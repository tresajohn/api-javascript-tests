const axios = require('axios');

class AuthClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async createToken(username, password) {
    const response = await axios.post(
      `${this.baseUrl}/auth`,
      { username, password },
      { timeout: 10000 }
    );
    if (response.data.reason) {
      throw new Error('Bad credentials');
    }
    return response.data.token;
  }
}

module.exports = { AuthClient };
