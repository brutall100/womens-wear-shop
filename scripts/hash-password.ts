// Prints an ADMIN_PASSWORD_HASH line for `.env`.
// Usage: npm run hash-password -- "your-long-password"
import { hashPassword } from "../lib/password.ts";

const password = process.argv[2] ?? "";

if (password.length < 10) {
  console.error('Usage: npm run hash-password -- "your-long-password"  (at least 10 characters)');
  process.exit(1);
}

console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
