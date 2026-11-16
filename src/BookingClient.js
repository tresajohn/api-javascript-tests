const axios = require('axios');

class BookingClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async ping() {
    const response = await axios.get(`${this.baseUrl}/ping`, {
      timeout: 10000,
      validateStatus: () => true,
    });
    return response.status;
  }

  async getAll() {
    const response = await axios.get(`${this.baseUrl}/booking`, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });
    return response.data;
  }

  async getById(bookingId) {
    const response = await axios.get(`${this.baseUrl}/booking/${bookingId}`, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });
    return response.data;
  }

  async create(payload) {
    const response = await axios.post(`${this.baseUrl}/booking`, payload, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });
    return response.data;
  }

  async update(bookingId, payload, token) {
    const response = await axios.put(`${this.baseUrl}/booking/${bookingId}`, payload, {
      headers: {
        Cookie: `token=${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    });
    return response.data;
  }

  async partialUpdate(bookingId, payload, token) {
    const response = await axios.patch(`${this.baseUrl}/booking/${bookingId}`, payload, {
      headers: {
        Cookie: `token=${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    });
    return response.data;
  }

  async delete(bookingId, token) {
    const response = await axios.delete(`${this.baseUrl}/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
      timeout: 10000,
    });
    return response.status;
  }
}

module.exports = { BookingClient };
