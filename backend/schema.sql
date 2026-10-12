PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  network TEXT NOT NULL,
  asset TEXT NOT NULL,
  payer_address TEXT NOT NULL,
  email TEXT NOT NULL,
  amount_units TEXT NOT NULL,
  amount_usdc TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','paid','report_ready','delivered','expired','failed')),
  tx_hash TEXT UNIQUE,
  paid_block INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_block INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_pending_payment ON orders(status, payer_address, amount_units, created_block, expires_at);
CREATE TABLE IF NOT EXISTS reports (
  order_id TEXT PRIMARY KEY REFERENCES orders(id),
  report_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
