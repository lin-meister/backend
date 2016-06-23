var express = require('express');
var router = express.Router();
var Card = require('../models/cards');

/* GET home page. */

router.get('/', function(req, res, callback) {
    console.log(req.body);
    Card.find({}, function(err, card) {
        if (err) {
            console.log(err);
        } else {
            console.log('done');

            res.json({
                data: card
            })
        }
    })
});

router.post('/', function(req, res) {
    console.log(req.body);
    var card = new Card(
        {
            title: req.body.title,
            body: req.body.body,
        }
    );
    card.save(function (err, card) {
        if (err) {
            console.log(err);
        } else {
            console.log('done');

            res.json({
                data: card
            })
        }
    });
});

router.delete('/:id', function(req, res) {
    console.log(req.body);
    console.log(req.params);
    Card.remove(
        {_id: req.params.id}, function(err, card) {
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

router.patch('/:id', function(req, res) {
    console.log(req.body);
    console.log(req.params);
    var card;
    Card.findByIdAndUpdate(req.params.id, {$set:req.body}, {new: true}, function(err, card) {
        if (err) {
            console.log(err);
        } else {
            console.log('Updated the entry in the database!');

            res.json({
                data: card
            })
        }
    })
});

module.exports = router;
