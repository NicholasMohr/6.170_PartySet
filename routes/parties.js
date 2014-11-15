var express = require('express');
var router = express.Router();

router.post('/:id', function (req, res) {
    var Parties = models.Parties;
    Polls.findOneAndUpdate({
        	"_id": req.id
	    }, {
            $push: {
                votes: doc._id
            }
        }, function (error, document) {
            if (error) {
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
                utils.sendSuccessResponse(res);
            }

        });
    });
});