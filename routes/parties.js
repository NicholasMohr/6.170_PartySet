var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')

//create new party and add current user to it
router.post('/', function (req, res) {
    //first check if user is already attending a party
    if(req.currentUser.party){
        //should allow this, just take them out of their old party and into this party
        utils.sendErrResponse(res, 403, "you are already in a party. Exit that party before creating a new one")
    }
    else{
        var newParty = new Parties({
            location_name: req.body.location_name,
            location_details: req.body.location_details,
            coordinates: req.body.coordinates,
            end_time: req.body.end_time,
            users: [req.currentUser]
        });
        newParty.save(function(err){
            if (err){
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            }
            else{
                utils.sendSuccessResponse(res, 'Sucessfully added party');
            }
        });
    }
});

//add current user to party
router.put('/:id', function (req, res) {
    Parties.findOneAndUpdate({
        	"_id": req.body.id
	    }, {
            $push: {
                users: req.currentUser
            }
        }, function (error, document) {
            if (error) {
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
                utils.sendSuccessResponse(res);
            }

        });
    Users.update({"_id": req.currentUser._id}, {"party": req.body.id}, function (error, document) {
        if (error) {
            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
            //TODO: update req.currentUser
            utils.sendSuccessResponse(res);
        }
    });
});

//remove current user from party
router.delete('/:id', function (req, res) {
    Parties.findOneAndUpdate({
            "_id": req.body.id
        }, {
            $pull: {
                users: req.currentUser
            }
        }, function (error, document) {
            if (error) {
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
                utils.sendSuccessResponse(res);
            }

        });
    Users.update({"_id": req.currentUser._id}, {"party": req.body.id}, function (error, document) {
        if (error) {
            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
            //TODO: update req.currentUser
            utils.sendSuccessResponse(res);
        }
    });
});