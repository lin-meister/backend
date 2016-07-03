var express = require('express');
var router = express.Router();
var Message = require('../models/messages');


/* GET messages listing. */
router.get('/', function(req, res, callback) {
    console.log(req.body);
    Message.find({}, function(err, message) {
        if (err) {
            console.log(err);
        } else {
            console.log('done');

            res.json({
                data: message
            })
        }
    });
});

router.post('/', function(req, res) {
    var message = new Message(
        {
            body: req.body.body,
            author: {
                id: req.user._id,
                name: req.user.username
            }
        }
    );
    message.save(function (err, message) {
        if (err) {
            console.log(err);
        } else {
            console.log('done');
            res.json({
                data: message
            })
        }
    });
});


module.exports = router;
