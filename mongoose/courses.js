// Primary Author: Carolyn

var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
	courseNumber: {type: String, required: true},
},{collection: "courses"});


module.exports = mongoose.model('Course', courseSchema);