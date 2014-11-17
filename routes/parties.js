var express = require('express');
var router = express.Router();

var Party = require('../mongoose/parties')
var Users = require('../mongoose/users')

//create new party and add current user to it
router.post('/', function (req, res) {
    //first check if user is already attending a party
    var newParty = new Party(req.body);
    newParty.save(function(err,doc){
        var party_id = doc._id;



        if(req.currentUser.party) {
            //remove user from their current party
            Party.findOneAndUpdate({
                    "_id": party_id
                }, {
                    $pull: {
                        users: req.currentUser
                    }
                }, function (error, document) {
                    if (error) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    }
                });
        }
        req.currentUser.party = party_id;
        utils.sendSuccessResponse(res);
    });
    
});

router.get('/', function (req, res) {
    Party.find({}, function(error, documents) {
        if (error) {
            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
            res.json(documents);
        }
    })
});

//add current user to party
router.put('/:id', function (req, res) {
    Party.findOneAndUpdate({
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
    Party.findOneAndUpdate({
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

module.exports = router;