export interface Admin {
  adminId: number;
  account: string;
  adminName: string;
  avatar: string;
}

export interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
} 