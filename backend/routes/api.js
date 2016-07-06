var express = require('express');
var router = express.Router();
var Card = require('../models/cards');

/* GET home page. */

// GET routing requests to localhost:3000/
// The function is the middleware function, which does something to the request and response and execute code in between
router.get('/', function(req, res) {
    if (req.user) {
        console.log(req.user + ' is logged in! Rendering cards');
        // Finds in the card array. Parameter is left empty since we have no criteria. cards is the data we return
        Card.find({}, function (err, cards) {
            if (err) {
                console.log(err);
            } else {
                console.log('done');
                // Returns the entire cards array
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

// GET routing requests to localhost:3000/search (searching and getting cards)
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
            // Return the list of cards based on the criteria
            res.json({
                data: cards
            });
        }
    }).sort({title: 1});

});

// POST routing requests to localhost:3000/ (adding and posting new cards)
router.post('/', function(req, res) {
    var card = new Card(
        {
            title: req.body.title,
            body: req.body.body,
            tags: req.body.tags,
            images: req.body.images,
            author: {
                id: req.user._id,
                name: req.user.username
            }
        }
    );
    card.save(function (err, card) {
        if (err) {
            console.log(err);
            res.render('error', "Error 413: The file you are uploading is too large. Please try again.");
        } else {
            console.log('done');
            // Return the added card as a JSON
            res.json({
                data: card
            });
        }
    });
});

// DELETE routing requests to localhost:3000/:id by id
router.delete('/:id', function(req, res) {
    console.log(req.body);
    console.log(req.params);
    Card.remove(
        // req.params is the named URL segments. In this case, req.params.id
        // is the part of the URL after the / and holds a value
        {_id: req.params.id}, function(err, card) {
        if (err) {
            console.log(err);
        } else {
            console.log('Deleted the entry from the database!');
            // Doesn't need to really return anything since we delete it
            res.json({
                success: true
            })
        }
    })
});

// PATCH (update) routing requests to localhost:3000/:id by id
router.patch('/:id', function(req, res) {
    console.log(req.body);
    console.log(req.params);
    Card.findByIdAndUpdate(req.params.id, {$set:req.body}, {new: true}, function(err, card) {
        if (err) {
            console.log(err);
        } else {
            console.log('Updated the entry in the database!');
            // Return the updated card as a JSON
            res.json({
                data: card
            })
        }
    })
});

module.exports = router;
