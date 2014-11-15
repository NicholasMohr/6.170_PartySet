var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// declare schema for database
// relational-style representation of movie database
// separate "tables" for movies and theaters, with theaters linked by ids
// this requires forming "joins" when queries are made

var userSchema = Schema({
    name: String,
    password: String,
    email: String,
    verified: Boolean,
    classes: [{type: Schema.Types.ObjectId, ref: 'Class'}]
}, {collection: "users"});

exports.Users = mongoose.model('Users', userSchema);