/**
 * Comments Controller
 * Public: list approved comments, create comment
 * Admin: delete comment
 */

const { supabase, supabaseAdmin } = require('../config/supabase');

// In-memory store when Supabase is offline
let demoComments = [];
let demoId = 1;

function sanitizeText(str, max) {
  return String(str || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);
}

// ---------- LIST (public) ----------
exports.getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, author_name, content, created_at')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

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
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load comments' });
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

    // Ensure post exists (best-effort)
    if (supabase) {
      const { data: post, error: postErr } = await supabase
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

    if (supabaseAdmin || supabase) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('comments')
        .insert([row])
        .select('id, post_id, author_name, content, created_at')
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Comment posted', comment: data });
    }

    const demo = { ...row, id: demoId++ };
    demoComments.push(demo);
    res.status(201).json({ success: true, message: 'Comment posted', comment: demo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

// ---------- DELETE (admin) ----------
exports.deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('post_id', postId);

      if (error) throw error;
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
  if (supabaseAdmin) {
    const { count } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    return count || 0;
  }
  return demoComments.filter((c) => c.status === 'approved').length;
};
