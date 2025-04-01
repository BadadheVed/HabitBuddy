const express = require('express')
const bcrypt = require('bcrypt')
const { jwtAuth, generateToken } = require('./jwt')
const router = express.Router();
const User = require('../Models/User')
const cors = require('cors')
router.use(express.json())
router.get('/all', async (req, res) => {
    let user = await User.find();
    let users = [];

    res.send(user)
});
router.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));
router.post('/Signup', cors(), async (req, res) => {
    try {
        let { name, email, password } = req.body;

        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).json({ Error: "User Already Exists" });

        // Hash password before saving
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

router.post('/Login', cors(), async (req, res) => {
    try {
        let { email, password } = req.body;
        const user = await User.findOne({ email: email })
        if (!user) return res.status(501).json({ error: "User Doesn't Exist" })
        if (!user) return res.status(401).send("User Not Found")
        const isMatch = await user.comparePass(password);
        if (!isMatch) return res.status(401).send("Bad Credentials, Try Again!");
        const payload = {
            id: user.id,
            name: user.name
        }
        const token = generateToken(payload);

        res.status(201).json({
            email: email,       // lowercase key for consistency
            token: token,
            message: "Logged In Successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

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

        // Destructure 'data' from the request body
        const { name, frequency, wantReminders } = req.body;

        if (!name || !frequency || !Array.isArray(frequency)) {
            return res.status(400).json({ message: 'Name and frequency are required and frequency should be an array' });
        }

        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const isValidFrequency = frequency.every(day => validDays.includes(day));
        if (!isValidFrequency) {
            return res.status(400).json({ message: 'Invalid frequency days, please use valid weekdays (Mon, Tue, etc.)' });
        }

        // Check if the activity already exists
        const existingActivity = user.activities.find(activity => activity.name === name && activity.frequency.every(day => frequency.includes(day)));
        if (existingActivity) {
            return res.status(400).json({ message: 'Activity already exists with the same name and frequency' });
        }

        // Create the new activity object, including the 'wantReminders' field
        const newActivity = {
            name: name,
            frequency: frequency,
            wantReminders: wantReminders || false, // Default to false if not provided
            completed: false,
            completedAt: null
        };

        // Push the new activity to the user's activities array
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

// router.post('/Logout', jwtAuth, async (req, res) => {  
// })


module.exports = router;