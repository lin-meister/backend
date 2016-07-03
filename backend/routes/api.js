var express = require('express');
var router = express.Router();
var Card = require('../models/cards');

/* GET home page. */

router.get('/', function(req, res) {
    console.log(req.body);
    if (req.user) {
        console.log(req.user + ' is logged in! Rendering cards');
        Card.find({}, function (err, cards) {
            if (err) {
                console.log(err);
            } else {
                console.log('done');

                res.json ({
                    data: cards
                });
            }
        })
    }
    else {
        console.log(req.user + ' There is no user in session! Log in again');
    }

});

router.get('/search', function(req, res) {
    console.log('Searching right now!');
    var criteria = req.query.title;
    
    console.log(criteria);
    // Search for entries whose title CONTAIN (INCLUDE) the criteria string
    Card.find({$text: {$search: criteria}}, function (err, cards) {
        if (err) {
            console.log(err);
        } else {
            console.log('done');
            console.log(cards);

            res.json({
                data: cards
            });
        }
    }).sort({title: 1});

});

router.post('/', function(req, res) {
    console.log(req.body);
    var card = new Card(
        {
            title: req.body.title,
            body: req.body.body,
            tags: req.body.tags,
            author: {
                id: req.user._id,
                name: req.user.username
            }
        }
    );
    card.save(function (err, card) {
        if (err) {
            console.log(err);
        } else {
            console.log('done');

            res.json({
                data: card
            });
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
