import api from './client';
import { LoginFormData, RegisterFormData } from '@/types/auth';

export async function login(credentials: LoginFormData) {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Backend responded with error (e.g., 400 or 401)
      return error.response.data;
    } else {
      // Network or unexpected error
      throw error;
    }
  }
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

// Legacy function (keeping for backward compatibility)
export function loginWithGoogle() {
  // Redirect the user to the backend Google auth route
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
}

// New Google authentication using ID token (recommended)
export async function loginWithGoogleToken(idToken: string) {
    try {
        const response = await api.post('/auth/google/token', {
            idToken: idToken
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Google authentication failed');
    }
}

// Get Google OAuth URL for web authentication
export async function getGoogleAuthUrl() {
    try {
        const response = await api.get('/auth/google/url');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to get Google auth URL');
    }
}

// Initialize Google Identity Services
export function initializeGoogleSignIn(callback: (response: any) => void) {
    return new Promise((resolve, reject) => {
        // Check if Google script is already loaded
        if (typeof window !== 'undefined' && (window as any).google) {
            initializeGsi();
            resolve(true);
            return;
        }

        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            initializeGsi();
            resolve(true);
        };
        
        script.onerror = () => {
            reject(new Error('Failed to load Google Identity Services'));
        };
        
        document.head.appendChild(script);

        function initializeGsi() {
            if ((window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: callback,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });
            }
        }
    });
}

// Render Google Sign-In button
export function renderGoogleSignInButton(elementId: string, options?: any) {
    if (typeof window !== 'undefined' && (window as any).google) {
        const defaultOptions = {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
        };

        (window as any).google.accounts.id.renderButton(
            document.getElementById(elementId),
            { ...defaultOptions, ...options }
        );
    }
}