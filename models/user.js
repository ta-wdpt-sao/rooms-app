const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    fullName: String,
    imageUrl: String,
    facebookID: String,
    googleID: String
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
