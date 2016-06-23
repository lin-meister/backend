var express = require('express');
var router = express.Router();
var User = require('../models/users');

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
  User.find({email: req.body.email}, function(err, user) {
    var params={
      status: false
    }
    if (err) {
      console.log(err);
    } else {
        if (user[0].password != req.body.password) {
          console.log('Error! Incorrect email or password');
        }
        else
        {
          params.status = true;
          console.log('User is now logged in');
        }
    }

    res.render('login', params);

  });
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
