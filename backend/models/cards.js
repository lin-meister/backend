var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var textSearch = require('mongoose-text-search');

var schema = new Schema({
    title: String,
    body: String,
    tags: [String],
    images: [String],
    author: Object,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

// give Card search capabilties
schema.plugin(textSearch);
// add a text index to the Card array
schema.index({title: 'text'});

module.exports = mongoose.model('cards', schema);