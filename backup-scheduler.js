// backup-scheduler.js — fully automated backups, no manual action required.
// Runs once at startup (covers the common case of the app only running
// during business hours) and then every 24 hours after that, writing a
// timestamped copy of the database into data/auto-backups/. Keeps the most
// recent 30 backups and prunes older ones automatically so disk usage
// doesn't grow unbounded.
const fs = require('fs');
const path = require('path');
const db = require('./db');

const BACKUP_DIR = path.join(db.DATA_DIR, 'auto-backups');
const KEEP_COUNT = 30;
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function runBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    db.pragma('wal_checkpoint(FULL)'); // flush WAL so the copied file is complete/consistent
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(BACKUP_DIR, `auto-backup-${stamp}.db`);
    fs.copyFileSync(db.DB_PATH, dest);

    // Prune old backups beyond KEEP_COUNT
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.db'))
      .map((f) => ({ f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    files.slice(KEEP_COUNT).forEach(({ f }) => fs.unlinkSync(path.join(BACKUP_DIR, f)));

    console.log(`[backup] Automatic backup saved: ${path.basename(dest)} (keeping ${Math.min(files.length, KEEP_COUNT)} of ${files.length})`);
  } catch (e) {
    console.error('[backup] Automatic backup failed:', e.message);
  }
}

function startScheduler() {
  runBackup(); // one on startup — covers cafes that don't run 24/7
  setInterval(runBackup, INTERVAL_MS);
}

module.exports = { startScheduler, runBackup, BACKUP_DIR };
