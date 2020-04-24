/**
 *
 *      ioBroker pushsafer Adapter
 *
 *      (c) 2016-2020 bluefox
 *      (c) 2019 appzer (pushsafer.com) 
 *
 *      MIT License
 *
 */

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */

'use strict';
const utils       = require('@iobroker/adapter-core'); // Get common adapter utils
const Pushsafer   = require('pushsafer-notifications');
const fs          = require('fs');
const adapterName = require('./package.json').name.split('.').pop();

let pushsafer;
let lastMessageTime = 0;
let lastMessageText = '';

let adapter;

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {name: adapterName});
    adapter = new utils.Adapter(options);

    adapter.on('message', obj => obj && obj.command === 'send' && obj.message && processMessage(obj.message, obj));

    adapter.on('ready', () => main());

    return adapter;
}

function processMessage(message, obj) {
    // filter out double messages
    const json = JSON.stringify(message);
    if (lastMessageTime && lastMessageText === JSON.stringify(message) && new Date().getTime() - lastMessageTime < 1000) {
        return adapter.log.debug('Filter out double message [first was for ' + (new Date().getTime() - lastMessageTime) + 'ms]: ' + json);
    }
    lastMessageTime = new Date().getTime();
    lastMessageText = json;

    sendNotification(message, error =>
        obj && obj.callback && adapter.sendTo(obj.from, obj.command, {error}, obj.callback));
}

function main() {
    // Adapter is listening on messages
}

function sendNotification(message, callback) {
    if (!message) message = {};
    let push;
    let isDelete = false;

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
            return callback && callback('Cannot send notification while not configured');
        }
    } else {
        push = pushsafer;
    }

    if (!push) {
        return;
    }

    if (typeof message !== 'object') {
        message = {message: message};
    }

    message.m         = message.message   || message.m  || '';
    message.t         = message.title     || message.t  || adapter.config.title;
    message.s         = message.sound     || message.s  || (adapter.config.sound ? adapter.config.sound : undefined);
    message.i         = message.icon      || message.i  || adapter.config.icon;
    message.d         = message.device    || message.d  || adapter.config.device;
    message.pr        = message.priority  || message.pr || adapter.config.priority;
    message.re        = message.retry     || message.re || adapter.config.retry;
    message.ex        = message.expire    || message.ex || adapter.config.expire;
    message.a         = message.answer    || message.a  || adapter.config.answer;
    message.v         = message.vibration || message.v  || adapter.config.vibration;
    message.l         = message.time2live || message.l  || adapter.config.time2live;
    message.c         = message.color     || message.c  || adapter.config.color || undefined;

    if (message.url) {
        message.u = message.url;
    }
    if (message.urlTitle) {
        message.ut = message.urlTitle;
    }

    let data;
    let parts;

    if (message.picture) {
        if (message.picture.substring(0, 5) !== 'data:') {
            try {
                data = Buffer.from(fs.readFileSync(message.picture)).toString('base64');
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
                data = Buffer.from(fs.readFileSync(message.picture2)).toString('base64');
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
                data = Buffer.from(fs.readFileSync(message.picture3)).toString('base64');
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
    if (message.priorty   !== undefined) delete message.priorty;
    if (message.retry     !== undefined) delete message.retry;
    if (message.expire    !== undefined) delete message.expire;
    if (message.answer    !== undefined) delete message.answer;
    if (message.picture   !== undefined) delete message.picture;
    if (message.picture2  !== undefined) delete message.picture2;
    if (message.picture3  !== undefined) delete message.picture3;
    if (message.url       !== undefined) delete message.url;
    if (message.urlTitle  !== undefined) delete message.urlTitle;
    if (message.time2live !== undefined) delete message.time2live;
    if (message.token     !== undefined) delete message.token;
    if (message.color     !== undefined) delete message.color;

    adapter.log.debug('Send pushsafer notification: ' + message.m);

    if (message.s  !== null && message.s  !== undefined) message.s  = message.s.toString();
    if (message.i  !== null && message.i  !== undefined) message.i  = message.i.toString();
    if (message.d  !== null && message.d  !== undefined) message.d  = message.d.toString();
    if (message.v  !== null && message.v  !== undefined) message.v  = message.v.toString();
    if (message.re !== null && message.re !== undefined) message.re = message.re.toString();
    if (message.ex !== null && message.ex !== undefined) message.ex = message.ex.toString();
    if (message.pr !== null && message.pr !== undefined) message.pr = message.pr.toString();
    if (message.a  !== null && message.a  !== undefined) message.a  = message.a.toString();
    if (message.l  !== null && message.l  !== undefined) message.l  = message.l.toString();
    if (message.l  !== null && message.l  !== undefined) message.l  = message.l.toString();
    if (message.c  !== null && message.c  !== undefined) message.c  = message.c.toString();

    push.send(message, (err, result) => {
        if (isDelete) {
            setTimeout(() => push = null, 500);
        }
        try {
            result = JSON.parse(result);
        } catch (e) {
            adapter.log.error('Cannot parse answer: ' + result);
        }

        if (err || result.error) {
            adapter.log.error('Cannot send notification: ' + JSON.stringify(err || result.error));
            callback && callback(err || result.error);
            return false;
        } else {
            callback && callback();
            return true;
        }
    });
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
