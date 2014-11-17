var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')
var Courses = require('../mongoose/courses')

//gives all classes
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

//gives all the parties in a class
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




module.exports = router;