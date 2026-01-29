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
    data: data.data || {}
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
  let targetPath = "/";
  if (notificationData.type === "NEW_PDF") {
    targetPath =
      "/home?pdfId=" +
      notificationData.pdfId +
      "&subject=" +
      notificationData.classId;
  } else if (notificationData.type === "SUMMARY") {
    targetPath = `/notebooks?summaryId=${notificationData.notebookId}`;
  } else if (notificationData.url) {
    targetPath = notificationData.url;
  }
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.includes(self.registration.scope) &&
            "focus" in client
          ) {
            return client.focus().then(() => {
              if ("navigate" in client) {
                return client.navigate(targetPath);
              }
            });
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetPath);
        }
      })
      .catch((err) => console.error("Error handling notification click:", err)),
  );
});
