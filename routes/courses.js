// Primary Author: Nick

var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')
var Courses = require('../mongoose/courses')
var utils = require('../utils/utils');

var controller = require('../controller/courses-controller');

// GET all classes
router.get('/', function (req, res){
    controller.getAllCourses(req, res);
});

// GET all the parties in a class
router.get('/:course_id', function (req, res) {
    controller.getPartiesOfCourse(req, res); 
});

// POST make a new class
router.post('/', function(req,res){
    controller.createNewCourse(req, res);
});

module.exports = router;