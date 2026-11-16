# Restful Booker API Test Suite (JavaScript)

Standalone JavaScript API test suite for the [Restful Booker](https://restful-booker.herokuapp.com) API.

## Stack

- Node.js 22 · Jest 29 · axios · allure-jest

## Run locally

```bash
npm install
npm test
```

## Generate Allure report

```bash
npm run report
npm run report:open
```

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
