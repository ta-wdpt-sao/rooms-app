const express = require("express");
const router = express.Router();
const User = require('../models/user');
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");

router.get("/login", (req, res, next) => {
    let user = new User();
    user._id = null;
    res.render("auth/login", { user, errorMessage: req.flash('error') });
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
}));

router.post("/signup", (req, res, next) => {
    const {
        fullName,
        imageUrl,
        email,
        password
    } = req.body;

    if (email == '' || password == '') {
      req.flash('error', 'E-mail and password can\'t be empty!')
      res.redirect('/login');
      return;
    }

    User.findOne({ "email": email })
    .then(user => {
      if (user !== null) {
        req.flash('error', 'The email already exists!')
        res.redirect('/login');
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        fullName,
        imageUrl,
        email,
        password: hashPass
      });
  
      newUser.save()
      .then(user => {
        res.redirect("/");
      })
      .catch(err => { throw new Error(err)});
    })
    .catch(err => { throw new Error(err)});
});

router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
