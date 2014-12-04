// Primary Author: Nick

var express = require('express');
var router = express.Router();
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('R5D9QYNU1F0Iae-uzaa1uA'); // personal mandrill API key;

var Parties = require('../mongoose/parties');
var Users = require('../mongoose/users');
var Courses = require('../mongoose/courses');
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
                newParty.host = req.user._id;
                console.log(req.body);
                //save the party that I just made
                newParty.save(function(err,doc){
                    if (err) {
                        utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                    } else {
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
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
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
                    utils.sendErrResponse(res, 404, 'The party could not be found.');
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
                //decrement that party's counter
                Parties.findOneAndUpdate({
                        "_id": req.user.party
                    }, {
                        $inc: {
                            attendees: -1
                        }
                    }, function (error, document) {
                        if (error) {
                            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                        }
                    }

                );
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
        },

        /*
            end the party specified if the current user is a host of the specified party
        */
        endParty: function(req, res) {
            console.log("gotinhere")
            Parties.findOne({"_id": req.params.id}, function(error, party){
                console.log("gotheretoo")
                if(error || party ==null){
                    console.log("no party");
                    utils.sendErrResponse(res, 404, 'The party could not be found.');
                }
                else{
                    if(String(party.host) === String(req.user._id)){
                        //the current user is the host of the party id
                        Parties.remove({"_id":req.params.id}, function(e,docs){
                            if(e){
                    console.log("erryo");
                                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
                            }
                            else{
                    console.log("successful?");
                                utils.sendSuccessResponse(res, 'Sucessfully removed party');
                            }
                        });
                    }
                    else{
                        utils.sendErrResponse(res,401,'you aren\'t the right user to do that');
                    }
                }
            });
        },

        /*
            email invites for specific party to list of users
        */
        emailInvite: function(req, res) {
            console.log("email");
            Parties.findOne({"_id": req.params.id}, function (err, party) {
                if(err || party == null) {
                    utils.sendErrResponse(res, 404, 'The party could not be found.');
                } else {
                    var emails = [];
                    var emailString = 'emails[]';
                    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
                        emailString = 'emails';
                    }
                    if (Array.isArray(req.body[emailString])) {
                        var i;
                        for (i = 0; i < req.body[emailString].length; i++) {
                            var em = req.body[emailString][i].toLowerCase();
                    
                            // check if username is actual email format
                            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (em == '' || !re.test(em)) { utils.sendErrResponse(res, 400, 'Please enter a valid MIT email address.'); }

                            // check to see if username is MIT email address
                            if (em.split("@").pop() != "mit.edu") { utils.sendErrResponse(res, 400, 'Please enter a valid MIT email address.'); }

                            // add to emails to send
                            var emailData = { "email": req.body[emailString][i].toLowerCase(),
                                              "name": "Invited Recipient",
                                              "type": "to"};
                            emails.push(emailData);
                        }
                    } else {
                        // add to emails to send
                        var emailData = { "email": req.body[emailString].toLowerCase(),
                                          "name": "Invited Recipient",
                                          "type": "to"};
                        emails.push(emailData);
                    }

                    // actually create message
                    var message = { "html": "<p>I'm going to a pset party for:</p>" +
                                            "<ul>" +
                                            "<li>Class: " + req.body.courseNumber + "</li>" +
                                            "<li>Location: " + party.location + "</li>" + 
                                            "<li>Details: " + party.details + "</li>" +
                                            "<li>Ends At: " + party.expireAt.toString() + "</li>" +
                                            "</ul>" +
                                            "<p>You should come, too! Visit <a href='http://project4-nmohr.rhcloud.com'>here</a>.</p>",
                                    "subject": "PartySet Invite",
                                    "from_email": req.user.email,
                                    "from_name": req.user.name,
                                    "to": emails,
                                    "important": false,
                                    "track_opens": null,
                                    "track_clicks": null,
                                    "auto_text": null,
                                    "auto_html": null,
                                    "inline_css": null,
                                    "url_strip_qs": null,
                                    "preserve_recipients": false,
                                    "view_content_link": null,
                                    "tracking_domain": null,
                                    "signing_domain": null,
                                    "return_path_domain": null,
                                    "merge": false
                                };
                    var async = false;
                    var ip_pool = "Main Pool";
                    var send_at = null;
                    // var send_at = "0000-00-00 00:00:00"; // send right away
                    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
                        console.log(result);
                    }, function(e) {
                        // Mandrill returns the error as an object with name and message keys
                        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                    });
                }
            });
        }
    }   
};

module.exports = controller();