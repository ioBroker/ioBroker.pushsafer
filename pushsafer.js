/**
 *
 *      ioBroker pushsafer Adapter
 *
 *      (c) 2014-2016 bluefox
 *
 *      MIT License
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var Pushsafer = require('pushsafer-notifications');

var adapter = utils.adapter('pushsafer');

adapter.on('message', function (obj) {
    if (obj && obj.command === 'send') processMessage(obj.message);
    processMessages();
});

adapter.on('ready', function () {
    main();
});

var stopTimer       = null;
var pushsafer;
var lastMessageTime = 0;
var lastMessageText = '';

// Terminate adapter after 30 seconds idle
function stop() {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }

    // Stop only if subscribe mode
    if (adapter.common && adapter.common.mode === 'subscribe') {
        stopTimer = setTimeout(function () {
            stopTimer = null;
            adapter.stop();
        }, 30000);
    }
}

function processMessage(message) {
    if (!message) return;

    // filter out double messages
    var json = JSON.stringify(message);
    if (lastMessageTime && lastMessageText === JSON.stringify(message) && new Date().getTime() - lastMessageTime < 1000) {
        adapter.log.debug('Filter out double message [first was for ' + (new Date().getTime() - lastMessageTime) + 'ms]: ' + json);
        return;
    }
    lastMessageTime = new Date().getTime();
    lastMessageText = json;

    if (stopTimer) clearTimeout(stopTimer);

    sendNotification(message);

    stop();
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
    stop();
}

function sendNotification(message, callback) {
    if (!message) message = {};
    
    if (!pushsafer) {
        if (adapter.config.privatekey) {
            pushsafer = new Pushsafer({
                k: adapter.config.privatekey
            });
        } else {
            adapter.log.error('Cannot send notification while not configured');
        }
    }

    if (!pushsafer) return;

    if (typeof message !== 'object') {
        message = {m: message};
    }

    message.t         = message.title     || adapter.config.title;
    message.s         = message.sound     || (adapter.config.sound ? adapter.config.sound : undefined);
    message.i         = message.icon      || adapter.config.icon;
    message.d         = message.device    || adapter.config.device;
    message.v         = message.vibration || adapter.config.vibration;

    adapter.log.info('Send pushsafer notification: ' + JSON.stringify(message));

    pushsafer.send(message, function (err, result) {
        if (err) {
            adapter.log.error('Cannot send notification: ' + JSON.stringify(err));
            if (callback) callback(err);
            return false;
        } else {
            if (callback) callback();
            return true;
        }
    });
}
