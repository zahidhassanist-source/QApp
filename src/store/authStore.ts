import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';

export interface UserUnlock {
  id: string;
  userId: string;
  examType: string;
  boardName?: string;
  groupOrProgram: string;
  unlockStatus: boolean;
  paymentStatus: 'Pending' | 'Approved' | 'Rejected';
  paymentMethod: 'bKash' | 'Nagad';
  transactionId: string;
  senderNumber?: string;
  submittedAt: number;
  unlockDate?: number;
}

export interface RegisteredUser {
  id: string;
  accountName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  role: 'admin' | 'user';
}

export interface OTPRecord {
  userId: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

interface AuthState {
  users: RegisteredUser[];
  otps: OTPRecord[];
  unlocks: UserUnlock[];
  registerUser: (user: Omit<RegisteredUser, 'id' | 'isVerified'>) => string;
  verifyOTP: (userId: string, otp: string) => boolean;
  generateOTP: (userId: string) => string;
  updateUser: (userId: string, data: Partial<RegisteredUser>) => void;
  getUserByEmailOrPhone: (identifier: string) => RegisteredUser | undefined;
  submitPayment: (userId: string, examType: string, boardName: string | undefined, groupOrProgram: string, method: 'bKash' | 'Nagad', transactionId: string, senderNumber?: string) => void;
  approveUnlock: (unlockId: string) => void;
  rejectUnlock: (unlockId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'admin-1',
          accountName: 'Admin Account',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+8801700000000',
          email: 'admin@qbd.com',
          passwordHash: bcrypt.hashSync('password123', 10),
          isVerified: true,
          role: 'admin',
        }
      ],
      otps: [],
      unlocks: [],
      registerUser: (userData) => {
        const id = Math.random().toString(36).substring(7);
        const newUser: RegisteredUser = {
          ...userData,
          id,
          isVerified: false,
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return id;
      },
      generateOTP: (userId) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        set((state) => {
          const filteredOtps = state.otps.filter(o => o.userId !== userId);
          return { otps: [...filteredOtps, { userId, otp, expiresAt, attempts: 0 }] };
        });
        return otp;
      },
      verifyOTP: (userId, otp) => {
        const state = get();
        const record = state.otps.find(o => o.userId === userId);
        if (!record) return false;
        
        if (Date.now() > record.expiresAt) {
          return false; // Expired
        }
        
        if (record.attempts >= 3) {
          return false; // Too many attempts
        }
        
        if (record.otp === otp) {
          // Success
          set((state) => ({
            otps: state.otps.filter(o => o.userId !== userId),
            users: state.users.map(u => u.id === userId ? { ...u, isVerified: true } : u)
          }));
          return true;
        } else {
          // Failed attempt
          set((state) => ({
            otps: state.otps.map(o => o.userId === userId ? { ...o, attempts: o.attempts + 1 } : o)
          }));
          return false;
        }
      },
      updateUser: (userId, data) => {
        set((state) => ({
          users: state.users.map(u => u.id === userId ? { ...u, ...data } : u)
        }));
      },
      getUserByEmailOrPhone: (identifier) => {
        return get().users.find(u => u.email === identifier || u.phone === identifier);
      },
      submitPayment: (userId, examType, boardName, groupOrProgram, method, transactionId, senderNumber) => {
        const id = Math.random().toString(36).substring(7);
        const newUnlock: UserUnlock = {
          id,
          userId,
          examType,
          boardName,
          groupOrProgram,
          unlockStatus: false,
          paymentStatus: 'Pending',
          paymentMethod: method,
          transactionId,
          senderNumber,
          submittedAt: Date.now()
        };
        set((state) => ({
          unlocks: [...state.unlocks, newUnlock]
        }));
      },
      approveUnlock: (unlockId) => {
        set((state) => ({
          unlocks: state.unlocks.map(u => u.id === unlockId ? {
            ...u,
            unlockStatus: true,
            paymentStatus: 'Approved',
            unlockDate: Date.now()
          } : u)
        }));
      },
      rejectUnlock: (unlockId) => {
        set((state) => ({
          unlocks: state.unlocks.map(u => u.id === unlockId ? {
            ...u,
            unlockStatus: false,
            paymentStatus: 'Rejected'
          } : u)
        }));
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
