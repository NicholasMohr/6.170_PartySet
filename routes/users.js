// Primary Author: Nick

var express = require('express');
var router = express.Router();
var passport = require('passport');
var controller = require('../controller/users-controller');
var utils = require('../utils/utils');

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

/* PUT a class listed for a specific user */
router.put('/:courseId', function(req, res){
	controller.addClassToUser(req, res);
});

/* PUT a class removed from a specific user */
router.put('/delete/:courseId', function(req, res){
	controller.removeClassFromUser(req, res);
});

/*
    GET returns whether a user is logged in
    For internal use only
*/
router.get('/loggedin', function(req, res) {
    console.log(req.user);
    controller.getCurrentUser(req, res);
});

module.exports = router;
