// Primary Author: Nick

var express = require('express');
var router = express.Router();

var Parties = require('../mongoose/parties')
var Users = require('../mongoose/users')
var utils = require('../utils/utils');

var controller = function(){
    return {
        /*
            create a new party if a user is logged in
        */
        createNewParty: function(req, res) {
            //can only post new party if the user is logged in
            if(req.user){
                //make the new party- this relies on the req.body names being the same as in model
                var newParty = new Parties(req.body);
                newParty.attendees = 1;
                console.log(req.body);
                //save the party that I just made
                newParty.save(function(err,doc){
                    if (err) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    } else {
                        console.log(req.user.party);
                        if (req.user.party) {
                            //Remove user from their current party (decrement users)
                            Parties.findOneAndUpdate({
                                "_id": req.user.party
                            }, {
                                $inc: {
                                    attendees: -1
                                }
                            }, function (error, document) {
                                if (error) {
                                    utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                                } else {
                                    //actually update req.user in the database
                                    Users.update({"_id": req.user._id}, {"party": doc._id}, function (error, document) {
                                        if (error) {
                                            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                                        } else {
                                            req.user.party = doc._id;
                                            console.log("sending success response");
                                            console.log(doc);
                                            utils.sendSuccessResponse(res,doc);
                                        }
                                    });
                                }
                            });
                        } else {
                            Users.update({"_id": req.user._id}, {"party": doc._id}, function (error, document) {
                                if (error) {
                                    utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                                } else {
                                    req.user.party = req.params.id
                                    console.log("sending success response");
                                    console.log(doc);
                                    utils.sendSuccessResponse(res,doc);
                                }
                            });
                        }

                    }
                });
            }
            else{
                //TODO:send err response
            }
        },

        /*
            res.json the parties
        */
        getParties: function(req, res) {
            Parties.find({}, function(error, documents) {
                if (error) {
                    utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                } else {
                    res.json(documents);
                }
            });
        },

        /*
            get all the party info
        */
        getPartyInfo: function(req, res) {
            Parties.findOne({"_id" : req.params.id}, function(err,party){
                if(err || party ==null){
                    utils.sendErrResponse(res, 404, 'The project could not be found.');
                }
                else{
                    res.json(party);
                }
            })
        },

        /*
            adds current user to party
        */
        addToParty: function(req, res) {
            if(req.user.party){
                //TODO: change this to a call to delete once I refactor
                utils.sendErrResponse(res, 403, "you're already in a party!")
            }
            //increment the party attendees counter
            Parties.findOneAndUpdate({
                    "_id": req.params.id
                }, {
                    $inc: {
                        attendees: 1
                    }
                }, function (error, document) {
                    if (error) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    }

                }
            );
            //update the user so it contains the right party
            Users.update({"_id": req.user._id}, {"party": req.params.id}, function (error, document) {
                if (error) {
                    utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                } else {
                    req.user.party = req.params.id
                    utils.sendSuccessResponse(res);
                }
            });
        },

        /*
            remove current user from party
        */
        removeFromParty: function(req, res) {
            //only allow them to leave a party they are already in.
            console.log(req.user.party);
            console.log(req.params.id);
            if(req.user.party == req.params.id){
                //decrement that party's users count
                Parties.findOneAndUpdate({
                        "_id": req.params.id
                    }, {
                        $inc: {
                            attendees: -1
                        }
                    }, function (error, document) {
                        if (error) {
                            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                        } else {
                            //update the user so it contains no party
                            Users.update({"_id": req.user._id}, {"party": null}, function (error, document) {
                                if (error) {
                                    utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                                } else {
                                    req.user.party = null;
                                    utils.sendSuccessResponse(res);
                                }
                            });
                        }
                    }

                );

            } else {
                console.log("not at that party!!!!");
                utils.sendSuccessResponse(res);
            }
        }
    }
    
};

module.exports = controller();