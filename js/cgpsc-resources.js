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
    list.innerHTML = items.length ? '' : '<p class="admin-empty">Abhi aapne koi extra resource add nahi kiya hai.</p>';
    items.forEach(function (item) { const row = document.createElement('div'); row.className = 'admin-item'; const info = document.createElement('div'); const h = document.createElement('h3'); h.textContent = (item.icon || '📘') + ' ' + item.title; const p = document.createElement('p'); p.textContent = item.description; info.append(h, p); const del = document.createElement('button'); del.className = 'admin-delete'; del.type = 'button'; del.textContent = 'Delete'; del.onclick = async function () { try { await request('DELETE', null, item.id); await load(); } catch (error) { showStatus(error.message, true); } }; row.append(info, del); list.append(row); });
  }
  async function load() { try { const items = await request(); renderPublic(items); renderAdmin(items); } catch (_) { renderPublic([]); } }
  document.addEventListener('DOMContentLoaded', function () {
    load();
    const adminLink = document.getElementById('resource-admin-link');
    if (adminLink) adminLink.hidden = !isAdmin();
    const form = document.getElementById('resource-form'); if (!form) return;
    if (!isAdmin()) { window.location.replace('cgpsc.html'); return; }
    document.getElementById('login-required').classList.add('hidden');
    document.getElementById('admin-content').classList.remove('hidden');
    form.addEventListener('submit', async function (event) { event.preventDefault(); const data = new FormData(form); try { await request('POST', { icon: String(data.get('icon') || '📘').trim(), title: String(data.get('title')).trim(), description: String(data.get('description')).trim(), url: String(data.get('url')).trim() }); form.reset(); showStatus('Resource live add ho gaya.'); await load(); } catch (error) { showStatus(error.message, true); } });
  });
})();
