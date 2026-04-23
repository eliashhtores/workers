/**
 * auth.js – Handles login / register UI interactions.
 */

/* ── Helpers ────────────────────────────────────────────── */

function showAlert(message, type = 'error') {
  const el = document.getElementById('alert');
  el.textContent = message;
  el.className = `mb-4 px-4 py-3 rounded-lg text-sm font-medium alert-${type}`;
  el.classList.remove('hidden');

  clearTimeout(el._timeout);
  if (type === 'success') {
    el._timeout = setTimeout(() => el.classList.add('hidden'), 4000);
  }
}

function hideAlert() {
  document.getElementById('alert').classList.add('hidden');
}

function setLoading(formId, loading) {
  const prefix = formId === 'form-login' ? 'login' : 'register';
  document.getElementById(`${prefix}-spinner`).classList.toggle('hidden', !loading);
  document.getElementById(`${prefix}-btn-text`).textContent = loading
    ? (prefix === 'login' ? 'Signing in…' : 'Creating account…')
    : (prefix === 'login' ? 'Sign In' : 'Create Account');
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  const icon = btn.querySelector('.eye-icon');
  if (isPassword) {
    // show "eye-off" icon
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7
           a9.959 9.959 0 012.223-3.592M9.88 9.88A3 3 0 0114.12 14.12
           M3 3l18 18" />`;
  } else {
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542
           7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
  }
}

function switchTab(tab) {
  const isLogin = tab === 'login';

  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);

  const loginBtn = document.getElementById('tab-login');
  const registerBtn = document.getElementById('tab-register');

  if (isLogin) {
    loginBtn.classList.add('bg-white', 'text-indigo-600', 'shadow');
    loginBtn.classList.remove('text-gray-500');
    registerBtn.classList.remove('bg-white', 'text-indigo-600', 'shadow');
    registerBtn.classList.add('text-gray-500');
  } else {
    registerBtn.classList.add('bg-white', 'text-indigo-600', 'shadow');
    registerBtn.classList.remove('text-gray-500');
    loginBtn.classList.remove('bg-white', 'text-indigo-600', 'shadow');
    loginBtn.classList.add('text-gray-500');
  }

  hideAlert();
}

/* ── Error formatting ───────────────────────────────────── */

function formatErrors(data) {
  if (!data) return 'An unexpected error occurred.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.non_field_errors) return data.non_field_errors.join(' ');

  // Field errors
  const messages = [];
  for (const [field, errors] of Object.entries(data)) {
    const label = field.replace(/_/g, ' ');
    const msg = Array.isArray(errors) ? errors.join(' ') : String(errors);
    messages.push(`${label}: ${msg}`);
  }
  return messages.join('\n') || 'An unexpected error occurred.';
}

/* ── Redirect after login ───────────────────────────────── */

function redirectToDashboard(user) {
  // Store user info for the next page
  localStorage.setItem('user', JSON.stringify(user));
  // Redirect – the dashboard page will be added in a future sprint
  window.location.href = user.role === 'employer' ? 'employer.html' : 'worker.html';
}

/* ── Login handler ──────────────────────────────────────── */

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    showAlert('Please fill in all fields.');
    return;
  }

  setLoading('form-login', true);
  const { ok, data } = await Auth.login(username, password);
  setLoading('form-login', false);

  if (ok) {
    Auth.saveTokens(data.access, data.refresh);
    showAlert('Login successful! Redirecting…', 'success');
    setTimeout(() => redirectToDashboard(data.user), 800);
  } else {
    showAlert(formatErrors(data));
  }
});

/* ── Register handler ───────────────────────────────────── */

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const role = document.getElementById('reg-role').value;
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const passwordConfirm = document.getElementById('reg-password-confirm').value;

  if (!username || !email || !password || !passwordConfirm) {
    showAlert('Please fill in all required fields.');
    return;
  }

  if (password !== passwordConfirm) {
    showAlert('Passwords do not match.');
    return;
  }

  if (password.length < 8) {
    showAlert('Password must be at least 8 characters long.');
    return;
  }

  setLoading('form-register', true);
  const { ok, data } = await Auth.register({ username, email, role, phone, password, password_confirm: passwordConfirm });
  setLoading('form-register', false);

  if (ok) {
    showAlert('Account created! Please sign in.', 'success');
    setTimeout(() => switchTab('login'), 1500);
  } else {
    showAlert(formatErrors(data));
  }
});

/* ── Auto-redirect if already logged in ─────────────────── */

if (Auth.isLoggedIn()) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role) redirectToDashboard(user);
}
