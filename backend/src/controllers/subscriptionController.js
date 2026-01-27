const { subscriptionModel } = require('../models/subscriptionModel');

exports.subscribe = async (req, res) => {
    try {
        const existing = await subscriptionModel.findOne({
            userId: req.user.email,
            endpoint: req.body.endpoint
        });  
        if (existing) {
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
        res.sendStatus(201);
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ message: 'Failed to save subscription' });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const result = await subscriptionModel.deleteMany({ userId: req.user.email });
        res.json({ message: 'Unsubscribed successfully', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ message: 'Failed to unsubscribe' });
    }
};
