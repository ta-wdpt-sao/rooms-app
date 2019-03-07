const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const User = require('../models/user');
const Room = require('../models/room');
const Review = require('../models/review');
const uploadCloud = require('../config/cloudinary.js');
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

router.get('/edit', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then(user => {
      res.render('users/form', { user } );
    })
    .catch(error => {
      throw new Error(error);
    });
});

router.post("/edit", ensureLogin.ensureLoggedIn(), uploadCloud.single('imageUrl'), (req, res, next) => {
  const userId = req.user._id;

  const {
    fullName
  } = req.body;

  const imageUrl = req.file.url;
  const imagePublicId = req.file.public_id;

  User.update(
    { _id: userId },
    { $set: {
      fullName,
      imageUrl,
      imagePublicId
     }
    },
    { new: true } 
  )
    .then(user => {
      res.redirect(`/users/${userId}`);
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
      if(req.user && user._id.equals(req.user._id)) {
        user.owned = true;
      }

      Room.find({ owner: user._id })
      .then(rooms => {
        Review.find({ user: user._id })
        .populate('user')
        .then(reviews => {
          res.render("users/details", { user, rooms, reviews });
        })
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
