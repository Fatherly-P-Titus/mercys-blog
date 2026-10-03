/**
 * Admin Controller – Stats & Site Content
 */

const { supabaseAdmin } = require('../config/supabase');

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
      /*
      // Example: aggregate from tables
      const { count: postsCount } = await supabaseAdmin
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // You would also query analytics / likes / comments tables
      return res.json({
        success: true,
        stats: {
          visitors: 12480,
          views: 48320,
          posts: postsCount || 0,
          likes: 3840,
          comments: 1256,
          readers: 3210
        }
      });
      */
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

    if (supabaseAdmin) {
      /*
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .select('content')
        .eq('section', section)
        .single();

      if (error) throw error;
      return res.json({ success: true, content: data.content });
      */
    }

    const content = siteContent[section];
    if (!content) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.json({ success: true, content });
  } catch (err) {
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
      /*
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .upsert({ section, content: updates, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, content: data.content });
      */
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
