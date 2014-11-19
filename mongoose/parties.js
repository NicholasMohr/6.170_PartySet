// Primary Author: Carolyn

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var partySchema = mongoose.Schema({
	location: String,
	details: String,
	lat: Number,
    lng: Number,
	endTime: Date,
	attendees: Number,
	course: {type: Schema.Types.ObjectId, ref: 'Courses'}
},{collection: "parties"});

partySchema.statics.activeForCourse = function(id, callback) {
    var active = [];
    this.find({course: id}).exec(function(error, docs){
        docs.forEach(function(doc){
            var cur = new Date();
            var end = doc.endTime;
            if (cur < end){
                active.push(doc);
            }
        });
        callback(error, active);
    });
}

module.exports = mongoose.model('Party', partySchema);