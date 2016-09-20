![Logo](admin/pushsafer.png)
ioBroker pushsafer Adapter
==============

[![NPM version](http://img.shields.io/npm/v/iobroker.pushsafer.svg)](https://www.npmjs.com/package/iobroker.pushsafer)
[![Downloads](https://img.shields.io/npm/dm/iobroker.pushsafer.svg)](https://www.npmjs.com/package/iobroker.pushsafer)

[![NPM](https://nodei.co/npm/iobroker.pushsafer.png?downloads=true)](https://nodei.co/npm/iobroker.pushsafer/)


Send pushsafer notifications from ioBroker.
Pushsafer.com supports iOS, Android, Windows 10 (Phone & Desktop) devices and Webpush (Chrome & Firefox)

## Configuration
First of all it is required an account on pushsafer with a [private key](https://www.pushsafer.com/)
![Pushsafer configuration](img/Screen0.png)

## Usage

To send notification from ScriptEngine just write: 

```javascript
// send notification to all instances of pushsafer adapter
sendTo("pushsafer", "message body");

// send notification to specific instance of pushsafer adapter
sendTo("pushsafer.1", "message body");

// To specify subject or other options
sendTo("pushsafer", {
   m:  'Test text',   // mandatory - your text message
   t:    'SweetHome', // optional  - your message's title, otherwise your app's name is used
   d:    '12',        // optional  - a device id or device group id (empty or a = all devices)
   s:    '2',         // optional  - a number betwenn 0-28 (see pushsafers API description)
   i:    '2',         // optional  - a number betwenn 1-98 (see pushsafers API description)
   v:    '0'          // optional  - a number betwenn 0-3 (see pushsafers API description)
});

```

You can find API description [here](https://www.pushsafer.com/en/pushapi)


## Changelog
### 0.1.1 (2016-09-20)
* fixed error with private key

### 0.1.0 (2016-08-28)
* filter out double messages

## License

The MIT License (MIT)

Copyright (c) 2014-2016 bluefox

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
