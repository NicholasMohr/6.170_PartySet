var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var partySchema = mongoose.Schema({
	location: String,
	details: String,
	coordinates: [Number],
	endTime: Date,
	attendees: Number,
	course: {type: Schema.Types.ObjectId, ref: 'Courses'}
},{collection: "parties"});


module.exports = mongoose.model('Party', partySchema);