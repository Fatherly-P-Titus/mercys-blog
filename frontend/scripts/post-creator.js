/**
 * Mercy's Blog - Post Creator Script
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    // Require admin JWT — hard redirect if missing
    if (typeof getToken !== 'function' || !getToken()) {
        window.location.href = 'admin-login.html';
        return;
    }

    const $form = $('#postForm');
    const $title = $('#postTitle');
    const $type = $('#postType');
    const $excerpt = $('#postExcerpt');
    const $content = $('#postContent');
    const $tags = $('#postTags');
    const $publishBtn = $('#publishBtn');
    const $saveDraftBtn = $('#saveDraftBtn');
    const $previewBtn = $('#previewBtn');
    const $formMessage = $('#formMessage');
    const $statusBadge = $('#statusBadge');

    // ========== CHARACTER / WORD COUNTS ==========
    function updateCounts() {
        const titleLen = $title.val().length;
        const excerptLen = $excerpt.val().length;
        const contentVal = $content.val();
        const contentLen = contentVal.length;
        const words = contentVal.trim() ? contentVal.trim().split(/\s+/).length : 0;
        const readMins = Math.max(1, Math.ceil(words / 200));

        $('#titleCount').text(titleLen);
        $('#excerptCount').text(excerptLen);
        $('#contentCount').text(contentLen);
        $('#wordCount').text(words);
        $('#readTime').text(readMins + ' min');
    }

    $title.on('input', updateCounts);
    $excerpt.on('input', updateCounts);
    $content.on('input', updateCounts);
    updateCounts();

    // ========== SIMPLE TOOLBAR ==========
    $('.toolbar-btn').on('click', function () {
        const command = $(this).data('command');
        const textarea = $content[0];
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = $content.val().substring(start, end);
        let replacement = '';

        switch (command) {
            case 'bold':
                replacement = `**${selected || 'bold text'}**`;
                break;
            case 'italic':
                replacement = `*${selected || 'italic text'}*`;
                break;
            case 'h2':
                replacement = `\n## ${selected || 'Heading'}\n`;
                break;
            case 'ul':
                replacement = `\n- ${selected || 'List item'}\n`;
                break;
            case 'blockquote':
                replacement = `\n> ${selected || 'Quote'}\n`;
                break;
            case 'link':
                const url = prompt('Enter URL:', 'https://');
                if (url) {
                    replacement = `[${selected || 'link text'}](${url})`;
                } else {
                    return;
                }
                break;
        }

        const newVal = $content.val().substring(0, start) + replacement + $content.val().substring(end);
        $content.val(newVal);
        updateCounts();
        $content.focus();
    });

    // ========== IMAGE UPLOAD ==========
    const $uploadArea = $('#imageUploadArea');
    const $fileInput = $('#postImage');
    const $placeholder = $('#uploadPlaceholder');
    const $preview = $('#imagePreview');
    const $previewImg = $('#previewImg');

    // File picker: opened via <label for="postImage"> (works on mobile).
    // Do NOT use input.trigger('click') — blocked on many phones.
    function showImagePreview(file) {
        if (!file) return;
        if (!file.type || file.type.indexOf('image/') !== 0) {
            showMessage('Please choose an image file (JPG, PNG, or WebP)', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showMessage('Image must be under 2MB', 'error');
            $fileInput.val('');
            return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
            $previewImg.attr('src', ev.target.result);
            $placeholder.prop('hidden', true);
            $preview.prop('hidden', false);
        };
        reader.readAsDataURL(file);
    }

    $fileInput.on('change', function () {
        var file = this.files && this.files[0];
        if (file) showImagePreview(file);
    });

    // Drag & drop (desktop)
    $uploadArea.on('dragover', function (e) {
        e.preventDefault();
        $(this).addClass('dragover');
    }).on('dragleave drop', function (e) {
        e.preventDefault();
        $(this).removeClass('dragover');
    }).on('drop', function (e) {
        var files = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files;
        var file = files && files[0];
        if (file && file.type && file.type.indexOf('image/') === 0) {
            // Assign via DataTransfer for browsers that allow it
            try {
                var dt = new DataTransfer();
                dt.items.add(file);
                $fileInput[0].files = dt.files;
            } catch (err) {
                // Fallback: still preview even if we cannot set input.files
            }
            showImagePreview(file);
        }
    });

    $('#removeImage').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $fileInput.val('');
        $previewImg.attr('src', '');
        $preview.prop('hidden', true);
        $placeholder.prop('hidden', false);
    });

    // ========== VALIDATION ==========
    function validate() {
        let isValid = true;
        clearErrors();

        if (!$title.val().trim()) {
            showFieldError('title', 'Title is required');
            isValid = false;
        } else if ($title.val().trim().length < 5) {
            showFieldError('title', 'Title must be at least 5 characters');
            isValid = false;
        }

        if (!$type.val()) {
            showFieldError('type', 'Please select a type');
            isValid = false;
        }

        if (!$content.val().trim()) {
            showFieldError('content', 'Content is required');
            isValid = false;
        } else if ($content.val().trim().length < 50) {
            showFieldError('content', 'Content should be at least 50 characters');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(field, message) {
        const $group = $('#' + (field === 'type' ? 'postType' : 'post' + field.charAt(0).toUpperCase() + field.slice(1))).closest('.form-group');
        // Simpler approach:
        if (field === 'title') {
            $('#postTitle').closest('.form-group').addClass('has-error');
            $('#titleError').text(message);
        } else if (field === 'type') {
            $('#postType').closest('.form-group').addClass('has-error');
            $('#typeError').text(message);
        } else if (field === 'content') {
            $('#postContent').closest('.form-group').addClass('has-error');
            $('#contentError').text(message);
        }
    }

    function clearErrors() {
        $('.form-group').removeClass('has-error');
        $('.error-message').text('');
    }

    function showMessage(msg, type) {
        $formMessage
            .removeClass('success error')
            .addClass(type)
            .text(msg)
            .prop('hidden', false);

        setTimeout(function () {
            $formMessage.prop('hidden', true);
        }, 4000);
    }

    // ========== PUBLISH ==========
    $form.on('submit', function (e) {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        $statusBadge.text('Publishing...').removeClass('draft published');

        const postData = {
            title: $title.val().trim(),
            type: $type.val(),
            excerpt: $excerpt.val().trim(),
            content: $content.val().trim(),
            tags: $tags.val().trim().split(',').map(t => t.trim()).filter(Boolean),
            status: 'published'
        };

        // Must be logged in
        if (typeof getToken === 'function' && !getToken()) {
            setLoading(false);
            showMessage('Please log in as admin before publishing.', 'error');
            setTimeout(function () {
                window.location.href = 'admin-login.html';
            }, 1500);
            return;
        }

        api.post('/posts', postData)
            .done(function (response) {
                setLoading(false);
                if (response.success && response.post) {
                    $statusBadge.text('Published').removeClass('draft').addClass('published');
                    var slug = response.post.slug;
                    var id = response.post.id;
                    var viewUrl = slug
                        ? ('post-page.html?slug=' + encodeURIComponent(slug))
                        : ('post-page.html?id=' + encodeURIComponent(id));
                    showMessage('Published! Opening post…', 'success');
                    setTimeout(function () {
                        window.location.href = viewUrl;
                    }, 1200);
                } else {
                    showMessage((response && response.message) || 'Failed to publish', 'error');
                    $statusBadge.text('Draft').removeClass('published').addClass('draft');
                }
            })
            .fail(function (xhr) {
                setLoading(false);
                $statusBadge.text('Draft').removeClass('published').addClass('draft');
                if (xhr.status === 401 || xhr.status === 403) {
                    showMessage('Session expired. Please log in again.', 'error');
                    setTimeout(function () {
                        window.location.href = 'admin-login.html';
                    }, 1500);
                    return;
                }
                if (xhr.status === 0) {
                    showMessage('Cannot reach server. Check your connection and try again.', 'error');
                    return;
                }
                var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Something went wrong';
                showMessage(msg, 'error');
            });
    });

    // ========== SAVE DRAFT ==========
    $saveDraftBtn.on('click', function () {
        clearErrors();
        if (!$title.val().trim() && !$content.val().trim()) {
            showMessage('Write something before saving a draft', 'error');
            return;
        }

        if (typeof getToken !== 'function' || !getToken()) {
            showMessage('Please log in as admin before saving a draft.', 'error');
            setTimeout(function () {
                window.location.href = 'admin-login.html';
            }, 1500);
            return;
        }

        var formData = new FormData();
        formData.append('title', $title.val().trim() || 'Untitled Draft');
        formData.append('type', $type.val() || 'general');
        formData.append('excerpt', $excerpt.val().trim());
        formData.append('content', $content.val().trim());
        formData.append('status', 'draft');
        var tags = $tags.val().trim().split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        formData.append('tags', JSON.stringify(tags));
        if ($fileInput[0].files && $fileInput[0].files[0]) {
            formData.append('image', $fileInput[0].files[0]);
        }

        api.post('/posts', formData, true)
            .done(function (response) {
                $statusBadge.text('Draft').removeClass('published').addClass('draft');
                if (response && response.success) {
                    showMessage('Draft saved', 'success');
                } else {
                    showMessage((response && response.message) || 'Draft may not have saved', 'error');
                }
            })
            .fail(function (xhr) {
                $statusBadge.text('Draft').removeClass('published').addClass('draft');
                if (xhr.status === 401 || xhr.status === 403) {
                    showMessage('Session expired. Please log in again.', 'error');
                    setTimeout(function () {
                        window.location.href = 'admin-login.html';
                    }, 1500);
                    return;
                }
                var msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Could not save draft';
                showMessage(msg, 'error');
            });
    });

    // ========== PREVIEW ==========
    $previewBtn.on('click', function () {
        const title = $title.val().trim() || 'Untitled Post';
        const type = $type.val() || 'general';
        const content = $content.val().trim() || 'No content yet.';
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const readMins = Math.max(1, Math.ceil(words / 200));

        const html = `
            <span class="preview-category">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <h1>${escapeHtml(title)}</h1>
            <div class="preview-meta">By Mercy · ${readMins} min read</div>
            <div class="preview-content">${escapeHtml(content)}</div>
        `;

        $('#previewBody').html(html);
        $('#previewModal').prop('hidden', false);
        $('body').css('overflow', 'hidden');
    });

    $('#closePreview, #previewOverlay').on('click', function () {
        $('#previewModal').prop('hidden', true);
        $('body').css('overflow', '');
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            $('#previewModal').prop('hidden', true);
            $('body').css('overflow', '');
        }
    });

    // ========== MOBILE MENU ==========
    $('#menuToggle').on('click', function () {
        $(this).toggleClass('active');
        $('#adminNav').toggleClass('open');
    });

    // ========== HELPERS ==========
    function setLoading(isLoading) {
        if (isLoading) {
            $publishBtn.prop('disabled', true);
            $publishBtn.find('.btn-text').prop('hidden', true);
            $publishBtn.find('.btn-loader').prop('hidden', false);
        } else {
            $publishBtn.prop('disabled', false);
            $publishBtn.find('.btn-text').prop('hidden', false);
            $publishBtn.find('.btn-loader').prop('hidden', true);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
