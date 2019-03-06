const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    fullName: String,
    imageUrl: String,
    imagePublicId: String,
    token: String,
    status: { type: String, enum: ['active', 'pending'], default: 'pending' },
    facebookID: String,
    googleID: String
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
