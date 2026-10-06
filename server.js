// server.js — The Common Grounds Cafe Management Software (backend entrypoint)
// Runs fully on the local PC — no internet required (feature 13: Offline Mode).
// Any device on the same Wi-Fi/LAN can reach it via the PC's local IP (feature 14: Multi-device).

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const os = require('os');

const app = express();

// Reverse-proxy aware deployment: production deployments normally sit behind
// Caddy/Nginx/Cloudflare. Keep this disabled unless explicitly requested.
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

// Security headers. CSP is relaxed for scripts/styles since this app serves
// its own bundled JS/CSS from the same origin with no external script
// sources — crossOriginEmbedderPolicy is off because it can interfere with
// loading the Google Fonts used by the theme.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  } : true,
  credentials: false,
}));
app.use(express.json({ limit: '15mb' })); // generous limit for base64 product/logo images

// Brute-force protection on login: 20 attempts per 15 minutes per IP. This
// only limits login itself — normal use of an already-issued token is
// unaffected. 20 (not a stricter number like 5-10) is deliberate: this is a
// single shared terminal multiple staff log in and out of during a shift,
// so a tighter limit risks locking out legitimate use during a busy
// shift-change — 20 guesses in 15 minutes is still nowhere near enough to
// brute-force a real password.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
});
app.use('/api/auth/login', loginLimiter);

// Lightweight unauthenticated health endpoint for reverse proxies, Docker, and uptime checks.
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'the-common-grounds', time: new Date().toISOString() }));

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/recipes'));
app.use('/api', require('./routes/inventory'));
app.use('/api', require('./routes/orders'));
app.use('/api', require('./routes/tables'));
app.use('/api', require('./routes/customers'));
app.use('/api', require('./routes/suppliers'));
app.use('/api', require('./routes/expenses'));
app.use('/api', require('./routes/settings'));
app.use('/api', require('./routes/backup'));
app.use('/api', require('./routes/reports'));
app.use('/api', require('./routes/dayclose'));
app.use('/api', require('./routes/golive'));
app.use('/api', require('./routes/activitylog'));
app.use('/api', require('./routes/hr'));
app.use('/api', require('./routes/roles'));

// ---- Serve the built frontend (production) ----
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST));
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
    if (err) res.status(200).send('Frontend not built yet. Run "npm run build" inside /frontend, or run the frontend dev server on port 5173.');
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

app.listen(PORT, HOST, () => {
  console.log('=================================================');
  console.log('  The Common Grounds — Cafe Management Software');
  console.log('=================================================');
  console.log(`  Local access:   http://localhost:${PORT}`);
  console.log(`  Network access: http://${getLocalIp()}:${PORT}  (use this on tablets/other PCs)`);
  console.log('=================================================');

  require('./backup-scheduler').startScheduler();
});
