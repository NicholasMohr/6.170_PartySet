// Primary Author: Nick

var express = require('express');
var router = express.Router();

var controller = require('../controller/parties-controller');

//create new party and add current user to it
router.post('/', function (req, res) {
    controller.createNewParty(req, res);
});

router.get('/', function (req, res) {
    controller.getParties(req, res);
});

//get all the party info
router.get('/:id', function (req, res) {
    controller.getPartyInfo(req, res);
});

//TODO: move this to PUT- /users/:id
//add current user to party
router.put('/:id', function (req, res) {
    controller.addToParty(req, res);
});

//TODO: move this to DELETE- /users/:id
//remove current user from party
router.delete('/:id', function (req, res) {
    controller.removeFromParty(req, res);    
});

//TODO: move this to DELETE- /:id
//remove the party specified by the id
router.delete('/endparty/:id', function (req, res) {
    controller.endParty(req, res);    
});

// invite a list of users to party
router.put('/:id/invite', function (req, res) {
	controller.emailInvite(req, res);
});



module.exports = router;