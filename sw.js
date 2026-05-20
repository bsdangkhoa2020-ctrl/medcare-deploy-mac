// sw.js — Service Worker cho bstuan247.com
// Đặt ở root repo, serve tại /sw.js

var CACHE_VERSION = 'bstuan247-v2';

self.addEventListener('install', function(event) {
  console.log('[SW] Install v2');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activate');
  event.waitUntil(self.clients.claim());
});

// ── Push event ───────────────────────────────────────────
self.addEventListener('push', function(event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = {
      title: 'BS. Tuấn 🌙',
      body: event.data ? event.data.text() : 'Đã đến giờ check-in buổi tối.'
    };
  }

  var title = data.title || 'BS. Tuấn 🌙';
  var options = {
    body:     data.body    || 'BS Tuấn đang chờ check-in buổi tối của bạn.',
    icon:     '/icon-192.png',
    badge:    '/icon-72.png',
    tag:      'evening-checkin',
    renotify: false,
    requireInteraction: false,
    data: { url: data.url || '/', type: data.type || 'checkin' },
    actions: [
      { action: 'open',    title: 'Check-in ngay' },
      { action: 'dismiss', title: 'Để sau'        }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification click ────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clients) {
        for (var i = 0; i < clients.length; i++) {
          var c = clients[i];
          if ('focus' in c) {
            c.focus();
            c.postMessage({ type: 'OPEN_CHECKIN' });
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

// ── Message từ app ────────────────────────────────────────
self.addEventListener('message', function(event) {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
