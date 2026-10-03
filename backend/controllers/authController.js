/**
 * Auth Controller – Admin login
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');

// Demo admin (used when Supabase is not configured)
const DEMO_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@mercysblog.com',
  // Pre-hashed "Admin12345" for demo – replace in production
  password: 'Admin12345'
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // ---------- Supabase Auth path ----------
    if (supabaseAdmin) {
      /*
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Optionally check if user has admin role in a profiles table
      const token = jwt.sign(
        { id: data.user.id, email: data.user.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: data.user.id, email: data.user.email }
      });
      */
    }

    // ---------- Demo / fallback path ----------
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const token = jwt.sign(
        { id: 'admin-1', email: DEMO_ADMIN.email, role: 'admin' },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: rememberMe ? '30d' : '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: 'admin-1', email: DEMO_ADMIN.email, role: 'admin' }
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
