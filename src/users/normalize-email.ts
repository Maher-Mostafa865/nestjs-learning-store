/** The form addresses are stored and compared in: trimmed, NFC, lowercase. */
export function normalizeEmail(email: string): string {
  return email.trim().normalize('NFC').toLowerCase();
}
