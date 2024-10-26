const mongoose = require("mongoose")

const User = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    level: Number,
    xp: Number,
    interests: Array
})

module.exports = User

