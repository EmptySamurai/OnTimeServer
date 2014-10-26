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
    var body = req.body;
    console.info(body);
    var method = body.method;
    switch (method) {
        case 'get_user_meetings': {
            getUserMeetings(req, res);
            break;
        }
        case 'add_meeting': {
            addMeeting(req, res);
            break;
        }
        case 'approve_meeting': {
            approveMeeting(req, res);
            break;
        }
        case 'check_user_in': {
            checkUserIn(req, res);
            break;
        }
        default : {
            sendError(res, "Unknown method");
        }
    }
});

function sendError(res, message) {
    console.warn(message);
    var error  = {
        error: message
    };
    res.status(500).send(JSON.stringify(error));
}

function sendObject(res, data) {
    var obj = {
        data: data
    };
    res.status(200).send(JSON.stringify(obj));
}

function getUserMeetings(req, res) {
    var user = req.body.data;
    req.db.getUserActiveMeetings(user, function(err, meetings) {
        if (err) {
            sendError(res, "Error on getting meetings");
            return;
        }
        sendObject(res, meetings);
    })
}

function addMeeting(req, res) {
    var meeting = req.body.data;
    req.db.addMeeting(meeting, function(err, addedMeeting) {
        if (err) {
            sendError(res, "Error on adding meeting");
            return;
        }
        sendObject(res, addedMeeting);
    })
}

function approveMeeting(req, res) {
    var data = req.body.data;
    req.db.approveMeeting(data.user, data.approve, data.meeting, function(err, meeting) {
        if (err) {
            sendError(res, "Error on approving user");
            return;
        }
        sendObject(res, meeting);
    })
}

function checkUserIn(req, res) {
    var data = req.body.data;
    req.db.checkUserIn(data.user, data.meeting, function(err, meeting) {
        if (err) {
            sendError(res, "Error on checking in user");
            return;
        }
        sendObject(res, meeting);
    })
}

module.exports = router;