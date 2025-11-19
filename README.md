## Mobile Restaurant Menu — Full Stack Setup

This repo now contains:

- A Next.js 16 front end (project root).
- A standalone Express API in `server/` that handles authentication and dashboard data backed by MongoDB.

## Prerequisites

- Node.js 18+
- A MongoDB cluster (local or hosted)

## Environment Variables

### Front end (`.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Update this to the deployed API URL when hosting the project.

### API server (`server/.env`)

```
PORT=4000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-string
```

Adjust the values for your environment prior to running the API.

## Installation

Install dependencies for both the front end and the API:

```bash
# Front end
npm install

# API server
cd server
npm install
```

## Running Locally

Run each project in its own terminal session.

Front end:

```bash
npm run dev
```

API server:

```bash
cd server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the customer experience. The floating “Admin login” button links to the admin portal.

## Creating an Admin Account

Visit [http://localhost:3000/admin/signup](http://localhost:3000/admin/signup) to create the first admin user and then sign in at `/admin`.

Prefer to seed via the shell?

```js
db.admins.insertOne({
  email: "admin@example.com",
  password: "$2a$12$eR0uQTP3P8QHzTyZ1BWzuOKbYKT5iDJrpVlzDqgW8sELpAo0P5uQ2", // hashed "password123"
});
```

> Replace the hash if you prefer a different password. Generate bcrypt hashes with `bcryptjs` or any compatible utility.

## Populating Restaurants

The admin dashboard reads from the `restaurants` collection. Example seed:

```js
db.restaurants.insertMany([
  {
    name: "The Burger Palace",
    cuisine: "American - Burgers",
    status: "active",
    todayOrders: 127,
    todayRevenue: 2845,
    totalMenuItems: 24,
    rating: 4.6,
    trend: "up",
    trendPercentage: 12,
  },
]);
```

Add as many documents as you like—the dashboard aggregates totals automatically.

## Admin Workflow

1. Visit `/admin` and sign in.
2. Successful login sets an HTTP-only cookie and redirects to `/admin/dashboard`.
3. Use the “Sign out” button to end the session.

## API Endpoints (Express server)

| Method | Route              | Description                         | Auth |
| ------ | ------------------ | ----------------------------------- | ---- |
| POST   | `/api/auth/signup` | Create a new admin account          | No   |
| POST   | `/api/auth/login`  | Authenticate admin & set session    | No   |
| POST   | `/api/auth/logout` | Destroy admin session               | Yes  |
| GET    | `/api/dashboard`   | Protected restaurant dashboard data | Yes  |

Protected routes require the `admin-token` cookie issued during login.

## Lahza Payments

Table bills now support contactless Lahza (Lahza) checkout directly from the customer tablet/phone.

Each restaurant/admin can store its own Lahza credentials (public key plus optional merchant/currency overrides). Use the authenticated endpoint:

```
PUT /api/restaurant
{
  "paymentConfig": {
    "lahza": {
      "publicKey": "pk_live_xxx",
      "currency": "ILS",
      "merchantId": "merchant_123"
    }
  }
}
```

Only the public key/currency are ever returned to diners.

1. For each admin, copy their Lahza **public key** into the restaurant settings via the API (UI coming soon) so guest checkout uses the right merchant.
2. Ensure your ordering tablets send `restaurantId` metadata (already handled in `app/[restaurant]/[table]/page.tsx`) so payments pick up the right key automatically.
3. (Optional) Adjust `NEXT_PUBLIC_LAHZA_CURRENCY` or the per-restaurant `currency` field if you charge in anything other than ILS.

Customers see a “Pay with Lahza” button inside the bill view. Successful charges flip the order’s payment status to **Paid** instantly after the popup reports success.

## Deployment Notes

- Deploy the front end and API separately (e.g. Vercel + Render/Fly/Heroku).
- Point `NEXT_PUBLIC_API_BASE_URL` at the live API URL.
- Provide MongoDB and JWT environment variables to the API server.

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)

Leverage the broader Next.js + Express ecosystem for additional patterns and tooling.
