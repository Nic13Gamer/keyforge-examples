# Electron Application

Simple desktop app built with Electron, protected with licenses by [Keyforge](https://keyforge.dev). No backend is required, licenses are validated and activated using the Keyforge public REST API.

**This example requires an internet connection on startup to validate and activate licenses.**

It does not use Keyforge client SDK `@keyforge/client` to keep things as simple as possible.

## How to use

Install dependencies:

```bash
npm install
```

Set your Keyforge product ID in `main.js`:

```js
const KEYFORGE_PRODUCT_ID = 'p_123456';
```

Run the app:

```bash
npm start
```

## How it works

When you run the app, it will ask you to activate it with a license key. After activation, the license key will be saved to disk and validated on each run. An internet connection is required to validate and activate the license.

To validate and activate licenses, this app makes use of the Keyforge public REST API. You can find more information about it [here](https://docs.keyforge.dev/api-reference/public).
