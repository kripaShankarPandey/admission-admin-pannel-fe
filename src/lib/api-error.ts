/**
 * Pull the human-readable message out of an axios-style API error.
 *
 * Nest's ValidationPipe returns `message` as an array of field errors, so both
 * shapes are handled. Anything unrecognised falls back to the caller's text.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.length > 0) return message;
  return fallback;
}
