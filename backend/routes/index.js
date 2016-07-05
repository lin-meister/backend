var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  var user = (req.user !== undefined) ? req.user : null;
  res.render('index', { title: 'Lazy Student App', user: user});
});

router.get('/about', function(req, res, next) {
  console.log(req.user);
  var user = (req.user !== undefined) ? req.user : null;
  res.render('about', { title: 'Lazy Student App', user: user});
});

module.exports = router;
