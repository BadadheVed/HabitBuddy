const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    activityName: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;
