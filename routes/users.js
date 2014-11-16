var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

var isLoggedInOrInvalidBody = function (req, res) {
    if (req.currentUser) {
        utils.sendErrResponse(res, 403, 'There is already a user logged in.');
        return true;
    } else if (!(req.body.username && req.body.password)) {
        utils.sendErrResponse(res, 400, 'Username or password not provided.');
        return true;
    }
    return false;
};

router.put('/', function (req, res) {
    var Users = models.Users;
    if (isLoggedInOrInvalidBody(req, res)) {
        return;
    }
    
    var user = new Users({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        verified: false,
        classes: []
    });
    user.save(function (err, result) {
        if (err) {
            // 11000 and 11001 are MongoDB duplicate key error codes
            if (err.code && (err.code === 11000 || err.code === 11001)) {
                utils.sendErrResponse(res, 400, 'That username is already taken!');
            } else {
                utils.sendErrResponse(res, 500, 'An unknown DB error occurred.');
            }
        } else {
            req.session.userId = result._id;
            var userSimple = {
                username: result.username
            };
            utils.sendSuccessResponse(res, {
                    user: userSimple
            });
        }
    });
});

router.put('/:classid', function(req, res){
	var Users = models.Users;
	Users.findOneAndUpdate({
            "_id": req.session.userId
        }, {
            $push: {
                classes: req.classid
            }
        }, function (error, document) {
            if (error) {
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
                utils.sendSuccessResponse(res);
            }
        }

    );
});

router.put('delete/:classid', function(req, res){
	var Users = models.Users;
	Users.findOneAndUpdate({
            "_id": req.session.userId
        }, {
            $pull: {
                classes: req.classid
            }
        }, function (error, document) {
            if (error) {
                utils.sendErrResponse(res, 500, 'An unknown error occurred.');
            } else {
                utils.sendSuccessResponse(res);
            }
        }

    );
});

module.exports = router;
