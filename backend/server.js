/**
 * Mercy's Blog – Express Backend
 * Tech: Express + Supabase
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Normalize FRONTEND_URL (strip trailing slash) for CORS
function normalizeOrigin(url) {
  if (!url) return null;
  return String(url).trim().replace(/\/+$/, '');
}

const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
const allowedOrigins = [
  frontendOrigin,
  'https://mercys-blog.vercel.app',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
].filter(Boolean);

// ---------- Middleware ----------
// Allow browser on Vercel to read API responses (critical for login)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser tools (no Origin header) and listed frontends
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts' }
});
app.use('/api/admin/login', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Routes ----------
app.use('/api/admin', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mercys Blog API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS: origin not allowed' });
  }
  // Multer errors
  if (err.name === 'MulterError' || (err.message && /image|file|upload/i.test(err.message) && err.message.length < 120)) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Mercy's Blog API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`   Env: ${process.env.NODE_ENV || 'development'}\n`);
});
