export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'vendor';
  company: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
