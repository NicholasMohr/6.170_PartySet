var express = require('express');
var router = express.Router();
var passport = require('passport');
var controller = require('../controller/users-controller');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

var isLoggedInOrInvalidBody = function (req, res) {
    if (req.user) {
        utils.sendErrResponse(res, 403, 'There is already a user logged in.');
        return true;
    } else if (!(req.body.username && req.body.password)) {
        utils.sendErrResponse(res, 400, 'Username or password not provided.');
        return true;
    }
    return false;
};

/*	
	POST to sign up
	Takes a JSON POST body with a desired username (email), password, and name
	If the username is valid/untaken, a User document will be created and the current user will be logged in.
	Otherwise, return an error.
*/
router.post('/', function(req, res, next) {
	passport.authenticate('local-signup', function(err, user, info) {
		if (err) { return res.status(400).send(err); }
		if (!user) { return res.status(400).send({error: info}); }
		else {
			req.login(user, function(err) {
				if (err) { return next(err); }
				// TODO check if want to use utils success method instead
				return res.status(201).json({content: {'message': 'Successfully created user', 'user': user}}).end();
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
        		// TODO check if want to use utils success method instead
        		return res.status(200).json({content: {'message': 'Successfully logged in', 'user': user}}).end();
        	});
        }
    })(req, res, next);
});

/* POST to logout */
router.post('/logout', function(req, res){
    req.logout();
    res.status(200).send({message: 'Logout successful'});
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
