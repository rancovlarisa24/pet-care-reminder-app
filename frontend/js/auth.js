// auth.js - autentificarea în frontend: login, înregistrare, deconectare și
// "poarta" care arată aplicația doar utilizatorilor logați.
// Token-ul JWT este salvat în localStorage și trimis la fiecare cerere de către app.js.
(function () {
  const API_BASE_URL = '/api';
  const TOKEN_KEY = 'petcare_token';
  const USER_KEY = 'petcare_user';

  // --- Elemente din pagină ---
  const authScreen = document.getElementById('authScreen');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authMessageBox = document.getElementById('authMessageBox');

  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserEmail = document.getElementById('sidebarUserEmail');
  const sidebarUserAvatar = document.getElementById('sidebarUserAvatar');
  const accountName = document.getElementById('accountName');
  const accountEmail = document.getElementById('accountEmail');
  const accountSince = document.getElementById('accountSince');
  const accountAvatar = document.getElementById('accountAvatar');
  const logoutBtn = document.getElementById('logoutBtn');
  const accountLogoutBtn = document.getElementById('accountLogoutBtn');

  // --- Helperi de stocare ---
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  };
  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };
  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Inițialele unui nume (pentru avatar).
  const initials = (name) => {
    const parts = String(name || '?').trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
  };

  const showAuthMessage = (message, type = 'error') => {
    authMessageBox.textContent = message;
    authMessageBox.className = type;
  };
  const clearAuthMessage = () => {
    authMessageBox.textContent = '';
    authMessageBox.className = '';
  };

  // Afișează datele utilizatorului în sidebar și pe pagina de cont (textContent => fără XSS).
  const renderUser = (user) => {
    if (!user) return;
    sidebarUserName.textContent = user.name || '—';
    sidebarUserEmail.textContent = user.email || '';
    sidebarUserAvatar.textContent = initials(user.name);
    accountName.textContent = user.name || '—';
    accountEmail.textContent = user.email || '';
    accountAvatar.textContent = initials(user.name);
    if (accountSince) {
      accountSince.textContent = user.created_at
        ? new Date(user.created_at).toLocaleDateString('ro-RO')
        : '—';
    }
  };

  // Trece interfața în starea "autentificat": ascunde login-ul, arată aplicația,
  // afișează datele userului și pornește încărcarea datelor (din app.js).
  const enterApp = (user) => {
    renderUser(user);
    document.body.classList.add('is-authed');
    if (window.PetCareApp && typeof window.PetCareApp.start === 'function') {
      window.PetCareApp.start(user);
    }
  };

  // Deconectare: șterge sesiunea și revine la ecranul de autentificare.
  const logout = () => {
    clearSession();
    document.body.classList.remove('is-authed');
    // Reîncărcăm pagina pentru a goli orice date afișate ale utilizatorului anterior.
    window.location.reload();
  };

  // --- Comutarea între tab-urile Autentificare / Cont nou ---
  const switchAuthMode = (target) => {
    authTabs.forEach((t) => t.classList.toggle('active', t.dataset.authTab === target));
    loginForm.hidden = target !== 'login';
    registerForm.hidden = target !== 'register';
    clearAuthMessage();
  };

  // Tab-urile din partea de sus + linkurile de comutare din josul fiecărui formular.
  document.querySelectorAll('[data-auth-tab]').forEach((el) => {
    el.addEventListener('click', () => switchAuthMode(el.dataset.authTab));
  });

  // --- Autentificare ---
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAuthMessage();

    const payload = {
      email: document.getElementById('loginEmail').value.trim(),
      password: document.getElementById('loginPassword').value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Autentificare eșuată.');
      }
      setSession(result.token, result.user);
      loginForm.reset();
      enterApp(result.user);
    } catch (error) {
      showAuthMessage(error.message);
    }
  });

  // --- Înregistrare cont nou ---
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAuthMessage();

    const payload = {
      name: document.getElementById('registerName').value.trim(),
      email: document.getElementById('registerEmail').value.trim(),
      password: document.getElementById('registerPassword').value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Înregistrare eșuată.');
      }
      setSession(result.token, result.user);
      registerForm.reset();
      enterApp(result.user);
    } catch (error) {
      showAuthMessage(error.message);
    }
  });

  // --- Butoanele de deconectare ---
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (accountLogoutBtn) accountLogoutBtn.addEventListener('click', logout);

  // Expunem un mic API pentru app.js (token + deconectare la 401).
  window.PetCareAuth = { getToken, getUser, logout };

  // --- La încărcarea paginii: validăm token-ul existent (dacă există) ---
  const init = async () => {
    const token = getToken();
    if (!token) {
      // Niciun token -> rămâne ecranul de autentificare.
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('token invalid');
      }
      const result = await response.json();
      setSession(token, result.user);
      enterApp(result.user);
    } catch {
      // Token expirat / invalid -> curățăm și arătăm login-ul.
      clearSession();
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
