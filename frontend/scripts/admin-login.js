/**
 * Mercy's Blog - Admin Login Script
 * Uses local jQuery
 * Backend API calls are commented out and ready for production
 */

$(document).ready(function () {
    const $form = $('#loginForm');
    const $email = $('#email');
    const $password = $('#password');
    const $loginBtn = $('#loginBtn');
    const $btnText = $loginBtn.find('.btn-text');
    const $btnLoader = $loginBtn.find('.btn-loader');
    const $formMessage = $('#formMessage');
    const $togglePassword = $('#togglePassword');

    // ---------- Password visibility toggle ----------
    $togglePassword.on('click', function () {
        const isPassword = $password.attr('type') === 'password';
        $password.attr('type', isPassword ? 'text' : 'password');

        // Simple icon swap via opacity (or you can swap SVG paths)
        $(this).css('opacity', isPassword ? 0.6 : 1);
    });

    // ---------- Clear errors on input ----------
    $email.on('input', function () {
        clearFieldError('email');
    });

    $password.on('input', function () {
        clearFieldError('password');
    });

    // ---------- Form submission ----------
    $form.on('submit', function (e) {
        e.preventDefault();

        // Reset previous messages
        hideFormMessage();
        clearAllErrors();

        const email = $email.val().trim();
        const password = $password.val();
        const rememberMe = $('#rememberMe').is(':checked');

        // Client-side validation
        let isValid = true;

        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showFieldError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        setLoading(true);

        // Real backend call
        api.post('/admin/login', {
            email: email,
            password: password,
            rememberMe: rememberMe
        })
        .done(function (response) {
            setLoading(false);

            if (response.success && response.token) {
                setToken(response.token, rememberMe);
                sessionStorage.setItem('adminLoggedIn', 'true');
                showFormMessage('Login successful! Redirecting...', 'success');

                setTimeout(function () {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                showFormMessage(response.message || 'Invalid email or password', 'error');
            }
        })
        .fail(function (xhr) {
            setLoading(false);
            // Fallback to demo mode if backend is unreachable
            if (xhr.status === 0 || xhr.status >= 500) {
                if (email === 'admin@mercysblog.com' && password === 'Admin12345') {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    showFormMessage('Login successful (demo mode)! Redirecting...', 'success');
                    setTimeout(function () {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                    return;
                }
            }
            const msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Something went wrong. Please try again.';
            showFormMessage(msg, 'error');
        });
    });

    // ---------- Forgot password (placeholder) ----------
    $('#forgotPassword').on('click', function (e) {
        e.preventDefault();
        showFormMessage('Password reset feature coming soon.', 'error');
    });

    // ---------- Helpers ----------
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showFieldError(field, message) {
        const $group = $('#' + field).closest('.form-group');
        $group.addClass('has-error');
        $('#' + field + 'Error').text(message);
    }

    function clearFieldError(field) {
        const $group = $('#' + field).closest('.form-group');
        $group.removeClass('has-error');
        $('#' + field + 'Error').text('');
    }

    function clearAllErrors() {
        $('.form-group').removeClass('has-error');
        $('.error-message').text('');
    }

    function showFormMessage(message, type) {
        $formMessage
            .removeClass('error success')
            .addClass(type)
            .text(message)
            .prop('hidden', false);
    }

    function hideFormMessage() {
        $formMessage.prop('hidden', true).text('');
    }

    function setLoading(isLoading) {
        if (isLoading) {
            $loginBtn.prop('disabled', true);
            $btnText.prop('hidden', true);
            $btnLoader.prop('hidden', false);
        } else {
            $loginBtn.prop('disabled', false);
            $btnText.prop('hidden', false);
            $btnLoader.prop('hidden', true);
        }
    }
});
