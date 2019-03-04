require("dotenv").config();
const express = require("express");
const app = express();
const User = require('../models/user');
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");

app.use(session({
    secret: "our-passport-local-strategy-app",
    store: new MongoStore({ url: process.env.MONGODB_URI }),
    resave: true,
    saveUninitialized: true
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) { return done(err); }
        done(null, user);
    });
});

app.use(flash());

passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email'
    },(req, email, password, done) => {
    User.findOne({ email }, (err, user) => {
        if (err) {
        return done(err);
        }
        if (!user) {
        return done(null, false, { message: "Incorrect username" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
    });
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.currentUser = req.user;
    }
  
    next();
});

module.exports = app;
