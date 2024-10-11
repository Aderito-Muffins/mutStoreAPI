const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required : true, unique: true},
    username: { type: String, required: true, unique: true },
    password: {type: String, required: true},
    mobileNumber: { type: String, required: true },
    userStatus: { type: Boolean, default: true },
    posted: { type: Date, default: Date.now },
    resetCode: {type: Number },
    resetCodeExpiry: {type: Date  }

})

const User = mongoose.model('User', userSchema)

module.exports = User;