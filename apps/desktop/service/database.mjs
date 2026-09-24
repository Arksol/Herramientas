import fs from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    totp_secret TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'registered',
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);
`;

export async function openUserDatabase(databasePath, legacyPath) {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath, { timeout: 5000 });
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec(schema);
  await importLegacyUsers(database, legacyPath);
  return database;
}

async function importLegacyUsers(database, legacyPath) {
  const count = database.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (Number(count) > 0) return;

  try {
    const parsed = JSON.parse(await fs.readFile(legacyPath, "utf8"));
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) return;
    const insert = database.prepare(`
      INSERT OR IGNORE INTO users
        (identifier, password_hash, totp_secret, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const user of parsed.users) {
      if (!user?.identifier || !user?.passwordHash || !user?.totpSecret) continue;
      insert.run(
        String(user.identifier).toLowerCase(),
        String(user.passwordHash),
        String(user.totpSecret),
        "registered",
        user.createdAt ?? new Date().toISOString()
      );
    }
  } catch {
    // No hay datos JSON antiguos que migrar; SQLite queda como fuente única.
  }
}

export function findUser(database, identifier) {
  return database.prepare(`
    SELECT id, identifier, password_hash AS passwordHash,
           totp_secret AS totpSecret, role, created_at AS createdAt
    FROM users
    WHERE identifier = ?
    LIMIT 1
  `).get(identifier) ?? null;
}

export function createUser(database, user) {
  database.prepare(`
    INSERT INTO users
      (identifier, password_hash, totp_secret, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(user.identifier, user.passwordHash, user.totpSecret, "registered", user.createdAt);
}

export function markUserLogin(database, identifier) {
  database.prepare("UPDATE users SET last_login_at = ? WHERE identifier = ?")
    .run(new Date().toISOString(), identifier);
}
