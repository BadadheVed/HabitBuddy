const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
mongoose.connect('mongodb://127.0.0.1:27017/HabitBuddy').then(() => {
    console.log("Connection Established");
}).catch(err => console.log("Error is", err.message))

const ActiSchema = new mongoose.Schema({
    name: { type: String, required: true },
    frequency: {
        type: [String],
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        required: true
    },
    wantReminders: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    lastCompletedDate: {
        type: Date,
        default: null,
    },

}, { timestamps: true });
const userSchema = new mongoose.Schema({
    name: { type: String, sparse: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
    },
    password: { type: String, required: true },
    activities: { type: [ActiSchema] }

}, { timestamps: true })

userSchema.pre('save', async function (next) {
    const user = this
    if (!user.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10)
        const newPass = await bcrypt.hash(user.password, salt)
        user.password = newPass
        next()
    } catch (err) {
        return next(err)
    }
})
userSchema.methods.comparePass = async function (userpassword) {
    if (!userpassword) {
        throw new Error("Password is required for comparison"); // Added input validation
    }
    try {
        const isMatch = await bcrypt.compare(userpassword, this.password)
        return isMatch
    } catch (error) {
        throw error
    }
}
const User = mongoose.model('User', userSchema);
module.exports = User;
