const webpush = require('web-push');

console.log('Configuring VAPID keys...');
console.log('VAPID_PUBLIC_KEY present:', !!process.env.VAPID_PUBLIC_KEY);
console.log('VAPID_PRIVATE_KEY present:', !!process.env.VAPID_PRIVATE_KEY);

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('ERROR: VAPID keys not configured! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
}

webpush.setVapidDetails(
    'mailto:dev@localhost',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;
