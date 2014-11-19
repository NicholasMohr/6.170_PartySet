// Primary Author: Nick

var express = require('express');
var router = express.Router();

var Courses = require('../mongoose/courses');
var Parties = require('../mongoose/parties');
var Users = require('../mongoose/users');
var utils = require('../utils/utils');

var controller = function(){
    return {
        /*
            get all courses
        */
        getAllCourses: function(req, res) {
            Courses.find({}, function(err,courses){
                if (err) {
                    utils.sendErrResponse(res, 500, 'An unexpected error occured.');
                } else {
                    res.json(courses);
                }
            });
        },

        /*
            get all parties in a course
        */
        getPartiesOfCourse: function(req, res) {
            //TODO: delete all the things that are before a certain date.
            Parties.activeForCourse({course : req.params.course_id}, function(err,parties){
                if (err) {
                    utils.sendErrResponse(res, 500, 'An unexpected error occured.');
                } else {
                    res.json(parties)
                }
            });
        },

        /*
            make a new course
        */
        createNewCourse: function(req, res) {
            var newCourse = new Courses(req.body);
            newCourse.save(function(err,doc){
                if (err) {
                    utils.sendErrResponse(res, 500, 'An unexpected error occured.');
                } else {
                    utils.sendSuccessResponse(res);
                }
            });
        }
    }
};

module.exports = controller();