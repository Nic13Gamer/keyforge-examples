import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello World!');
});

serve(
  {
    fetch: app.fetch,
    port: 8787,
  },
  () => console.log('Server is running on http://localhost:8787')
);
