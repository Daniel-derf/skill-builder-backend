const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    interests: { type: Map, of: [String] }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
