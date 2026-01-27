self.addEventListener("push", (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    const textData = event.data ? event.data.text() : "New notification";
    data = {
      title: "Notification",
      body: textData,
    };
  }
  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    tag: "easy-notes-notification",
    requireInteraction: true,
    silent: false,
    data: data.data || {},  // Store custom data from backend
  };
  event.waitUntil(
    self.registration
      .showNotification(data.title, options)
      .catch((err) => console.error("Error showing notification:", err)),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  let targetUrl = self.registration.scope;
  if (notificationData.type === "NEW_PDF") {
    targetUrl = new URL("/classes", self.registration.scope).href;
  } else if (notificationData.url) {
    targetUrl = new URL(notificationData.url, self.registration.scope).href;
  }
  event.waitUntil(
    clients.openWindow(targetUrl)
      .catch((err) => console.error("Error handling notification click:", err))
  );
});
