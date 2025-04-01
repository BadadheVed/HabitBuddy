const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
mongoose.connect('mongodb://127.0.0.1:27017/HabitBuddy').then(() => {
    console.log("Connection Established");
}).catch(err => console.log("Error is", err.message))
const userSchema = new mongoose.Schema({
    name: { type: String, sparse: true, trim: true },
    email: { type: String, required: true, unique: true }, // this can be email or  
    password: { type: String, required: true }

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
