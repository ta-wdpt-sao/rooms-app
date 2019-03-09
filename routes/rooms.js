const express = require('express');
const router  = express.Router();
const ensureLogin = require("connect-ensure-login");
const Room = require('../models/room');
const uploadCloud = require('../config/cloudinary.js');
const cloudinary = require('cloudinary');

/* GET home page */
router.get('/', (req, res, next) => {
  Room.find({})
    .then(rooms => {
      rooms.forEach(room => {
        if(req.user && room.owner && room.owner.equals(req.user._id)) {
          room.owned = true;
        }

        if(room.imageUrl) {
          room.imageUrl = cloudinary.url(
            room.imagePublicId,
            { gravity: "center", height: 200, width: 300, crop: "fill" }
          );
        }
      });

      res.render('rooms/index', { rooms });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get('/add', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  let room = new Room();
  room._id = null;
  res.render('rooms/form', { room });
});

router.post('/add', ensureLogin.ensureLoggedIn(), uploadCloud.single('imageUrl'), (req, res, next) => {
  const {
    name,
    description,
    address
  } = req.body;

  const imageUrl = req.file.url;
  const imagePublicId = req.file.public_id;

  const location = {
    type: 'Point',
    coordinates: [req.body.longitude, req.body.latitude]
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
      imagePublicId,
      address,
      location,
      owner: req.user._id
    });

    newRoom.save()
    .then(room => {
      res.redirect('/rooms');
    })
    .catch(err => { throw new Error(err)});
  })
  .catch(err => { throw new Error(err)});
});

router.get('/edit/:id', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  const roomId = req.params.id;

  Room.findOne({ _id: roomId })
    .then(room => {
      res.render('rooms/form', { room } );
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.post("/edit", ensureLogin.ensureLoggedIn(), uploadCloud.single('imageUrl'), (req, res, next) => {
  const roomId = req.body._id;

  const {
    name,
    description,
    address
  } = req.body;

  const imageUrl = req.file.url;
  const imagePublicId = req.file.public_id;

  const location = {
    type: 'Point',
    coordinates: [req.body.longitude, req.body.latitude]
  };

  Room.findOneAndUpdate(
    { _id: roomId },
    { $set: {
      name,
      description,
      imageUrl,
      imagePublicId,
      address,
      location
     }
    },
    { returnNewDocument: true } 
  )
    .then(room => {
      console.log(room)
      res.redirect('/rooms');
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get('/delete/:id', ensureLogin.ensureLoggedIn(), (req, res, next) => {
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

router.post('/delete', ensureLogin.ensureLoggedIn(), (req, res, next) => {
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
    .populate('owner')
    .populate({ path: 'reviews', populate: { path: 'user' } })
    .then(room => {
      if(req.user && room.owner && room.owner.equals(req.user._id)) {
        room.owned = true;
      }

      res.render('rooms/detail', { room, msgSuccess: req.flash('success') });
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
