const express = require('express');
const router = express.Router();
const { jwtAuth, generteToken } = require('./jwt')
router.use(express.json())
const { User } = require('../Models/User')

const shell = require('shelljs')
const cron = require('node-cron')

router.get('/getNoti', jwtAuth, async (req, res) => {
    try {
        console.log('getNoti endpoint called with user ID:', req.user?.id);
        const userId = req.user.id;

        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: "Authorization failed" });
        }

        const user = await User.findById(userId);
        console.log('User found:', !!user);

        if (!user) {
            return res.status(404).json({ message: "Your Session is Over! Please Login Again To Continue" });
        }

        const notifications = user.activities.filter(act => {
            return act.notificationSent?.sent === true && !act.completed;
        });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

cron.schedule("*/30 * * * *", async () => {
    try {
        const users = await User.find({});
        for (const user of users) {
            let updated = false
            user.activities.forEach((activity) => {
                if (!activity.completed) {
                    const activityTime = new Date(activity.createdAt);
                    const now = new Date();
                    const hoursPassed = (now - activityTime) / (1000 * 60 * 60);
                    if (
                        hoursPassed >= 3 &&
                        (!activity.notificationSent || !activity.notificationSent.sent)
                    ) {
                        activity.notificationSent = {
                            sent: true,
                            date: now
                        };
                        updated = true;
                    }
                }

            })
            if (updated) {
                await user.save();
            }
        }
        console.log('⏰ Notification check done');
    } catch (error) {
        console.error('❌ Cron job error:', error);
    }
})
module.exports = router;
