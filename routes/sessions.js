// Primary Author: Hyungie

var express = require('express');
var router = express.Router();
var passport = require('passport');
var utils = require('../utils/utils');

/*	
	POST to sign up
	Takes a JSON POST body with a desired username (email), password, and name
	If the username is valid/untaken, a User document will be created and the current user will be logged in.
	Otherwise, return an error.
*/
router.post('/', function(req, res, next) {
	passport.authenticate('local-signup', function(err, user, info) {
		if (err) { utils.sendErrResponse(res, 400, err.message);}
		if (!user) { utils.sendErrResponse(res, 400, info);}
		else {
			req.login(user, function(err) {
				if (err) { return next(err); }
                utils.sendSuccessResponse(res, 'Successfully created user');
			});
		}
	})(req, res, next);
});

/*
	POST to login with username/password 
	Takes a JSON POST body with a username and a password parameter.
	If the username and password are valid, it will log the user in, otherwise return an error.
*/
router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
        console.log(err);
        if (err) { return next(err); }
        if (!user) { return next(err); }
        else {
        	req.login(user, function(err) {
        		if (err) { return next(err); }
                utils.sendSuccessResponse(res, 'Successfully logged in');
        	});
        }
    })(req, res, next);
});

/* POST to logout */
router.post('/logout', function(req, res){
    req.logout();
    utils.sendSuccessResponse(res, 'Logout successful');
});

module.exports = router;