/**
 * Mercy's Blog - Profile Page Script
 * Loads profile site content + author posts from the API.
 */

$(document).ready(function () {
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatDate(iso) {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch (e) {
            return iso;
        }
    }

    function estimateReadTime(content) {
        var words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200)) + ' min';
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function postHref(post) {
        if (post.slug) return 'post-page.html?slug=' + encodeURIComponent(post.slug);
        if (post.id) return 'post-page.html?id=' + encodeURIComponent(post.id);
        return 'post-page.html';
    }

    function mapApiPost(p) {
        return {
            id: p.id,
            slug: p.slug || '',
            title: p.title || 'Untitled',
            excerpt: p.excerpt || '',
            category: capitalize(p.category || 'general'),
            date: formatDate(p.created_at || p.date),
            readTime: estimateReadTime(p.content || p.excerpt),
            image: p.image || 'assets/images/post-1.jpg'
        };
    }

    // ========== RENDER AUTHOR POSTS ==========
    function renderAuthorPosts(posts) {
        var $grid = $('#profilePostsGrid');
        if (!$grid.length) return;
        $grid.empty();

        if (!posts || !posts.length) {
            $grid.html('<p class="no-posts">No published posts yet.</p>');
            return;
        }

        posts.forEach(function (post) {
            var href = postHref(post);
            var card =
                '<article class="profile-post-card">' +
                '<a href="' + href + '" class="card-image">' +
                '<span class="category-tag">' + escapeHtml(post.category) + '</span>' +
                '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" loading="lazy">' +
                '</a>' +
                '<div class="card-body">' +
                '<h3><a href="' + href + '">' + escapeHtml(post.title) + '</a></h3>' +
                '<p class="card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
                '<div class="card-meta">' +
                '<span>' + escapeHtml(post.date) + '</span> · ' + escapeHtml(post.readTime) + ' read' +
                '</div></div></article>';
            $grid.append(card);
        });
    }

    // ========== APPLY PROFILE SITE CONTENT ==========
    function applyProfileContent(c) {
        if (!c || typeof c !== 'object') return;

        if (c.profileName) {
            $('.profile-intro h1').text(c.profileName);
            document.title = c.profileName + " | Mercy's Blog";
        }
        if (c.profileTagline) {
            $('.profile-tagline').text(c.profileTagline);
        }
        if (c.profileBio) {
            $('.profile-short-bio').text(c.profileBio);
        }
        if (c.aboutLong) {
            var $about = $('.about-content');
            if ($about.length) {
                var paras = String(c.aboutLong).split(/\n\n+/).filter(Boolean);
                if (!paras.length) {
                    paras = [String(c.aboutLong)];
                }
                $about.html(paras.map(function (p) {
                    return '<p>' + escapeHtml(p.trim()) + '</p>';
                }).join(''));
            }
        }
        if (c.statArticles) $('#statPosts').text(c.statArticles);
        if (c.statTotalViews) $('#statViews').text(c.statTotalViews);
        if (c.statTotalReaders) $('#statReaders').text(c.statTotalReaders);
        if (c.avatarImage) {
            $('.profile-avatar').attr('src', c.avatarImage).attr('alt', c.profileName || 'Author');
        }
    }

    function loadProfileContent() {
        if (typeof api === 'undefined') return;
        api.get('/admin/site-content/profile')
            .done(function (res) {
                if (res.success && res.content) {
                    applyProfileContent(res.content);
                }
            })
            .fail(function () {
                // Keep static HTML defaults
            });
    }

    function loadAuthorPosts() {
        if (typeof api === 'undefined') {
            renderAuthorPosts([]);
            return;
        }
        api.get('/posts?limit=12&status=published')
            .done(function (res) {
                var list = (res.posts || []).map(mapApiPost);
                renderAuthorPosts(list);
                // Update posts stat from real count when available
                if (res.total != null && !$('#statPosts').data('from-content')) {
                    // only if site content didn't set a custom display string
                }
            })
            .fail(function () {
                renderAuthorPosts([]);
            });
    }

    // ========== HEADER SCROLL ==========
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 20) {
            $('#siteHeader').addClass('scrolled');
        } else {
            $('#siteHeader').removeClass('scrolled');
        }
    });

    // ========== SMOOTH SCROLL ==========
    $('a[href^="#"]').on('click', function (e) {
        var target = $($(this).attr('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: target.offset().top - 80 }, 400);
        }
    });

    loadProfileContent();
    loadAuthorPosts();
});
