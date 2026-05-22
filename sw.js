// ════════════════════════════════════════════════════════════════
// SERVICE WORKER — BSTUAN247
// ────────────────────────────────────────────────────────────────
// Chức năng:
//   1. Push Notification — nhận push từ Supabase Edge Function
//   2. Notification Click — mở app + gửi message OPEN_CHECKIN
//   3. Activate ngay — không cần reload nhiều lần
//
// Lưu ý:
//   - File này deploy ở ROOT của domain (https://bstuan247.com/sw.js)
//   - Bump CACHE_VERSION khi muốn force update SW
// ════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v1';

// ── Install: kích hoạt ngay, không chờ ──────────────────────────
self.addEventListener('install', function(event) {
  console.log('[SW] Install', CACHE_VERSION);
  // Skip waiting để SW mới active ngay
  self.skipWaiting();
});

// ── Activate: claim toàn bộ tab đang mở ─────────────────────────
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate', CACHE_VERSION);
  event.waitUntil(self.clients.claim());
});

// ── Push: nhận push từ Edge Function gemini-proxy / push-sender ──
self.addEventListener('push', function(event) {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch(e) {
    // Nếu không phải JSON, lấy text
    data = { title: 'BS. Tuấn', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'BS. Tuấn';
  const options = {
    body: data.body || 'Bạn có thông báo mới',
    icon: data.icon || '/manifest.json', // fallback icon từ manifest
    badge: data.badge || '/manifest.json',
    tag: data.tag || 'bstuan247-notif',
    data: {
      type: data.type || 'OPEN_CHECKIN',  // mặc định mở evening check-in
      url: data.url || '/'
    },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification Click: mở app + gửi message ─────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  const messageType = (event.notification.data && event.notification.data.type) || 'OPEN_CHECKIN';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Tìm tab đang mở
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin)) {
            // Focus + gửi message
            client.postMessage({ type: messageType });
            return client.focus();
          }
        }
        // Không có tab → mở mới
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Message từ index.html: nếu muốn force update ─────────────────
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
