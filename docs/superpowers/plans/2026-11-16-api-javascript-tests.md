# API JavaScript Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone JavaScript API test suite for Restful Booker with Allure reporting deployed to GitHub Pages via CI.

**Architecture:** Two client classes (`AuthClient`, `BookingClient`) in `src/` wrap axios calls; Jest test files in `tests/` consume them directly with `beforeAll`/`beforeEach`/`afterEach` for setup and teardown. `allure-jest` provides the Allure report layer via Jest's `testEnvironment`.

**Tech Stack:** Node.js 22, Jest 29, axios, allure-jest, allure-commandline

**Spec:** Conversation design — same coverage as `api-python-tests` (Restful Booker, all CRUD + edge cases), new repo `api-javascript-tests`, Allure report on GitHub Pages.

## Global Constraints

- Node.js >= 22
- Jest >= 29
- axios >= 1.7.0
- allure-jest >= 3.0.0
- allure-commandline >= 2.0.0
- Base URL: `https://restful-booker.herokuapp.com` (constant `BASE_URL` in each test file — not from env)
- Auth credentials: username `admin`, password `password123`
- All axios calls must pass `timeout: 10000`
- GitHub repo name: `api-javascript-tests`
- Allure results dir: `allure-results/` (set in `jest.config.js`)

## Review Focus

1. **Shared public API interference** — `beforeEach` creates a fresh booking per write test; `afterEach` deletes it. Tests must never depend on a pre-existing booking ID. Covered in Task 4 `beforeEach`/`afterEach`.
2. **Auth response body, not status** — `/auth` returns HTTP 200 for both success (`{token}`) and failure (`{reason}`); `createToken` must check `response.data.reason`, not status. Covered in Task 2 `'invalid credentials throw Bad credentials'`.
3. **axios treats 201 as success** — axios default `validateStatus` passes anything 2xx; `delete()` returns `response.status` (201). Test must assert `201` explicitly. Covered in Task 4 `'delete returns 201'`.
4. **axios throws AxiosError on 4xx/5xx** — edge case tests must use `rejects.toMatchObject({ response: { status: N } })`. Covered in Task 4 `'getById 999999999'`, `'update without token'`, `'delete without token'`.
5. **Heroku cold-start** — first request can take 10–30s after idle. All client methods pass `timeout: 10000`. Covered as a code constraint in Tasks 2 and 3.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `jest.config.js`
- Create: `src/.gitkeep` (placeholder so `src/` is tracked)
- Create: `tests/.gitkeep` (placeholder so `tests/` is tracked)
- Create: `.gitignore`
- Create: `README.md`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` runs (zero tests, zero failures); repo at `github.com/tresajohn/api-javascript-tests`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "api-javascript-tests",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "jest",
    "report": "npx allure generate allure-results --clean -o allure-report",
    "report:open": "npx allure open allure-report"
  },
  "devDependencies": {
    "axios": "^1.7.0",
    "jest": "^29.0.0",
    "allure-jest": "^3.0.0",
    "allure-commandline": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `jest.config.js`**

```js
module.exports = {
  testEnvironment: 'allure-jest/node',
  testEnvironmentOptions: {
    resultsDir: 'allure-results',
  },
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 15000,
};
```

- [ ] **Step 3: Create `src/.gitkeep` and `tests/.gitkeep`** (empty files)

- [ ] **Step 4: Create `.gitignore`**

Include: `node_modules/`, `allure-results/`, `allure-report/`, `.env`

- [ ] **Step 5: Create `README.md`**

```markdown
# Restful Booker API Test Suite (JavaScript)

Standalone JavaScript API test suite for the [Restful Booker](https://restful-booker.herokuapp.com) API.

## Stack
- Node.js 22 · Jest 29 · axios · allure-jest

## Run locally
\`\`\`bash
npm install
npm test
\`\`\`

## Generate Allure report
\`\`\`bash
npm run report
npm run report:open
\`\`\`

## CI / Live report
GitHub Actions runs all tests on every push to `main` and publishes the interactive Allure report to GitHub Pages.

[View live report](https://tresajohn.github.io/api-javascript-tests/)

## Coverage
| Area | Scenarios |
|------|-----------|
| Health | Ping endpoint returns 201 |
| Auth | Valid credentials return token · Invalid credentials throw error |
| Bookings (read) | Get all bookings · Get booking by ID |
| Bookings (write) | Create · Full update · Partial update · Delete |
| Edge cases | 404 on missing booking · 403 without auth token |
```

- [ ] **Step 6: Create `.github/workflows/ci.yml`**

```yaml
name: API Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: pages
  cancel-in-progress: true

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test || true

      - name: Generate Allure report
        if: always()
        run: npm run report

      - name: Upload Allure artifact
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: allure-report
          path: allure-report/
          retention-days: 14

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        if: github.ref == 'refs/heads/main' && always()
        with:
          path: allure-report/

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
        if: github.ref == 'refs/heads/main' && always()
```

- [ ] **Step 7: Install deps and verify zero tests run**

Run: `npm install && npm test`
Expected: `Test Suites: 0 skipped` or `No tests found` — no errors

- [ ] **Step 8: Create GitHub repo and push**

```bash
git init && git add . && git commit -m "chore: project scaffold"
gh repo create tresajohn/api-javascript-tests --public --source=. --remote=origin --push
gh api repos/tresajohn/api-javascript-tests/pages --method POST -f build_type=workflow
```

---

### Task 2: AuthClient + Auth Tests

**Files:**
- Create: `src/AuthClient.js`
- Create: `tests/auth.test.js`

**Interfaces:**
- Consumes: `BASE_URL = 'https://restful-booker.herokuapp.com'` (defined per file)
- Produces:
  - `AuthClient(baseUrl: string)` — constructor
  - `AuthClient.createToken(username: string, password: string): Promise<string>` — resolves to token; rejects with `Error('Bad credentials')` if `response.data.reason` exists

- [ ] **Step 1: Write failing tests in `tests/auth.test.js`**

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern=auth`
Expected: FAIL — `Cannot find module '../src/AuthClient'`

- [ ] **Step 3: Implement `AuthClient` in `src/AuthClient.js`**

`constructor(baseUrl)` stores `this.baseUrl`.
`createToken(username, password)`: POST `${this.baseUrl}/auth` with `{ username, password }`, `timeout: 10000`. If `response.data.reason` exists, throw `new Error('Bad credentials')`. Return `response.data.token`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern=auth`
Expected: 2 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/AuthClient.js tests/auth.test.js
git commit -m "feat: auth client and tests"
```

---

### Task 3: BookingClient Read Ops + Health + Read Tests

**Files:**
- Create: `src/BookingClient.js`
- Create: `tests/health.test.js`
- Create: `tests/booking.test.js` (read tests only)

**Interfaces:**
- Consumes: nothing from prior tasks (uses `BASE_URL` constant per file)
- Produces:
  - `BookingClient(baseUrl: string)` — constructor
  - `BookingClient.ping(): Promise<number>` — returns HTTP status code
  - `BookingClient.getAll(): Promise<Array<{bookingid: number}>>` — rejects on non-2xx
  - `BookingClient.getById(bookingId: number): Promise<object>` — rejects on non-2xx

- [ ] **Step 1: Write failing tests**

`tests/health.test.js`:
```js
const { BookingClient } = require('../src/BookingClient');
const BASE_URL = 'https://restful-booker.herokuapp.com';

describe('Health', () => {
  test('ping returns 201', async () => {
    const client = new BookingClient(BASE_URL);
    const status = await client.ping();
    expect(status).toBe(201);
  });
});
```

`tests/booking.test.js` (read section):
```js
const { BookingClient } = require('../src/BookingClient');
const { AuthClient } = require('../src/AuthClient');
const BASE_URL = 'https://restful-booker.herokuapp.com';

let bookingClient;

beforeAll(() => {
  bookingClient = new BookingClient(BASE_URL);
});

describe('Booking read', () => {
  test('getAll returns a non-empty array with bookingid fields', async () => {
    const result = await bookingClient.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('bookingid');
  });

  test('getById returns a booking with expected fields', async () => {
    const all = await bookingClient.getAll();
    const booking = await bookingClient.getById(all[0].bookingid);
    for (const key of ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates']) {
      expect(booking).toHaveProperty(key);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern='health|booking'`
Expected: FAIL — `Cannot find module '../src/BookingClient'`

- [ ] **Step 3: Implement `BookingClient` read ops in `src/BookingClient.js`**

`constructor(baseUrl)` stores `this.baseUrl`.
- `ping()`: GET `${baseUrl}/ping`, `timeout: 10000`, `validateStatus: () => true`. Return `response.status`.
- `getAll()`: GET `${baseUrl}/booking`, `timeout: 10000`. Return `response.data`.
- `getById(bookingId)`: GET `${baseUrl}/booking/${bookingId}`, `timeout: 10000`. Return `response.data`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern='health|booking'`
Expected: 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/BookingClient.js tests/health.test.js tests/booking.test.js
git commit -m "feat: booking client read ops and health/read tests"
```

---

### Task 4: BookingClient Write Ops + Write Tests + Edge Cases

**Files:**
- Modify: `src/BookingClient.js` (add `create`, `update`, `partialUpdate`, `delete`)
- Modify: `tests/booking.test.js` (add write tests + edge cases)

**Interfaces:**
- Consumes: `AuthClient.createToken` from Task 2, `BookingClient` read ops from Task 3
- Produces:
  - `BookingClient.create(payload: object): Promise<{bookingid: number, booking: object}>`
  - `BookingClient.update(bookingId: number, payload: object, token: string): Promise<object>`
  - `BookingClient.partialUpdate(bookingId: number, payload: object, token: string): Promise<object>`
  - `BookingClient.delete(bookingId: number, token: string): Promise<number>` — returns status code (201)

Auth header for write ops: `{ Cookie: \`token=${token}\` }` plus `Content-Type: application/json` and `Accept: application/json`.

- [ ] **Step 1: Write failing tests** (append to `tests/booking.test.js`)

Add at top of file:
```js
const BOOKING_PAYLOAD = {
  firstname: 'Test', lastname: 'User', totalprice: 150, depositpaid: true,
  bookingdates: { checkin: '2025-01-01', checkout: '2025-01-07' },
  additionalneeds: 'Breakfast',
};
let token;
```

Extend `beforeAll`:
```js
beforeAll(async () => {
  bookingClient = new BookingClient(BASE_URL);
  token = await new AuthClient(BASE_URL).createToken('admin', 'password123');
});
```

Add describe blocks:
```js
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
```

- [ ] **Step 2: Run tests to verify new ones fail**

Run: `npm test -- --testPathPattern=booking`
Expected: 2 read tests PASS, write/edge tests FAIL — `bookingClient.create is not a function`

- [ ] **Step 3: Add write ops to `src/BookingClient.js`**

- `create(payload)`: POST `${baseUrl}/booking`, `{ headers: { Accept: 'application/json' }, timeout: 10000 }`, JSON body. Return `response.data`.
- `update(bookingId, payload, token)`: PUT `${baseUrl}/booking/${bookingId}`, headers `{ Cookie: \`token=${token}\`, 'Content-Type': 'application/json', Accept: 'application/json' }`, `timeout: 10000`. Return `response.data`.
- `partialUpdate(bookingId, payload, token)`: PATCH same headers as `update`. Return `response.data`.
- `delete(bookingId, token)`: DELETE `${baseUrl}/booking/${bookingId}`, headers `{ Cookie: \`token=${token}\` }`, `timeout: 10000`. Return `response.status`.

- [ ] **Step 4: Run full suite**

Run: `npm test`
Expected: 12 tests pass, 0 fail

- [ ] **Step 5: Commit and push**

```bash
git add src/BookingClient.js tests/booking.test.js
git commit -m "feat: booking write ops, edge cases, full suite green"
git push origin main
```
