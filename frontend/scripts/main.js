/**
 * Mercy's Blog - Main Script (Home / Index)
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    // ========== SAMPLE POSTS DATA ==========
    // In production these will come from Supabase / Express API
    const samplePosts = [
        {
            id: 1,
            slug: "the-quiet-power-of-morning-silence",
            title: "The Quiet Power of Morning Silence",
            excerpt: "Before the world wakes up, there is a sacred window of stillness. Here's why protecting those first moments can change the entire tone of your day.",
            category: "lifestyle",
            date: "Sep 25, 2025",
            readTime: "5 min",
            author: "Mercy",
            image: "assets/images/post-1.jpg"
        },
        {
            id: 2,
            title: "Why I Stopped Explaining Myself",
            excerpt: "Not every decision needs a defense. Learning when to simply act and let the results speak has been one of the most freeing shifts in my personal growth.",
            category: "personal",
            date: "Sep 22, 2025",
            readTime: "4 min",
            author: "Mercy",
            image: "assets/images/post-2.jpg"
        },
        {
            id: 3,
            title: "The Comparison Trap on Social Media",
            excerpt: "Scrolling through highlight reels can quietly erode contentment. A honest look at how curated lives affect our mental space and what we can do about it.",
            category: "opinions",
            date: "Sep 18, 2025",
            readTime: "7 min",
            author: "Mercy",
            image: "assets/images/post-3.jpg"
        },
        {
            id: 4,
            title: "Building a Home That Feels Like You",
            excerpt: "Your living space should reflect who you are becoming, not just who you used to be. Practical ideas for creating an environment that supports your current season.",
            category: "lifestyle",
            date: "Sep 14, 2025",
            readTime: "6 min",
            author: "Mercy",
            image: "assets/images/post-4.jpg"
        },
        {
            id: 5,
            title: "On Friendship After 30",
            excerpt: "Friendships evolve. Some deepen, some fade, and new ones appear in unexpected places. Navigating connection with more intention and less pressure.",
            category: "personal",
            date: "Sep 10, 2025",
            readTime: "5 min",
            author: "Mercy",
            image: "assets/images/post-5.jpg"
        },
        {
            id: 6,
            title: "The Myth of Having It All Figured Out",
            excerpt: "We often wait for clarity before taking the next step. But most of the time, the path reveals itself only after we start walking.",
            category: "opinions",
            date: "Sep 5, 2025",
            readTime: "4 min",
            author: "Mercy",
            image: "assets/images/post-6.jpg"
        },
        {
            id: 7,
            title: "Simple Rituals That Ground Me",
            excerpt: "From evening tea to weekly walks without a phone — the small, repeated acts that quietly keep me steady when life gets loud.",
            category: "lifestyle",
            date: "Aug 30, 2025",
            readTime: "5 min",
            author: "Mercy",
            image: "assets/images/lifestyle.jpg"
        },
        {
            id: 8,
            title: "Learning to Rest Without Guilt",
            excerpt: "Rest is not a reward you earn after productivity. It is a basic human need. Unlearning the hustle mindset one nap at a time.",
            category: "personal",
            date: "Aug 25, 2025",
            readTime: "6 min",
            author: "Mercy",
            image: "assets/images/personal.jpg"
        }
    ];

    let currentFilter = 'all';
    let visibleCount = 6;

    // ========== RENDER POSTS ==========
    function renderPosts(filter = 'all', limit = visibleCount) {
        const $grid = $('#postsGrid');
        $grid.empty();

        const filtered = filter === 'all'
            ? samplePosts
            : samplePosts.filter(p => p.category === filter);

        const postsToShow = filtered.slice(0, limit);

        if (postsToShow.length === 0) {
            $grid.html('<p class="no-posts">No posts found in this category.</p>');
            $('#loadMoreBtn').hide();
            return;
        }

        postsToShow.forEach(post => {
            const href = post.slug
                ? `post-page.html?slug=${encodeURIComponent(post.slug)}`
                : (post.id ? `post-page.html?id=${encodeURIComponent(post.id)}` : 'post-page.html');
            const card = `
                <article class="post-card" data-category="${post.category}">
                    <a href="${href}" class="card-image">
                        <span class="category-tag">${capitalize(post.category)}</span>
                        <img src="${post.image || 'assets/images/post-1.jpg'}" alt="${post.title}" loading="lazy">
                    </a>
                    <div class="card-body">
                        <h3><a href="${href}">${post.title}</a></h3>
                        <p class="card-excerpt">${post.excerpt || ''}</p>
                        <div class="card-meta">
                            <span>${post.date || ''}</span>
                            <span class="dot">•</span>
                            <span>${post.readTime || '5 min'} read</span>
                        </div>
                    </div>
                </article>
            `;
            $grid.append(card);
        });

        // Show/hide Load More
        if (filtered.length > limit) {
            $('#loadMoreBtn').show().text('Load More Posts');
        } else {
            $('#loadMoreBtn').hide();
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    // ========== HELPERS ==========
    function postHref(post) {
        if (post.slug) return 'post-page.html?slug=' + encodeURIComponent(post.slug);
        if (post.id) return 'post-page.html?id=' + encodeURIComponent(post.id);
        return 'post-page.html';
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    // ========== HERO FROM POST OR SITE CONTENT ==========
    function updateHeroFromPost(post) {
        if (!post) return;
        var href = postHref(post);
        $('.hero .btn-primary').attr('href', href);
        // Only overwrite hero text if site content has not already set a custom title
        if (!$('.hero-title').data('from-site-content')) {
            if (post.title) $('.hero-title').text(post.title);
            if (post.excerpt) $('.hero-excerpt').text(post.excerpt);
            if (post.image) $('.hero-image img').attr('src', post.image).attr('alt', post.title || '');
            if (post.date) $('.hero-meta .date').text(post.date);
            if (post.readTime) $('.hero-meta .read-time').text(post.readTime + (String(post.readTime).indexOf('read') >= 0 ? '' : ' read'));
            if (post.category) $('.hero-badge').text(capitalize(post.category));
        } else {
            // Still point CTA at real post when possible
            $('.hero .btn-primary').attr('href', href);
        }
    }

    function updatePopularList(posts) {
        var $list = $('.popular-list');
        if (!$list.length || !posts || !posts.length) return;

        var top = posts.slice().sort(function (a, b) {
            return (Number(b.views) || 0) - (Number(a.views) || 0);
        }).slice(0, 3);

        if (!top.length) return;

        $list.empty();
        top.forEach(function (post, i) {
            var num = String(i + 1).padStart(2, '0');
            var href = postHref(post);
            var views = post.views != null
                ? (Number(post.views).toLocaleString() + ' views')
                : '';
            var li =
                '<li><a href="' + href + '">' +
                '<span class="pop-num">' + num + '</span>' +
                '<div><h4>' + escapeHtml(post.title) + '</h4>' +
                (views ? '<span class="pop-meta">' + escapeHtml(views) + '</span>' : '') +
                '</div></a></li>';
            $list.append(li);
        });
    }

    // ========== SITE CONTENT (homepage) ==========
    function applyHomepageContent(c) {
        if (!c || typeof c !== 'object') return;

        if (c.heroBadge) $('.hero-badge').text(c.heroBadge);
        if (c.heroTitle) {
            $('.hero-title').text(c.heroTitle).data('from-site-content', true);
        }
        if (c.heroExcerpt) $('.hero-excerpt').text(c.heroExcerpt);
        if (c.heroImage) {
            $('.hero-image img').attr('src', c.heroImage).attr('alt', c.heroTitle || '');
        }
        if (c.aboutText) {
            $('.about-card > p').first().text(c.aboutText);
        }
        if (c.footerTagline) {
            $('.footer-brand > p').first().text(c.footerTagline);
        }
    }

    function loadHomepageContent() {
        if (typeof api === 'undefined') return $.Deferred().resolve().promise();
        return api.get('/admin/site-content/homepage')
            .done(function (res) {
                if (res.success && res.content) {
                    applyHomepageContent(res.content);
                }
            })
            .fail(function () { /* keep static HTML */ });
    }

    // Try loading posts from API (falls back to samplePosts)
    function tryLoadFromAPI() {
        if (typeof api === 'undefined') {
            renderPosts();
            updatePopularList(samplePosts);
            return;
        }
        api.get('/posts?limit=20&status=published')
            .done(function (res) {
                if (res.success && res.posts && res.posts.length) {
                    samplePosts.length = 0;
                    res.posts.forEach(function (p) {
                        var words = (p.content || p.excerpt || '').trim().split(/\s+/).filter(Boolean).length;
                        var mins = Math.max(1, Math.ceil(words / 200));
                        samplePosts.push({
                            id: p.id,
                            slug: p.slug || '',
                            title: p.title,
                            excerpt: p.excerpt || '',
                            category: p.category || 'general',
                            date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
                            readTime: mins + ' min',
                            author: p.author || 'Mercy',
                            image: p.image || 'assets/images/post-1.jpg',
                            views: p.views != null ? p.views : 0
                        });
                    });
                    updateHeroFromPost(samplePosts[0]);
                    updatePopularList(samplePosts);
                } else {
                    updatePopularList(samplePosts);
                }
                renderPosts();
            })
            .fail(function () {
                renderPosts();
                updatePopularList(samplePosts);
            });
    }

    // Load site content first, then posts (so content flags are set before hero overwrite)
    loadHomepageContent().always(function () {
        tryLoadFromAPI();
    });

    // ============================================================
    // BACKEND API CALLS (commented out – enable in production)
    // ============================================================
    /*
    // Example: Fetch posts from your Express / Supabase endpoint
    function fetchPostsFromAPI(category = 'all', page = 1) {
        $.ajax({
            url: '/api/posts',
            method: 'GET',
            data: {
                category: category,
                page: page,
                limit: 6
            },
            success: function (response) {
                // response.posts = array of post objects
                // response.hasMore = boolean
                renderPostsFromAPI(response.posts);
                
                if (response.hasMore) {
                    $('#loadMoreBtn').show();
                } else {
                    $('#loadMoreBtn').hide();
                }
            },
            error: function (xhr) {
                console.error('Failed to load posts', xhr);
                $('#postsGrid').html('<p class="no-posts">Unable to load posts. Please try again later.</p>');
            }
        });
    }

    // Example: Search endpoint
    function searchPostsAPI(query) {
        $.ajax({
            url: '/api/posts/search',
            method: 'GET',
            data: { q: query },
            success: function (response) {
                renderPostsFromAPI(response.posts);
            },
            error: function () {
                $('#postsGrid').html('<p class="no-posts">Search failed. Please try again.</p>');
            }
        });
    }
    */
});
