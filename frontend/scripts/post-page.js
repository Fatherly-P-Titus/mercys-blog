/**
 * Mercy's Blog - Post Page Script
 * Loads a post by ?slug= or ?id= from the API, with static fallback.
 */

$(document).ready(function () {
    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    /** Very small markdown-ish → HTML for admin content */
    function formatContent(raw) {
        if (!raw) return '<p>No content.</p>';
        var text = String(raw);
        text = escapeHtml(text);
        text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = text.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, function (m) {
            return '<ul>' + m + '</ul>';
        });
        var blocks = text.split(/\n\n+/);
        text = blocks.map(function (block) {
            block = block.trim();
            if (!block) return '';
            if (/^<(h2|ul|blockquote)/.test(block)) return block;
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }).join('\n');
        return text;
    }

    function estimateReadTime(content) {
        var words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200)) + ' min read';
    }

    function formatDate(iso) {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
            });
        } catch (e) {
            return iso;
        }
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

    function generateTOC() {
        var $headings = $('#postContent h2');
        var $toc = $('#tableOfContents');
        $toc.empty();

        if ($headings.length === 0) {
            $('#tocCard').hide();
            return;
        }

        $('#tocCard').show();
        $headings.each(function (index) {
            var $heading = $(this);
            var id = 'section-' + (index + 1);
            $heading.attr('id', id);
            $toc.append('<a href="#' + id + '">' + escapeHtml($heading.text()) + '</a>');
        });
    }

    function bindTOCScroll() {
        $(window).off('scroll.toc').on('scroll.toc', function () {
            var $tocLinks = $('#tableOfContents a');
            var scrollPos = $(window).scrollTop() + 120;
            $('#postContent h2').each(function () {
                var $heading = $(this);
                var top = $heading.offset().top;
                var id = $heading.attr('id');
                if (scrollPos >= top) {
                    $tocLinks.removeClass('active');
                    $tocLinks.filter('[href="#' + id + '"]').addClass('active');
                }
            });
        });

        $('#tableOfContents').off('click').on('click', 'a', function (e) {
            e.preventDefault();
            var target = $($(this).attr('href'));
            if (target.length) {
                $('html, body').animate({ scrollTop: target.offset().top - 90 }, 400);
            }
        });
    }

    var $progress = $('#readingProgress');
    $(window).on('scroll.progress', function () {
        var $content = $('#postContent');
        if (!$content.length) return;
        var contentTop = $content.offset().top;
        var contentHeight = $content.outerHeight();
        var windowHeight = $(window).height();
        var scrollTop = $(window).scrollTop();
        var progress = Math.min(
            Math.max((scrollTop - contentTop + 100) / (contentHeight - windowHeight + 200), 0),
            1
        );
        $progress.css('width', (progress * 100) + '%');
    });

    $('.share-btn').on('click', function () {
        var platform = $(this).data('platform');
        var url = encodeURIComponent(window.location.href);
        var title = encodeURIComponent(document.title);

        if (platform === 'twitter') {
            window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + title, '_blank', 'width=550,height=420');
        } else if (platform === 'facebook') {
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=550,height=420');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href).then(function () {
                var $btn = $('.share-btn[data-platform="copy"]');
                var original = $btn.html();
                $btn.html('<span style="font-size:12px;font-weight:600;">Copied!</span>');
                setTimeout(function () { $btn.html(original); }, 1500);
            }).catch(function () {
                prompt('Copy this link:', window.location.href);
            });
        }
    });

    function renderPost(post) {
        var category = capitalize(post.category || post.type || 'General');
        var title = post.title || 'Untitled';
        var dateStr = formatDate(post.created_at || post.date);
        var readTime = post.readTime || estimateReadTime(post.content);
        var views = post.views != null ? Number(post.views).toLocaleString() + ' views' : '';
        var image = post.image || 'assets/images/featured.jpg';
        var author = post.author || 'Mercy';
        var likes = post.likes != null ? Number(post.likes) : 0;

        // Track current post for engagement
        window.__currentPostId = post.id;
        window.__currentPostSlug = post.slug || '';

        document.title = title + " | Mercy's Blog";
        $('meta[name="description"]').attr('content', post.excerpt || title);

        $('.post-category').text(category);
        $('.post-title').text(title);
        $('.author-name').text(author);
        $('.post-date').text(dateStr);
        $('.read-time').text(readTime);
        if (views) $('.views').text(views);
        $('#likeCount').text(likes);
        syncLikeButtonState(post.id);

        $('.post-breadcrumb a').eq(1).text(category);
        $('.featured-img').attr('src', image).attr('alt', title);

        $('#postContent').html(formatContent(post.content));

        generateTOC();
        bindTOCScroll();
    }

    function renderNotFound() {
        $('.post-title').text('Post not found');
        $('#postContent').html('<p>This post could not be loaded. It may have been removed or the link is incorrect.</p><p><a href="index.html">Back to home</a></p>');
        $('#tocCard').hide();
        $('.post-category').text('');
        $('.read-time, .views').text('');
    }

    function showLoading() {
        $('.post-title').text('Loading…');
        $('#postContent').html('<p style="color:#999;">Loading post…</p>');
    }

    function renderRelated(posts) {
        var $grid = $('#relatedGrid');
        if (!$grid.length) return;
        $grid.empty();
        if (!posts || !posts.length) return;

        posts.forEach(function (post) {
            var href = postHref(post);
            var img = post.image || 'assets/images/post-1.jpg';
            var dateStr = formatDate(post.created_at || post.date);
            var read = post.readTime || estimateReadTime(post.content || post.excerpt);
            var card =
                '<article class="related-card">' +
                '<a href="' + href + '" class="card-image">' +
                '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(post.title) + '" loading="lazy">' +
                '</a>' +
                '<div class="card-body">' +
                '<h3><a href="' + href + '">' + escapeHtml(post.title) + '</a></h3>' +
                '<div class="card-meta"><span>' + escapeHtml(dateStr) + '</span> · ' + escapeHtml(read) + '</div>' +
                '</div></article>';
            $grid.append(card);
        });
    }

    function loadRelated(category, excludeId) {
        if (typeof api === 'undefined') return;
        var q = '/posts?limit=4&status=published';
        if (category) q += '&category=' + encodeURIComponent(String(category).toLowerCase());

        api.get(q)
            .done(function (res) {
                var list = (res.posts || []).filter(function (p) {
                    return String(p.id) !== String(excludeId);
                }).slice(0, 3);
                renderRelated(list);
            })
            .fail(function () {});
    }


    // ========== LIKES (one per browser via localStorage) ==========
    function likedKey(id) {
        return 'liked_post_' + id;
    }

    function hasLiked(id) {
        try {
            return localStorage.getItem(likedKey(id)) === '1';
        } catch (e) {
            return false;
        }
    }

    function markLiked(id) {
        try {
            localStorage.setItem(likedKey(id), '1');
        } catch (e) {}
    }

    function syncLikeButtonState(id) {
        var $btn = $('#likeBtn');
        if (!$btn.length || !id) return;
        if (hasLiked(id)) {
            $btn.addClass('liked').attr('aria-pressed', 'true');
            $btn.find('.like-label').text('Liked');
        } else {
            $btn.removeClass('liked').attr('aria-pressed', 'false');
            $btn.find('.like-label').text('Like');
        }
    }

    $('#likeBtn').on('click', function () {
        var id = window.__currentPostId;
        if (!id) {
            return;
        }
        if (hasLiked(id)) {
            return; // already liked this browser
        }
        if (typeof api === 'undefined') return;

        var $btn = $(this);
        $btn.prop('disabled', true);

        api.post('/posts/' + encodeURIComponent(id) + '/like')
            .done(function (res) {
                $btn.prop('disabled', false);
                if (res.success) {
                    markLiked(id);
                    $('#likeCount').text(res.likes != null ? res.likes : (Number($('#likeCount').text()) || 0) + 1);
                    syncLikeButtonState(id);
                }
            })
            .fail(function () {
                $btn.prop('disabled', false);
            });
    });

    function loadPost() {
        var slug = getQueryParam('slug');
        var id = getQueryParam('id');
        var key = slug || id;

        if (!key) {
            generateTOC();
            bindTOCScroll();
            return;
        }

        if (typeof api === 'undefined') {
            renderNotFound();
            return;
        }

        showLoading();

        var viewKey = 'viewed_post_' + key;
        var alreadyViewed = false;
        try {
            alreadyViewed = sessionStorage.getItem(viewKey) === '1';
        } catch (e) {}

        var path = '/posts/' + encodeURIComponent(key);
        if (alreadyViewed) {
            path += '?countView=false';
        }

        api.get(path)
            .done(function (res) {
                if (res.success && res.post) {
                    try {
                        sessionStorage.setItem(viewKey, '1');
                    } catch (e) {}
                    renderPost(res.post);
                    loadRelated(res.post.category, res.post.id);
                    loadComments(res.post.id);
                } else {
                    renderNotFound();
                }
            })
            .fail(function () {
                renderNotFound();
            });
    }

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 20) {
            $('#siteHeader').addClass('scrolled');
        } else {
            $('#siteHeader').removeClass('scrolled');
        }
    });


    // ========== COMMENTS ==========
    function formatCommentDate(iso) {
        if (!iso) return '';
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch (e) {
            return iso;
        }
    }

    function renderComments(comments) {
        var $list = $('#commentsList');
        $list.empty();
        var total = comments ? comments.length : 0;
        if (total) {
            $('#commentsCount').text('(' + total + ')');
        } else {
            $('#commentsCount').text('');
        }

        if (!comments || !comments.length) {
            $list.html('<p class="comments-empty">No comments yet. Be the first to share a thought.</p>');
            return;
        }

        comments.forEach(function (c) {
            var html =
                '<article class="comment-item" data-id="' + c.id + '">' +
                '<div class="comment-item-header">' +
                '<span class="comment-author">' + escapeHtml(c.author_name) + '</span>' +
                '<span class="comment-date">' + escapeHtml(formatCommentDate(c.created_at)) + '</span>' +
                '</div>' +
                '<p class="comment-body">' + escapeHtml(c.content) + '</p>' +
                '</article>';
            $list.append(html);
        });
    }

    function loadComments(postId) {
        if (!postId || typeof api === 'undefined') {
            $('#commentsList').html('<p class="comments-empty">Comments unavailable.</p>');
            return;
        }
        $('#commentsList').html('<p class="comments-loading">Loading comments…</p>');
        api.get('/posts/' + encodeURIComponent(postId) + '/comments')
            .done(function (res) {
                if (res.success) {
                    renderComments(res.comments || []);
                } else {
                    $('#commentsList').html('<p class="comments-empty">Could not load comments.</p>');
                }
            })
            .fail(function () {
                $('#commentsList').html('<p class="comments-empty">Could not load comments.</p>');
            });
    }

    $('#commentText').on('input', function () {
        $('#commentCharCount').text($(this).val().length);
    });

    $('#commentForm').on('submit', function (e) {
        e.preventDefault();
        var postId = window.__currentPostId;
        if (!postId) {
            $('#commentFormStatus')
                .text('Open a specific post to comment.')
                .removeClass('success')
                .addClass('error')
                .prop('hidden', false);
            return;
        }
        if (typeof api === 'undefined') return;

        var name = $('#commentName').val().trim();
        var content = $('#commentText').val().trim();
        if (name.length < 2 || content.length < 2) {
            $('#commentFormStatus')
                .text('Name and comment are required.')
                .removeClass('success')
                .addClass('error')
                .prop('hidden', false);
            return;
        }

        var $btn = $('#commentSubmitBtn');
        $btn.prop('disabled', true);
        $btn.find('.btn-text').prop('hidden', true);
        $btn.find('.btn-loader').prop('hidden', false);
        $('#commentFormStatus').prop('hidden', true);

        api.post('/posts/' + encodeURIComponent(postId) + '/comments', {
            author_name: name,
            content: content
        })
            .done(function (res) {
                $btn.prop('disabled', false);
                $btn.find('.btn-text').prop('hidden', false);
                $btn.find('.btn-loader').prop('hidden', true);
                if (res.success && res.comment) {
                    $('#commentText').val('');
                    $('#commentCharCount').text('0');
                    $('#commentFormStatus')
                        .text('Comment posted. Thank you!')
                        .removeClass('error')
                        .addClass('success')
                        .prop('hidden', false);
                    // Prepend or reload list
                    loadComments(postId);
                    setTimeout(function () {
                        $('#commentFormStatus').prop('hidden', true);
                    }, 3000);
                } else {
                    $('#commentFormStatus')
                        .text((res && res.message) || 'Could not post comment')
                        .removeClass('success')
                        .addClass('error')
                        .prop('hidden', false);
                }
            })
            .fail(function (xhr) {
                $btn.prop('disabled', false);
                $btn.find('.btn-text').prop('hidden', false);
                $btn.find('.btn-loader').prop('hidden', true);
                var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Could not post comment';
                $('#commentFormStatus')
                    .text(msg)
                    .removeClass('success')
                    .addClass('error')
                    .prop('hidden', false);
            });
    });


    loadPost();
});
