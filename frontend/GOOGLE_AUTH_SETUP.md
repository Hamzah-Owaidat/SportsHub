# Google Authentication Setup for Next.js Frontend

## Overview
This frontend now supports Google authentication that works with both web and mobile applications using the same backend API.

## 1. Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Frontend URL (optional, for redirects)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for passport - legacy)
   - `http://localhost:5000/api/auth/google/web-callback` (for new system)
   - Your production backend URLs
7. Copy the Client ID and add it to your `.env.local` file

## 3. Backend Environment Variables

Make sure your backend has these environment variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## 4. Components Usage

### GoogleSignInButton Component

The new `GoogleSignInButton` component replaces the old manual button:

```tsx
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

// Basic usage
<GoogleSignInButton />

// With custom handlers
<GoogleSignInButton
  onSuccess={(data) => {
    console.log('User signed in:', data);
    // Custom success logic here
  }}
  onError={(error) => {
    console.error('Sign in failed:', error);
    // Custom error handling here
  }}
  disabled={loading}
  theme="outline"
  size="large"
  text="signin_with"
/>
```

### Props

- `onSuccess?: (data: any) => void` - Custom success handler
- `onError?: (error: string) => void` - Custom error handler  
- `disabled?: boolean` - Disable the button
- `theme?: 'outline' | 'filled_blue' | 'filled_black'` - Button theme
- `size?: 'large' | 'medium' | 'small'` - Button size
- `text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'` - Button text
- `className?: string` - Additional CSS classes

## 5. API Functions

### New Functions

```typescript
import { 
  loginWithGoogleToken, 
  initializeGoogleSignIn, 
  renderGoogleSignInButton,
  googleSignOut 
} from "@/lib/api/auth";

// Login with Google ID token (works for both web and mobile)
const result = await loginWithGoogleToken(idToken);

// Initialize Google Sign-In
await initializeGoogleSignIn(callbackFunction);

// Render Google button manually
renderGoogleSignInButton('element-id', options);

// Sign out from Google
googleSignOut();
```

### Legacy Function (kept for backward compatibility)

```typescript
import { loginWithGoogle } from "@/lib/api/auth";

// Old redirect-based method (still works)
loginWithGoogle();
```

## 6. Authentication Flow

### Web Flow (Recommended)
1. User clicks Google Sign-In button
2. Google Identity Services loads and handles authentication
3. Google returns an ID token
4. Frontend sends ID token to `/api/auth/google/token`
5. Backend verifies token and returns JWT
6. Frontend stores JWT and redirects to dashboard

### Mobile Flow
1. Mobile app uses Google Sign-In SDK
2. Gets ID token from Google
3. Sends ID token to `/api/auth/google/token`
4. Backend verifies token and returns JWT
5. Mobile app stores JWT

## 7. Error Handling

The components and API functions include comprehensive error handling:

- Invalid or expired ID tokens
- Network connectivity issues
- Backend authentication failures
- Google service unavailability

## 8. Security Features

- Server-side ID token verification
- JWT token with expiration
- Secure HTTP-only cookies (when applicable)
- CSRF protection with SameSite cookies

## 9. Testing

### Test the new authentication:

1. Start your backend server
2. Start your frontend development server
3. Go to the sign-in page
4. Click the Google Sign-In button
5. Complete the Google authentication flow
6. Verify you're redirected to the dashboard with a valid JWT token

### Debug Issues:

- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Ensure Google Client ID matches between frontend and backend
- Check that Google Cloud Console has correct redirect URIs

## 10. Migration from Old System

If you were using the old passport-based system:

1. ✅ The old endpoints still work for backward compatibility
2. ✅ Update your sign-in/sign-up components to use `GoogleSignInButton`
3. ✅ Set up the required environment variables
4. ✅ Test the new flow
5. 🔄 Gradually migrate users to the new system
6. 🔄 Eventually remove the old passport endpoints (optional)

## 11. Troubleshooting

### Common Issues:

**"Failed to load Google Sign-In"**
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Verify internet connectivity
- Check browser console for blocked scripts

**"Google authentication failed"**  
- Verify backend is running and accessible
- Check that backend has correct `GOOGLE_CLIENT_ID`
- Ensure `/api/auth/google/token` endpoint is working

**Redirect issues**
- Verify `FRONTEND_URL` is set correctly in backend
- Check Google Cloud Console redirect URIs
- Ensure URLs match exactly (including http/https and ports)

For more detailed backend setup, see `/backend/docs/google-auth-guide.md`. 