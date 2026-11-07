import { SourceError } from "./types.js";

export function mapHttpError(name: string, status: number): SourceError {
  if (status === 401 || status === 403) return new SourceError(`${name} rejected the API key`);
  if (status === 429) return new SourceError(`${name} rate limit reached`);
  return new SourceError(`${name} is unavailable`);
}

export function mapThrown(name: string, error: unknown): never {
  if (error instanceof SourceError) throw error;
  if (error instanceof Error && error.name === "AbortError") throw error;
  if (error instanceof Error && error.name === "TimeoutError") {
    throw new SourceError(`${name} timed out`);
  }
  throw new SourceError(`${name} is unavailable`);
}
