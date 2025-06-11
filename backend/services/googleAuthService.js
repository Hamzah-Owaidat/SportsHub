const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verify Google ID token and extract user information
   * @param {string} idToken - Google ID token from client
   * @returns {Object} User profile information
   */
  async verifyIdToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      throw new Error(`Invalid Google ID token: ${error.message}`);
    }
  }

  /**
   * Generate Google OAuth URL for web-based authentication
   * @param {string} redirectUri - Redirect URI after authentication
   * @returns {string} Google OAuth URL
   */
  generateAuthUrl(redirectUri) {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const scopes = ['profile', 'email'];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    });
  }

  /**
   * Exchange authorization code for tokens (for web flow)
   * @param {string} code - Authorization code from Google
   * @param {string} redirectUri - Redirect URI used in the initial request
   * @returns {Object} User profile information
   */
  async exchangeCodeForTokens(code, redirectUri) {
    try {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info using the access token
      const userInfoResponse = await oauth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      });

      return {
        googleId: userInfoResponse.data.id,
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        picture: userInfoResponse.data.picture,
        emailVerified: userInfoResponse.data.verified_email,
      };
    } catch (error) {
      throw new Error(`Failed to exchange code for tokens: ${error.message}`);
    }
  }
}

module.exports = new GoogleAuthService(); 