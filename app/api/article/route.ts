import { app } from "../../../server/app.js";

export const runtime = "nodejs";

export function GET(request: Request): Promise<Response> | Response {
  return app.fetch(request);
}
