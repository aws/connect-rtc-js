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
TBD