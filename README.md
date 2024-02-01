[![Build Status](https://travis-ci.org/aws/connect-rtc-js.svg)](https://travis-ci.org/aws/connect-rtc-js)

# Amazon Connect connect-rtc-js #
**connect-rtc.js** provides softphone support to AmazonConnect customers when they choose to directly integrate with AmazonConnect API and not using AmazonConnect web application.
It implements Amazon Connect WebRTC signaling protocol and integrates with browser WebRTC APIs to provide a simple contact session interface which can be integrated with [Amazon Connect StreamJS](https://github.com/aws/amazon-connect-streams) seemlessly.

## Usage ##
### Prebuilt releases
In the [gh-pages branch](https://github.com/aws/connect-rtc-js/tree/gh-pages) prebuilt ready to use files can be downloaded/linked directly.
### Build your own
1. Install latest LTS version of [NodeJS](https://nodejs.org)
2. Install [Grunt](https://gruntjs.com/)
3. `git clone https://github.com/aws/connect-rtc-js.git`
4. `cd connect-rtc-js`
5. `npm install`
5. To build:
    1. `grunt`
    2. Find build artifacts in **out** directory
6. To run unit tests:
    1. `npm test`
7. To run demo page:
    1. `grunt demo`
    2. Open the URL printed out by connect task, it looks like "Started connect web server on <https://localhost:9943>"
    3. Click **demo** folder

## Amazon Connect StreamJS integration ##
In a typical [amazon-connect-streams](https://github.com/aws/amazon-connect-streams) integration, connect-rtc-js is not required on parent page. Softphone call handling is done by embedded CCP.

However the following steps could further customize softphone experience.
1. Load connect-rtc-js along with amazon-connect-streams on parent page
2. Following [amazon-connect-streams instructions](https://github.com/aws/amazon-connect-streams/blob/master/README.md) to initialize CCP
3. Replace the softphone parameter (within the second parameter of ***connect.core.initCCP()***) with
    `allowFramedSoftphone: false`
    This would stop embedded CCP from handling softphone call
4. Add this line after initCCP
    `connect.core.initSoftphoneManager({allowFramedSoftphone: true});`
    This would allow your page to handle softphone call with the connect-rtc-js loaded by your page. ***allowFramedSoftphone*** is necessary if your page also lives in a frame, otherwise you can remove that parameter.
5. Add this HTML element to your web page
    `<audio id="remote-audio" autoplay></audio>`
    amazon-connect-streams library will look for this element and inject it into connect-rtc-js so that connect-rtc-js can play downstream audio through this element.
6. Customize it (some ideas below)
    * Customize audio device for `remote-audio` element
    * Look at all the documented APIs in [RtcSession](https://github.com/aws/connect-rtc-js/blob/master/src/js/rtc_session.js) class, modify [softphone.js](https://github.com/aws/amazon-connect-streams/blob/master/src/softphone.js) as you need
    * Revert step 4, add your own glue layer between amazon-connect-streams and connect-rtc-js (use [softphone.js](https://github.com/aws/amazon-connect-streams/blob/master/src/softphone.js) as a template)
