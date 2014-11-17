var User = require('../mongoose/users');
var mongoose = require('mongoose');

var controller = function(){
    return {

        /*
            Add a class to a user
        */
        addClasstoUser: function(req, res) {
            // var Users = models.Users;
            Users.findOneAndUpdate({
                "_id": req.session.userId
                }, {
                    $push: {
                        classes: req.classid
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
            Users.findOneAndUpdate({
                    "_id": req.session.userId
                }, {
                    $pull: {
                        classes: req.classid
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