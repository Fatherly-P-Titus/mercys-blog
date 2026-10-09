/**
 * Comments Controller
 * Public: list approved comments, create comment
 * Admin: delete comment
 */

const { supabase, supabaseAdmin } = require('../config/supabase');

// In-memory store when Supabase table is unavailable
let demoComments = [];
let demoId = 1;

function sanitizeText(str, max) {
  return String(str || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);
}

function isMissingTableError(err) {
  if (!err) return false;
  const msg = String(err.message || err.details || err.hint || '');
  const code = String(err.code || '');
  return (
    code === '42P01' ||
    /relation .* does not exist/i.test(msg) ||
    /could not find the table/i.test(msg) ||
    /schema cache/i.test(msg)
  );
}

// ---------- LIST (public) ----------
exports.getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const client = supabaseAdmin || supabase;

    if (client) {
      const { data, error } = await client
        .from('comments')
        .select('id, post_id, author_name, content, created_at')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) {
        if (isMissingTableError(error)) {
          console.warn('comments table missing — returning empty list');
          return res.json({
            success: true,
            comments: [],
            total: 0,
            warning: 'Comments table not set up yet'
          });
        }
        throw error;
      }

      return res.json({
        success: true,
        comments: data || [],
        total: (data || []).length
      });
    }

    const list = demoComments.filter(
      (c) => String(c.post_id) === String(postId) && c.status === 'approved'
    );
    res.json({ success: true, comments: list, total: list.length });
  } catch (err) {
    console.error('getComments error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to load comments'
    });
  }
};

// ---------- CREATE (public) ----------
exports.createComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const author_name = sanitizeText(req.body.author_name || req.body.name, 50);
    const content = sanitizeText(req.body.content || req.body.text, 2000);

    if (!author_name || author_name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a name (at least 2 characters)'
      });
    }
    if (!content || content.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please write a comment (at least 2 characters)'
      });
    }

    const readClient = supabaseAdmin || supabase;
    const writeClient = supabaseAdmin || supabase;

    // Ensure post exists and is published
    if (readClient) {
      const { data: post, error: postErr } = await readClient
        .from('posts')
        .select('id, status')
        .eq('id', postId)
        .maybeSingle();

      if (postErr) throw postErr;
      if (!post || post.status !== 'published') {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
    }

    const row = {
      post_id: Number(postId) || postId,
      author_name,
      content,
      status: 'approved',
      created_at: new Date().toISOString()
    };

    if (writeClient) {
      const { data, error } = await writeClient
        .from('comments')
        .insert([row])
        .select('id, post_id, author_name, content, created_at')
        .single();

      if (error) {
        if (isMissingTableError(error)) {
          return res.status(503).json({
            success: false,
            message:
              'Comments are not set up yet. Create the comments table in Supabase (see COMMENTS_SETUP.md).'
          });
        }
        console.error('createComment supabase error:', error);
        return res.status(500).json({
          success: false,
          message: error.message || 'Failed to post comment'
        });
      }
      return res.status(201).json({ success: true, message: 'Comment posted', comment: data });
    }

    const demo = { ...row, id: demoId++ };
    demoComments.push(demo);
    res.status(201).json({ success: true, message: 'Comment posted', comment: demo });
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to post comment'
    });
  }
};

// ---------- DELETE (admin) ----------
exports.deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const client = supabaseAdmin || supabase;

    if (client) {
      const { error } = await client
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('post_id', postId);

      if (error) {
        if (isMissingTableError(error)) {
          return res.status(503).json({
            success: false,
            message: 'Comments table not set up yet'
          });
        }
        throw error;
      }
      return res.json({ success: true, message: 'Comment deleted' });
    }

    demoComments = demoComments.filter(
      (c) => !(String(c.id) === String(commentId) && String(c.post_id) === String(postId))
    );
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

// ---------- COUNT (for stats) ----------
exports.countComments = async () => {
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const { count, error } = await client
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      if (error) return 0;
      return count || 0;
    } catch (e) {
      return 0;
    }
  }
  return demoComments.filter((c) => c.status === 'approved').length;
};
