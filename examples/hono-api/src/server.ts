import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Keyforge } from 'keyforge-js';

const API_KEY = process.env.KEYFORGE_API_KEY!;
const PRODUCT_ID = process.env.KEYFORGE_PRODUCT_ID!;

const app = new Hono();
const keyforge = new Keyforge(API_KEY);

app.get('/download', async (c) => {
  const licenseKey = c.req.query('license_key');

  if (!licenseKey) {
    c.status(400);

    return c.text(
      'License key is required. Use the "license_key" query parameter to specify it.'
    );
  }

  const { isValid } = await keyforge.licenses.validate(licenseKey, {
    productId: PRODUCT_ID,
  });

  if (!isValid) {
    c.status(400);

    return c.text('Invalid license key.');
  }

  return c.text(
    "Thank you for buying our product! Here's the download link: <YOUR_DOWNLOAD_LINK>."
  );
});

serve(
  {
    fetch: app.fetch,
    port: 8787,
  },
  () => console.log('Server is running on http://localhost:8787')
);
