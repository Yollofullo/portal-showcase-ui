export function sanitizeQRData(input: string): string | null {
  const sanitized = input.trim();
  const isValid = /^[a-zA-Z0-9-_:/?&.=]+$/.test(sanitized);
  return isValid ? sanitized : null;
}