const $ = (id) => document.getElementById(id);
const render = (data) => { $('capture').checked = data.captureEnabled !== false; $('count').textContent = data.queue.length; $('eventsCount').textContent = data.events.length; $('events').innerHTML = data.events.length ? data.events.map((e) => `<li><b>${e.type}</b><small>${new Date(e.at).toLocaleString()}</small></li>`).join('') : '<li class="muted">No events yet</li>'; };
const refresh = () => chrome.runtime.sendMessage({ type: 'GET_STATE' }).then(render);
$('capture').addEventListener('change', (e) => chrome.runtime.sendMessage({ type: 'SET_CAPTURE', enabled: e.target.checked }));
$('clear').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'CLEAR_QUEUE' }).then(refresh));
refresh();
