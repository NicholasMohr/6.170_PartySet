var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')

//create new party and add current user to it
router.post('/', function (req, res) {
    //first check if user is already attending a party
    var newParty = new Parties({
        location_name: req.body.location_name,
        location_details: req.body.location_details,
        coordinates: req.body.coordinates,
        end_time: req.body.end_time,
        users: [req.currentUser]
    });
    newParty.save(function(err,doc){
        party_id = doc._id;

        if(req.currentUser.party){
            //remove user from their current party
            Parties.findOneAndUpdate({
                    "_id": party_id
                }, {
                    $pull: {
                        users: req.currentUser
                    }
                }, function (error, document) {
                    if (error) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    }
                }

            );
        }
        req.currentUser.party = party_id;
        utils.sendSuccessResponse(res);
    });
    
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

        }
    );
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
        }

    );
    Users.update({"_id": req.currentUser._id}, {"party": null}, function (error, document) {
        if (error) {
            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
            //TODO: update req.currentUser
            utils.sendSuccessResponse(res);
        }
    });
});