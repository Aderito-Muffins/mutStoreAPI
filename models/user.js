const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    username: { type: String, required: true, unique: true },
    pass: {type: String, required: true},
    perfilUrl: { type: String, required: true },
    activateStatus: { type: Boolean, default: true },
    posted: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

module.exports = User;