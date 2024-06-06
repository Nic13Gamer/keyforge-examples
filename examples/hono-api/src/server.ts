import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Keyforge, KeyforgeError } from 'keyforge-js';

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

app.post('/activate', async (c) => {
  const data = (await c.req.json()) as Record<string, string>;
  const { licenseKey, deviceIdentifier, deviceName } = data;

  if (!licenseKey || !deviceIdentifier || !deviceName) {
    c.status(400);

    return c.text(
      '"licenseKey", "deviceIdentifier" and "deviceName" are required.'
    );
  }

  try {
    const license = await keyforge.licenses.activate(licenseKey, {
      productId: PRODUCT_ID,
      device: {
        identifier: deviceIdentifier,
        name: deviceName,
      },
    });

    return c.json({ licenseKey: license.key });
  } catch (error) {
    if (error instanceof KeyforgeError) {
      c.status(400);

      return c.text(error.message);
    }
  }
});

serve(
  {
    fetch: app.fetch,
    port: 8787,
  },
  () => console.log('Server is running on http://localhost:8787')
);
