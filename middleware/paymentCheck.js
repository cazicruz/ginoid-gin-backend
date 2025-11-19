const User = require('../models/User');

/**
 * middleware/paymentCheck.js
 *
 * Checks that the current user has a subscription with a non-zero amount
 * and that the subscription date is not older than 30 days.
 *
 * Expects either:
 *  - req.user to be populated (e.g. by auth middleware), or
 *  - req.userId / req.params.userId to contain the user id.
 *
 * Adjust the User model import path as needed for your project structure.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_LIMIT = 30;

// Update the path to your User model if necessary

module.exports = async function paymentCheck(req, res, next) {
    try {
        // Resolve user object or load from DB
        let user = req.user;
        if (!user) {
            const userId = req.userId ;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            user = await User.findById(userId).lean();
            if (!user) return res.status(404).json({ error: 'User not found' });
        }

        const subscription = (user.subscription || {});
        const amount = Number(subscription.amount || 0);
        const dateSubscribed = subscription.dateSubscribed;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(402).json({ error: 'Invalid subscription amount' });
        }

        if (!dateSubscribed) {
            return res.status(402).json({ error: 'Subscription date missing' });
        }

        const subscribedAt = new Date(dateSubscribed);
        if (isNaN(subscribedAt.getTime())) {
            return res.status(400).json({ error: 'Invalid subscription date format' });
        }

        const ageDays = (Date.now() - subscribedAt.getTime()) / MS_PER_DAY;
        if (ageDays > DAYS_LIMIT) {
            return res.status(402).json({ error: `Subscription expired (older than ${DAYS_LIMIT} days)` });
        }

        // all good
        return next();
    } catch (err) {
        return next(err);
    }
};