// Primary Authors: Nick

var User = require('../mongoose/users');
var mongoose = require('mongoose');
var utils = require('../utils/utils');

var controller = function(){
    return {
        /*
            Returns logged in user if there is a user logged in
        */
        getCurrentUser: function(req, res) {
            if (!req.isAuthenticated()) {
                utils.sendErrResponse(res, 401, 'You are not logged in!');
            } else {
                User.findById(req.user._id.toString()).populate('courses').exec(function (err, u) {
                    if (err) {
                        utils.sendErrResponse(res, 400, err.message);
                    } else {
                        console.log(u);
                        return utils.sendSuccessResponse(res, {'party': u.party,'courses': u.courses, 'name': u.name, 'id': req.user._id.toString()});
                    }
                });
            }
        },

        /*
            Add a class to a user
        */
        addClassToUser: function(req, res) {
            // var Users = models.Users;
            console.log(req.user._id);
            console.log(req.params.courseId);
            User.findOneAndUpdate({
                "_id": req.user._id
                }, {
                    $push: {
                        courses: req.params.courseId
                    }
                }, function (error, document) {
                    if (error) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    } else {
                        utils.sendSuccessResponse(res);
                    }
                }
            );
        },

        /*
            Remove a class from a user
        */
        removeClassFromUser: function(req, res) {
            // var Users = models.Users;
            User.findOneAndUpdate({
                    "_id": req.user._id
                }, {
                    $pull: {
                        courses: req.params.courseId
                    }
                }, function (error, document) {
                    if (error) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    } else {
                        utils.sendSuccessResponse(res);
                    }
                }
            );
        }
    }
};

module.exports = controller();