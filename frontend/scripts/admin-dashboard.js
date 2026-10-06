/**
 * Mercy's Blog - Admin Dashboard Script
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    // Auth check
    if (!getToken() && sessionStorage.getItem('adminLoggedIn') !== 'true') {
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

        // ---------- TEMPORARY MOCK ----------
        setTimeout(function () {
            // Persist to localStorage for demo so changes can be read later
            localStorage.setItem('siteContent_homepage', JSON.stringify(data));
            $status.text('Homepage saved! (Demo – stored locally)').addClass('success');
            setTimeout(() => $status.text(''), 3000);
            console.log('Homepage content saved:', data);
        }, 800);
        // ---------- END MOCK ----------
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
        */

        // ---------- TEMPORARY MOCK ----------
        setTimeout(function () {
            localStorage.setItem('siteContent_profile', JSON.stringify(data));
            $status.text('Profile saved! (Demo – stored locally)').addClass('success');
            setTimeout(() => $status.text(''), 3000);
            console.log('Profile content saved:', data);
        }, 800);
        // ---------- END MOCK ----------
    });

    // ========== LOAD SAVED CONTENT (demo) ==========
    function loadSavedContent() {
        try {
            const homepage = JSON.parse(localStorage.getItem('siteContent_homepage') || '{}');
            if (homepage.heroBadge) $('#heroBadge').val(homepage.heroBadge);
            if (homepage.heroTitle) $('#heroTitle').val(homepage.heroTitle);
            if (homepage.heroExcerpt) $('#heroExcerpt').val(homepage.heroExcerpt);
            if (homepage.aboutText) $('#aboutText').val(homepage.aboutText);
            if (homepage.footerTagline) $('#footerTagline').val(homepage.footerTagline);

            const profile = JSON.parse(localStorage.getItem('siteContent_profile') || '{}');
            if (profile.profileName) $('#profileName').val(profile.profileName);
            if (profile.profileTagline) $('#profileTagline').val(profile.profileTagline);
            if (profile.profileBio) $('#profileBio').val(profile.profileBio);
            if (profile.aboutLong) $('#aboutLong').val(profile.aboutLong);
            if (profile.statArticles) $('#statArticles').val(profile.statArticles);
            if (profile.statTotalViews) $('#statTotalViews').val(profile.statTotalViews);
            if (profile.statTotalReaders) $('#statTotalReaders').val(profile.statTotalReaders);
        } catch (e) {
            console.warn('Could not load saved content', e);
        }
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
});
