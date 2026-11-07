import { spawn } from "node:child_process";

const api = spawn("npx", ["tsx", "watch", "server/index.ts"], { stdio: "inherit" });
const web = spawn("npx", ["vite", "--host", "127.0.0.1", "--port", "4173"], { stdio: "inherit" });

function shutdown(code = 0) {
  api.kill("SIGTERM");
  web.kill("SIGTERM");
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
api.on("exit", (code) => {
  if (code) shutdown(code);
});
web.on("exit", (code) => {
  if (code) shutdown(code ?? 1);
});
