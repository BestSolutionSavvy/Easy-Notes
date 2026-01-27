const mongoose = require("mongoose");
const webpush = require('../config/webpush');

const subscriptionSchema = new mongoose.Schema({
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String
    },
    userId: {
        type: String,
        ref: "User",
        required: true,
    }
});

const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);

const sendNotification = async (userId, payload) => {
    try {
        console.log('=== sendNotification called ===');
        console.log('userId:', userId);
        console.log('payload:', payload);
        
        const subs = await subscriptionModel.find({ userId: userId });
        console.log('Found subscriptions:', subs.length);
        
        if (subs.length === 0) {
            console.log(`No subscriptions found for user ${userId}`);
            return;
        }

        console.log('Subscription details:', subs.map(s => ({
            endpoint: s.endpoint,
            userId: s.userId
        })));

        const promises = subs.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };
            console.log('Sending to endpoint:', sub.endpoint);
            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
                console.log('✓ Notification sent successfully to', sub.endpoint);
            } catch (err) {
                console.error('✗ Error sending notification to', sub.endpoint);
                console.error('Error details:', {
                    message: err.message,
                    statusCode: err.statusCode,
                    body: err.body
                });
                
                // If subscription is expired (410), remove it from database
                if (err.statusCode === 410) {
                    console.log('Removing expired subscription from database:', sub._id);
                    await subscriptionModel.deleteOne({ _id: sub._id });
                }
            }
        });

        await Promise.all(promises);
        console.log(`=== Completed sending to ${subs.length} subscription(s) ===`);
    } catch (error) {
        console.error('Error in sendNotification:', error);
    }
};

module.exports = { subscriptionModel, sendNotification };