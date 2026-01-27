const { subscriptionModel, sendNotification } = require('../models/subscriptionModel');

exports.subscribe = async (req, res) => {
    try {
        console.log('Subscription request received:', {
            userId: req.user.email,
            endpoint: req.body.endpoint
        });
        
        // Check if this endpoint already exists for this user
        const existing = await subscriptionModel.findOne({
            userId: req.user.email,
            endpoint: req.body.endpoint
        });
        
        if (existing) {
            console.log('Subscription already exists, updating...');
            existing.keys = {
                p256dh: req.body.keys.p256dh,
                auth: req.body.keys.auth
            };
            await existing.save();
        } else {
            await subscriptionModel.create({
                endpoint: req.body.endpoint,
                keys: {
                    p256dh: req.body.keys.p256dh,
                    auth: req.body.keys.auth
                },
                userId: req.user.email
            });
        }
        
        console.log('Subscription saved successfully for user:', req.user.email);
        res.sendStatus(201);
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Failed to save subscription' });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        console.log('Unsubscribe request for user:', req.user.email);
        const result = await subscriptionModel.deleteMany({ userId: req.user.email });
        console.log('Deleted subscriptions:', result.deletedCount);
        res.json({ message: 'Unsubscribed successfully', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ message: 'Failed to unsubscribe' });
    }
};

exports.testNotification = async (req, res) => {
    try {
        console.log('Test notification requested by:', req.user.email);
        
        await sendNotification(req.user.email, {
            title: 'Test Notification',
            body: 'This is a test push notification!'
        });
        
        res.json({ message: 'Test notification sent' });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ message: 'Failed to send test notification', error: error.message });
    }
};