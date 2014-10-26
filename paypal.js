/**
 * Created by emptysamurai on 26.10.14.
 */

var https = require('https');
var qs = require('querystring');
var settings = require('./settings');

module.exports.makeQuery = function(meeting, callback)
{
    var sendObject = {
        USER: "ontime_api1.gmail.com",
        PWD: "Y9253ZZPXW9KNAKL",
        SIGNATURE: "AFcWxV21C7fd0v3bYYYRCpSSRl31AhpqEu3RexMlOb-ngWNdZNuwAc8P",
        VERSION: "2.3",
        METHOD: "MassPay",
        RECEIVERTYPE: "EmailAddress",
        CURRENCYCODE: "RUB"
    };

    var totalSum = meeting.bet * meeting.approved_participants.length;
    var restMoney = totalSum - meeting.bet * meeting.checked_in_users.length;
    if (restMoney == 0) {
        var oneManMoney = meeting.bet;
    } else {
        var charityMoney = restMoney*0.15;
        var oneManMoney = (restMoney-charityMoney)/meeting.checked_in_users.length+meeting.bet;
    }
    for (var i = 0; i < meeting.checked_in_users.length; i++) {
        var user = meeting.checked_in_users[i];
        sendObject['L_EMAIL' + i] = user.email;
        sendObject['L_AMT' + i] = oneManMoney;
    }

    var data = qs.stringify(sendObject);

    var options = {
        host: "api-3t.sandbox.paypal.com",
        port: 443,
        path: '/nvp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = https.request(options, function(res) {
        var body="";
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body+=chunk;
        });
        res.on('end', function () {
            var data = qs.parse(body);
            if (data.ACK != "Success") {
                callback(data.ACK);
                return
            }
            callback(null);
        });

    });

    req.write(data);
    req.end();

};
