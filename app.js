require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const http = require('http');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require("express-session");
const passportConfig = require('./config/passport.js');
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

// passport and session config
app.use(passportConfig);

// default value for title local
app.locals.title = 'Jazz Rooms - Because a room without jazz is not a room';

// routes
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
