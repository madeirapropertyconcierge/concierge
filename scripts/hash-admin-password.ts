import { createScryptHash } from '../src/cms/auth';

const password = process.argv[2];

if (!password) {
  console.error('Usage: bun run scripts/hash-admin-password.ts "your-password"');
  process.exit(1);
}

console.log(createScryptHash(password));
