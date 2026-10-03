/**
 * Posts Controller
 * Public: list, get single
 * Admin: create, update, delete
 */

const { supabase, supabaseAdmin } = require('../config/supabase');

// In-memory store for demo when Supabase is not connected
let demoPosts = [
  {
    id: 1,
    title: 'Finding Balance in a Busy World',
    slug: 'finding-balance-in-a-busy-world',
    excerpt: 'In a world that never stops, learning how to pause...',
    content: 'Full content here...',
    category: 'lifestyle',
    tags: ['balance', 'mindfulness'],
    status: 'published',
    author: 'Mercy',
    image: '/assets/images/featured.jpg',
    views: 2400,
    likes: 186,
    created_at: '2025-09-28T10:00:00Z',
    updated_at: '2025-09-28T10:00:00Z'
  }
];

// ---------- PUBLIC ----------
exports.getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, status = 'published' } = req.query;

    if (supabase) {
      /*
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const from = (page - 1) * limit;
      const to = from + Number(limit) - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return res.json({
        success: true,
        posts: data,
        total: count,
        page: Number(page),
        hasMore: count > page * limit
      });
      */
    }

    // Demo fallback
    let posts = demoPosts.filter(p => p.status === status);
    if (category && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }
    const start = (page - 1) * limit;
    const sliced = posts.slice(start, start + Number(limit));

    res.json({
      success: true,
      posts: sliced,
      total: posts.length,
      page: Number(page),
      hasMore: posts.length > page * limit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    if (supabase) {
      /*
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      return res.json({ success: true, post: data });
      */
    }

    const post = demoPosts.find(p => p.id == idOrSlug || p.slug === idOrSlug);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
};

// ---------- ADMIN ----------
exports.createPost = async (req, res) => {
  try {
    const { title, type, excerpt, content, tags, status = 'draft' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPost = {
      id: Date.now(),
      title,
      slug,
      excerpt: excerpt || '',
      content,
      category: type || 'general',
      tags: Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []),
      status,
      author: 'Mercy',
      image: req.file ? `/uploads/${req.file.filename}` : null,
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabaseAdmin) {
      /*
      const { data, error } = await supabaseAdmin
        .from('posts')
        .insert([newPost])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, post: data });
      */
    }

    demoPosts.unshift(newPost);
    res.status(201).json({ success: true, message: 'Post created', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (supabaseAdmin) {
      /*
      const { data, error } = await supabaseAdmin
        .from('posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, post: data });
      */
    }

    const index = demoPosts.findIndex(p => p.id == id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    demoPosts[index] = { ...demoPosts[index], ...updates, updated_at: new Date().toISOString() };
    res.json({ success: true, post: demoPosts[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (supabaseAdmin) {
      /*
      const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, message: 'Post deleted' });
      */
    }

    demoPosts = demoPosts.filter(p => p.id != id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
};
