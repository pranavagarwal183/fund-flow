import type { IncomingMessage, ServerResponse } from "http";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import https from "https";
import { decompress } from "@mongodb-js/zstd";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// --- Constants ---
const DB_ZST_URL = "https://github.com/captn3m0/historical-mf-data/releases/latest/download/funds.db.zst";
const CACHE_DIR = path.join(os.tmpdir(), "fund-flow-cache");
const ZST_PATH = path.join(CACHE_DIR, "funds.db.zst");
const DB_PATH = path.join(CACHE_DIR, "funds.db");
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// --- Database Singleton ---
let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

// --- Helper Functions ---
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      // Handle non-200 responses
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
      }
      const file = fsSync.createWriteStream(dest);
      response.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    });
    request.on("error", (err) => {
      fs.unlink(dest).catch(() => {}).finally(() => reject(err));
    });
  });
}

async function decompressZstd(src: string, dest: string): Promise<void> {
  const compressedData = await fs.readFile(src);
  // 'decompress' is an async function, not a class
  const decompressedData = await decompress(compressedData);
  await fs.writeFile(dest, decompressedData);
}

async function isFresh(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return (Date.now() - stats.mtimeMs) < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

async function getDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    await ensureCacheDir();
    const dbExists = fsSync.existsSync(DB_PATH);
    if (!dbExists || !(await isFresh(DB_PATH))) {
      await downloadFile(DB_ZST_URL, ZST_PATH);
      await decompressZstd(ZST_PATH, DB_PATH);
    }

    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY,
    });
    // Optional performance pragmas
    await db.exec("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;");
    return db;
  })();
  
  return dbPromise;
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

// --- Main Handler ---
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const method = (req.method || "GET").toUpperCase();
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const db = await getDatabase();

    // --- GET: Search for funds by name ---
    if (method === "GET") {
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) {
        return sendJson(res, 400, { error: "Query parameter 'q' is required" });
      }
      
      const rows = await db.all(
        `SELECT s.isin, sc.scheme_code, sc.scheme_name 
         FROM securities s
         LEFT JOIN schemes sc ON s.scheme_code = sc.scheme_code
         WHERE sc.scheme_name LIKE ? 
         LIMIT 50`,
        `%${q}%`
      );
      
      return sendJson(res, 200, { results: rows });
    }

    // --- POST: Get latest NAV for a list of ISINs ---
    if (method === "POST") {
      let body = "";
      await new Promise<void>((resolve) => {
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => resolve());
      });

      let payload: { isins?: string[] };
      try {
        payload = JSON.parse(body || "{}");
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON body" });
      }
      
      const isins = Array.isArray(payload.isins) ? [...new Set(payload.isins.filter(Boolean))] : [];
      if (isins.length === 0) {
        return sendJson(res, 400, { error: "Body must include a non-empty 'isins' array" });
      }

      const placeholders = isins.map(() => "?").join(",");
      const rows = await db.all(
        `SELECT isin, nav, date
         FROM nav_by_isin
         WHERE isin IN (${placeholders})
         AND date = (SELECT MAX(date) FROM nav_by_isin WHERE isin = nav_by_isin.isin)
        `,
        isins
      );

      return sendJson(res, 200, { results: rows });
    }

    return sendJson(res, 405, { error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("API Error:", err);
    return sendJson(res, 500, { error: "An internal server error occurred" });
  }
}