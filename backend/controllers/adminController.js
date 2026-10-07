/**
 * Admin Controller – Stats & Site Content
 */

const { supabaseAdmin } = require('../config/supabase');
const commentsController = require('./commentsController');

// In-memory site content for demo
let siteContent = {
  homepage: {
    heroBadge: 'Featured',
    heroTitle: 'Finding Balance in a Busy World',
    heroExcerpt: 'In a world that never stops, learning how to pause, breathe, and prioritize what truly matters has become one of the most valuable skills we can develop.',
    aboutText: 'Sharing honest thoughts on lifestyle, personal growth, relationships, and the everyday moments that shape us.',
    footerTagline: 'Personal thoughts on lifestyle, growth, and the things that matter.',
    heroImage: '/assets/images/featured.jpg'
  },
  profile: {
    profileName: 'Mercy',
    profileTagline: 'Writer · Thinker · Everyday Observer',
    profileBio: 'Sharing honest thoughts on lifestyle, personal growth, relationships, and the quiet moments that shape who we become.',
    aboutLong: 'Hi, I\'m Mercy...',
    statArticles: '40+',
    statTotalViews: '28k',
    statTotalReaders: '3.2k',
    avatarImage: '/assets/images/avatar.jpg'
  }
};

// ---------- STATS ----------
exports.getStats = async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { count: postsCount } = await supabaseAdmin
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Sum views & likes from posts (real engagement)
      let totalViews = 0;
      let totalLikes = 0;
      const { data: engagementRows } = await supabaseAdmin
        .from('posts')
        .select('views, likes');

      if (engagementRows && engagementRows.length) {
        engagementRows.forEach(function (row) {
          totalViews += Number(row.views) || 0;
          totalLikes += Number(row.likes) || 0;
        });
      }

      return res.json({
        success: true,
        stats: {
          visitors: totalViews, // approximate unique visitors unavailable without analytics
          views: totalViews,
          posts: postsCount || 0,
          likes: totalLikes,
          comments: await commentsController.countComments(),
          readers: totalViews
        }
      });
    }

    // Demo stats
    res.json({
      success: true,
      stats: {
        visitors: 12480,
        views: 48320,
        posts: 42,
        likes: 3840,
        comments: 1256,
        readers: 3210
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// ---------- SITE CONTENT ----------
exports.getSiteContent = async (req, res) => {
  try {
    const { section } = req.params; // 'homepage' | 'profile'

    if (!['homepage', 'profile'].includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section' });
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .select('content')
        .eq('section', section)
        .maybeSingle();

      if (error) throw error;

      if (data && data.content) {
        return res.json({ success: true, content: data.content });
      }
      // Fall through to in-memory defaults if row missing
    }

    const content = siteContent[section];
    if (!content) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.json({ success: true, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

exports.updateSiteContent = async (req, res) => {
  try {
    const { section } = req.params; // 'homepage' | 'profile'
    const updates = req.body;

    if (!['homepage', 'profile'].includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section' });
    }

    if (supabaseAdmin) {
      // Merge with existing content if present
      let merged = { ...(siteContent[section] || {}), ...updates };

      const { data: existing } = await supabaseAdmin
        .from('site_content')
        .select('content')
        .eq('section', section)
        .maybeSingle();

      if (existing && existing.content) {
        merged = { ...existing.content, ...updates };
      }

      const { data, error } = await supabaseAdmin
        .from('site_content')
        .upsert({
          section,
          content: merged,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, message: `${section} content updated`, content: data.content });
    }

    siteContent[section] = { ...siteContent[section], ...updates };
    res.json({
      success: true,
      message: `${section} content updated`,
      content: siteContent[section]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
};
