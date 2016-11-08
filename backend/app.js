// The entry point of the entire back-end. Routing requests are all passed through here first
// to determine which routes they will go

// Require function is provided by Node.js, loads modules and gives you access to their exports.
// Module is a reusable collection for use, similar to a library
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var api = require('./routes/api');
var users = require('./routes/users');
var messages = require('./routes/messages');
var socketio = require('./socketio');
var cors = require('cors');
var User = require('./models/users');

// Create an instance of the express class to get access to express functionalities
var app = express();

// Using mongoose
var mongoose = require('mongoose');
var mongoURL = 'mongodb://localhost/lazyapp';
mongoose.connect(mongoURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Successfully connected to mongo at:', mongoURL);
});

var session = require('client-sessions');
// var socket = require('localhost:8080/socketio.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(bodyParser.raw({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(cors());

// Use a user session
app.use(session({
  cookieName: 'session', // cookie name dictates the key name added to the request object
  secret: 'asdjklf;a;jra;lkjr', // should be a large unguessable string
  duration: 30 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 5 * 60 * 1000, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));

// Set the request's user if it exists i.e. somebody is logged in
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ email: req.session.user.email }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

// Route and match URL requests to their specific files that will handle related requests
app.use('/', routes);
// app.use('/about', routes);
app.use('/api', api);
app.use('/users', users);
app.use('/messages', messages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
