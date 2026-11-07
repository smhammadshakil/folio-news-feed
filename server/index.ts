import { serve } from "@hono/node-server";
import { app, env } from "./app.js";

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`Folio API listening on ${info.port} (${env.dataMode})`);
});
