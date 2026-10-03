/**
 * Mercy's Blog - Post Page Script
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    // ========== TABLE OF CONTENTS ==========
    function generateTOC() {
        const $headings = $('#postContent h2');
        const $toc = $('#tableOfContents');

        if ($headings.length === 0) {
            $('#tocCard').hide();
            return;
        }

        $headings.each(function (index) {
            const $heading = $(this);
            const id = 'section-' + (index + 1);
            $heading.attr('id', id);

            const link = `<a href="#${id}">${$heading.text()}</a>`;
            $toc.append(link);
        });
    }

    generateTOC();

    // Highlight active TOC item on scroll
    const $tocLinks = $('#tableOfContents a');

    $(window).on('scroll', function () {
        const scrollPos = $(window).scrollTop() + 120;

        $('#postContent h2').each(function () {
            const $heading = $(this);
            const top = $heading.offset().top;
            const id = $heading.attr('id');

            if (scrollPos >= top) {
                $tocLinks.removeClass('active');
                $tocLinks.filter(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // Smooth scroll for TOC links
    $('#tableOfContents').on('click', 'a', function (e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 90
            }, 400);
        }
    });

    // ========== READING PROGRESS BAR ==========
    const $progress = $('#readingProgress');

    $(window).on('scroll', function () {
        const $content = $('#postContent');
        if (!$content.length) return;

        const contentTop = $content.offset().top;
        const contentHeight = $content.outerHeight();
        const windowHeight = $(window).height();
        const scrollTop = $(window).scrollTop();

        const progress = Math.min(
            Math.max((scrollTop - contentTop + 100) / (contentHeight - windowHeight + 200), 0),
            1
        );

        $progress.css('width', (progress * 100) + '%');
    });

    // ========== SHARE BUTTONS ==========
    $('.share-btn').on('click', function () {
        const platform = $(this).data('platform');
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=550,height=420');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href).then(function () {
                const $btn = $('.share-btn[data-platform="copy"]');
                const original = $btn.html();
                $btn.html('<span style="font-size:12px;font-weight:600;">Copied!</span>');
                setTimeout(function () {
                    $btn.html(original);
                }, 1500);
            }).catch(function () {
                // Fallback
                prompt('Copy this link:', window.location.href);
            });
        }
    });

    // ========== RELATED POSTS ==========
    const relatedPosts = [
        {
            title: "The Quiet Power of Morning Silence",
            date: "Sep 25, 2025",
            readTime: "5 min",
            category: "Lifestyle",
            image: "assets/images/post-1.jpg"
        },
        {
            title: "Learning to Rest Without Guilt",
            date: "Aug 25, 2025",
            readTime: "6 min",
            category: "Personal",
            image: "assets/images/personal.jpg"
        },
        {
            title: "Simple Rituals That Ground Me",
            date: "Aug 30, 2025",
            readTime: "5 min",
            category: "Lifestyle",
            image: "assets/images/lifestyle.jpg"
        }
    ];

    function renderRelated() {
        const $grid = $('#relatedGrid');
        $grid.empty();

        relatedPosts.forEach(post => {
            const card = `
                <article class="related-card">
                    <a href="post-page.html" class="card-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                    </a>
                    <div class="card-body">
                        <h3><a href="post-page.html">${post.title}</a></h3>
                        <div class="card-meta">
                            <span>${post.date}</span> · ${post.readTime} read
                        </div>
                    </div>
                </article>
            `;
            $grid.append(card);
        });
    }

    renderRelated();

    // ========== HEADER SCROLL (reuse from main if needed) ==========
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 20) {
            $('#siteHeader').addClass('scrolled');
        } else {
            $('#siteHeader').removeClass('scrolled');
        }
    });

    // ========== MOBILE MENU & SEARCH (lightweight, in case main.js not fully covering) ==========
    // These are already handled in main.js which is also loaded.
    // Keeping this file focused on post-specific behavior.

    // ============================================================
    // BACKEND API CALLS (commented out – enable in production)
    // ============================================================
    /*
    // Example: Fetch single post by slug or ID
    function fetchPost(slug) {
        $.ajax({
            url: '/api/posts/' + slug,
            method: 'GET',
            success: function (post) {
                // Populate title, content, meta, tags, etc.
                document.title = post.title + " | Mercy's Blog";
                $('.post-title').text(post.title);
                $('.post-category').text(post.category);
                $('.post-date').text(post.date);
                $('.read-time').text(post.readTime + ' read');
                $('#postContent').html(post.contentHtml);
                // Re-generate TOC after content is injected
                generateTOC();
            },
            error: function () {
                $('.post-content').html('<p>Post not found.</p>');
            }
        });
    }

    // Example: Fetch related posts
    function fetchRelated(category, excludeId) {
        $.ajax({
            url: '/api/posts',
            method: 'GET',
            data: { category: category, limit: 3, exclude: excludeId },
            success: function (response) {
                // render related cards from response.posts
            }
        });
    }

    // Example: Submit comment
    // $('#commentForm').on('submit', function (e) { ... });
    */
});
