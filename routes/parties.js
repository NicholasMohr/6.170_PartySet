var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')

//create new party and add current user to it
router.post('/', function (req, res) {
    //I doubt this will work    
    var newParty = new Party(req.body);
    newParty.attendees = 1;
    newParty.save(function(err,doc){
        var party_id = doc._id;

        if(req.currentUser.party){
            //remove user from their current party
            //TODO: change this to a call to delete
            Parties.findOneAndUpdate({
                    "_id": req.currentUser.party
                }, {
                    $inc: {
                        users: -1
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

//get all the party info
router.get('/:id', function (req, res) {
    Parties.findOne({"_id" : req.params.id}, function(err,party){
        if(err || party ==null){
            utils.sendErrResponse(res, 404, 'The project could not be found.');
        }
        else{
            res.json(party);
        }
    })

});


//add current user to party
router.put('/:id', function (req, res) {
    if(req.currentUser.party){
        //TODO: change this to a call to delete
        utils.sendErrResponse(res, 403, "you're already in a party!")
    }
    Parties.findOneAndUpdate({
        	"_id": req.params.id
	    }, {
            $inc: {
                users: 1
            }
        }, function (error, document) {
            if (error) {
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            }

        }
    );
    Users.update({"_id": req.currentUser._id}, {"party": req.params.id}, function (error, document) {
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
    if(req.currentUser.party === req.params.id){
        Parties.findOneAndUpdate({
                "_id": req.params.id
            }, {
                $inc: {
                    users: -1
                }
            }, function (error, document) {
                if (error) {
                    utils.sendErrResponse(res, 500, 'An unknown error occurred.');
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
    }
    
});

module.exports = router;