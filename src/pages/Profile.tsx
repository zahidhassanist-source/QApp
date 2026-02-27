import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { User, LogOut, Settings, Bell, Shield, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
          <User className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        <p className="text-slate-500">{user.email}</p>
        <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full uppercase tracking-wider">
          {user.role}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-500 px-4 uppercase tracking-wider">Settings</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Notifications</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Privacy & Security</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700">
                <Settings className="w-5 h-5 text-slate-400" />
                <span className="font-medium">App Settings</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-700">
                <HelpCircle className="w-5 h-5 text-slate-400" />
                <span className="font-medium">Help & Support</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <Button variant="danger" className="w-full gap-2" size="lg" onClick={handleLogout}>
        <LogOut className="w-5 h-5" /> Sign Out
      </Button>
    </div>
  );
}
