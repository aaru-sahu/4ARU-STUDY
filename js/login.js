(function () {
  const cfg = window.SUPABASE_CONFIG;
  const adminEmail = '4k4sh07@gmail.com';
  const form = document.getElementById('admin-login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const button = document.getElementById('login-button');
  const status = document.getElementById('status');
  function show(message, error) { status.textContent = message; status.classList.toggle('error', Boolean(error)); }
  function busy(value) { button.disabled = value; button.textContent = value ? 'Signing in…' : 'Secure admin login'; }
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!cfg || !cfg.url || !cfg.anonKey) { show('Supabase configuration missing.', true); return; }
    if (email.value.trim().toLowerCase() !== adminEmail) { show('This email is not authorised for the admin portal.', true); return; }
    busy(true); show('Signing in securely…');
    try {
      const response = await fetch(cfg.url + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.anonKey }, body: JSON.stringify({ email: email.value.trim().toLowerCase(), password: password.value }) });
      const data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error_description || data.msg || 'Incorrect email or password.');
      localStorage.setItem('sb-access-token', data.access_token);
      localStorage.setItem('sb-refresh-token', data.refresh_token || '');
      window.location.assign('cgpsc-admin.html');
    } catch (error) { show(error.message, true); } finally { busy(false); }
  });
})();
