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
            const card = `
                <article class="post-card" data-category="${post.category}">
                    <a href="post-page.html" class="card-image">
                        <span class="category-tag">${capitalize(post.category)}</span>
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                    </a>
                    <div class="card-body">
                        <h3><a href="post-page.html">${post.title}</a></h3>
                        <p class="card-excerpt">${post.excerpt}</p>
                        <div class="card-meta">
                            <span>${post.date}</span>
                            <span class="dot">•</span>
                            <span>${post.readTime} read</span>
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


    // Try loading posts from API (falls back to samplePosts)
    function tryLoadFromAPI() {
        if (typeof api === 'undefined') {
            renderPosts();
            return;
        }
        api.get('/posts?limit=20')
            .done(function (res) {
                if (res.success && res.posts && res.posts.length) {
                    // Map API posts into the shape renderPosts expects
                    samplePosts.length = 0;
                    res.posts.forEach(function (p) {
                        samplePosts.push({
                            id: p.id,
                            title: p.title,
                            excerpt: p.excerpt || '',
                            category: p.category || 'general',
                            date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
                            readTime: '5 min',
                            author: p.author || 'Mercy',
                            image: p.image || 'assets/images/post-1.jpg'
                        });
                    });
                }
                renderPosts();
            })
            .fail(function () {
                renderPosts(); // use built-in sample data
            });
    }

    tryLoadFromAPI();


    // ========== FILTER TABS ==========
    $('#filterTabs').on('click', '.filter-btn', function () {
        const filter = $(this).data('filter');
        currentFilter = filter;
        visibleCount = 6;

        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        renderPosts(filter, visibleCount);
    });

    // ========== LOAD MORE ==========
    $('#loadMoreBtn').on('click', function () {
        visibleCount += 4;
        renderPosts(currentFilter, visibleCount);
    });

    // ========== CATEGORY SIDEBAR CLICKS ==========
    $('.category-list').on('click', 'a', function (e) {
        e.preventDefault();
        const category = $(this).data('category');

        // Map sidebar categories to filter tabs where possible
        const validFilters = ['lifestyle', 'personal', 'opinions'];
        if (validFilters.includes(category)) {
            currentFilter = category;
            visibleCount = 6;

            $('.filter-btn').removeClass('active');
            $(`.filter-btn[data-filter="${category}"]`).addClass('active');

            renderPosts(category, visibleCount);

            // Smooth scroll to posts
            $('html, body').animate({
                scrollTop: $('.posts-column').offset().top - 80
            }, 400);
        }
    });

    // ========== MOBILE MENU ==========
    const $menuToggle = $('#menuToggle');
    const $mainNav = $('#mainNav');

    $menuToggle.on('click', function () {
        $(this).toggleClass('active');
        $mainNav.toggleClass('open');
    });

    // Close menu when clicking a link
    $mainNav.on('click', 'a', function () {
        $menuToggle.removeClass('active');
        $mainNav.removeClass('open');
    });

    // ========== SEARCH TOGGLE ==========
    const $searchToggle = $('#searchToggle');
    const $searchBar = $('#searchBar');
    const $searchInput = $('#searchInput');

    $searchToggle.on('click', function () {
        $searchBar.toggleClass('open');
        if ($searchBar.hasClass('open')) {
            $searchInput.focus();
        }
    });

    // ========== SEARCH FORM ==========
    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        const query = $searchInput.val().trim().toLowerCase();

        if (!query) {
            renderPosts(currentFilter, visibleCount);
            return;
        }

        const results = samplePosts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query)
        );

        const $grid = $('#postsGrid');
        $grid.empty();

        if (results.length === 0) {
            $grid.html(`<p class="no-posts">No posts found for "<strong>${$searchInput.val()}</strong>"</p>`);
            $('#loadMoreBtn').hide();
            return;
        }

        results.forEach(post => {
            const card = `
                <article class="post-card" data-category="${post.category}">
                    <a href="post-page.html" class="card-image">
                        <span class="category-tag">${capitalize(post.category)}</span>
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                    </a>
                    <div class="card-body">
                        <h3><a href="post-page.html">${post.title}</a></h3>
                        <p class="card-excerpt">${post.excerpt}</p>
                        <div class="card-meta">
                            <span>${post.date}</span>
                            <span class="dot">•</span>
                            <span>${post.readTime} read</span>
                        </div>
                    </div>
                </article>
            `;
            $grid.append(card);
        });

        $('#loadMoreBtn').hide();
        $searchBar.removeClass('open');
    });

    // ========== HEADER SCROLL EFFECT ==========
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 20) {
            $('#siteHeader').addClass('scrolled');
        } else {
            $('#siteHeader').removeClass('scrolled');
        }
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
