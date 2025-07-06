# Offline Electron Application

Simple desktop app built with Electron, protected with licenses by [Keyforge](https://keyforge.dev). License validation is done offline, by verifying a token. No backend is required, licenses are validated and activated using the Keyforge public REST API.

This example uses the Keyforge client SDK `@keyforge/client` to simplify token verification.

## How to use

Install dependencies:

```bash
npm install
```

Set your Keyforge product ID and product public key JWK in `main.js`:

```js
const KEYFORGE_PRODUCT_ID = 'YOUR_PRODUCT_ID';
const KEYFORGE_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_JWK'; // JWK JSON string or object
```

Run the app:

```bash
npm start
```

## How it works

When you run the app, it will ask you to activate it with a license key. After activation, the returned license token will be saved to disk and verified on each run.

An internet connection is only needed to activate the license and for occasional token refreshes.

This app makes use of the Keyforge public REST API. You can find more information about it [here](https://docs.keyforge.dev/api-reference/public).
