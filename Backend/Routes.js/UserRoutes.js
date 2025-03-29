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
        let { email, password } = req.body;
        const existinguser = await User.findOne({ email }) // check if existing user is present
        if (existinguser) return res.status(400).json({ Error: "User Already Existing" })

        // creating a new user
        const newUser = new User({ email, password });
        let ans = await newUser.save();
        const payload = {
            id: ans.id
        }
        const token = generateToken(payload);
        res.status(201).json({
            response: "Profile Created Succesfully",
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/Login', cors(), async (req, res) => {
    try {
        let { email, password } = req.body;
        const user = await User.findOne({ email: email })
        if (!user) return res.status(501).json({ error: "User Doesn't Exist" })
        if (!user || !(await user.comparePass(password))) return res.status(401).send("Bad Credentials , Try Again !")
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        res.status(201).json({ Email: `Logged In Succesfully Your Email is ${email}`, message: `your token is ${token}` })
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

// router.post('/Logout', jwtAuth, async (req, res) => {  
// })


module.exports = router;