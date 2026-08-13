(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const table = cfg.url ? cfg.url + '/rest/v1/cgpsc_resources' : '';
  const defaults = [
    { icon: '📚', title: 'Syllabus', description: 'CGPSC syllabus aur topic-wise preparation structure dekhen.', url: '#syllabus' },
    { icon: '📝', title: 'Previous Papers', description: 'Previous year question papers aur unka analysis.', url: '#' },
    { icon: '📰', title: 'Current Affairs', description: 'Important national aur Chhattisgarh current affairs.', url: '#' },
    { icon: '📖', title: 'Study Material', description: 'Subject-wise notes aur preparation material.', url: '#' }
  ];
  const adminEmail = '4k4sh07@gmail.com';
  function token() { return localStorage.getItem('sb-access-token'); }
  function signedInEmail() { try { const part = token().split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(atob(part)).email || ''; } catch (_) { return ''; } }
  function isAdmin() { return signedInEmail().toLowerCase() === adminEmail; }
  function headers() { return { apikey: cfg.anonKey, Authorization: 'Bearer ' + (token() || cfg.anonKey), 'Content-Type': 'application/json' }; }
  async function request(method, body, id) {
    const url = table + (id ? '?id=eq.' + encodeURIComponent(id) : '?select=*&order=created_at.desc');
    const response = await fetch(url, { method: method || 'GET', headers: { ...headers(), Prefer: method === 'POST' ? 'return=representation' : 'return=minimal' }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(function () { return []; });
    if (!response.ok) throw new Error(data.message || data.hint || 'Database request failed. Please login again.');
    return data;
  }
  function safeUrl(value) { try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) || value.startsWith('#') ? url.href : '#'; } catch (_) { return '#'; } }
  function renderPublic(items) {
    const grid = document.getElementById('cgpsc-resources'); if (!grid) return;
    grid.innerHTML = '';
    [...defaults, ...items].forEach(function (item) { const a = document.createElement('a'); a.className = 'resource'; a.href = safeUrl(item.url); const h = document.createElement('h3'); h.textContent = (item.icon || '📘') + ' ' + item.title; const p = document.createElement('p'); p.textContent = item.description; a.append(h, p); grid.append(a); });
  }
  function showStatus(text, error) { const box = document.getElementById('admin-status'); if (box) { box.textContent = text; box.style.color = error ? '#ff9d9d' : '#9cff45'; } }
  function renderAdmin(items) {
    const list = document.getElementById('resource-list'); if (!list) return;
    list.innerHTML = items.length ? '' : '<tr><td colspan="5" class="admin-empty">No extra resources published yet.</td></tr>';
    items.forEach(function (item) { const row = document.createElement('tr'); const name = document.createElement('td'); name.innerHTML = '<span class="material-name"></span><span class="material-desc"></span>'; name.querySelector('.material-name').textContent = (item.icon || '📘') + ' ' + item.title; name.querySelector('.material-desc').textContent = item.description; const type = document.createElement('td'); const isPdf = /\.pdf($|\?)/i.test(item.url); type.innerHTML = '<span class="pill ' + (isPdf ? 'pdf' : '') + '">' + (isPdf ? 'PDF' : 'LINK') + '</span>'; const date = document.createElement('td'); date.textContent = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'; const state = document.createElement('td'); state.innerHTML = '<span class="pill">Active</span>'; const actions = document.createElement('td'); actions.className = 'row-actions'; const open = document.createElement('a'); open.className = 'icon-button'; open.href = safeUrl(item.url); open.target = '_blank'; open.rel = 'noopener'; open.title = 'Open resource'; open.textContent = '↗'; const del = document.createElement('button'); del.className = 'icon-button delete'; del.type = 'button'; del.title = 'Delete resource'; del.textContent = '🗑'; del.onclick = async function () { if (!confirm('Delete this resource from the public CGPSC page?')) return; try { await request('DELETE', null, item.id); await load(); } catch (error) { showStatus(error.message, true); } }; actions.append(open, del); row.append(name, type, date, state, actions); list.append(row); });
  }
  function updateStats(items) { const total = items.length; const pdf = items.filter(function (item) { return /\.pdf($|\?)/i.test(item.url); }).length; const set = function (id, value) { const node = document.getElementById(id); if (node) node.textContent = value; }; set('stat-total', total); set('stat-active', total); set('stat-pdf', pdf); set('stat-links', total - pdf); }
  async function load() { try { const items = await request(); renderPublic(items); renderAdmin(items); updateStats(items); window.adminResources = items; } catch (_) { renderPublic([]); } }
  document.addEventListener('DOMContentLoaded', function () {
    load();
    const form = document.getElementById('resource-form'); if (!form) return;
    if (!isAdmin()) {
      // The dashboard is private: send visitors to the real authentication page
      // instead of leaving an unauthorised dashboard shell on screen.
      location.replace('login.html');
      return;
    }
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('admin-email').textContent = signedInEmail();
    const modal = document.getElementById('resource-modal');
    document.querySelectorAll('[data-open-modal]').forEach(function (button) { button.onclick = function () { modal.classList.remove('hidden'); document.getElementById('title').focus(); }; });
    document.querySelectorAll('[data-close-modal]').forEach(function (button) { button.onclick = function () { modal.classList.add('hidden'); showStatus(''); }; });
    document.querySelectorAll('[data-view]').forEach(function (button) { button.onclick = function () { const target = button.dataset.view; document.querySelectorAll('.nav-item[data-view]').forEach(function (item) { item.classList.toggle('active', item === button); }); document.getElementById('overview-view').classList.toggle('hidden', target !== 'overview'); document.getElementById('materials-view').classList.toggle('hidden', target !== 'materials'); }; });
    document.querySelectorAll('[data-view-target]').forEach(function (button) { button.onclick = function () { document.querySelector('[data-view="materials"]').click(); }; });
    document.getElementById('refresh-resources').onclick = load;
    document.getElementById('resource-search').oninput = function (event) { const needle = event.target.value.toLowerCase(); renderAdmin((window.adminResources || []).filter(function (item) { return (item.title + ' ' + item.description).toLowerCase().includes(needle); })); };
    form.addEventListener('submit', async function (event) { event.preventDefault(); const data = new FormData(form); try { await request('POST', { icon: String(data.get('icon') || '📘').trim(), title: String(data.get('title')).trim(), description: String(data.get('description')).trim(), url: String(data.get('url')).trim() }); form.reset(); modal.classList.add('hidden'); showStatus(''); await load(); document.querySelector('[data-view="materials"]').click(); } catch (error) { showStatus(error.message, true); } });
  });
})();
