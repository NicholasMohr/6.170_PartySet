var express = require('express');
var router = express.Router();

router.put('/:id', function (req, res) {
    var Parties = models.Parties;
    var Users = models.Users;
    Parties.findOneAndUpdate({
        	"_id": req.id
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
    });
    Users.update({"_id": req.session.userId}, {"party": req.id}, function (error, document) {
        if (error) {
            utils.sendErrResponse(res, 500, 'An unknown error occurred.');
        } else {
            utils.sendSuccessResponse(res);
        }
    });
});