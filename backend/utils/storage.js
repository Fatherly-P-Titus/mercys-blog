/**
 * Upload image buffer to Supabase Storage (bucket: post-images)
 * Falls back to local /uploads if Supabase is unavailable.
 */
const path = require('path');
const fs = require('fs');
const { supabaseAdmin } = require('../config/supabase');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'post-images';

function safeFileName(original) {
  const base = String(original || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return `${Date.now()}-${base}`;
}

/**
 * @param {{ buffer: Buffer, mimetype: string, originalname: string }} file
 * @returns {Promise<string>} public URL or local path
 */
async function uploadPostImage(file) {
  if (!file || !file.buffer) {
    throw new Error('No file provided');
  }

  const fileName = safeFileName(file.originalname);

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error.message);
      throw new Error(error.message || 'Image upload failed');
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
    if (data && data.publicUrl) {
      return data.publicUrl;
    }
    throw new Error('Could not get public URL for uploaded image');
  }

  // Local fallback (dev / no Supabase)
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const dest = path.join(uploadsDir, fileName);
  fs.writeFileSync(dest, file.buffer);
  return `/uploads/${fileName}`;
}

module.exports = { uploadPostImage, BUCKET };
