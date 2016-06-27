var express = require('express');
var router = express.Router();
var User = require('../models/users');
var session = require('client-sessions');

/* GET users listing. */
router.get('/', function(req, res, callback) {
  console.log(req.body);
  User.find({}, function(err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log('done');

      res.json({
        data: user
      })
    }
  })
});

router.post('/register', function(req, res) {
  console.log(req.body);
  var user = new User(
      {
        username: req.body.name,
        email: req.body.email,
        password: req.body.password,
      }
  );
  user.save(function (err, user) {
    var params={
      status: false
    }
    if (err) {
      console.log(err);
    } else {
      params.status = true;
      console.log('done');
    }

    res.render('register', params);

  });
});

router.post('/login', function(req, res) {
  console.log(req.body);
  User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        res.redirect('/');
        console.log('Incorrect email');
      } else {
        if (req.body.password === user.password) {
          // sets a cookie with the user's info
          req.session.user = user;
          res.redirect('/');
        } else {
          console.log('Incorrect password', req.body.passsword);
        }
      }
    });
});


router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});


router.delete('/:id', function(req, res) {
  console.log(req.body);
  console.log(req.params);
  User.remove(
      {_id: req.params.id}, function(err, user) {
        if (err) {
          console.log(err);
        } else {
          console.log('Deleted the entry from the database!');

          res.json({
            success: true
          })
        }
      })
});

module.exports = router;
