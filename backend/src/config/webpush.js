const webpush = require('web-push');

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('ERROR: VAPID keys not configured! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
}

webpush.setVapidDetails(
    'mailto:noreply@easy-notes-j8m3.onrender.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;
