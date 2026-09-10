const $ = (id) => document.getElementById(id);
const render = (data) => { $('capture').checked = data.captureEnabled !== false; $('count').textContent = data.queue.length; $('eventsCount').textContent = data.events.length; $('apiUrl').value = data.apiBaseUrl || ''; $('ownerId').value = data.ownerId || ''; $('events').innerHTML = data.events.length ? data.events.map((e) => `<li><b>${e.type}</b><small>${new Date(e.at).toLocaleString()}</small></li>`).join('') : '<li class="muted">No events yet</li>'; };
const refresh = () => chrome.runtime.sendMessage({ type: 'GET_STATE' }).then(render);
$('capture').addEventListener('change', (e) => chrome.runtime.sendMessage({ type: 'SET_CAPTURE', enabled: e.target.checked }));
$('clear').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'CLEAR_QUEUE' }).then(refresh));
 $('saveConfig').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'SET_API_CONFIG', apiBaseUrl: $('apiUrl').value, ownerId: $('ownerId').value, apiKey: $('apiKey').value }).then((result) => { $('apiKey').value = ''; if (result?.error) alert(result.error); else refresh(); }));
 $('upload').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'UPLOAD_NOW' }).then(render));
refresh();
