var User = require('../mongoose/users');
var mongoose = require('mongoose');

var controller = function(){
    return {
        /*
            Returns logged in user if there is a user logged in
        */
        getCurrentUser: function(req, res) {
            if (!req.isAuthenticated()) { utils.sendErrResponse(res, 401, 'You are not logged in!'); }
            User.findById(req.user._id.toString(), 'classes').populate('classes', 'name').exec(function(err, u){
                if (err) {
                    utils.sendErrResponse(res, 400, err.message);
                } else {
                    return utils.sendSuccessResponse({'classes': u.classes, 'name': u.name, 'id': req.user._id.toString()});
                }
            });
        },

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