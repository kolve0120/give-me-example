// src/types/auth.ts
export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  customerCode?: string; // 客戶角色時對應的客戶編號
  permissions: {
    canViewAllOrders: boolean;
    canEditAllOrders: boolean;
    canManageUsers: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  customerCode?: string;
}
