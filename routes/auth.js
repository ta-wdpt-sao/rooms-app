const express = require("express");
const router = express.Router();
const User = require('../models/user');
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");

router.get("/login", (req, res, next) => {
    let user = new User();
    user._id = null;
    res.render("auth/login", { user });
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
}));

router.post("/signup", (req, res, next) => {
    const {
      email,
      password,
      fullName,
      imageUrl
    } = req.body;

    if (username == '' || password == '') {
      res.render('auth/login', {
        msgError: `username and password can't be empty`
      });
      return;
    }

    User.findOne({ "email": email })
    .then(user => {
      if (user !== null) {
        res.render("auth/login", {
          msgError: "The email already exists!"
        });
        return;
      }
  
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
  
      const newUser = new User({
        email,
        password: hashPass,
        fullName,
        description,
        imageUrl
      });
  
      newUser.save()
      .then(user => {
        res.redirect("/");
      })
      .catch(err => { throw new Error(err)});
    })
    .catch(err => { throw new Error(err)});
  
});

module.exports = router;
