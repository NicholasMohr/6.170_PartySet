var mongoose = require('mongoose');

var partySchema = mongoose.Schema({
	location_name: String,
	location_details: String,
	coordinates: [Number],
	end_time: Date,
	users: [{type: String, ref: 'Users'}]
},{collection: "parties"});


module.exports = mongoose.model('Parties', partySchema);