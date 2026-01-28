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
        const subs = await subscriptionModel.find({ userId: userId });    
        if (subs.length === 0) {
            return;
        }
        const promises = subs.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };
            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
            } catch (err) {
                console.error('✗ Error sending notification to', sub.endpoint);
                console.error('Error details:', {
                    message: err.message,
                    statusCode: err.statusCode,
                    body: err.body
                });   
                if (err.statusCode === 410) {
                    await subscriptionModel.deleteOne({ _id: sub._id });
                }
            }
        });
        await Promise.all(promises);
    } catch (error) {
        console.error('Error in sendNotification:', error);
    }
};

module.exports = { subscriptionModel, sendNotification };