// Primary Author: Nick

var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')
var Courses = require('../mongoose/courses')
var utils = require('../utils/utils');

// gives all classes
router.get('/', function(req, res){
    Courses.find({}, function(err,courses){
        if(err){
            utils.sendErrResponse(res, 500, 'An unexpected error occured.');
        }
        else{
            res.json(courses)
        }
    })
})

// gives all the parties in a class
router.get('/:course_id', function (req, res) {
    Parties.find({course : req.params.course_id}, function(err,parties){
        if(err){
            utils.sendErrResponse(res, 500, 'An unexpected error occured.');
        }
        else{
            res.json(parties)
        }
    })
    
});

// make a new class
router.post('/', function(req,res){
    console.log(req.body);
    var newCourse = new Courses(req.body);
    newCourse.save(function(err,doc){
        if(err){
            utils.sendErrResponse(res, 500, 'An unexpected error occured.');
        }
        else{
            utils.sendSuccessResponse(res);
        }
    })
})




module.exports = router;