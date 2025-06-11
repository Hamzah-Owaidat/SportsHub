"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeGoogleSignIn, loginWithGoogleToken, renderGoogleSignInButton } from '@/lib/api/auth';

interface GoogleSignInButtonProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  className?: string;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  className = ''
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleCredentialResponse = async (response: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await loginWithGoogleToken(response.credential);
        
        if (data.success) {
          // Store JWT token
          localStorage.setItem('token', data.token);
          
          if (onSuccess) {
            onSuccess(data);
          } else {
            // Default behavior: redirect to dashboard
            router.push('/');
          }
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Google sign-in failed';
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize Google Sign-In
    initializeGoogleSignIn(handleCredentialResponse)
      .then(() => {
        // Render the Google Sign-In button
        if (buttonRef.current) {
          renderGoogleSignInButton('google-signin-button', {
            theme,
            size,
            text,
            width: '100%',
          });
        }
      })
      .catch((error) => {
        setError('Failed to load Google Sign-In');
        console.error('Google Sign-In initialization error:', error);
      });

    // Cleanup function
    return () => {
      // Remove any existing Google button elements
      const existingButton = document.getElementById('google-signin-button');
      if (existingButton) {
        existingButton.innerHTML = '';
      }
    };
  }, [disabled, theme, size, text, onSuccess, onError, router]);

  if (disabled || isLoading) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-400 bg-gray-100 rounded-lg px-7 cursor-not-allowed dark:bg-white/5 dark:text-white/40 ${className}`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
            fill="currentColor" 
          />
          <path
            d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
            fill="currentColor" 
          />
          <path
            d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
            fill="currentColor" 
          />
          <path
            d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
            fill="currentColor" 
          />
        </svg>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    );
  }

  return (
    <div className={className}>
      <div ref={buttonRef} id="google-signin-button" />
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
              clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 