export function formatError(err: unknown): string {
  if (err instanceof Error) {
    return `${err.message}${err.stack ? `\nStack: ${err.stack}` : ""}`;
  }
  return String(err);
}
