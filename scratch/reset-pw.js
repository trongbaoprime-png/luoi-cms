const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dbPath = '/root/.omniroute/storage.sqlite';
const db = new Database(dbPath);

console.log('--- CLEAN REPAIR FOR OMNIROUTE SETTINGS ---');

// Hash password "12345678"
const bcryptHash = bcrypt.hashSync('12345678', 12);
console.log('Bcrypt Hash String:', bcryptHash);

// Store JSON encoded values in key_value table
// In key_value table: value is a JSON string. So string values must be JSON.stringify("...")
db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'password', ?)").run(JSON.stringify(bcryptHash));
db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'requireLogin', ?)").run(JSON.stringify(false));
db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'setupComplete', ?)").run(JSON.stringify(true));

const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'settings' AND key IN ('password', 'requireLogin', 'setupComplete')").all();
console.log('Verified Rows in DB:');
for (const r of rows) {
  console.log(r.key, '=> raw:', r.value, '| parsed:', JSON.parse(r.value), '| type of parsed:', typeof JSON.parse(r.value));
}
