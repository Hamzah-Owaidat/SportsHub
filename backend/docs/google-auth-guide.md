# Google Authentication Guide

This guide explains how to implement Google authentication for both web and mobile applications using the same backend API.

## Overview

The backend now supports three different Google authentication flows:

1. **Passport-based flow** (legacy, web only)
2. **Token-based flow** (recommended for mobile apps)
3. **Web callback flow** (recommended for web apps)

## Environment Variables

Make sure you have these environment variables set:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
API_URL=http://localhost:5000  # Your backend URL
FRONTEND_URL=http://localhost:3000  # Your frontend URL
```

## Mobile App Implementation (Flutter)

### 1. Install Dependencies

Add to your `pubspec.yaml`:

```yaml
dependencies:
  google_sign_in: ^6.1.5
  http: ^1.1.0
```

### 2. Configure Google Sign-In

#### Android Configuration
Add to `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="default_web_client_id">YOUR_GOOGLE_CLIENT_ID</string>
</resources>
```

#### iOS Configuration
Add your `GoogleService-Info.plist` to `ios/Runner/`.

### 3. Flutter Implementation

```dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GoogleAuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  Future<Map<String, dynamic>?> signInWithGoogle() async {
    try {
      // Sign in with Google
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      // Get authentication details
      final GoogleSignInAuthentication googleAuth = 
          await googleUser.authentication;

      // Send ID token to your backend
      final response = await http.post(
        Uri.parse('${YOUR_API_URL}/api/auth/google/token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'idToken': googleAuth.idToken,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Store the JWT token
        final jwtToken = data['token'];
        return data;
      } else {
        throw Exception('Failed to authenticate with backend');
      }
    } catch (error) {
      print('Google Sign-In Error: $error');
      return null;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
```

### 4. Usage in Flutter

```dart
class LoginScreen extends StatelessWidget {
  final GoogleAuthService _authService = GoogleAuthService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            final result = await _authService.signInWithGoogle();
            if (result != null) {
              // Navigate to home screen
              Navigator.pushReplacementNamed(context, '/home');
            }
          },
          child: Text('Sign in with Google'),
        ),
      ),
    );
  }
}
```

## Web App Implementation (Next.js)

### 1. Install Dependencies

```bash
npm install @google-cloud/local-auth googleapis
```

### 2. Client-Side Implementation

```typescript
// lib/auth/google.ts
export async function signInWithGoogle(): Promise<any> {
  try {
    // Get the auth URL from your backend
    const urlResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/url`);
    const { authUrl } = await urlResponse.json();
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Alternative: Using Google Identity Services (recommended)
export function initializeGoogleSignIn() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      resolve(true);
    };
    document.head.appendChild(script);
  });
}

async function handleCredentialResponse(response: any) {
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: response.credential,
      }),
    });

    const data = await result.json();
    if (data.success) {
      // Store JWT token and redirect
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

### 3. React Component

```tsx
// components/GoogleSignInButton.tsx
import { useEffect } from 'react';

export default function GoogleSignInButton() {
  useEffect(() => {
    const initializeGsi = async () => {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
          }
        );
      }
    };

    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = initializeGsi;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      const data = await result.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return <div id="google-signin-button"></div>;
}
```

## API Endpoints

### POST /api/auth/google/token
**Description**: Authenticate with Google ID token (works for both web and mobile)

**Request Body**:
```json
{
  "idToken": "google_id_token_here"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here"
}
```

### GET /api/auth/google/url
**Description**: Get Google OAuth URL for web authentication

**Response**:
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/oauth2/auth?..."
}
```

### GET /api/auth/google/web-callback
**Description**: Handle Google OAuth callback (redirects to frontend with token)

**Query Parameters**:
- `code`: Authorization code from Google
- `error`: Error message if authentication failed

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error scenarios:
- Invalid or expired ID token
- Missing Google client configuration
- User role not found
- Network connectivity issues

## Security Considerations

1. **Token Validation**: All Google ID tokens are verified server-side
2. **JWT Security**: JWT tokens include user information and have expiration
3. **HTTPS Only**: Use HTTPS in production for secure token transmission
4. **Client ID Validation**: Tokens are validated against your specific Google Client ID

## Migration from Passport

If you're currently using the passport-based flow (`/api/auth/google` and `/api/auth/google/callback`), you can migrate gradually:

1. Keep existing endpoints for backward compatibility
2. Update mobile apps to use `/api/auth/google/token`
3. Update web apps to use Google Identity Services with `/api/auth/google/token`
4. Remove passport endpoints once migration is complete

## Testing

### Test Mobile Flow
```bash
curl -X POST http://localhost:5000/api/auth/google/token \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your_google_id_token"}'
```

### Test Web Flow
```bash
curl http://localhost:5000/api/auth/google/url
```

This will return the Google OAuth URL that you can visit in a browser to test the web flow. 