import http from "node:http";
import { readFile } from "node:fs/promises";
import pg from "pg";
import worker from "./src/index.js";

const { Pool } = pg;
const port = Number(process.env.PORT || 10000);
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

function adaptSql(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => "$" + (++i));
}

// Keep placeholder numbering local to each query; do not mutate the parameter array.
function databaseAdapter(pgPool) {
  return {
    prepare(sql) {
      let values = [];
      const query = () => pgPool.query(adaptSql(sql), values);
      return {
        bind(...args) { values = args; return this; },
        async first() { const r = await query(); return r.rows[0] ?? null; },
        async run() { const r = await query(); return { meta: { changes: r.rowCount ?? 0 }, results: r.rows }; }
      };
    }
  };
}

const env = {
  DB: pool ? databaseAdapter(pool) : null,
  PAYMENT_RECIPIENT: process.env.PAYMENT_RECIPIENT || "",
  ADMIN_SECRET: process.env.ADMIN_SECRET || "",
  SITE_ORIGIN: process.env.SITE_ORIGIN || "https://wayout4.github.io",
  BASE_RPC_URL: process.env.BASE_RPC_URL || "https://mainnet.base.org",
  CONFIRMATIONS: process.env.CONFIRMATIONS || "12",
  MAX_BLOCK_RANGE: process.env.MAX_BLOCK_RANGE || "1500",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  AI_MODEL: process.env.AI_MODEL || "gpt-4.1-mini"
};

async function initializeDatabase() {
  if (!pool) return;
  const schema = await readFile(new URL("./schema.postgres.sql", import.meta.url), "utf8");
  await pool.query(schema);
  console.log("PostgreSQL schema initialized.");
}

const server = http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const request = new Request(new URL(req.url || "/", "http://" + (req.headers.host || "localhost")), {
      method: req.method,
      headers: req.headers,
      ...(body.length && req.method !== "GET" && req.method !== "HEAD" ? { body } : {})
    });
    const response = await worker.fetch(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("Request failed:", error?.message || error);
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ ok: false, error: "Internal server error" }));
    } else res.end();
  }
});

let verifyTimer;
let verifierRunning = false;
async function runPaymentVerifier() {
  if (verifierRunning) return;
  if (!env.DB || !env.PAYMENT_RECIPIENT || !env.ADMIN_SECRET) {
    console.warn("Payment verifier idle: set DATABASE_URL, PAYMENT_RECIPIENT and ADMIN_SECRET.");
    return;
  }
  verifierRunning = true;
  try {
    const request = new Request("http://localhost/api/admin/verify", {
      method: "POST",
      headers: { authorization: "Bearer " + env.ADMIN_SECRET }
    });
    const response = await worker.fetch(request, env);
    if (!response.ok) console.error("Payment verification returned HTTP", response.status, await response.text());
    else console.log("Payment verification cycle completed.");
  } catch (error) {
    console.error("Payment verification cycle failed:", error?.message || error);
  } finally {
    verifierRunning = false;
  }
}

async function start() {
  await initializeDatabase();
  server.listen(port, "0.0.0.0", () => console.log("BaseGrid Safety API listening on port", port));
  verifyTimer = setInterval(runPaymentVerifier, Math.max(60, Number(process.env.VERIFIER_INTERVAL_SECONDS || 60)) * 1000);
  verifyTimer.unref?.();
  await runPaymentVerifier();
}

function shutdown() {
  clearInterval(verifyTimer);
  server.close(async () => {
    if (pool) await pool.end().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start().catch(error => {
  console.error("Startup failed:", error?.message || error);
  process.exit(1);
});
