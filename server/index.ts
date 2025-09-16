import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { decompress } from '@mongodb-js/zstd';

const app = express();
app.use(express.json({ limit: '1mb' }));

// --- Constants ---
const DB_ZST_URL = 'https://github.com/captn3m0/historical-mf-data/releases/latest/download/funds.db.zst';
const CACHE_DIR = path.join(os.tmpdir(), 'fund-flow-cache');
const ZST_PATH = path.join(CACHE_DIR, 'funds.db.zst');
const DB_PATH = path.join(CACHE_DIR, 'funds.db');
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// --- Database Singleton ---
let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

// --- Helper Functions ---
async function ensureCacheDir() {
  if (!fsSync.existsSync(CACHE_DIR)) {
    fsSync.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
      }
      const file = fsSync.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });
    request.on('error', (err) => {
      fs.unlink(dest).catch(() => {}).finally(() => reject(err));
    });
  });
}

// CORRECTED: Use async decompress function
async function decompressZstd(src: string, dest: string): Promise<void> {
  const compressedData = await fs.readFile(src);
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
    if (!fsSync.existsSync(DB_PATH) || !(await isFresh(DB_PATH))) {
      await downloadFile(DB_ZST_URL, ZST_PATH);
      await decompressZstd(ZST_PATH, DB_PATH);
    }
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY,
    });
    await db.exec('PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;');
    return db;
  })();
  return dbPromise;
}

// --- API Routes ---
app.get('/api/funds', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }
    const db = await getDatabase();
    // CORRECTED: Join schemes and securities to get ISIN
    const rows = await db.all(
      `SELECT s.isin, sc.scheme_code, sc.scheme_name
       FROM securities s
       LEFT JOIN schemes sc ON s.scheme_code = sc.scheme_code
       WHERE sc.scheme_name LIKE ?
       LIMIT 50`,
      `%${q}%`
    );
    res.json({ results: rows });
  } catch (e: any) {
    console.error('GET /api/funds Error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/funds', async (req: Request, res: Response) => {
  try {
    const isins: string[] = Array.isArray(req.body?.isins) ? [...new Set(req.body.isins.filter(Boolean))] : [];
    if (isins.length === 0) {
      return res.status(400).json({ error: "Body must include a non-empty 'isins' array" });
    }
    const db = await getDatabase();
    // CORRECTED: Use the simple nav_by_isin view for latest NAV
    const placeholders = isins.map(() => '?').join(',');
    const rows = await db.all(
      `SELECT isin, nav, date
       FROM nav_by_isin
       WHERE isin IN (${placeholders})
       AND date = (SELECT MAX(date) FROM nav_by_isin WHERE isin = nav_by_isin.isin)
      `,
      isins
    );
    res.json({ results: rows });
  } catch (e: any) {
    console.error('POST /api/funds Error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001; // Changed default port to 3001
app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});