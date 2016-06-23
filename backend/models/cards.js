var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: String,
    body: String,
    tags: [String],
    images: [String],
    author: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('cards', schema);