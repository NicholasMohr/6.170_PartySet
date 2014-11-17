var mongoose = require('mongoose');

var partySchema = mongoose.Schema({
	location: String,
	details: String,
	coordinates: [Number],
	endTime: Date,
	attendees: Number
},{collection: "parties"});


module.exports = mongoose.model('Party', partySchema);