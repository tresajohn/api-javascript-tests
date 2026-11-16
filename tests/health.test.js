const { BookingClient } = require('../src/BookingClient');

const BASE_URL = 'https://restful-booker.herokuapp.com';

describe('Health', () => {
  test('ping returns 201', async () => {
    const client = new BookingClient(BASE_URL);
    const status = await client.ping();
    expect(status).toBe(201);
  });
});
