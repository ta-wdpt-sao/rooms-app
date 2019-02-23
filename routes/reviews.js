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
        .then(room => {
            if (room == null) {
                res.redirect('/rooms');
            } else {
                const newReview = new Review({
                    rating,
                    comment
                });

                newReview.save()
                    .then(review => {
                        Room.update({ _id: roomId }, { $push: { reviews: review._id }})
                            .then(book => {
                                res.redirect(`/rooms/${roomId}`)
                            })
                            .catch((error) => {
                                throw new Error(err);
                            });
                    })
                    .catch(err => { throw new Error(err)});
            }
        })
        .catch(err => { throw new Error(err) });
});

module.exports = router;
