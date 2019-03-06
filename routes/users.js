const express = require("express");
const router = express.Router();
const User = require('../models/user');
const Room = require('../models/room');
const cloudinary = require('cloudinary');

router.get("/", (req, res, next) => {
  User.find()
    .then(users => {
      users.forEach(user => {
        if(req.user && user.owner && user.owner.equals(req.user._id)) {
          user.owned = true;
        }

        if(user.imageUrl) {
          user.imageUrl = cloudinary.url(
            user.imagePublicId,
            { gravity: "center", height: 100, width: 100, crop: "fill" }
          );
        }
      });

      res.render("users/index", { users });
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.get("/:id", (req, res, next) => {
  let userId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) return res.status(404).send('not-found');
  User.findOne({ _id: userId })
    .then(user => {
      Room.find({ owner: user._id })
      .then(rooms => {
        res.render("users/details", { user, rooms });
      })
      .catch(error => {
        throw new Error(error);
      });
    })
    .catch(error => {
      throw new Error(error);
    });
});

module.exports = router;
