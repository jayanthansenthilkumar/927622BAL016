const axios = require('axios');

class AuthService {
  constructor(authUrl) {
    this.authUrl = authUrl;
    this.token = null;
    this.tokenExpiry = null;
    this.credentials = {
      token_type: "Bearer",
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY5MDYwLCJpYXQiOjE3NDgwNjg3NjAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImM0OWVhZTI4LWQ0ZTUtNDdlMy1iODA1LWJhYTNkNmJiMjEyNCIsInN1YiI6ImpheWFudGhhbnNlbnRoaWxrdW1hcjE4QGdtYWlsLmNvbSJ9LCJlbWFpbCI6ImpheWFudGhhbnNlbnRoaWxrdW1hcjE4QGdtYWlsLmNvbSIsIm5hbWUiOiJqYXlhbnRoYW4gcyIsInJvbGxObyI6IjkyNzYyMmJhbDAxNiIsImFjY2Vzc0NvZGUiOiJ3aGVRVXkiLCJjbGllbnRJRCI6ImM0OWVhZTI4LWQ0ZTUtNDdlMy1iODA1LWJhYTNkNmJiMjEyNCIsImNsaWVudFNlY3JldCI6InNUUGhiQk14WXpoV1lnUnIifQ.4az8ZA1mWU_S5ANCQIGaMbd7h2kfZBYy_mhUMOgjgpw",
      expires_in: 1748069060
    };
  }

  // Initialize the token from stored credentials
  init() {
    this.token = this.credentials.access_token;
    this.tokenExpiry = this.credentials.expires_in;
    return this.token;
  }

  // Get the current token or refresh if expired
  async getAuthToken() {
    // If we don't have a token yet, initialize it
    if (!this.token) {
      return this.init();
    }

    // Check if token is expired (with some buffer time)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (this.tokenExpiry && currentTimestamp > this.tokenExpiry - 300) {
      try {
        // Try to refresh the token using the auth endpoint
        const response = await axios.post(`${this.authUrl}`, {
          clientID: this.credentials.clientID,
          clientSecret: this.credentials.clientSecret
        });
        
        if (response.data && response.data.access_token) {
          this.token = response.data.access_token;
          this.tokenExpiry = response.data.expires_in;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error.message);
        // If refresh fails, use the existing token as fallback
      }
    }

    return this.token;
  }

  // Get Authorization header with bearer token
  async getAuthHeader() {
    const token = await this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  }
}

module.exports = AuthService;
