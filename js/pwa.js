(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  var promptEvent;
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    promptEvent = event;
    installButton.hidden = false;
  });

  var installButton = document.createElement('button');
  installButton.type = 'button';
  installButton.hidden = true;
  installButton.className = 'install-app-button';
  installButton.textContent = 'Install 4ARU App';
  installButton.setAttribute('aria-label', 'Install 4ARU Study app');
  installButton.addEventListener('click', function () {
    if (!promptEvent) return;
    promptEvent.prompt();
    promptEvent.userChoice.then(function () { promptEvent = null; installButton.hidden = true; });
  });
  document.body.appendChild(installButton);

  var style = document.createElement('style');
  style.textContent = '.install-app-button{position:fixed;right:18px;bottom:18px;z-index:9999;border:0;border-radius:999px;background:#35d07f;color:#02140d;padding:13px 18px;font-weight:800;font-size:14px;box-shadow:0 8px 26px rgba(0,0,0,.34);cursor:pointer}.install-app-button:focus-visible{outline:3px solid #fff;outline-offset:3px}';
  document.head.appendChild(style);
})();
