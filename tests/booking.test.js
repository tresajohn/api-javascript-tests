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

describe('Booking write', () => {
  let createdId;

  beforeEach(async () => {
    const result = await bookingClient.create(BOOKING_PAYLOAD);
    createdId = result.bookingid;
  });

  afterEach(async () => {
    try { await bookingClient.delete(createdId, token); } catch {}
  });

  test('create returns bookingid and matching firstname', async () => {
    expect(typeof createdId).toBe('number');
    const booking = await bookingClient.getById(createdId);
    expect(booking.firstname).toBe(BOOKING_PAYLOAD.firstname);
  });

  test('update changes firstname and totalprice', async () => {
    const updated = { ...BOOKING_PAYLOAD, firstname: 'Updated', totalprice: 999 };
    const result = await bookingClient.update(createdId, updated, token);
    expect(result.firstname).toBe('Updated');
    expect(result.totalprice).toBe(999);
  });

  test('partialUpdate changes only firstname', async () => {
    const result = await bookingClient.partialUpdate(createdId, { firstname: 'Patched' }, token);
    expect(result.firstname).toBe('Patched');
  });

  test('delete returns 201 and booking no longer exists', async () => {
    const status = await bookingClient.delete(createdId, token);
    expect(status).toBe(201);
    await expect(bookingClient.getById(createdId)).rejects.toMatchObject({ response: { status: 404 } });
  });
});

describe('Booking edge cases', () => {
  test('getById with non-existent ID rejects with 404', async () => {
    await expect(bookingClient.getById(999999999)).rejects.toMatchObject({ response: { status: 404 } });
  });

  let edgeId;
  beforeEach(async () => {
    const result = await bookingClient.create(BOOKING_PAYLOAD);
    edgeId = result.bookingid;
  });
  afterEach(async () => {
    try { await bookingClient.delete(edgeId, token); } catch {}
  });

  test('update without token rejects with 403', async () => {
    await expect(
      bookingClient.update(edgeId, BOOKING_PAYLOAD, '')
    ).rejects.toMatchObject({ response: { status: 403 } });
  });

  test('delete without token rejects with 403', async () => {
    await expect(
      bookingClient.delete(edgeId, '')
    ).rejects.toMatchObject({ response: { status: 403 } });
  });
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
