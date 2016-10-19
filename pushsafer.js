/**
 *
 *      ioBroker pushsafer Adapter
 *
 *      (c) 2016 bluefox
 *
 *      MIT License
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';
var utils     = require(__dirname + '/lib/utils'); // Get common adapter utils
var Pushsafer = require('pushsafer-notifications');
var fs        = require('fs');
var adapter   = utils.adapter('pushsafer');

adapter.on('message', function (obj) {
    if (obj && obj.command === 'send') {
        processMessage(obj.message, obj);
    }
    processMessages();
});

adapter.on('ready', function () {
    main();
});

var pushsafer;
var lastMessageTime = 0;
var lastMessageText = '';

function processMessage(message, obj) {
    if (!message) return;

    // filter out double messages
    var json = JSON.stringify(message);
    if (lastMessageTime && lastMessageText === JSON.stringify(message) && new Date().getTime() - lastMessageTime < 1000) {
        adapter.log.debug('Filter out double message [first was for ' + (new Date().getTime() - lastMessageTime) + 'ms]: ' + json);
        return;
    }
    lastMessageTime = new Date().getTime();
    lastMessageText = json;

    sendNotification(message, function (err) {
        if (obj && obj.callback) {
            adapter.sendTo(obj.from, obj.command, {error: err}, obj.callback);
        }
    });
}

function processMessages() {
    adapter.getMessage(function (err, obj) {
        if (obj) {
            processMessage(obj.message);
            processMessages();
        }
    });
}

function main() {
    // Adapter is started only if some one writes into "system.adapter.pushsafer.X.messagebox" new value
    processMessages();
}

function sendNotification(message, callback) {
    if (!message) message = {};
    var push;
    var isDelete = false;

    if (message.token) {
        isDelete = true;
        push = new Pushsafer({
            k:     message.token,
            debug: process.argv[3] === 'debug'
        });
    } else if (!pushsafer) {
        if (adapter.config.token) {
            pushsafer = new Pushsafer({
                k:     adapter.config.token,
                debug: process.argv[3] === 'debug'
            });
            push = pushsafer;
        } else {
            adapter.log.error('Cannot send notification while not configured');
            if (callback) callback('Cannot send notification while not configured');
            return;
        }
    } else {
        push = pushsafer;
    }

    if (!push) return;

    if (typeof message !== 'object') message = {message: message};

    message.m         = message.message   || message.m || '';
    message.t         = message.title     || message.t || adapter.config.title;
    message.s         = message.sound     || message.s || (adapter.config.sound ? adapter.config.sound : undefined);
    message.i         = message.icon      || message.i || adapter.config.icon;
    message.d         = message.device    || message.d || adapter.config.device;
    message.v         = message.vibration || message.v || adapter.config.vibration;
    message.l         = message.time2live || message.l || adapter.config.time2live;
    if (message.url)      message.u  = message.url;
    if (message.urlTitle) message.ut = message.urlTitle;

    var data;
    var parts;

    if (message.picture) {
        if (message.picture.substring(0, 5) !== 'data:') {
            try {
                data = new Buffer(fs.readFileSync(message.picture)).toString('base64');
                parts = message.picture.split('.');

                message.p = 'data:image/' + parts.pop().toLowerCase() + ';base64,' + data;
            } catch (e) {
                adapter.log.error('Cannot read image "' + message.picture + '": '+ e);
            }
        } else {
            message.p = message.picture;
        }
    }
    if (message.picture2) {
        if (message.picture2.substring(0, 5) !== 'data:') {
            try {
                data = new Buffer(fs.readFileSync(message.picture2)).toString('base64');
                parts = message.picture2.split('.');

                message.p2 = 'data:image/' + parts.pop().toLowerCase() + ';base64,' + data;
            } catch (e) {
                adapter.log.error('Cannot read image "' + message.picture2 + '": '+ e);
            }
        } else {
            message.p2 = message.picture2;
        }
    }
    if (message.picture3) {
        if (message.picture3.substring(0, 5) !== 'data:') {
            try {
                data = new Buffer(fs.readFileSync(message.picture3)).toString('base64');
                parts = message.picture3.split('.');

                message.p3 = 'data:image/' + parts.pop().toLowerCase() + ';base64,' + data;
            } catch (e) {
                adapter.log.error('Cannot read image "' + message.picture3 + '": '+ e);
            }
        } else {
            message.p3 = message.picture3;
        }
    }

    if (message.message   !== undefined) delete message.message;
    if (message.title     !== undefined) delete message.title;
    if (message.sound     !== undefined) delete message.sound;
    if (message.icon      !== undefined) delete message.icon;
    if (message.device    !== undefined) delete message.device;
    if (message.vibration !== undefined) delete message.vibration;
    if (message.picture   !== undefined) delete message.picture;
    if (message.picture2  !== undefined) delete message.picture2;
    if (message.picture3  !== undefined) delete message.picture3;
    if (message.url       !== undefined) delete message.url;
    if (message.urlTitle  !== undefined) delete message.urlTitle;
    if (message.time2live !== undefined) delete message.time2live;
    if (message.token     !== undefined) delete message.token;

    adapter.log.debug('Send pushsafer notification: ' + message.m);

    if (message.s !== null && message.s !== undefined) message.s = message.s.toString();
    if (message.i !== null && message.i !== undefined) message.i = message.i.toString();
    if (message.d !== null && message.d !== undefined) message.d = message.d.toString();
    if (message.v !== null && message.v !== undefined) message.v = message.v.toString();
    if (message.l !== null && message.l !== undefined) message.l = message.l.toString();

    push.send(message, function (err, result) {
        if (isDelete) {
            setTimeout(function () {
                push = null;
            }, 500);
        }
        try {
            result = JSON.parse(result);
        } catch (e) {
            adapter.log.error('Cannot parse answer: ' + result);
        }

        if (err || result.error) {
            adapter.log.error('Cannot send notification: ' + JSON.stringify(err || result.error));
            if (callback) callback(err || result.error);
            return false;
        } else {
            if (callback) callback();
            return true;
        }
    });
}
