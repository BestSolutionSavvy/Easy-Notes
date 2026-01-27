// Debug utility for push notifications

export async function debugPushSetup() {
    console.log('=== Push Notification Debug ===');
    
    // 1. Check browser support
    console.log('1. Browser Support:');
    console.log('  - Service Worker:', 'serviceWorker' in navigator);
    console.log('  - Push Manager:', 'PushManager' in window);
    console.log('  - Notification API:', 'Notification' in window);
    
    // 2. Check permissions
    console.log('\n2. Permissions:');
    console.log('  - Notification permission:', Notification.permission);
    
    // 3. Check VAPID key
    console.log('\n3. VAPID Configuration:');
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    console.log('  - VAPID key configured:', !!vapidKey);
    console.log('  - VAPID key (first 20 chars):', vapidKey?.substring(0, 20));
    
    // 4. Check service worker
    console.log('\n4. Service Worker Status:');
    try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        if (reg) {
            console.log('  - Registration found:', true);
            console.log('  - Active:', !!reg.active);
            console.log('  - Waiting:', !!reg.waiting);
            console.log('  - Installing:', !!reg.installing);
            console.log('  - Scope:', reg.scope);
            
            // 5. Check subscription
            console.log('\n5. Push Subscription:');
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                console.log('  - Subscription exists:', true);
                console.log('  - Endpoint:', sub.endpoint);
                console.log('  - Keys:', {
                    p256dh: sub.toJSON().keys?.p256dh?.substring(0, 20) + '...',
                    auth: sub.toJSON().keys?.auth?.substring(0, 20) + '...'
                });
            } else {
                console.log('  - Subscription exists:', false);
            }
        } else {
            console.log('  - Registration found:', false);
        }
    } catch (error) {
        console.error('Error checking service worker:', error);
    }
    
    console.log('\n=== End Debug ===');
}

// Test sending a local notification
export async function testLocalNotification() {
    console.log('Testing local notification...');
    try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification('Test Local Notification', {
            body: 'This is a test notification created locally',
            icon: '/favicon.ico',
            tag: 'test-local'
        });
        console.log('✓ Local notification shown');
        return true;
    } catch (error) {
        console.error('✗ Failed to show local notification:', error);
        return false;
    }
}
