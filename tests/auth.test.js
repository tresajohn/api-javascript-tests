const { AuthClient } = require('../src/AuthClient');

const BASE_URL = 'https://restful-booker.herokuapp.com';

describe('Auth', () => {
  test('valid credentials return a non-empty token string', async () => {
    const client = new AuthClient(BASE_URL);
    const token = await client.createToken('admin', 'password123');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('invalid credentials throw Bad credentials', async () => {
    const client = new AuthClient(BASE_URL);
    await expect(client.createToken('wrong', 'wrong')).rejects.toThrow('Bad credentials');
  });
});
