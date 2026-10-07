/**
 * Mercy's Blog - Admin Dashboard Script
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    // Auth check — JWT required (no session-flag bypass)
    if (typeof getToken !== 'function' || !getToken()) {
        window.location.href = 'admin-login.html';
        return;
    }

    // ========== TABS ==========
    $('.mod-tab').on('click', function () {
        const tab = $(this).data('tab');
        $('.mod-tab').removeClass('active');
        $(this).addClass('active');
        $('.mod-panel').removeClass('active');
        $('#panel-' + tab).addClass('active');
    });

    // ========== IMAGE PICKERS ==========
    $('#heroImageBtn').on('click', function () {
        $('#heroImage').trigger('click');
    });

    $('#heroImage').on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#heroThumb').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    $('#avatarImageBtn').on('click', function () {
        $('#avatarImage').trigger('click');
    });

    $('#avatarImage').on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#avatarThumb').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // ========== SAVE HOMEPAGE ==========
    $('#homepageForm').on('submit', function (e) {
        e.preventDefault();

        const data = {
            heroBadge: $('#heroBadge').val().trim(),
            heroTitle: $('#heroTitle').val().trim(),
            heroExcerpt: $('#heroExcerpt').val().trim(),
            aboutText: $('#aboutText').val().trim(),
            footerTagline: $('#footerTagline').val().trim()
        };

        const $status = $('#homepageStatus');
        $status.text('Saving...').removeClass('success error');

        api.put('/admin/site-content/homepage', data)
            .done(function (res) {
                $status.text('Homepage saved!').addClass('success');
                localStorage.setItem('siteContent_homepage', JSON.stringify(data));
                setTimeout(() => $status.text(''), 3000);
            })
            .fail(function (xhr) {
                // Fallback: save locally
                localStorage.setItem('siteContent_homepage', JSON.stringify(data));
                $status.text('Saved locally (backend offline)').addClass('success');
                setTimeout(() => $status.text(''), 3000);
            });
    });

    // ========== SAVE PROFILE ==========
    $('#profileForm').on('submit', function (e) {
        e.preventDefault();

        const data = {
            profileName: $('#profileName').val().trim(),
            profileTagline: $('#profileTagline').val().trim(),
            profileBio: $('#profileBio').val().trim(),
            aboutLong: $('#aboutLong').val().trim(),
            statArticles: $('#statArticles').val().trim(),
            statTotalViews: $('#statTotalViews').val().trim(),
            statTotalReaders: $('#statTotalReaders').val().trim()
        };

        const $status = $('#profileStatus');
        $status.text('Saving...').removeClass('success error');

        api.put('/admin/site-content/profile', data)
            .done(function (res) {
                $status.text('Profile saved!').addClass('success');
                localStorage.setItem('siteContent_profile', JSON.stringify(data));
                setTimeout(() => $status.text(''), 3000);
            })
            .fail(function () {
                localStorage.setItem('siteContent_profile', JSON.stringify(data));
                $status.text('Saved locally (backend offline)').addClass('success');
                setTimeout(() => $status.text(''), 3000);
            });
    });

    // ========== LOAD SAVED CONTENT (API first, localStorage fallback) ==========
    function fillHomepageForm(c) {
        if (!c) return;
        if (c.heroBadge) $('#heroBadge').val(c.heroBadge);
        if (c.heroTitle) $('#heroTitle').val(c.heroTitle);
        if (c.heroExcerpt) $('#heroExcerpt').val(c.heroExcerpt);
        if (c.aboutText) $('#aboutText').val(c.aboutText);
        if (c.footerTagline) $('#footerTagline').val(c.footerTagline);
    }

    function fillProfileForm(c) {
        if (!c) return;
        if (c.profileName) $('#profileName').val(c.profileName);
        if (c.profileTagline) $('#profileTagline').val(c.profileTagline);
        if (c.profileBio) $('#profileBio').val(c.profileBio);
        if (c.aboutLong) $('#aboutLong').val(c.aboutLong);
        if (c.statArticles) $('#statArticles').val(c.statArticles);
        if (c.statTotalViews) $('#statTotalViews').val(c.statTotalViews);
        if (c.statTotalReaders) $('#statTotalReaders').val(c.statTotalReaders);
    }

    function loadSavedContent() {
        // localStorage fallback while API loads
        try {
            fillHomepageForm(JSON.parse(localStorage.getItem('siteContent_homepage') || '{}'));
            fillProfileForm(JSON.parse(localStorage.getItem('siteContent_profile') || '{}'));
        } catch (e) {}

        if (typeof api === 'undefined') return;

        api.get('/admin/site-content/homepage')
            .done(function (res) {
                if (res.success && res.content) {
                    fillHomepageForm(res.content);
                    localStorage.setItem('siteContent_homepage', JSON.stringify(res.content));
                }
            });

        api.get('/admin/site-content/profile')
            .done(function (res) {
                if (res.success && res.content) {
                    fillProfileForm(res.content);
                    localStorage.setItem('siteContent_profile', JSON.stringify(res.content));
                }
            });
    }

    loadSavedContent();

    // ========== LOGOUT ==========
    $('#logoutBtn').on('click', function (e) {
        e.preventDefault();
        clearToken();
        window.location.href = 'admin-login.html';
    });

    // ========== MOBILE MENU ==========
    $('#menuToggle').on('click', function () {
        $(this).toggleClass('active');
        $('#adminNav').toggleClass('open');
    });

    // ========== FETCH STATS ==========
    function fetchStats() {
        api.get('/admin/stats')
            .done(function (res) {
                if (res.success && res.stats) {
                    const s = res.stats;
                    $('#statVisitors').text(Number(s.visitors).toLocaleString());
                    $('#statViews').text(Number(s.views).toLocaleString());
                    $('#statPosts').text(s.posts);
                    $('#statLikes').text(Number(s.likes).toLocaleString());
                    $('#statComments').text(Number(s.comments).toLocaleString());
                    $('#statReaders').text(Number(s.readers).toLocaleString());
                }
            })
            .fail(function () {
                console.warn('Could not load stats from API – using defaults');
            });
    }
    fetchStats();

    // ========== MANAGE POSTS ==========
    var managedPosts = [];

    function formatPostDate(iso) {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch (e) {
            return iso;
        }
    }

    function showPostsStatus(msg, type) {
        var $el = $('#postsManageStatus');
        $el.text(msg).removeClass('success error').addClass(type || '').prop('hidden', false);
        setTimeout(function () { $el.prop('hidden', true); }, 3500);
    }

    function postViewHref(post) {
        if (post.slug) return 'post-page.html?slug=' + encodeURIComponent(post.slug);
        return 'post-page.html?id=' + encodeURIComponent(post.id);
    }

    function renderPostsTable(posts) {
        var $body = $('#postsTableBody');
        $body.empty();
        managedPosts = posts || [];

        if (!managedPosts.length) {
            $('#postsEmpty').prop('hidden', false);
            $body.html('<tr><td colspan="5">No posts found.</td></tr>');
            return;
        }
        $('#postsEmpty').prop('hidden', true);

        managedPosts.forEach(function (post) {
            var status = post.status || 'draft';
            var cat = post.category || post.type || 'general';
            var tr =
                '<tr data-id="' + post.id + '">' +
                '<td class="post-title-cell"><a href="' + postViewHref(post) + '" target="_blank" rel="noopener">' +
                $('<div>').text(post.title || 'Untitled').html() + '</a></td>' +
                '<td>' + $('<div>').text(cat).html() + '</td>' +
                '<td><span class="status-pill ' + status + '">' + status + '</span></td>' +
                '<td>' + formatPostDate(post.created_at || post.updated_at) + '</td>' +
                '<td><div class="post-row-actions">' +
                '<a href="' + postViewHref(post) + '" target="_blank" rel="noopener">View</a>' +
                '<button type="button" class="btn-edit-post" data-id="' + post.id + '">Edit</button>' +
                '<button type="button" class="btn-delete-post btn-danger" data-id="' + post.id + '">Delete</button>' +
                '</div></td></tr>';
            $body.append(tr);
        });
    }

    function loadManagedPosts() {
        var status = $('#postsStatusFilter').val() || 'all';
        var q = '/admin/posts?limit=50';
        if (status && status !== 'all') {
            q += '&status=' + encodeURIComponent(status);
        } else {
            q += '&status=all';
        }

        $('#postsTableBody').html('<tr class="posts-loading-row"><td colspan="5">Loading posts…</td></tr>');

        api.get(q)
            .done(function (res) {
                if (res.success) {
                    renderPostsTable(res.posts || []);
                } else {
                    renderPostsTable([]);
                    showPostsStatus(res.message || 'Failed to load posts', 'error');
                }
            })
            .fail(function (xhr) {
                renderPostsTable([]);
                if (xhr.status === 401 || xhr.status === 403) {
                    showPostsStatus('Session expired. Please log in again.', 'error');
                    setTimeout(function () { window.location.href = 'admin-login.html'; }, 1500);
                    return;
                }
                showPostsStatus('Could not load posts', 'error');
            });
    }

    function openEditModal(post) {
        $('#editPostId').val(post.id);
        $('#editTitle').val(post.title || '');
        $('#editType').val(post.category || post.type || 'general');
        $('#editStatus').val(post.status || 'draft');
        $('#editExcerpt').val(post.excerpt || '');
        $('#editContent').val(post.content || '');
        var tags = post.tags;
        if (Array.isArray(tags)) {
            $('#editTags').val(tags.join(', '));
        } else if (typeof tags === 'string') {
            $('#editTags').val(tags);
        } else {
            $('#editTags').val('');
        }
        $('#editPostModal').prop('hidden', false);
    }

    function closeEditModal() {
        $('#editPostModal').prop('hidden', true);
    }

    $('#refreshPostsBtn').on('click', function () {
        loadManagedPosts();
    });

    $('#postsStatusFilter').on('change', function () {
        loadManagedPosts();
    });

    $('#postsTableBody').on('click', '.btn-edit-post', function () {
        var id = $(this).data('id');
        var post = managedPosts.find(function (p) { return String(p.id) === String(id); });
        if (post) openEditModal(post);
    });

    $('#postsTableBody').on('click', '.btn-delete-post', function () {
        var id = $(this).data('id');
        var post = managedPosts.find(function (p) { return String(p.id) === String(id); });
        var label = post ? post.title : ('#' + id);
        if (!confirm('Delete post “' + label + '”? This cannot be undone.')) return;

        api.delete('/posts/' + encodeURIComponent(id))
            .done(function (res) {
                if (res.success) {
                    showPostsStatus('Post deleted', 'success');
                    loadManagedPosts();
                    fetchStats();
                } else {
                    showPostsStatus(res.message || 'Delete failed', 'error');
                }
            })
            .fail(function (xhr) {
                if (xhr.status === 401 || xhr.status === 403) {
                    showPostsStatus('Session expired. Please log in again.', 'error');
                    return;
                }
                var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Delete failed';
                showPostsStatus(msg, 'error');
            });
    });

    $('#editPostClose, #editPostCancel').on('click', function () {
        closeEditModal();
    });

    $('#editPostModal').on('click', function (e) {
        if (e.target === this) closeEditModal();
    });

    $('#editPostForm').on('submit', function (e) {
        e.preventDefault();
        var id = $('#editPostId').val();
        if (!id) return;

        var tagsRaw = $('#editTags').val().trim();
        var tags = tagsRaw
            ? tagsRaw.split(',').map(function (t) { return t.trim(); }).filter(Boolean)
            : [];

        var payload = {
            title: $('#editTitle').val().trim(),
            category: $('#editType').val(),
            type: $('#editType').val(),
            status: $('#editStatus').val(),
            excerpt: $('#editExcerpt').val().trim(),
            content: $('#editContent').val().trim(),
            tags: tags
        };

        if (!payload.title || !payload.content) {
            showPostsStatus('Title and content are required', 'error');
            return;
        }

        // Update slug if title changed
        payload.slug = payload.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        $('#editPostSave').prop('disabled', true).text('Saving…');

        api.put('/posts/' + encodeURIComponent(id), payload)
            .done(function (res) {
                $('#editPostSave').prop('disabled', false).text('Save changes');
                if (res.success) {
                    closeEditModal();
                    showPostsStatus('Post updated', 'success');
                    loadManagedPosts();
                } else {
                    showPostsStatus(res.message || 'Update failed', 'error');
                }
            })
            .fail(function (xhr) {
                $('#editPostSave').prop('disabled', false).text('Save changes');
                if (xhr.status === 401 || xhr.status === 403) {
                    showPostsStatus('Session expired. Please log in again.', 'error');
                    return;
                }
                var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Update failed';
                showPostsStatus(msg, 'error');
            });
    });

    loadManagedPosts();
});
