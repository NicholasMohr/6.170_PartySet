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

//TODO: test this
//add current user to party
router.put('/:id', function (req, res) {
    controller.addToParty(req, res);
});

//TODO: test this
//remove current user from party
router.delete('/:id', function (req, res) {
    controller.removeFromParty(req, res);    
});

module.exports = router;