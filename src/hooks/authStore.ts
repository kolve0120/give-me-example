// src/hooks/authStore.ts
import { StateCreator } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  customerCode?: string;
  roles: string[];
}

export interface AuthSlice {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string, role: 'admin' | 'customer', customerCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getUserRoles: () => Promise<string[]>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => {
  // 設置 auth 狀態監聽器
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const roles = userRoles?.map(r => r.role) || [];

      const userProfile: UserProfile = {
        id: session.user.id,
        username: profile?.username || session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
        customerCode: profile?.customer_code,
        roles,
      };

      set({ user: userProfile, isAuthenticated: true, isAuthLoading: false });
    } else if (event === 'SIGNED_OUT') {
      set({ user: null, isAuthenticated: false, isAuthLoading: false });
    }
  });

  return {
    user: null,
    isAuthenticated: false,
    isAuthLoading: true,

    login: async (email, password) => {
      set({ isAuthLoading: true });
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id);

          const roles = userRoles?.map(r => r.role) || [];

          const userProfile: UserProfile = {
            id: data.user.id,
            username: profile?.username || data.user.email?.split('@')[0] || '',
            email: data.user.email || '',
            customerCode: profile?.customer_code,
            roles,
          };

          set({ user: userProfile, isAuthenticated: true, isAuthLoading: false });
          return { success: true };
        }

        set({ isAuthLoading: false });
        return { success: false, error: '登入失敗' };
      } catch (error: any) {
        console.error('Login failed:', error);
        set({ isAuthLoading: false });
        return { success: false, error: error.message || '登入失敗' };
      }
    },

    register: async (username, email, password, role, customerCode) => {
      set({ isAuthLoading: true });
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              role,
              customer_code: customerCode,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id);

          const roles = userRoles?.map(r => r.role) || [role];

          const userProfile: UserProfile = {
            id: data.user.id,
            username: profile?.username || username,
            email: data.user.email || email,
            customerCode: profile?.customer_code || customerCode,
            roles,
          };

          set({ user: userProfile, isAuthenticated: true, isAuthLoading: false });
          return { success: true };
        }

        set({ isAuthLoading: false });
        return { success: false, error: '註冊失敗' };
      } catch (error: any) {
        console.error('Register failed:', error);
        set({ isAuthLoading: false });
        return { success: false, error: error.message || '註冊失敗' };
      }
    },

    logout: async () => {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          const roles = userRoles?.map(r => r.role) || [];

          const userProfile: UserProfile = {
            id: session.user.id,
            username: profile?.username || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            customerCode: profile?.customer_code,
            roles,
          };

          set({ user: userProfile, isAuthenticated: true, isAuthLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isAuthLoading: false });
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
        set({ user: null, isAuthenticated: false, isAuthLoading: false });
      }
    },

    getUserRoles: async () => {
      const state = get();
      if (!state.user) return [];
      return state.user.roles;
    },

    hasRole: (role) => {
      const state = get();
      return state.user?.roles.includes(role) || false;
    },

    isAdmin: () => {
      const state = get();
      return state.user?.roles.includes('admin') || false;
    },
  };
};
