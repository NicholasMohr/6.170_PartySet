// Primary Author: Carolyn

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true, lowercase:true},
    verified: {type: Boolean, required: true}, // for future implementation: email verified or not
    party: {type: Schema.Types.ObjectId, ref: 'Party'},
    courses: [{type: Schema.Types.ObjectId, ref: 'Course'}]
});

module.exports = mongoose.model('User', userSchema);