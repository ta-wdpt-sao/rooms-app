const express = require('express');
const router  = express.Router();
const Room = require('../models/room');
const Review = require('../models/review');

router.post('/add', (req, res, next) => {
    const {
        roomId,
        rating,
        comment
    } = req.body;

    if (comment == '') {
        res.redirect(`/rooms/${roomId}`)
        return;
    }

    Room.findOne({ _id: roomId })
        .populate('reviews')
        .then(room => {
            if (room == null) {
                res.redirect('/rooms');
            } else {
                const newReview = new Review({
                    user: req.user._id,
                    rating,
                    comment
                });

                newReview.save()
                    .then(review => {                        
                        let ratingTotal = room.reviews.reduce((acc, item) => {
                            return acc + Number(item.rating);
                        }, Number(rating));

                        let ratingAvg = Math.floor(ratingTotal / (room.reviews.length + 1));

                        Room.update({ _id: roomId }, { rating: ratingAvg, $push: { reviews: review._id }})
                            .then(room => {
                                req.flash('success', 'Review sent successfully');
                                res.redirect(`/rooms/${roomId}`)
                            })
                            .catch((err) => {
                                throw new Error(err);
                            });
                    })
                    .catch(err => { throw new Error(err)});
            }
        })
        .catch(err => { throw new Error(err) });
});

module.exports = router;
