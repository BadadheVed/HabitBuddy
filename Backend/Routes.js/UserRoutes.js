const express = require('express')
const bcrypt = require('bcrypt')
const { jwtAuth, generateToken } = require('./jwt')
const router = express.Router();
const User = require('../Models/User')
const Challenge = require('../Models/Challenges')
const socketIO = require('socket.io')


router.use(express.json())

router.get('/all', async (req, res) => {
    let user = await User.find();
    let users = [];

    res.send(user)
});


router.post('/Signup', async (req, res) => {
    try {
        let { name, email, password } = req.body;

        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).json({ message: "User already exists ! Please Login" });


        // const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password });

        let ans = await newUser.save();
        const payload = {
            id: ans.id,
            name: ans.name
        };
        const token = generateToken(payload);

        res.status(201).json({
            response: "Profile Created Successfully",
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/Login', async (req, res) => {
    try {
        let { email, password } = req.body;
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isMatch = await user.comparePass(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        const payload = {
            id: user.id,
            name: user.name
        }
        const token = generateToken(payload);

        return res.status(201).json({
            email: email,       // lowercase key for consistency
            token: token,
            message: "Logged In Successfully"
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }

})
router.post('/resetPassword', async (req, res) => {
    try {
        const { email, newPassword } = req.body;


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const isSamePassword = await user.comparePass(newPassword);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/Dashboard', jwtAuth, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid)
        res.status(200).json({ data: `Your Email Is ${user.email}` })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
router.post('/addActivity', jwtAuth, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const { name, frequency, wantReminders } = req.body;

        if (!name || !frequency || !Array.isArray(frequency)) {
            return res.status(400).json({ message: 'Name and frequency are required and frequency should be an array' });
        }

        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const isValidFrequency = frequency.every(day => validDays.includes(day));
        if (!isValidFrequency) {
            return res.status(400).json({ message: 'Invalid frequency days, please use valid weekdays (Mon, Tue, etc.)' });
        }


        const existingActivity = user.activities.find(activity => activity.name === name && activity.frequency.every(day => frequency.includes(day)));
        if (existingActivity) {
            return res.status(400).json({ message: 'Activity already exists with the same name and frequency' });
        }


        const newActivity = {
            name: name,
            frequency: frequency,
            wantReminders: wantReminders || false, // Default to false if not provided
            completed: false,
            completedAt: null
        };


        user.activities.push(newActivity);
        await user.save();

        res.status(201).json({ message: 'Activity added successfully', activity: newActivity });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
router.get('/activities', jwtAuth, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).send(user.activities)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "An error occurred while fetching activities" });

    }
})

router.put('/activities/:id', jwtAuth, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const activity = user.activities.id(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });


        activity.completed = req.body.completed;
        activity.lastCompletedDate = req.body.lastCompletedDate;
        await user.save();

        res.status(200).json({ message: 'Activity updated successfully', activity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
router.post('/AddFriend', jwtAuth, async (req, res) => {
    try {
        const senderId = req.user.id;
        const { userId, userName } = req.body;

        if (!userId || !userName) {
            return res.status(400).json({ message: "User ID and Name are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() === senderId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        if (user.friendRequests.some(req => req.sender.toString() === senderId)) {
            return res.status(400).json({ message: "Friend request already sent" });
        }


        user.friendRequests.push({ sender: senderId, status: "pending" });
        await user.save();

        res.status(200).json({ message: `Friend request sent to ${userName}`, user });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/getUsers', jwtAuth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        let users;

        // Check if query is a valid MongoDB ObjectId
        if (query.match(/^[0-9a-fA-F]{24}$/)) {

            users = await User.find({ _id: query }).select('name email _id');
        } else {

            users = await User.find({
                name: { $regex: query, $options: 'i' }
            }).select('name email _id');
        }

        // Remove the current user from results
        const filteredUsers = users.filter(user => user._id.toString() !== req.user.id);

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.get('/getRequest', jwtAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate("friendRequests.sender", "name _id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const pendingRequests = user.friendRequests.filter(req => req.status === 'pending');

        const friendRequests = pendingRequests.map((request) => ({
            senderId: request.sender._id,
            senderName: request.sender.name,
            status: request.status,
        }));
        res.status(200).json({ friendRequests });
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Server error" });
    }
})
router.post('/acceptFriendRequest', jwtAuth, async (req, res) => {
    try {
        const receiverId = req.user.id;
        const { senderId } = req.body;

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove friend request
        receiver.friendRequests = receiver.friendRequests.filter(
            request => request.sender.toString() !== senderId
        );

        // Add to friends list for both users
        if (!receiver.friends.includes(senderId)) {
            receiver.friends.push(senderId);
        }
        if (!sender.friends.includes(receiverId)) {
            sender.friends.push(receiverId);
        }

        await Promise.all([receiver.save(), sender.save()]);

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post('/rejectFriendRequest', jwtAuth, async (req, res) => {
    try {
        const receiverId = req.user.id;
        const { senderId } = req.body;

        if (!senderId) {
            return res.status(400).json({ message: "Sender ID is required" });
        }

        const receiver = await User.findById(receiverId).populate("friendRequests.sender");
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }


        receiver.friendRequests = receiver.friendRequests.filter(
            request => request.sender && request.sender._id.toString() !== senderId
        );

        await receiver.save();

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.get('/getFriends', jwtAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('friends', 'name _id');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const friends = user.friends.map(friend => ({
            _id: friend._id,
            name: friend.name
        }));

        res.status(200).json({ friends });
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post('/removeFriend', jwtAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;

        const [user, friend] = await Promise.all([
            User.findById(userId),
            User.findById(friendId)
        ]);

        if (!user || !friend) {
            return res.status(404).json({ message: "User or friend not found" });
        }

        // Remove friend from both users' friend lists
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await Promise.all([user.save(), friend.save()]);

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.to(friendId).emit('friendRemoved', {
            friendId: userId,
            friendName: user.name
        });

        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        console.error("Error removing friend:", error);
        res.status(500).json({ message: "Server error" });
    }
})
router.post('/sendChallenge', jwtAuth, async (req, res) => {
    try {
        const senderId = req.user.id;
        const { activityId, friendIds } = req.body;

        // Find the sender user document
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" });
        }

        // Find the activity in the sender's embedded activities array
        const activity = sender.activities.id(activityId);  // This will search by the activity's _id
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        // Create challenges for each friend
        const challenges = await Promise.all(
            friendIds.map(async (friendId) => {
                const challenge = new Challenge({
                    activityId,
                    activityName: activity.name,
                    senderId,
                    senderName: sender.name,
                    receiverId: friendId,
                    status: 'pending',
                    createdAt: new Date()
                });

                try {
                    await challenge.save();
                } catch (saveError) {
                    console.error("Error saving challenge:", saveError);
                    throw new Error("Error saving challenge");
                }

                // Emit socket event to the receiver
                const io = req.app.get('io');
                io.to(friendId).emit('challengeReceived', {
                    challengeId: challenge._id,
                    senderName: sender.name,
                    activityName: activity.name
                });

                return challenge;
            })
        );

        res.status(200).json({ message: "Challenges sent successfully", challenges });
    } catch (error) {
        console.error("Error sending challenges:", error);
        res.status(500).json({ message: "Server error", error: error.message, stack: error.stack });
    }
});
router.get('/getChallenges', jwtAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch pending challenges for the user as a receiver
        const challenges = await Challenge.find({
            receiverId: userId,
            status: 'pending'
        }).sort('-createdAt');

        // Populate senderId, but no need to populate 'activityId' since it's embedded in the user
        const challengesWithUserData = await Promise.all(
            challenges.map(async (challenge) => {
                // Find the sender user data
                const sender = await User.findById(challenge.senderId);

                // Add activity data directly from the embedded activities
                const activity = sender.activities.find(act => act._id.toString() === challenge.activityId.toString());

                return {
                    ...challenge.toObject(),
                    sender: sender.name, // or any other sender details you need
                    activity: activity // Return the activity embedded within the sender
                };
            })
        );

        res.status(200).json({ challenges: challengesWithUserData });
    } catch (error) {
        console.error("Error fetching challenges:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post('/acceptChallenge', jwtAuth, async (req, res) => {
    try {
        const { challengeId } = req.body;
        const userId = req.user.id;


        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }


        if (challenge.receiverId.toString() !== userId) {
            return res.status(403).json({ message: "This challenge is not for you" });
        }


        challenge.status = 'accepted';
        await challenge.save();


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }



        const activity = user.activities.find(activity => activity._id.toString() === challenge.activityId.toString());
        if (activity) {
            activity.completed = true;
            activity.completedAt = new Date();
            await user.save();
        }

        res.status(200).json({ message: "Challenge accepted" });
    } catch (error) {
        console.error("Error accepting challenge:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.post('/rejectChallenge', jwtAuth, async (req, res) => {
    try {
        const { challengeId } = req.body;
        const userId = req.user.id;


        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }


        if (challenge.receiverId.toString() !== userId) {
            return res.status(403).json({ message: "This challenge is not for you" });
        }


        challenge.status = 'rejected';
        await challenge.save();

        res.status(200).json({ message: "Challenge rejected" });
    } catch (error) {
        console.error("Error rejecting challenge:", error);
        res.status(500).json({ message: "Server error" });
    }
});



router.get('/activityHeatmap', jwtAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const activities = user.activities || [];


        const activityCountsByDate = {};


        activities.forEach(activity => {

            if (activity.completedAt) {
                const completedDate = new Date(activity.completedAt);


                if (completedDate.getFullYear() === year) {
                    const dateStr = completedDate.toISOString().split('T')[0];
                    activityCountsByDate[dateStr] = (activityCountsByDate[dateStr] || 0) + 1;
                }
            }


            if (activity.lastCompletedDate) {
                const lastCompletedDate = new Date(activity.lastCompletedDate);


                if (lastCompletedDate.getFullYear() === year) {
                    const dateStr = lastCompletedDate.toISOString().split('T')[0];
                    activityCountsByDate[dateStr] = (activityCountsByDate[dateStr] || 0) + 1;
                }
            }
        });


        const formattedActivities = Object.entries(activityCountsByDate).map(([date, count]) => ({
            date,
            count
        }));

        res.status(200).json({ activities: formattedActivities });
    } catch (error) {
        console.error("Error fetching activity heatmap:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;