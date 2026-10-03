/**
 * Mercy's Blog - Profile Page Script
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    // ========== SAMPLE POSTS BY AUTHOR ==========
    const authorPosts = [
        {
            title: "Finding Balance in a Busy World",
            excerpt: "In a world that never stops, learning how to pause, breathe, and prioritize what truly matters has become one of the most valuable skills we can develop.",
            category: "Lifestyle",
            date: "Sep 28, 2025",
            readTime: "6 min",
            image: "assets/images/featured.jpg"
        },
        {
            title: "The Quiet Power of Morning Silence",
            excerpt: "Before the world wakes up, there is a sacred window of stillness. Here's why protecting those first moments can change the entire tone of your day.",
            category: "Lifestyle",
            date: "Sep 25, 2025",
            readTime: "5 min",
            image: "assets/images/post-1.jpg"
        },
        {
            title: "Why I Stopped Explaining Myself",
            excerpt: "Not every decision needs a defense. Learning when to simply act and let the results speak has been one of the most freeing shifts in my personal growth.",
            category: "Personal",
            date: "Sep 22, 2025",
            readTime: "4 min",
            image: "assets/images/post-2.jpg"
        },
        {
            title: "The Comparison Trap on Social Media",
            excerpt: "Scrolling through highlight reels can quietly erode contentment. A honest look at how curated lives affect our mental space and what we can do about it.",
            category: "Opinions",
            date: "Sep 18, 2025",
            readTime: "7 min",
            image: "assets/images/post-3.jpg"
        },
        {
            title: "Building a Home That Feels Like You",
            excerpt: "Your living space should reflect who you are becoming, not just who you used to be. Practical ideas for creating an environment that supports your current season.",
            category: "Lifestyle",
            date: "Sep 14, 2025",
            readTime: "6 min",
            image: "assets/images/post-4.jpg"
        },
        {
            title: "On Friendship After 30",
            excerpt: "Friendships evolve. Some deepen, some fade, and new ones appear in unexpected places. Navigating connection with more intention and less pressure.",
            category: "Personal",
            date: "Sep 10, 2025",
            readTime: "5 min",
            image: "assets/images/post-5.jpg"
        }
    ];

    // ========== RENDER AUTHOR POSTS ==========
    function renderAuthorPosts() {
        const $grid = $('#profilePostsGrid');
        $grid.empty();

        authorPosts.forEach(post => {
            const card = `
                <article class="profile-post-card">
                    <a href="post-page.html" class="card-image">
                        <span class="category-tag">${post.category}</span>
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                    </a>
                    <div class="card-body">
                        <h3><a href="post-page.html">${post.title}</a></h3>
                        <p class="card-excerpt">${post.excerpt}</p>
                        <div class="card-meta">
                            <span>${post.date}</span> · ${post.readTime} read
                        </div>
                    </div>
                </article>
            `;
            $grid.append(card);
        });
    }

    renderAuthorPosts();

    // ========== HEADER SCROLL ==========
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 20) {
            $('#siteHeader').addClass('scrolled');
        } else {
            $('#siteHeader').removeClass('scrolled');
        }
    });

    // ========== SMOOTH SCROLL FOR IN-PAGE LINKS ==========
    $('a[href^="#"]').on('click', function (e) {
        const target = $($(this).attr('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 400);
        }
    });

    // ============================================================
    // BACKEND API CALLS (commented out – enable in production)
    // ============================================================
    /*
    // Example: Fetch author profile
    function fetchAuthorProfile() {
        $.ajax({
            url: '/api/author/mercy',
            method: 'GET',
            success: function (author) {
                $('.profile-intro h1').text(author.name);
                $('.profile-tagline').text(author.tagline);
                $('.profile-short-bio').text(author.shortBio);
                $('#statPosts').text(author.stats.posts);
                $('#statViews').text(author.stats.views);
                $('#statReaders').text(author.stats.readers);
                // Populate about content, social links, etc.
            },
            error: function () {
                console.error('Failed to load author profile');
            }
        });
    }

    // Example: Fetch posts by author
    function fetchAuthorPosts(limit = 6) {
        $.ajax({
            url: '/api/posts',
            method: 'GET',
            data: { author: 'mercy', limit: limit },
            success: function (response) {
                // Render response.posts into #profilePostsGrid
            },
            error: function () {
                $('#profilePostsGrid').html('<p>Unable to load posts.</p>');
            }
        });
    }
    */
});
