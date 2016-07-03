var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    body: String,
    author: Object,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('messages', schema);