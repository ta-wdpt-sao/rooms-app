const express = require('express');
const router  = express.Router();
const Room = require('../models/room');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('rooms/index');
});

router.get('/add', (req, res, next) => {
  let room = new Room();
  room._id = null;
  res.render('rooms/form', { room });
});

router.post('/add', (req, res, next) => {
  const {
    name,
    description,
    imageUrl
  } = req.body;

  const location = {
    type: 'Point',
    // coordinates: [req.body.longitude, req.body.latitude]
    coordinates: [-46.6623271, -23.5617326]
  };

  if (name == '') {
    res.render('room-add', {
      msgError: `name can't be empty`
    })
    return;
  }

  Room.findOne({ 'name': name })
  .then(room => {
    if (room !== null) {
      res.render('room-form', {
        msgError: 'A room with that name already exists!'
      });
      return;
    }

    const newRoom = new Room({
      name,
      description,
      imageUrl,
      location
    });

    newRoom.save()
    .then(room => {
      res.redirect('/rooms');
    })
    .catch(err => { throw new Error(err)});
  })
  .catch(err => { throw new Error(err)});
});

module.exports = router;
