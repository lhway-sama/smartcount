import apiClient from './apiClient';

interface LoginCredentials {
  login: string;
  mot_de_passe: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/login/', credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout/');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await apiClient.post<{ token: string }>('/api/auth/refresh/');
    return response.data.token;
  } catch (error) {
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};