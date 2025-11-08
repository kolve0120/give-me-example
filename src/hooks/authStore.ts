// src/hooks/authStore.ts
import { StateCreator } from 'zustand';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (user: User) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,

  login: async (credentials) => {
    set({ isAuthLoading: true });
    try {
      // TODO: 實作 API 登入
      // 暫時使用假資料
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: credentials.username === 'admin' ? 'admin' : 'customer',
        customerCode: credentials.username === 'admin' ? undefined : 'C001',
        permissions: {
          canViewAllOrders: credentials.username === 'admin',
          canEditAllOrders: credentials.username === 'admin',
          canManageUsers: credentials.username === 'admin',
        },
      };
      
      set({ user: mockUser, isAuthenticated: true, isAuthLoading: false });
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      set({ isAuthLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isAuthLoading: true });
    try {
      // TODO: 實作 API 註冊
      const newUser: User = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        role: data.role,
        customerCode: data.customerCode,
        permissions: {
          canViewAllOrders: data.role === 'admin',
          canEditAllOrders: data.role === 'admin',
          canManageUsers: data.role === 'admin',
        },
      };
      
      set({ user: newUser, isAuthenticated: true, isAuthLoading: false });
      localStorage.setItem('auth-user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Register failed:', error);
      set({ isAuthLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('auth-user');
  },

  checkAuth: () => {
    const saved = localStorage.getItem('auth-user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        set({ user, isAuthenticated: true });
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  },

  updateUser: (user) => {
    set({ user });
    localStorage.setItem('auth-user', JSON.stringify(user));
  },
});
