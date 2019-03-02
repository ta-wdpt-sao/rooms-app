const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const roomSchema = new Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    address: { type: String },
    location: { type: { type: String}, coordinates: [Number] },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    rating: { type: Number }
}, {
    timestamps: true
});

roomSchema.index({location: '2dsphere'});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
