const express = require('express');
const router  = express.Router();
const Room = require('../models/room');

/* GET home page */
router.get('/', (req, res, next) => {
  Room.find({})
    .then(rooms => {
      res.render('index', { rooms });
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
