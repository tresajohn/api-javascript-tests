const { BookingClient } = require('../src/BookingClient');
const { AuthClient } = require('../src/AuthClient');

const BASE_URL = 'https://restful-booker.herokuapp.com';
const BOOKING_PAYLOAD = {
  firstname: 'Test',
  lastname: 'User',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2025-01-01', checkout: '2025-01-07' },
  additionalneeds: 'Breakfast',
};

let bookingClient;
let token;

beforeAll(async () => {
  bookingClient = new BookingClient(BASE_URL);
  token = await new AuthClient(BASE_URL).createToken('admin', 'password123');
});

describe('Booking read', () => {
  test('getAll returns a non-empty array with bookingid fields', async () => {
    const result = await bookingClient.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('bookingid');
  });

  test('getById returns a booking with expected fields', async () => {
    const created = await bookingClient.create(BOOKING_PAYLOAD);
    try {
      const booking = await bookingClient.getById(created.bookingid);
      for (const key of ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates']) {
        expect(booking).toHaveProperty(key);
      }
    } finally {
      try { await bookingClient.delete(created.bookingid, token); } catch {}
    }
  });
});
