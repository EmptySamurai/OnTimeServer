/**
 * Created by emptysamurai on 25.10.14.
 */
var express = require('express');
var router = express.Router();


router.post('/', function(req, res) {
    if (!('body' in req)) {
        sendError(res, "Can't parse JSON");
        return;
    }
    var data = req.body;
    var method = data.method;
    switch (method) {
        case 'add_user': {
            break;
        }
        default : {
            sendError(res, "Unknown method");
        }
    }

});

function sendError(res, message) {
    var error  = {
        error: message
    };
    res.status(500).send(JSON.stringify(error));
}

function saveUser(req, res) {
    var data = req.body.data;
    db.addUser(data.fbID, function (err) {
        if (err) {
            sendError(res, "Error on adding user");
            return;
        }
        res.status(200).send(JSON.stringify({}));
    })
}

module.exports = router;