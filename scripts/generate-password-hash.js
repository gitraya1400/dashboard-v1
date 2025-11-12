#!/usr/bin/env node

/**
 * Helper script untuk generate bcrypt hash password untuk admin user
 * Usage: node scripts/generate-password-hash.js <password>
 * 
 * Contoh:
 * node scripts/generate-password-hash.js password123
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Password tidak diberikan');
  console.log('');
  console.log('Usage: node scripts/generate-password-hash.js <password>');
  console.log('');
  console.log('Contoh:');
  console.log('  node scripts/generate-password-hash.js password123');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('');
console.log('✅ Hash berhasil dihasilkan:');
console.log('');
console.log(`Password: ${password}`);
console.log(`Hash:     ${hash}`);
console.log('');
console.log('Gunakan hash ini di database untuk User.password');
console.log('');
console.log('Contoh SQL INSERT:');
console.log(`INSERT INTO User (username, email, password, role)`);
console.log(`VALUES ('admin', 'admin@example.com', '${hash}', 'admin');`);
console.log('');
