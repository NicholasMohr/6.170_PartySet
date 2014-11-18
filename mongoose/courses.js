// Primary Author: Carolyn

var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
	courseNumber: String
},{collection: "courses"});


module.exports = mongoose.model('Course', courseSchema);