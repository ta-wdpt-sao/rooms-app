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

userSchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'user'
});

// userSchema.set('toObject', { virtuals: true });
// userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
