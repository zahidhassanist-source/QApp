import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Mail, Phone, User as UserIcon, ArrowLeft } from 'lucide-react';
import bcrypt from 'bcryptjs';

type AuthView = 'login' | 'signup' | 'otp' | 'forgot-password' | 'reset-password';

export default function Login() {
  const [view, setView] = useState<AuthView>('login');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  
  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  const login = useStore((state) => state.login);
  const authStore = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone); // E.164 format roughly

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = authStore.getUserByEmailOrPhone(identifier);
      
      if (!user) {
        setError('Invalid credentials or unregistered account.');
        setLoading(false);
        return;
      }

      const isValid = bcrypt.compareSync(password, user.passwordHash);

      if (!isValid) {
        setError('Invalid credentials.');
        setLoading(false);
        return;
      }

      if (!user.isVerified) {
        setPendingUserId(user.id);
        const newOtp = authStore.generateOTP(user.id);
        setMessage(`OTP sent to your registered ${method}. (Demo OTP: ${newOtp})`);
        setCountdown(300); // 5 minutes
        setResendCount(0);
        setView('otp');
        setLoading(false);
        return;
      }
      
      // Login to global store
      login({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role, isPaid: user.isPaid });
      navigate('/');
    } catch (err) {
      setError('An error occurred during login.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) return setError('Invalid email format.');
    if (!validatePhone(phone)) return setError('Invalid phone format. Include country code (e.g., +880).');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');

    if (authStore.getUserByEmailOrPhone(email)) return setError('Email already registered.');
    if (authStore.getUserByEmailOrPhone(phone)) return setError('Phone number already registered.');

    setLoading(true);
    try {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const userId = authStore.registerUser({
        accountName,
        firstName,
        lastName,
        phone,
        email,
        passwordHash,
        role: 'user'
      });

      setPendingUserId(userId);
      const newOtp = authStore.generateOTP(userId);
      setMessage(`OTP sent to your registered email/phone. (Demo OTP: ${newOtp})`);
      setCountdown(300); // 5 minutes
      setResendCount(0);
      setView('otp');
    } catch (err) {
      setError('Registration failed.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!pendingUserId) return setError('Session expired. Please try again.');

    const success = authStore.verifyOTP(pendingUserId, otp);
    if (success) {
      setMessage('Verification successful! You can now log in.');
      setView('login');
      setIdentifier(email || phone);
      setPassword('');
      setOtp('');
    } else {
      setError('Invalid or expired OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    if (!pendingUserId) return;
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please try again later.');
      return;
    }
    setError('');
    const newOtp = authStore.generateOTP(pendingUserId);
    setMessage(`New OTP sent. (Demo OTP: ${newOtp})`);
    setCountdown(300);
    setResendCount(c => c + 1);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = authStore.getUserByEmailOrPhone(identifier);
    if (!user) {
      setError('No account found with this email/phone.');
      return;
    }

    setPendingUserId(user.id);
    const newOtp = authStore.generateOTP(user.id);
    setMessage(`Password reset OTP sent. (Demo OTP: ${newOtp})`);
    setCountdown(300);
    setResendCount(0);
    setView('reset-password');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pendingUserId) return setError('Session expired.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');

    const success = authStore.verifyOTP(pendingUserId, otp);
    if (success) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      authStore.updateUser(pendingUserId, { passwordHash });
      setMessage('Password reset successfully. Please log in.');
      setView('login');
      setPassword('');
    } else {
      setError('Invalid or expired OTP.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-indigo-200">
            Q
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'otp' && 'Verify Account'}
            {view === 'forgot-password' && 'Forgot Password'}
            {view === 'reset-password' && 'Reset Password'}
          </h1>
          <p className="text-sm text-slate-500">
            {view === 'login' && 'Sign in to access previous year questions.'}
            {view === 'signup' && 'Join us to access thousands of questions.'}
            {view === 'otp' && 'Enter the OTP sent to your device.'}
            {view === 'forgot-password' && 'Enter your email or phone to receive an OTP.'}
            {view === 'reset-password' && 'Enter OTP and your new password.'}
          </p>
        </div>

        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
        {message && <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">{message}</div>}

        {/* Login View */}
        {view === 'login' && (
          <>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setMethod('email')}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === 'phone' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setMethod('phone')}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {method === 'email' ? <Mail className="h-5 w-5 text-slate-400" /> : <Phone className="h-5 w-5 text-slate-400" />}
                  </div>
                  <Input
                    type={method === 'email' ? 'email' : 'tel'}
                    placeholder={method === 'email' ? 'admin@qbd.com' : '+8801700000000'}
                    className="pl-10"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <button type="button" onClick={() => { setView('forgot-password'); setError(''); setMessage(''); }} className="text-xs font-medium text-indigo-600 hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              Don't have an account? <button type="button" onClick={() => { setView('signup'); setError(''); setMessage(''); }} className="font-medium text-indigo-600 hover:underline">Sign up</button>
            </div>
          </>
        )}

        {/* Sign Up View */}
        {view === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Account Name</label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} required placeholder="e.g. John's Account" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+8801700000000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" minLength={8} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-slate-500">
              Already have an account? <button type="button" onClick={() => { setView('login'); setError(''); setMessage(''); }} className="font-medium text-indigo-600 hover:underline">Sign in</button>
            </div>
          </form>
        )}

        {/* OTP View */}
        {view === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Enter 6-digit OTP</label>
              <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" maxLength={6} className="text-center tracking-widest text-lg" />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Verify Account
            </Button>

            <div className="text-center text-sm text-slate-500">
              {countdown > 0 ? (
                <span>Resend OTP in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
              ) : (
                <button type="button" onClick={handleResendOTP} className="font-medium text-indigo-600 hover:underline">Resend OTP</button>
              )}
            </div>
            <div className="text-center">
              <button type="button" onClick={() => setView('login')} className="text-sm text-slate-500 hover:underline flex items-center justify-center gap-1 w-full">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password View */}
        {view === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email or Phone Number</label>
              <Input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="admin@qbd.com or +8801700000000" />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Send Reset OTP
            </Button>

            <div className="text-center">
              <button type="button" onClick={() => setView('login')} className="text-sm text-slate-500 hover:underline flex items-center justify-center gap-1 w-full">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
            </div>
          </form>
        )}

        {/* Reset Password View */}
        {view === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Enter 6-digit OTP</label>
              <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="123456" maxLength={6} className="text-center tracking-widest text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" minLength={8} />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Reset Password
            </Button>

            <div className="text-center text-sm text-slate-500">
              {countdown > 0 ? (
                <span>Resend OTP in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
              ) : (
                <button type="button" onClick={handleResendOTP} className="font-medium text-indigo-600 hover:underline">Resend OTP</button>
              )}
            </div>
            <div className="text-center">
              <button type="button" onClick={() => setView('login')} className="text-sm text-slate-500 hover:underline flex items-center justify-center gap-1 w-full">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
