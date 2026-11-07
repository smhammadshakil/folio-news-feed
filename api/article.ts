import { app } from "../server/app.ts";

export const runtime = "nodejs";

export function GET(request: Request): Promise<Response> | Response {
  return app.fetch(request);
}
