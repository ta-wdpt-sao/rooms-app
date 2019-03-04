require('dotenv').config();

const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const ensureLogin = require("connect-ensure-login");
const express = require('express');
const favicon = require('serve-favicon');
const flash = require("connect-flash");
const hbs = require('hbs');
const http = require('http');
const LocalStrategy = require("passport-local").Strategy;
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const passport = require("passport");
const path = require('path');
const nodesassmiddleware = require('node-sass-middleware');

mongoose
    .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
    .then(x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
    })
    .catch(err => {
        console.error('Error connecting to mongo', err)
    });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup
app.use(nodesassmiddleware({
    src:  path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
}));

hbs.registerPartials(__dirname + '/views/partials');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// passport local config
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

// default value for title local
app.locals.title = 'Jazz Rooms - Because a room without jazz is not a room';

// routes
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.currentUser = req.user;
  }

  next();
});

const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/', auth);

const rooms = require('./routes/rooms');
app.use('/rooms', rooms);

const reviews = require('./routes/reviews');
app.use('/reviews', reviews);

const users = require('./routes/users');
app.use('/users', users);

// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
    res.status(404);
    res.render('errors/not-found');
});

app.use((err, req, res, next) => {
    // always log the error
    console.error('ERROR', req.method, req.path, err);

    // only render if the error ocurred before sending the response
    if (!res.headersSent) {
        res.status(500);
        res.render('errors/error');
    }
});  

let server = http.createServer(app);

server.on('error', error => {
  if (error.syscall !== 'listen') { throw error }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${process.env.PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${process.env.PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}`);
});
