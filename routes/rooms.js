const express = require('express');
const router  = express.Router();
const Room = require('../models/room');
const Review = require('../models/review');

/* GET home page */
router.get('/', (req, res, next) => {
  Room.find({})
    .then(rooms => {
      res.render('rooms/index', { rooms });
    })
    .catch(error => {
      throw new Error(error);
    });
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
    imageUrl,
    address
  } = req.body;

  const location = {
    type: 'Point',
    coordinates: [req.body.longitude, req.body.latitude]
    // coordinates: [-46.6623271, -23.5617326]
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
      address,
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

router.get('/edit/:id', (req, res, next) => {
  const roomId = req.params.id;

  Room.findOne({ _id: roomId })
    .then(room => {
      res.render('rooms/form', { room } );
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.post("/edit", (req, res, next) => {
  const roomId = req.body._id;

  const {
    name,
    description,
    imageUrl,
    address
  } = req.body;

  const location = {
    type: 'Point',
    coordinates: [req.body.longitude, req.body.latitude]
  };

  Room.update(
    { _id: roomId },
    { $set: {
      name,
      description,
      imageUrl,
      address,
      location
     }
    },
    { new: true } 
  )
    .then(room => {
      res.redirect('/rooms');
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get('/delete/:id', (req, res, next) => {
  let roomId = req.params.id;

  if (!/^[0-9a-fA-F]{24}$/.test(roomId)) return res.status(404).send('not-found');

  Room.findOne({ _id: roomId })
    .then(room => {
      res.render('rooms/delete', { room });
    })
    .catch(error => {
      console.log(error);
    });
});

router.post('/delete', (req, res, next) => {
  let roomId = req.body._id;

  if (!/^[0-9a-fA-F]{24}$/.test(roomId)) return res.status(404).send('not-found');

  Room.deleteOne({ _id: roomId })
    .then(room => {
      res.render("rooms/delete", { message: `room ${room.name} deleted!` });    
    })
    .catch(err => {
      throw new Error(err);
    });
});

router.get('/:id', (req, res, next) => {
  let roomId = req.params.id;

  if (!/^[0-9a-fA-F]{24}$/.test(roomId)) return res.status(404).send('not-found');

  Room.findOne({ _id: roomId })
    .populate('reviews')
    .then(room => {
      res.render('rooms/detail', { room });
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
