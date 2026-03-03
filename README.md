# 🌌 Intergalactic Bank API

REST API for bank accounts and transactions with multi-currency support (COSMIC_COINS, GALAXY_GOLD, MOON_BUCKS).

## Quick Start

```bash
npm install && npm run dev
curl http://localhost:3000/health
```

Default: **http://localhost:3000**. Generate API key: `GET /api/v1/auth`. Default admin key: `1234`.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/api/v1/auth` | GET | No | Generate API key |
| `/api/v1/accounts` | GET, POST | Yes | List / create accounts |
| `/api/v1/accounts/:id` | GET, PUT, DELETE | Yes | Get / update / delete (soft) |
| `/api/v1/transactions` | GET, POST | Yes | List / transfer or deposit |
| `/api/v1/transactions/:id` | GET | Yes | Get transaction |

**Auth:** send `x-api-key: your-key` on all protected routes. **Rate limit:** 300 req/min per key.

## Postman

1. Import `OpenAPI/Bank API Reference Documentation.postman_collection.json`
2. Set `baseUrl` → `http://localhost:3000`, `apiKey` → `1234`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (auto-reload) |
| `npm start` | Production |
| `npm test` | Run tests |
| `npm test -- --coverage` | Tests + coverage |
| `npm run lint` | Lint |

## Config (optional `.env`)

```
PORT=3000
ADMIN_API_KEY=1234
RATE_LIMIT_REQUESTS=300
RATE_LIMIT_WINDOW_MS=60000
```

## Project Layout

```
src/
├── server.js           # Entry
├── database/db.js      # In-memory store
├── models/             # Account, Transaction
├── routes/             # admin, accounts, transactions
└── middleware/         # auth, errorHandler, rateLimit
```

## Important Behavior

- **Ownership** – Accounts are scoped to the API key that created them.
- **Soft delete** – Deleted accounts are flagged; history kept.
- **Editable** – Only `owner` and `accountType`; balance/currency change via transactions only.

## Example Requests

**Create account** `POST /api/v1/accounts`:
```json
{ "owner": "John Doe", "currency": "COSMIC_COINS", "balance": 1000, "accountType": "STANDARD" }
```

**Transfer** `POST /api/v1/transactions`:
```json
{ "fromAccountId": "123", "toAccountId": "456", "amount": 500, "currency": "COSMIC_COINS" }
```

**Deposit** – Use `"fromAccountId": "0"`.

## Error Format

```json
{ "error": { "name": "errorType", "message": "Description" } }
```

Common codes: **400** validation, **401** auth, **403** forbidden, **404** not found, **429** rate limit, **500** server error.

## Sample Data (on startup)

- Nova Newman (10k COSMIC_COINS), Gary Galaxy (237 COSMIC_COINS), Luna Starlight (5k GALAXY_GOLD) – all under admin key `1234`.

## Account Types & Currencies

**Types:** STANDARD, PREMIUM, BUSINESS. **Currencies:** COSMIC_COINS, GALAXY_GOLD, MOON_BUCKS.

## Replacing Storage

Swap in a real DB by updating `src/database/db.js` with your driver and CRUD; the rest of the app stays the same.

---

**More detail** → `CLAUDE.md` · **Tests** → `npm test`

License: ISC
