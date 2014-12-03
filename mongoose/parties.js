// Primary Author: Carolyn

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var partySchema = mongoose.Schema({
	location: {type: String, required: true},
	details: {type: String, required: true},
	lat: {type: Number, required: true},
    lng: {type: Number, required: true},
	expireAt: {type: Date, required: true},
	attendees: {type: Number, required: true},
	host: {type: Schema.Types.ObjectId, ref: 'Users'},
	course: {type: Schema.Types.ObjectId, ref: 'Courses'}
},{collection: "parties"});

partySchema.statics.activeForCourse = function(id, callback) {
    var active = [];
    this.find({course: id}).exec(function(error, docs){
        docs.forEach(function(doc){
            var cur = new Date();
            var end = doc.expireAt;
            console.log(cur);
            if (cur < end){
                active.push(doc);
            }
        });
        callback(error, active);
    });
}

module.exports = mongoose.model('Party', partySchema);