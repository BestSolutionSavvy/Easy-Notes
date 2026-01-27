console.log('Service Worker loaded');

self.addEventListener('push', event => {
    console.log('Push event received:', event);
    
    let data;
    try {
        data = event.data.json();
        console.log('Push data:', data);
    } catch (e) {
        console.error('Error parsing push data:', e);
        data = {
            title: 'Notification',
            body: event.data ? event.data.text() : 'New notification'
        };
    }

    const options = {
        body: data.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'easy-notes-notification',
        requireInteraction: false
    };

    console.log('Showing notification:', data.title, options);

    event.waitUntil(
        self.registration.showNotification(data.title, options)
            .then(() => console.log('Notification shown successfully'))
            .catch(err => console.error('Error showing notification:', err))
    );
});

self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
