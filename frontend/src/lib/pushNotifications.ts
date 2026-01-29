import axios from 'axios';

/**
 * Converts a URL-safe base64 string to a Uint8Array.
 * @param base64String - The base64 string to convert.
 * @returns - The resulting Uint8Array.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Checks and enables push notifications for the user.
 * @returns - A promise that resolves to true if successful, false otherwise.
 */
export async function enablePush() {
    try {
        // Check if service workers and notifications are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.error('Push notifications are not supported');
            return false;
        }
        // Check current permission status
        if (Notification.permission === 'denied') {
            console.warn('Notification permission denied');
            return false;
        }
        // Verify VAPID key is configured
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
            console.error('VAPID public key not configured');
            return false;
        }
        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return false;
        }
        // Check if already subscribed
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            const applicationServerKey = urlBase64ToUint8Array(vapidKey);
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource
            });
        }
        await axios.post('/api/push/subscribe', sub);
        return true;
    } catch (error) {
        console.error('Error enabling push notifications:', error);
        return false;
    }
}

/**
 * Disables push notifications for the user.
 * @returns - A promise that resolves to true if successful, false otherwise.
 */
export async function disablePush() {
    try {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.error('Push notifications are not supported');
            return false;
        }
        // Get service worker registration
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
            console.warn('No service worker registered');
            return false;
        }
        // Get current subscription
        const sub = await reg.pushManager.getSubscription();
        if (!sub) {
            console.warn('No active subscription found');
            return false;
        }
        // Unsubscribe from push notifications
        await sub.unsubscribe();
        await axios.post('/api/push/unsubscribe', { endpoint: sub.endpoint });
        return true;
    } catch (error) {
        console.error('Error disabling push notifications:', error);
        return false;
    }
}
