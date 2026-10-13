CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  network TEXT NOT NULL,
  asset TEXT NOT NULL,
  payer_address TEXT NOT NULL,
  email TEXT NOT NULL,
  amount_units TEXT NOT NULL,
  amount_usdc TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','report_ready','delivered','expired','failed')),
  tx_hash TEXT UNIQUE,
  paid_block BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_block BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_pending_payment
  ON orders(status, payer_address, amount_units, created_block, expires_at);
CREATE TABLE IF NOT EXISTS reports (
  order_id UUID PRIMARY KEY REFERENCES orders(id),
  report_json TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'usdc';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_id_unique ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_payment_intent_id_unique ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
