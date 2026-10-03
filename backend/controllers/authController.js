/**
 * Auth Controller – Admin login
 * 
 */

const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

function getAdminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || ''
  };
}

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = getAdminCredentials();

    // Fail closed if credentials are not configured in production
    if (!admin.email || !admin.password) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD is not set');
      return res.status(500).json({
        success: false,
        message: 'Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server.'
      });
    }

    // ---------- Env-based admin login ----------
    if (
      email.trim().toLowerCase() === admin.email &&
      password === admin.password
    ) {
      const token = jwt.sign(
        { id: 'admin-1', email: admin.email, role: 'admin' },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d') }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: 'admin-1', email: admin.email, role: 'admin' }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};





