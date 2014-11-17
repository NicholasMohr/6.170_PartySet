var express = require('express');
var router = express.Router();
var passport = require('passport');
var controller = require('../controller/users-controller');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

var isLoggedInOrInvalidBody = function (req, res) {
    if (req.currentUser) {
        utils.sendErrResponse(res, 403, 'There is already a user logged in.');
        return true;
    } else if (!(req.body.username && req.body.password)) {
        utils.sendErrResponse(res, 400, 'Username or password not provided.');
        return true;
    }
    return false;
};

/*	
	PUT to sign up
	Takes a JSON POST body with a desired username (email), password, and name
	If the username is valid/untaken, a User document will be created and the current user will be logged in.
	Otherwise, return an error.
*/
router.put('/', function (req, res) {
    // passport.authenticate('local-signup', function(err, user, info){
    //     if (err)  { return res.status(400).send(err); }
    //     if (!user) { return res.status(400).send({error:info}); }
    //     else {
    //         req.login(user, function(err){
    //             if (err) return next(err);
    //             return res.status(201).json({content:{'message': 'Successfully created user', 'user': user}}).end();
    //         }); 
    //     }    
    // })(req, res, next);

    var Users = models.Users;
    if (isLoggedInOrInvalidBody(req, res)) {
        return;
    }
    
    var user = new Users({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        verified: false,
        classes: []
    });
    user.save(function (err, result) {
        if (err) {
            // 11000 and 11001 are MongoDB duplicate key error codes
            if (err.code && (err.code === 11000 || err.code === 11001)) {
                utils.sendErrResponse(res, 400, 'That username is already taken!');
            } else {
                utils.sendErrResponse(res, 500, 'An unknown DB error occurred.');
            }
        } else {
            req.session.userId = result._id;
            var userSimple = {
                username: result.username
            };
            utils.sendSuccessResponse(res, {
                    user: userSimple
            });
        }
    });
});

/*
	PUT a class listed for a specific user
*/
router.put('/:classid', function(req, res){
	controller.addClassToUser(req, res);
});

/*
	PUT a class removed from a specific user
*/
router.put('delete/:classid', function(req, res){
	controller.removeClassFromUser(req, res);
});

module.exports = router;
