var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    password: String,
    email: String,
    verified: Boolean,
    party: {type: Schema.Types.ObjectId, ref: 'Party'},
    courses: [{type: Schema.Types.ObjectId, ref: 'Course'}]
});
// }, {collection: "users"});

// exports.Users = mongoose.model('Users', userSchema);
module.exports = mongoose.model('User', userSchema);