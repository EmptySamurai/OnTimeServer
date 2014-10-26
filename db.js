var mongoose = require("mongoose");
var settings = require('./settings');
if (process.env.NODE_ENV == 'production') {
    mongoose.connect(settings.db_url);
    mongoose.set('debug', true);
} else {
    mongoose.connect("mongodb://localhost:27017/ontime");
    mongoose.set('debug', true);
}

process.on('SIGINT', function () {

    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });

});


/*var userSchema = new mongoose.Schema({
 fbID: {
 type: Number,
 unique: true,
 required: true
 }
 });*/

var approvedUser = {
    fbID: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    }
};

var checkedInUserSchema = new mongoose.Schema({
    user: approvedUser,
    time: {
        type: Date,
        required: true
    }
});

var userSchema  = {
    fbID: {
        type: Number,
        required: true
    },
    time: {
        type: Date
    },
    email: {
        type: String
    }

};

var meetingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    creator: {
        type: userSchema,
        required: true
    },
    unapproved_participants: [userSchema],
    approved_participants: {
        type: [userSchema],
        default: []
    },
    unnotified_users: [userSchema],
    checked_in_users: {
        type: [userSchema],
        default: []
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    end: {
        type: Date,
        required: true
    },
    bet: {
        type: Number,
        required: true
    }
});

//var CheckedInUser = mongoose.model('CheckedInUser', checkedInUserSchema);
var Meeting = mongoose.model('Meeting', meetingSchema);

module.exports.getUserMeetings = function (user, callback) {

    Meeting.find({$or: [
        {approved_participants: { $elemMatch: { fbID: user.fbID } }},
        {unapproved_participants: { $elemMatch: { fbID: user.fbID } }},
        {'creator.fbID': user.fbID }
    ]}, function (err, meetings) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, meetings);
    });
};

module.exports.getUserActiveMeetings = function (user, callback) {

    Meeting.find({$and: [
        {$or: [

            {approved_participants: { $elemMatch: { fbID: user.fbID } }},
            {unapproved_participants: { $elemMatch: { fbID: user.fbID } }},
            {'creator.fbID': user.fbID }
        ]},
        {end: {$gte: new Date()}}
    ]}, function (err, meetings) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, meetings);
    });
};

module.exports.addMeeting = function (meeting, callback) {
    meeting.unnotified_users = meeting.unapproved_participants;
    var meetingObject = new Meeting(meeting);

    meetingObject.save(function (err, savedMeeting) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, savedMeeting);
    });
};

function indexOfUserInArray(user, arr) {
    for (var i=0; i<arr.length; i++) {
        if (arr[i].fbID == user.fbID) {
            return i;
        }
    }
    return -1;
}

module.exports.approveMeeting = function (user, approve, meeting, callback) {
    Meeting.find({_id: meeting._id}, function (err, meeting) {
        if (err) {
            callback(err);
            return;
        }
        var index = indexOfUserInArray(user, meeting.unapproved_participants);
        if (index < 0) {
            if (!approve) {
                index = indexOfUserInArray(user, meeting.approved_participants);
                if (index < 0) {
                    callback('User is not approved');
                    return;
                }
                meeting.approved_participants.splice(index, 1);
            } else {
                callback('User is not unapproved');
                return;
            }
        } else {
            meeting.unapproved_participants.splice(index, 1);
        }
        if (approve) {
            meeting.approved_participants.push(user);
        }
        Meeting.findOneAndUpdate({_id: meeting._id}, {unapproved_participants: meeting.unapproved_participants, approved_participants: meeting.approved_participants}, function (err, meeting) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, meeting)
        });
    });

};

module.exports.checkUserIn = function(user, meeting, callback) {
    user.time = new Date();

    Meeting.findOneAndUpdate({_id: meeting._id}, {$push: {checked_in_users: user}}, function(err, meeting) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, meeting);
    })
};

/*var userExists = function (user, callback) {

 User.count(user, function (err, count) {
 if (err) {
 callback(err);
 return;
 }

 callback(null, Boolean(count));
 });
 };

 module.exports.addUser = function (user, callback) {

 userExists(user, function (err, exists) {
 if (err) {
 callback(err);
 return;
 }

 if (!exists) {
 var userObject = new User(user);

 userObject.save(function (err, savedUser) {
 if (err) {
 callback(err);
 return;
 }

 callback(null, savedUser);
 });
 } else {
 callback(null, user);
 }
 });
 };*/


