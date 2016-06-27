var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: String,
    body: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('messages', schema);