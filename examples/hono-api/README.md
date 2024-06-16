# Hono API

Basic API server built with [Hono](https://hono.dev). It uses the [Keyforge Node.js SDK](https://docs.keyforge.dev) to work with licenses. This example uses TypeScript.

## How to use

Install dependencies:

```bash
npm install
```

Create a `.env` file and set environment variables:

```bash
KEYFORGE_API_KEY=sk_...
KEYFORGE_PRODUCT_ID=p_123456
```

Run the dev server:

```bash
npm run dev
```

## API Endpoints

- `GET /download`: Validate a license key and return an example download link if the license is valid.

- `POST /activate`: Activate a license. Requires `licenseKey`, `deviceIdentifier`, and `deviceName` in the request body.

- `POST /validate`: Validate a license. Requires `licenseKey`, and `deviceIdentifier` in the request body.
