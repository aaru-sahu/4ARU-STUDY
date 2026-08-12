/* Real passwordless Supabase login: email link returns a short-lived session token. */
(function () {
  const cfg = window.SUPABASE_CONFIG;
  const emailInput = document.getElementById('email');
  const sendButton = document.getElementById('email-button');
  const status = document.getElementById('status');

  function show(message, error) {
    status.textContent = message;
    status.classList.toggle('error', Boolean(error));
  }

  function setBusy(isBusy) {
    sendButton.disabled = isBusy;
    sendButton.textContent = isBusy ? 'Sending…' : 'Send secure login link';
  }

  function finishFromEmailLink() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');
    if (!token) return;
    localStorage.setItem('sb-access-token', token);
    history.replaceState({}, document.title, window.location.pathname);
    emailInput.closest('#email-step').classList.add('hidden');
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encoded + '='.repeat((4 - encoded.length % 4) % 4)));
    if ((payload.email || '').toLowerCase() === '4k4sh07@gmail.com') document.getElementById('admin-portal-link').classList.remove('hidden');
    show('Email verified. You are logged in.');
  }

  async function sendLink() {
    if (!cfg || !cfg.url || !cfg.anonKey) {
      show('Supabase connection configuration is missing.', true);
      return;
    }
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    const lastRequest = Number(localStorage.getItem('4aru-login-last-request') || 0);
    const secondsLeft = Math.ceil((60000 - (Date.now() - lastRequest)) / 1000);
    if (secondsLeft > 0) {
      show('Please wait ' + secondsLeft + ' seconds before requesting another login email.', true);
      return;
    }
    setBusy(true);
    show('Secure login link भेजा जा रहा है…');
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const response = await fetch(cfg.url + '/auth/v1/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: cfg.anonKey },
        body: JSON.stringify({
          email: emailInput.value.trim().toLowerCase(),
          create_user: true,
          email_redirect_to: redirectTo
        })
      });
      const data = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        const details = data.msg || data.message || '';
        if (/rate limit/i.test(details)) throw new Error('Supabase email limit reached. Please wait up to 1 hour before trying again. Do not click the button repeatedly.');
        throw new Error(details || 'Email भेजा नहीं जा सका।');
      }
      localStorage.setItem('4aru-login-last-request', String(Date.now()));
      show('Email भेज दिया गया। Inbox खोलकर “Sign in” link पर tap/click करें। फिर आप automatically logged in हो जाएंगे।');
    } catch (error) {
      show(error.message || 'Request failed. Please try again.', true);
    } finally {
      setBusy(false);
    }
  }

  finishFromEmailLink();
  sendButton.addEventListener('click', sendLink);
})();
