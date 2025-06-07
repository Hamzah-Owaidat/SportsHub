import api from './client';
import { LoginFormData, RegisterFormData } from '@/types/auth';

export async function login(credentials: LoginFormData) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
}

export async function register(data: RegisterFormData) {
    const response = await api.post('/auth/register', data);
    return response.data;
}

export async function logout(){
    const response = await api.post('/auth/logout');
    return response.data;
}

export async function getCurrentUser(){
    const response = await api.get('/auth/me');
    return response.data;
}

export function loginWithGoogle() {
  // Redirect the user to the backend Google auth route
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
}
