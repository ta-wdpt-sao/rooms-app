const express = require('express');
const router  = express.Router();
const Room = require('../models/room');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

/* GET home page */
router.get('/', (req, res, next) => {
  Room.find({})
    .then(rooms => {
      rooms.forEach(room => {
        if(room.imageUrl) {
          room.imageUrl = cloudinary.url(
            room.imagePublicId,
            { gravity: "center", height: 200, width: 300, crop: "crop" }
          );
        }
      });

      res.render('index', { rooms });
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
