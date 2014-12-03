// Primary Authors: Nick

var User = require('../mongoose/users');
var Party = require('../mongoose/parties')
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
            //take the course out of users courses
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
                        console.log(req.user.party)
                        if(req.user.party){
                            Party.findById(req.user.party.toString()).exec(function(err, p){

                                if(p && p.course == req.params.courseId){
                                    //Remove this person from the party
                                    Party.findOneAndUpdate({
                                            "_id": req.user.party
                                        }, {
                                            $inc: {
                                                attendees: -1
                                            }
                                        }, function (error, document) {
                                            if (error) {
                                                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                                            } else {
                                                //update the user so it contains no party
                                                User.update({"_id": req.user._id}, {"party": null}, function (error, document) {
                                                    if (error) {
                                                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                                                    } else {
                                                        req.user.party = null;
                                                        utils.sendSuccessResponse(res);
                                                    }
                                                });
                                            }
                                        }

                                    );
                                }
                            });
                        }
                    }
                }
            );
        }
    }
};

module.exports = controller();