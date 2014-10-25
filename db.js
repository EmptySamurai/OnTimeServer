var mongoose = require("mongoose");
var settings = require('./settings');
if (process.env.NODE_ENV == 'production') {
    mongoose.connect(settings.db_url);
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


var userSchema = new mongoose.Schema({
    fbID: {
        type: Number,
        unique: true,
        required: true
    }
});

var meetingSchema = new mongoose.Schema({
    creator: {
        type: Number,
        required: true
    },
    participants:  [Number],
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
    end: Date,
    bet: Number
});

var User = mongoose.model('User', userSchema);
var Meeting = mongoose.model('Meeting', meetingSchema);

module.exports.getUserMeetings = function (fbID, callback) {

    Meeting.find({participants: fbID}, function (err, meetings) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, meetings);
    });
};

module.exports.getUserActiveMeetings = function (fbID, callback) {

    Meeting.find({participants: fbID, end: {$gte : Date.now()}}, function (err, meetings) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, meetings);
    });
};

module.exports.addUser = function (fbID, callback) {
    var user = {
        fbID: fbID
    };
    var userObject = new User(user);

    userObject.save(function (err, savedUser) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, savedUser);
    });
};

