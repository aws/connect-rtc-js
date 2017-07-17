(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
}

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
}

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  caps.headerExtensions.forEach(function(extension) {
    sdp += SDPUtils.writeExtmap(extension);
  });
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(5), 10);
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  var cname;
  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines an returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],2:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],3:[function(require,module,exports){
(function (global){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":2,"./lib/rng":3}],5:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'opera': // fallthrough as it uses chrome shims
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection) {
        logging('Chrome shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = chromeShim;

      chromeShim.shimGetUserMedia();
      chromeShim.shimMediaStream();
      chromeShim.shimSourceObject();
      chromeShim.shimPeerConnection();
      chromeShim.shimOnTrack();
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection) {
        logging('Firefox shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = firefoxShim;

      firefoxShim.shimGetUserMedia();
      firefoxShim.shimSourceObject();
      firefoxShim.shimPeerConnection();
      firefoxShim.shimOnTrack();
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection) {
        logging('MS edge shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = edgeShim;

      edgeShim.shimGetUserMedia();
      edgeShim.shimPeerConnection();
      break;
    case 'safari':
      if (!safariShim) {
        logging('Safari shim is not included in this adapter release.');
        return;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      module.exports.browserShim = safariShim;

      safariShim.shimGetUserMedia();
      break;
    default:
      logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":6,"./edge/edge_shim":8,"./firefox/firefox_shim":10,"./safari/safari_shim":12,"./utils":13}],6:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimMediaStream: function() {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          var self = this;
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var event = new Event('track');
              event.track = te.track;
              event.receiver = {track: te.track};
              event.streams = [e.stream];
              self.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    // The RTCPeerConnection object.
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      // Translate iceTransportPolicy to iceTransports,
      // see https://code.google.com/p/webrtc/issues/detail?id=4869
      logging('PeerConnection');
      if (pcConfig && pcConfig.iceTransportPolicy) {
        pcConfig.iceTransports = pcConfig.iceTransportPolicy;
      }

      var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
      var origGetStats = pc.getStats.bind(pc);
      pc.getStats = function(selector, successCallback, errorCallback) {
        var self = this;
        var args = arguments;

        // If selector is a function then we are in the old style stats so just
        // pass back the original getStats format to avoid breaking old users.
        if (arguments.length > 0 && typeof selector === 'function') {
          return origGetStats(selector, successCallback);
        }

        var fixChromeStats_ = function(response) {
          var standardReport = {};
          var reports = response.result();
          reports.forEach(function(report) {
            var standardStats = {
              id: report.id,
              timestamp: report.timestamp,
              type: report.type
            };
            report.names().forEach(function(name) {
              standardStats[name] = report.stat(name);
            });
            standardReport[standardStats.id] = standardStats;
          });

          return standardReport;
        };

        // shim getStats with maplike support
        var makeMapStats = function(stats, legacyStats) {
          var map = new Map(Object.keys(stats).map(function(key) {
            return[key, stats[key]];
          }));
          legacyStats = legacyStats || stats;
          Object.keys(legacyStats).forEach(function(key) {
            map[key] = legacyStats[key];
          });
          return map;
        };

        if (arguments.length >= 2) {
          var successCallbackWrapper_ = function(response) {
            args[1](makeMapStats(fixChromeStats_(response)));
          };

          return origGetStats.apply(this, [successCallbackWrapper_,
              arguments[0]]);
        }

        // promise-support
        return new Promise(function(resolve, reject) {
          if (args.length === 1 && typeof selector === 'object') {
            origGetStats.apply(self, [
              function(response) {
                resolve(makeMapStats(fixChromeStats_(response)));
              }, reject]);
          } else {
            // Preserve legacy chrome stats only on legacy access of stats obj
            origGetStats.apply(self, [
              function(response) {
                resolve(makeMapStats(fixChromeStats_(response),
                    response.result()));
              }, reject]);
          }
        }).then(successCallback, errorCallback);
      };

      return pc;
    };
    window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

    // wrap static methods. Currently just generateCertificate.
    if (webkitRTCPeerConnection.generateCertificate) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return webkitRTCPeerConnection.generateCertificate;
        }
      });
    }

    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = webkitRTCPeerConnection.prototype[method];
      webkitRTCPeerConnection.prototype[method] = function() {
        var self = this;
        if (arguments.length < 1 || (arguments.length === 1 &&
            typeof arguments[0] === 'object')) {
          var opts = arguments.length === 1 ? arguments[0] : undefined;
          return new Promise(function(resolve, reject) {
            nativeMethod.apply(self, [resolve, reject, opts]);
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = webkitRTCPeerConnection.prototype[method];
            webkitRTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var self = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(self, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = webkitRTCPeerConnection.prototype[method];
          webkitRTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null)
    var nativeAddIceCandidate =
        RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function() {
      if (arguments[0] === null) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":13,"./getusermedia":7}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && constraints.audio) {
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile, where it defaults to "user".
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode)) {
        delete constraints.video.facingMode;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          // Look for "back" in label, or use last cam (typically back cam).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var back = devices.find(function(d) {
              return d.label.toLowerCase().indexOf('back') !== -1;
            }) || (devices.length && devices[devices.length - 1]);
            if (back) {
              constraints.video.deviceId = face.exact ? {exact: back.deviceId} :
                                                        {ideal: back.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        ConstraintNotSatisfiedError: 'OverconstrainedError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        onError(shimError_(e));
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":13}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var browserDetails = require('../utils').browserDetails;

var edgeShim = {
  shimPeerConnection: function() {
    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed.
      var origMSTEnabled = Object.getOwnPropertyDescriptor(
          MediaStreamTrack.prototype, 'enabled');
      Object.defineProperty(MediaStreamTrack.prototype, 'enabled', {
        set: function(value) {
          origMSTEnabled.set.call(this, value);
          var ev = new Event('enabled');
          ev.enabled = value;
          this.dispatchEvent(ev);
        }
      });
    }

    window.RTCPeerConnection = function(config) {
      var self = this;

      var _eventTarget = document.createDocumentFragment();
      ['addEventListener', 'removeEventListener', 'dispatchEvent']
          .forEach(function(method) {
            self[method] = _eventTarget[method].bind(_eventTarget);
          });

      this.onicecandidate = null;
      this.onaddstream = null;
      this.ontrack = null;
      this.onremovestream = null;
      this.onsignalingstatechange = null;
      this.oniceconnectionstatechange = null;
      this.onnegotiationneeded = null;
      this.ondatachannel = null;

      this.localStreams = [];
      this.remoteStreams = [];
      this.getLocalStreams = function() {
        return self.localStreams;
      };
      this.getRemoteStreams = function() {
        return self.remoteStreams;
      };

      this.localDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.remoteDescription = new RTCSessionDescription({
        type: '',
        sdp: ''
      });
      this.signalingState = 'stable';
      this.iceConnectionState = 'new';
      this.iceGatheringState = 'new';

      this.iceOptions = {
        gatherPolicy: 'all',
        iceServers: []
      };
      if (config && config.iceTransportPolicy) {
        switch (config.iceTransportPolicy) {
          case 'all':
          case 'relay':
            this.iceOptions.gatherPolicy = config.iceTransportPolicy;
            break;
          case 'none':
            // FIXME: remove once implementation and spec have added this.
            throw new TypeError('iceTransportPolicy "none" not supported');
          default:
            // don't set iceTransportPolicy.
            break;
        }
      }
      this.usingBundle = config && config.bundlePolicy === 'max-bundle';

      if (config && config.iceServers) {
        // Edge does not like
        // 1) stun:
        // 2) turn: that does not have all of turn:host:port?transport=udp
        // 3) turn: with ipv6 addresses
        var iceServers = JSON.parse(JSON.stringify(config.iceServers));
        this.iceOptions.iceServers = iceServers.filter(function(server) {
          if (server && server.urls) {
            var urls = server.urls;
            if (typeof urls === 'string') {
              urls = [urls];
            }
            urls = urls.filter(function(url) {
              return (url.indexOf('turn:') === 0 &&
                  url.indexOf('transport=udp') !== -1 &&
                  url.indexOf('turn:[') === -1) ||
                  (url.indexOf('stun:') === 0 &&
                    browserDetails.version >= 14393);
            })[0];
            return !!urls;
          }
          return false;
        });
      }
      this._config = config;

      // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
      // everything that is needed to describe a SDP m-line.
      this.transceivers = [];

      // since the iceGatherer is currently created in createOffer but we
      // must not emit candidates until after setLocalDescription we buffer
      // them in this array.
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
      var self = this;
      var sections = SDPUtils.splitSections(self.localDescription.sdp);
      // FIXME: need to apply ice candidates in a way which is async but
      // in-order
      this._localIceCandidatesBuffer.forEach(function(event) {
        var end = !event.candidate || Object.keys(event.candidate).length === 0;
        if (end) {
          for (var j = 1; j < sections.length; j++) {
            if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
              sections[j] += 'a=end-of-candidates\r\n';
            }
          }
        } else if (event.candidate.candidate.indexOf('typ endOfCandidates')
            === -1) {
          sections[event.candidate.sdpMLineIndex + 1] +=
              'a=' + event.candidate.candidate + '\r\n';
        }
        self.localDescription.sdp = sections.join('');
        self.dispatchEvent(event);
        if (self.onicecandidate !== null) {
          self.onicecandidate(event);
        }
        if (!event.candidate && self.iceGatheringState !== 'complete') {
          var complete = self.transceivers.every(function(transceiver) {
            return transceiver.iceGatherer &&
                transceiver.iceGatherer.state === 'completed';
          });
          if (complete) {
            self.iceGatheringState = 'complete';
          }
        }
      });
      this._localIceCandidatesBuffer = [];
    };

    window.RTCPeerConnection.prototype.getConfiguration = function() {
      return this._config;
    };

    window.RTCPeerConnection.prototype.addStream = function(stream) {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      this.localStreams.push(clonedStream);
      this._maybeFireNegotiationNeeded();
    };

    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var idx = this.localStreams.indexOf(stream);
      if (idx > -1) {
        this.localStreams.splice(idx, 1);
        this._maybeFireNegotiationNeeded();
      }
    };

    window.RTCPeerConnection.prototype.getSenders = function() {
      return this.transceivers.filter(function(transceiver) {
        return !!transceiver.rtpSender;
      })
      .map(function(transceiver) {
        return transceiver.rtpSender;
      });
    };

    window.RTCPeerConnection.prototype.getReceivers = function() {
      return this.transceivers.filter(function(transceiver) {
        return !!transceiver.rtpReceiver;
      })
      .map(function(transceiver) {
        return transceiver.rtpReceiver;
      });
    };

    // Determines the intersection of local and remote capabilities.
    window.RTCPeerConnection.prototype._getCommonCapabilities =
        function(localCapabilities, remoteCapabilities) {
          var commonCapabilities = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: []
          };
          localCapabilities.codecs.forEach(function(lCodec) {
            for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
              var rCodec = remoteCapabilities.codecs[i];
              if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                  lCodec.clockRate === rCodec.clockRate) {
                // number of channels is the highest common number of channels
                rCodec.numChannels = Math.min(lCodec.numChannels,
                    rCodec.numChannels);
                // push rCodec so we reply with offerer payload type
                commonCapabilities.codecs.push(rCodec);

                // determine common feedback mechanisms
                rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                  for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                    if (lCodec.rtcpFeedback[j].type === fb.type &&
                        lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                      return true;
                    }
                  }
                  return false;
                });
                // FIXME: also need to determine .parameters
                //  see https://github.com/openpeer/ortc/issues/569
                break;
              }
            }
          });

          localCapabilities.headerExtensions
              .forEach(function(lHeaderExtension) {
                for (var i = 0; i < remoteCapabilities.headerExtensions.length;
                     i++) {
                  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                  if (lHeaderExtension.uri === rHeaderExtension.uri) {
                    commonCapabilities.headerExtensions.push(rHeaderExtension);
                    break;
                  }
                }
              });

          // FIXME: fecMechanisms
          return commonCapabilities;
        };

    // Create ICE gatherer, ICE transport and DTLS transport.
    window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
        function(mid, sdpMLineIndex) {
          var self = this;
          var iceGatherer = new RTCIceGatherer(self.iceOptions);
          var iceTransport = new RTCIceTransport(iceGatherer);
          iceGatherer.onlocalcandidate = function(evt) {
            var event = new Event('icecandidate');
            event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

            var cand = evt.candidate;
            var end = !cand || Object.keys(cand).length === 0;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === undefined) {
                iceGatherer.state = 'completed';
              }

              // Emit a candidate with type endOfCandidates to make the samples
              // work. Edge requires addIceCandidate with this empty candidate
              // to start checking. The real solution is to signal
              // end-of-candidates to the other side when getting the null
              // candidate but some apps (like the samples) don't do that.
              event.candidate.candidate =
                  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
            } else {
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
              event.candidate.candidate = SDPUtils.writeCandidate(cand);
            }

            // update local description.
            var sections = SDPUtils.splitSections(self.localDescription.sdp);
            if (event.candidate.candidate.indexOf('typ endOfCandidates')
                === -1) {
              sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=' + event.candidate.candidate + '\r\n';
            } else {
              sections[event.candidate.sdpMLineIndex + 1] +=
                  'a=end-of-candidates\r\n';
            }
            self.localDescription.sdp = sections.join('');

            var complete = self.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer &&
                  transceiver.iceGatherer.state === 'completed';
            });

            // Emit candidate if localDescription is set.
            // Also emits null candidate when all gatherers are complete.
            switch (self.iceGatheringState) {
              case 'new':
                self._localIceCandidatesBuffer.push(event);
                if (end && complete) {
                  self._localIceCandidatesBuffer.push(
                      new Event('icecandidate'));
                }
                break;
              case 'gathering':
                self._emitBufferedCandidates();
                self.dispatchEvent(event);
                if (self.onicecandidate !== null) {
                  self.onicecandidate(event);
                }
                if (complete) {
                  self.dispatchEvent(new Event('icecandidate'));
                  if (self.onicecandidate !== null) {
                    self.onicecandidate(new Event('icecandidate'));
                  }
                  self.iceGatheringState = 'complete';
                }
                break;
              case 'complete':
                // should not happen... currently!
                break;
              default: // no-op.
                break;
            }
          };
          iceTransport.onicestatechange = function() {
            self._updateConnectionState();
          };

          var dtlsTransport = new RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function() {
            self._updateConnectionState();
          };
          dtlsTransport.onerror = function() {
            // onerror does not set state to failed by itself.
            dtlsTransport.state = 'failed';
            self._updateConnectionState();
          };

          return {
            iceGatherer: iceGatherer,
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

    // Start the RTP Sender and Receiver for a transceiver.
    window.RTCPeerConnection.prototype._transceive = function(transceiver,
        send, recv) {
      var params = this._getCommonCapabilities(transceiver.localCapabilities,
          transceiver.remoteCapabilities);
      if (send && transceiver.rtpSender) {
        params.encodings = transceiver.sendEncodingParameters;
        params.rtcp = {
          cname: SDPUtils.localCName
        };
        if (transceiver.recvEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
        }
        transceiver.rtpSender.send(params);
      }
      if (recv && transceiver.rtpReceiver) {
        // remove RTX field in Edge 14942
        if (transceiver.kind === 'video'
            && transceiver.recvEncodingParameters) {
          transceiver.recvEncodingParameters.forEach(function(p) {
            delete p.rtx;
          });
        }
        params.encodings = transceiver.recvEncodingParameters;
        params.rtcp = {
          cname: transceiver.cname
        };
        if (transceiver.sendEncodingParameters.length) {
          params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
        }
        transceiver.rtpReceiver.receive(params);
      }
    };

    window.RTCPeerConnection.prototype.setLocalDescription =
        function(description) {
          var self = this;
          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // FIXME: What was the purpose of this empty if statement?
            // if (!this._pendingOffer) {
            // } else {
            if (this._pendingOffer) {
              // VERY limited support for SDP munging. Limited to:
              // * changing the order of codecs
              sections = SDPUtils.splitSections(description.sdp);
              sessionpart = sections.shift();
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var caps = SDPUtils.parseRtpParameters(mediaSection);
                self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
              });
              this.transceivers = this._pendingOffer;
              delete this._pendingOffer;
            }
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(self.remoteDescription.sdp);
            sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart,
                'a=ice-lite').length > 0;
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var transceiver = self.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;

              var rejected = mediaSection.split('\n', 1)[0]
                  .split(' ', 2)[1] === '0';

              if (!rejected && !transceiver.isDatachannel) {
                var remoteIceParameters = SDPUtils.getIceParameters(
                    mediaSection, sessionpart);
                if (isIceLite) {
                  var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                  .map(function(cand) {
                    return SDPUtils.parseCandidate(cand);
                  })
                  .filter(function(cand) {
                    return cand.component === '1';
                  });
                  // ice-lite only includes host candidates in the SDP so we can
                  // use setRemoteCandidates (which implies an
                  // RTCIceCandidateComplete)
                  if (cands.length) {
                    iceTransport.setRemoteCandidates(cands);
                  }
                }
                var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                    mediaSection, sessionpart);
                if (isIceLite) {
                  remoteDtlsParameters.role = 'server';
                }

                if (!self.usingBundle || sdpMLineIndex === 0) {
                  iceTransport.start(iceGatherer, remoteIceParameters,
                      isIceLite ? 'controlling' : 'controlled');
                  dtlsTransport.start(remoteDtlsParameters);
                }

                // Calculate intersection of capabilities.
                var params = self._getCommonCapabilities(localCapabilities,
                    remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                self._transceive(transceiver,
                    params.codecs.length > 0,
                    false);
              }
            });
          }

          this.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-local-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }

          // If a success callback was provided, emit ICE candidates after it
          // has been executed. Otherwise, emit callback after the Promise is
          // resolved.
          var hasCallback = arguments.length > 1 &&
            typeof arguments[1] === 'function';
          if (hasCallback) {
            var cb = arguments[1];
            window.setTimeout(function() {
              cb();
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              self._emitBufferedCandidates();
            }, 0);
          }
          var p = Promise.resolve();
          p.then(function() {
            if (!hasCallback) {
              if (self.iceGatheringState === 'new') {
                self.iceGatheringState = 'gathering';
              }
              // Usually candidates will be emitted earlier.
              window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
            }
          });
          return p;
        };

    window.RTCPeerConnection.prototype.setRemoteDescription =
        function(description) {
          var self = this;
          var stream = new MediaStream();
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          var isIceLite = SDPUtils.matchPrefix(sessionpart,
              'a=ice-lite').length > 0;
          this.usingBundle = SDPUtils.matchPrefix(sessionpart,
              'a=group:BUNDLE ').length > 0;
          sections.forEach(function(mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var mline = lines[0].substr(2).split(' ');
            var kind = mline[0];
            var rejected = mline[1] === '0';
            var direction = SDPUtils.getDirection(mediaSection, sessionpart);

            var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
            if (mid.length) {
              mid = mid[0].substr(6);
            } else {
              mid = SDPUtils.generateIdentifier();
            }

            // Reject datachannels which are not implemented yet.
            if (kind === 'application' && mline[2] === 'DTLS/SCTP') {
              self.transceivers[sdpMLineIndex] = {
                mid: mid,
                isDatachannel: true
              };
              return;
            }

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpSender;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                  sessionpart);
              remoteDtlsParameters.role = 'client';
            }
            recvEncodingParameters =
                SDPUtils.parseRtpEncodingParameters(mediaSection);

            var cname;
            // Gets the first SSRC. Note that with RTX there might be multiple
            // SSRCs.
            var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                .map(function(line) {
                  return SDPUtils.parseSsrcMedia(line);
                })
                .filter(function(obj) {
                  return obj.attribute === 'cname';
                })[0];
            if (remoteSsrc) {
              cname = remoteSsrc.value;
            }

            var isComplete = SDPUtils.matchPrefix(mediaSection,
                'a=end-of-candidates', sessionpart).length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                .map(function(cand) {
                  return SDPUtils.parseCandidate(cand);
                })
                .filter(function(cand) {
                  return cand.component === '1';
                });
            if (description.type === 'offer' && !rejected) {
              var transports = self.usingBundle && sdpMLineIndex > 0 ? {
                iceGatherer: self.transceivers[0].iceGatherer,
                iceTransport: self.transceivers[0].iceTransport,
                dtlsTransport: self.transceivers[0].dtlsTransport
              } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

              if (isComplete) {
                transports.iceTransport.setRemoteCandidates(cands);
              }

              localCapabilities = RTCRtpReceiver.getCapabilities(kind);

              // filter RTX until additional stuff needed for RTX is implemented
              // in adapter.js
              localCapabilities.codecs = localCapabilities.codecs.filter(
                  function(codec) {
                    return codec.name !== 'rtx';
                  });

              sendEncodingParameters = [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

              track = rtpReceiver.track;
              receiverList.push([track, rtpReceiver]);
              // FIXME: not correct when there are multiple streams but that is
              // not currently supported in this shim.
              stream.addTrack(track);

              // FIXME: look at direction.
              if (self.localStreams.length > 0 &&
                  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                var localTrack;
                if (kind === 'audio') {
                  localTrack = self.localStreams[0].getAudioTracks()[0];
                } else if (kind === 'video') {
                  localTrack = self.localStreams[0].getVideoTracks()[0];
                }
                if (localTrack) {
                  rtpSender = new RTCRtpSender(localTrack,
                      transports.dtlsTransport);
                }
              }

              self.transceivers[sdpMLineIndex] = {
                iceGatherer: transports.iceGatherer,
                iceTransport: transports.iceTransport,
                dtlsTransport: transports.dtlsTransport,
                localCapabilities: localCapabilities,
                remoteCapabilities: remoteCapabilities,
                rtpSender: rtpSender,
                rtpReceiver: rtpReceiver,
                kind: kind,
                mid: mid,
                cname: cname,
                sendEncodingParameters: sendEncodingParameters,
                recvEncodingParameters: recvEncodingParameters
              };
              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              self._transceive(self.transceivers[sdpMLineIndex],
                  false,
                  direction === 'sendrecv' || direction === 'sendonly');
            } else if (description.type === 'answer' && !rejected) {
              transceiver = self.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpSender = transceiver.rtpSender;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              self.transceivers[sdpMLineIndex].recvEncodingParameters =
                  recvEncodingParameters;
              self.transceivers[sdpMLineIndex].remoteCapabilities =
                  remoteCapabilities;
              self.transceivers[sdpMLineIndex].cname = cname;

              if ((isIceLite || isComplete) && cands.length) {
                iceTransport.setRemoteCandidates(cands);
              }
              if (!self.usingBundle || sdpMLineIndex === 0) {
                iceTransport.start(iceGatherer, remoteIceParameters,
                    'controlling');
                dtlsTransport.start(remoteDtlsParameters);
              }

              self._transceive(transceiver,
                  direction === 'sendrecv' || direction === 'recvonly',
                  direction === 'sendrecv' || direction === 'sendonly');

              if (rtpReceiver &&
                  (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                receiverList.push([track, rtpReceiver]);
                stream.addTrack(track);
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          this.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          switch (description.type) {
            case 'offer':
              this._updateSignalingState('have-remote-offer');
              break;
            case 'answer':
              this._updateSignalingState('stable');
              break;
            default:
              throw new TypeError('unsupported type "' + description.type +
                  '"');
          }
          if (stream.getTracks().length) {
            self.remoteStreams.push(stream);
            window.setTimeout(function() {
              var event = new Event('addstream');
              event.stream = stream;
              self.dispatchEvent(event);
              if (self.onaddstream !== null) {
                window.setTimeout(function() {
                  self.onaddstream(event);
                }, 0);
              }

              receiverList.forEach(function(item) {
                var track = item[0];
                var receiver = item[1];
                var trackEvent = new Event('track');
                trackEvent.track = track;
                trackEvent.receiver = receiver;
                trackEvent.streams = [stream];
                self.dispatchEvent(event);
                if (self.ontrack !== null) {
                  window.setTimeout(function() {
                    self.ontrack(trackEvent);
                  }, 0);
                }
              });
            }, 0);
          }
          if (arguments.length > 1 && typeof arguments[1] === 'function') {
            window.setTimeout(arguments[1], 0);
          }
          return Promise.resolve();
        };

    window.RTCPeerConnection.prototype.close = function() {
      this.transceivers.forEach(function(transceiver) {
        /* not yet
        if (transceiver.iceGatherer) {
          transceiver.iceGatherer.close();
        }
        */
        if (transceiver.iceTransport) {
          transceiver.iceTransport.stop();
        }
        if (transceiver.dtlsTransport) {
          transceiver.dtlsTransport.stop();
        }
        if (transceiver.rtpSender) {
          transceiver.rtpSender.stop();
        }
        if (transceiver.rtpReceiver) {
          transceiver.rtpReceiver.stop();
        }
      });
      // FIXME: clean up tracks, local streams, remote streams, etc
      this._updateSignalingState('closed');
    };

    // Update the signaling state.
    window.RTCPeerConnection.prototype._updateSignalingState =
        function(newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this.dispatchEvent(event);
          if (this.onsignalingstatechange !== null) {
            this.onsignalingstatechange(event);
          }
        };

    // Determine whether to fire the negotiationneeded event.
    window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
        function() {
          // Fire away (for now).
          var event = new Event('negotiationneeded');
          this.dispatchEvent(event);
          if (this.onnegotiationneeded !== null) {
            this.onnegotiationneeded(event);
          }
        };

    // Update the connection state.
    window.RTCPeerConnection.prototype._updateConnectionState = function() {
      var self = this;
      var newState;
      var states = {
        'new': 0,
        closed: 0,
        connecting: 0,
        checking: 0,
        connected: 0,
        completed: 0,
        failed: 0
      };
      this.transceivers.forEach(function(transceiver) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      });
      // ICETransport.completed and connected are the same for this purpose.
      states.connected += states.completed;

      newState = 'new';
      if (states.failed > 0) {
        newState = 'failed';
      } else if (states.connecting > 0 || states.checking > 0) {
        newState = 'connecting';
      } else if (states.disconnected > 0) {
        newState = 'disconnected';
      } else if (states.new > 0) {
        newState = 'new';
      } else if (states.connected > 0 || states.completed > 0) {
        newState = 'connected';
      }

      if (newState !== self.iceConnectionState) {
        self.iceConnectionState = newState;
        var event = new Event('iceconnectionstatechange');
        this.dispatchEvent(event);
        if (this.oniceconnectionstatechange !== null) {
          this.oniceconnectionstatechange(event);
        }
      }
    };

    window.RTCPeerConnection.prototype.createOffer = function() {
      var self = this;
      if (this._pendingOffer) {
        throw new Error('createOffer called while there is a pending offer.');
      }
      var offerOptions;
      if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        offerOptions = arguments[0];
      } else if (arguments.length === 3) {
        offerOptions = arguments[2];
      }

      var tracks = [];
      var numAudioTracks = 0;
      var numVideoTracks = 0;
      // Default to sendrecv.
      if (this.localStreams.length) {
        numAudioTracks = this.localStreams[0].getAudioTracks().length;
        numVideoTracks = this.localStreams[0].getVideoTracks().length;
      }
      // Determine number of audio and video tracks we need to send/recv.
      if (offerOptions) {
        // Reject Chrome legacy constraints.
        if (offerOptions.mandatory || offerOptions.optional) {
          throw new TypeError(
              'Legacy mandatory/optional constraints not supported.');
        }
        if (offerOptions.offerToReceiveAudio !== undefined) {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
        if (offerOptions.offerToReceiveVideo !== undefined) {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
      if (this.localStreams.length) {
        // Push local streams.
        this.localStreams[0].getTracks().forEach(function(track) {
          tracks.push({
            kind: track.kind,
            track: track,
            wantReceive: track.kind === 'audio' ?
                numAudioTracks > 0 : numVideoTracks > 0
          });
          if (track.kind === 'audio') {
            numAudioTracks--;
          } else if (track.kind === 'video') {
            numVideoTracks--;
          }
        });
      }
      // Create M-lines for recvonly streams.
      while (numAudioTracks > 0 || numVideoTracks > 0) {
        if (numAudioTracks > 0) {
          tracks.push({
            kind: 'audio',
            wantReceive: true
          });
          numAudioTracks--;
        }
        if (numVideoTracks > 0) {
          tracks.push({
            kind: 'video',
            wantReceive: true
          });
          numVideoTracks--;
        }
      }

      var sdp = SDPUtils.writeSessionBoilerplate();
      var transceivers = [];
      tracks.forEach(function(mline, sdpMLineIndex) {
        // For each track, create an ice gatherer, ice transport,
        // dtls transport, potentially rtpsender and rtpreceiver.
        var track = mline.track;
        var kind = mline.kind;
        var mid = SDPUtils.generateIdentifier();

        var transports = self.usingBundle && sdpMLineIndex > 0 ? {
          iceGatherer: transceivers[0].iceGatherer,
          iceTransport: transceivers[0].iceTransport,
          dtlsTransport: transceivers[0].dtlsTransport
        } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

        var localCapabilities = RTCRtpSender.getCapabilities(kind);
        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
        localCapabilities.codecs.forEach(function(codec) {
          // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
          // by adding level-asymmetry-allowed=1
          if (codec.name === 'H264' &&
              codec.parameters['level-asymmetry-allowed'] === undefined) {
            codec.parameters['level-asymmetry-allowed'] = '1';
          }
        });

        var rtpSender;
        var rtpReceiver;

        // generate an ssrc now, to be used later in rtpSender.send
        var sendEncodingParameters = [{
          ssrc: (2 * sdpMLineIndex + 1) * 1001
        }];
        if (track) {
          rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
        }

        if (mline.wantReceive) {
          rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
        }

        transceivers[sdpMLineIndex] = {
          iceGatherer: transports.iceGatherer,
          iceTransport: transports.iceTransport,
          dtlsTransport: transports.dtlsTransport,
          localCapabilities: localCapabilities,
          remoteCapabilities: null,
          rtpSender: rtpSender,
          rtpReceiver: rtpReceiver,
          kind: kind,
          mid: mid,
          sendEncodingParameters: sendEncodingParameters,
          recvEncodingParameters: null
        };
      });
      if (this.usingBundle) {
        sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
          return t.mid;
        }).join(' ') + '\r\n';
      }
      tracks.forEach(function(mline, sdpMLineIndex) {
        var transceiver = transceivers[sdpMLineIndex];
        sdp += SDPUtils.writeMediaSection(transceiver,
            transceiver.localCapabilities, 'offer', self.localStreams[0]);
      });

      this._pendingOffer = transceivers;
      var desc = new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.createAnswer = function() {
      var self = this;

      var sdp = SDPUtils.writeSessionBoilerplate();
      if (this.usingBundle) {
        sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
          return t.mid;
        }).join(' ') + '\r\n';
      }
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.isDatachannel) {
          sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
              'c=IN IP4 0.0.0.0\r\n' +
              'a=mid:' + transceiver.mid + '\r\n';
          return;
        }
        // Calculate intersection of capabilities.
        var commonCapabilities = self._getCommonCapabilities(
            transceiver.localCapabilities,
            transceiver.remoteCapabilities);

        sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
            'answer', self.localStreams[0]);
      });

      var desc = new RTCSessionDescription({
        type: 'answer',
        sdp: sdp
      });
      if (arguments.length && typeof arguments[0] === 'function') {
        window.setTimeout(arguments[0], 0, desc);
      }
      return Promise.resolve(desc);
    };

    window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
      if (candidate === null) {
        this.transceivers.forEach(function(transceiver) {
          transceiver.iceTransport.addRemoteCandidate({});
        });
      } else {
        var mLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < this.transceivers.length; i++) {
            if (this.transceivers[i].mid === candidate.sdpMid) {
              mLineIndex = i;
              break;
            }
          }
        }
        var transceiver = this.transceivers[mLineIndex];
        if (transceiver) {
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return;
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component !== '1') {
            return;
          }
          // A dirty hack to make samples work.
          if (cand.type === 'endOfCandidates') {
            cand = {};
          }
          transceiver.iceTransport.addRemoteCandidate(cand);

          // update the remoteDescription.
          var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
          sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
              : 'a=end-of-candidates') + '\r\n';
          this.remoteDescription.sdp = sections.join('');
        }
      }
      if (arguments.length > 1 && typeof arguments[1] === 'function') {
        window.setTimeout(arguments[1], 0);
      }
      return Promise.resolve();
    };

    window.RTCPeerConnection.prototype.getStats = function() {
      var promises = [];
      this.transceivers.forEach(function(transceiver) {
        ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
            'dtlsTransport'].forEach(function(method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
      });
      var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
          arguments[1];
      return new Promise(function(resolve) {
        // shim getStats with maplike support
        var results = new Map();
        Promise.all(promises).then(function(res) {
          res.forEach(function(result) {
            Object.keys(result).forEach(function(id) {
              results.set(id, result[id]);
              results[id] = result[id];
            });
          });
          if (cb) {
            window.setTimeout(cb, 0, results);
          }
          resolve(results);
        });
      });
    };
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":13,"./getusermedia":9,"sdp":1}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
  },

  shimSourceObject: function() {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function() {
    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = mozRTCSessionDescription;
      window.RTCIceCandidate = mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null)
    var nativeAddIceCandidate =
        RTCPeerConnection.prototype.addIceCandidate;
    RTCPeerConnection.prototype.addIceCandidate = function() {
      if (arguments[0] === null) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var nativeGetStats = RTCPeerConnection.prototype.getStats;
    RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          return makeMapStats(stats);
        })
        .then(onSucc, onErr);
    };
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":13,"./getusermedia":11}],11:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
    return {
      name: {
        SecurityError: 'NotAllowedError',
        PermissionDeniedError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    console.warn('navigator.getUserMedia has been replaced by ' +
                 'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":13}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
    navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{}],13:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function() {
    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/([0-9]+)\./, 1);

    // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/([0-9]+)\./, 2);

      // Safari or unknown webkit-based
      // for the time being Safari has support for MediaStreams but not webRTC
      } else {
        // Safari UA substrings of interest for reference:
        // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
        // - safari UI version:        Version/9.0.3 (unique to Safari)
        // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
        //
        // if the webkit version and safari UI webkit versions are equals,
        // ... this is a stable version.
        //
        // only the internal webkit version is important today to know if
        // media streams are supported
        //
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/([0-9]+)\./, 1);

        // unknown webkit-based browser
        } else {
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }

    // Edge.
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);

    // Default fallthrough: not supported.
    } else {
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}],14:[function(require,module,exports){
(function (global){
'use strict';

require('webrtc-adapter');

var _rtc_session = require('./rtc_session');

var _rtc_session2 = _interopRequireDefault(_rtc_session);

var _rtc_const = require('./rtc_const');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @license
 * License info for uuid module assembled into js bundle:
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2010-2016 Robert Kieffer and other contributors
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
global.connect = global.connect || {}; /**
                                        * @license
                                        * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                        *
                                        * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
                                        *
                                        *   http://aws.amazon.com/asl/
                                        *
                                        * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
                                        */
/**
 * @license
 * License info for webrtc-adapter module assembled into js bundle:
 * 
 * Copyright (c) 2014, The WebRTC project authors. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 
 * Neither the name of Google nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * @license
 * License info for sdp module assembled into js bundle:
 * 
 * See https://www.npmjs.com/package/sdp
 */

global.connect.RTCSession = _rtc_session2.default;
global.connect.RTCErrors = _rtc_const.RTC_ERRORS;

global.lily = global.lily || {};
global.lily.RTCSession = _rtc_session2.default;
global.lily.RTCErrors = _rtc_const.RTC_ERRORS;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./rtc_const":16,"./rtc_session":17,"webrtc-adapter":5}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
var TimeoutExceptionName = exports.TimeoutExceptionName = 'Timeout';

var Timeout = exports.Timeout = function (_Error) {
    _inherits(Timeout, _Error);

    function Timeout(msg) {
        _classCallCheck(this, Timeout);

        var _this = _possibleConstructorReturn(this, (Timeout.__proto__ || Object.getPrototypeOf(Timeout)).call(this, msg));

        _this.name = TimeoutExceptionName;
        return _this;
    }

    return Timeout;
}(Error);

var GumTimeoutExceptionName = exports.GumTimeoutExceptionName = 'GumTimeout';

var GumTimeout = exports.GumTimeout = function (_Timeout) {
    _inherits(GumTimeout, _Timeout);

    function GumTimeout(msg) {
        _classCallCheck(this, GumTimeout);

        var _this2 = _possibleConstructorReturn(this, (GumTimeout.__proto__ || Object.getPrototypeOf(GumTimeout)).call(this, msg));

        _this2.name = GumTimeoutExceptionName;
        return _this2;
    }

    return GumTimeout;
}(Timeout);

var IllegalParametersExceptionName = exports.IllegalParametersExceptionName = 'IllegalParameters';

var IllegalParameters = exports.IllegalParameters = function (_Error2) {
    _inherits(IllegalParameters, _Error2);

    function IllegalParameters(msg) {
        _classCallCheck(this, IllegalParameters);

        var _this3 = _possibleConstructorReturn(this, (IllegalParameters.__proto__ || Object.getPrototypeOf(IllegalParameters)).call(this, msg));

        _this3.name = IllegalParametersExceptionName;
        return _this3;
    }

    return IllegalParameters;
}(Error);

var IllegalStateExceptionName = exports.IllegalStateExceptionName = 'IllegalState';

var IllegalState = exports.IllegalState = function (_Error3) {
    _inherits(IllegalState, _Error3);

    function IllegalState(msg) {
        _classCallCheck(this, IllegalState);

        var _this4 = _possibleConstructorReturn(this, (IllegalState.__proto__ || Object.getPrototypeOf(IllegalState)).call(this, msg));

        _this4.name = IllegalStateExceptionName;
        return _this4;
    }

    return IllegalState;
}(Error);

var UnsupportedOperationExceptionName = exports.UnsupportedOperationExceptionName = 'UnsupportedOperation';

var UnsupportedOperation = exports.UnsupportedOperation = function (_Error4) {
    _inherits(UnsupportedOperation, _Error4);

    function UnsupportedOperation(msg) {
        _classCallCheck(this, UnsupportedOperation);

        var _this5 = _possibleConstructorReturn(this, (UnsupportedOperation.__proto__ || Object.getPrototypeOf(UnsupportedOperation)).call(this, msg));

        _this5.name = UnsupportedOperationExceptionName;
        return _this5;
    }

    return UnsupportedOperation;
}(Error);

var BusyExceptionName = exports.BusyExceptionName = 'BusyException';

var BusyException = exports.BusyException = function (_Error5) {
    _inherits(BusyException, _Error5);

    function BusyException(msg) {
        _classCallCheck(this, BusyException);

        var _this6 = _possibleConstructorReturn(this, (BusyException.__proto__ || Object.getPrototypeOf(BusyException)).call(this, msg));

        _this6.name = BusyExceptionName;
        return _this6;
    }

    return BusyException;
}(Error);

var CallNotFoundExceptionName = exports.CallNotFoundExceptionName = 'CallNotFoundException';

var CallNotFoundException = exports.CallNotFoundException = function (_Error6) {
    _inherits(CallNotFoundException, _Error6);

    function CallNotFoundException(msg) {
        _classCallCheck(this, CallNotFoundException);

        var _this7 = _possibleConstructorReturn(this, (CallNotFoundException.__proto__ || Object.getPrototypeOf(CallNotFoundException)).call(this, msg));

        _this7.name = CallNotFoundExceptionName;
        return _this7;
    }

    return CallNotFoundException;
}(Error);

var UnknownSignalingErrorName = exports.UnknownSignalingErrorName = 'UnknownSignalingError';

var UnknownSignalingError = exports.UnknownSignalingError = function (_Error7) {
    _inherits(UnknownSignalingError, _Error7);

    function UnknownSignalingError() {
        _classCallCheck(this, UnknownSignalingError);

        var _this8 = _possibleConstructorReturn(this, (UnknownSignalingError.__proto__ || Object.getPrototypeOf(UnknownSignalingError)).call(this));

        _this8.name = UnknownSignalingErrorName;
        return _this8;
    }

    return UnknownSignalingError;
}(Error);

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Timeout waiting for server response to accept/hangup request.
 */
var MAX_ACCEPT_BYE_DELAY_MS = exports.MAX_ACCEPT_BYE_DELAY_MS = 2000;
/**
 * Timeout waiting for server response to invite.
 */
var MAX_INVITE_DELAY_MS = exports.MAX_INVITE_DELAY_MS = 5000;
/**
 *  Default timeout on opening WebSocket connection.
 */
var DEFAULT_CONNECT_TIMEOUT_MS = exports.DEFAULT_CONNECT_TIMEOUT_MS = 10000;
/**
 * Default ice collection timeout in milliseconds.
 */
var DEFAULT_ICE_TIMEOUT_MS = exports.DEFAULT_ICE_TIMEOUT_MS = 8000;
/**
 * Default gum timeout in milliseconds to be enforced during start of a call.
 */
var DEFAULT_GUM_TIMEOUT_MS = exports.DEFAULT_GUM_TIMEOUT_MS = 10000;

/**
 * RTC error names.
 */
var RTC_ERRORS = exports.RTC_ERRORS = {
  ICE_COLLECTION_TIMEOUT: 'Ice Collection Timeout',
  USER_BUSY: 'User Busy',
  SIGNALLING_CONNECTION_FAILURE: 'Signalling Connection Failure',
  SIGNALLING_HANDSHAKE_FAILURE: 'Signalling Handshake Failure',
  SET_REMOTE_DESCRIPTION_FAILURE: 'Set Remote Description Failure',
  CREATE_OFFER_FAILURE: 'Create Offer Failure',
  SET_LOCAL_DESCRIPTION_FAILURE: 'Set Local Description Failure',
  INVALID_REMOTE_SDP: 'Invalid Remote SDP',
  NO_REMOTE_ICE_CANDIDATE: 'No Remote ICE Candidate',
  GUM_TIMEOUT_FAILURE: 'GUM Timeout Failure',
  GUM_OTHER_FAILURE: 'GUM Other Failure',
  CALL_NOT_FOUND: 'Call Not Found'
};

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailedState = exports.DisconnectedState = exports.CleanUpState = exports.TalkingState = exports.AcceptState = exports.InviteAnswerState = exports.ConnectSignalingAndIceCollectionState = exports.SetLocalSessionDescriptionState = exports.CreateOfferState = exports.GrabLocalMediaState = exports.RTCSessionState = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   http://aws.amazon.com/asl/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _utils = require('./utils');

var _session_report = require('./session_report');

var _rtc_const = require('./rtc_const');

var _exceptions = require('./exceptions');

var _signaling = require('./signaling');

var _signaling2 = _interopRequireDefault(_signaling);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _rtpStats = require('./rtp-stats');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RTCSessionState = exports.RTCSessionState = function () {
    function RTCSessionState(rtcSession) {
        _classCallCheck(this, RTCSessionState);

        this._rtcSession = rtcSession;
    }

    _createClass(RTCSessionState, [{
        key: 'onEnter',
        value: function onEnter() {}
    }, {
        key: 'onExit',
        value: function onExit() {}
    }, {
        key: '_isCurrentState',
        value: function _isCurrentState() {
            return this._rtcSession._state === this;
        }
    }, {
        key: 'transit',
        value: function transit(nextState) {
            if (this._isCurrentState()) {
                this._rtcSession.transit(nextState);
            }
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this.transit(new FailedState(this._rtcSession));
        }
    }, {
        key: 'onIceCandidate',
        value: function onIceCandidate(evt) {// eslint-disable-line no-unused-vars
            //ignore candidate by default, ConnectSignalingAndIceCollectionState will override to collect candidates, but collecting process could last much longer than ConnectSignalingAndIceCollectionState
            //we don't want to spam the console log
        }
    }, {
        key: 'onRemoteHungup',
        value: function onRemoteHungup() {
            throw new _exceptions.UnsupportedOperation('onRemoteHungup not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingConnected',
        value: function onSignalingConnected() {
            throw new _exceptions.UnsupportedOperation('onSignalingConnected not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingHandshaked',
        value: function onSignalingHandshaked() {
            throw new _exceptions.UnsupportedOperation('onSignalingHandshaked not implemented by ' + this.name);
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('onSignalingFailed not implemented by ' + this.name);
        }
    }, {
        key: 'logger',
        get: function get() {
            return this._rtcSession._logger;
        }
    }, {
        key: 'name',
        get: function get() {
            return "RTCSessionState";
        }
    }]);

    return RTCSessionState;
}();

var GrabLocalMediaState = exports.GrabLocalMediaState = function (_RTCSessionState) {
    _inherits(GrabLocalMediaState, _RTCSessionState);

    function GrabLocalMediaState() {
        _classCallCheck(this, GrabLocalMediaState);

        return _possibleConstructorReturn(this, (GrabLocalMediaState.__proto__ || Object.getPrototypeOf(GrabLocalMediaState)).apply(this, arguments));
    }

    _createClass(GrabLocalMediaState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var startTime = Date.now();
            if (self._rtcSession._userAudioStream) {
                self.transit(new CreateOfferState(self._rtcSession));
            } else {
                var gumTimeoutPromise = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(new _exceptions.GumTimeout('Local media has not been initialized yet.'));
                    }, self._rtcSession._gumTimeoutMillis);
                });
                var sessionGumPromise = self._gUM(self._rtcSession._buildMediaConstraints());

                Promise.race([sessionGumPromise, gumTimeoutPromise]).then(function (stream) {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    self._rtcSession._onGumSuccess(self._rtcSession);
                    self._rtcSession._streamToBeClosed = stream;
                    self._rtcSession._sessionReport.gumOtherFailure = false;
                    self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    self.transit(new CreateOfferState(self._rtcSession));
                }).catch(function (e) {
                    self._rtcSession._sessionReport.gumTimeMillis = Date.now() - startTime;
                    var errorReason;
                    if (e instanceof _exceptions.GumTimeout) {
                        errorReason = _rtc_const.RTC_ERRORS.GUM_TIMEOUT_FAILURE;
                        self._rtcSession._sessionReport.gumTimeoutFailure = true;
                        self._rtcSession._sessionReport.gumOtherFailure = false;
                    } else {
                        errorReason = _rtc_const.RTC_ERRORS.GUM_OTHER_FAILURE;
                        self._rtcSession._sessionReport.gumOtherFailure = true;
                        self._rtcSession._sessionReport.gumTimeoutFailure = false;
                    }
                    self.logger.error('Local media initialization failed', e);
                    self._rtcSession._onGumError(self._rtcSession);
                    self.transit(new FailedState(self._rtcSession, errorReason));
                });
            }
        }
    }, {
        key: '_gUM',
        value: function _gUM(constraints) {
            return navigator.mediaDevices.getUserMedia(constraints);
        }
    }, {
        key: 'name',
        get: function get() {
            return "GrabLocalMediaState";
        }
    }]);

    return GrabLocalMediaState;
}(RTCSessionState);

var CreateOfferState = exports.CreateOfferState = function (_RTCSessionState2) {
    _inherits(CreateOfferState, _RTCSessionState2);

    function CreateOfferState() {
        _classCallCheck(this, CreateOfferState);

        return _possibleConstructorReturn(this, (CreateOfferState.__proto__ || Object.getPrototypeOf(CreateOfferState)).apply(this, arguments));
    }

    _createClass(CreateOfferState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var stream = self._rtcSession._streamToBeClosed || self._rtcSession._userAudioStream;
            self._rtcSession._pc.addStream(stream);
            self._rtcSession._onLocalStreamAdded(self._rtcSession, stream);
            self._rtcSession._pc.createOffer().then(function (rtcSessionDescription) {
                self._rtcSession._localSessionDescription = rtcSessionDescription;
                self._rtcSession._sessionReport.createOfferFailure = false;
                self.transit(new SetLocalSessionDescriptionState(self._rtcSession));
            }).catch(function (e) {
                self.logger.error('CreateOffer failed', e);
                self._rtcSession._sessionReport.createOfferFailure = true;
                self.transit(new FailedState(self._rtcSession, _rtc_const.RTC_ERRORS.CREATE_OFFER_FAILURE));
            });
        }
    }, {
        key: 'name',
        get: function get() {
            return "CreateOfferState";
        }
    }]);

    return CreateOfferState;
}(RTCSessionState);

var SetLocalSessionDescriptionState = exports.SetLocalSessionDescriptionState = function (_RTCSessionState3) {
    _inherits(SetLocalSessionDescriptionState, _RTCSessionState3);

    function SetLocalSessionDescriptionState() {
        _classCallCheck(this, SetLocalSessionDescriptionState);

        return _possibleConstructorReturn(this, (SetLocalSessionDescriptionState.__proto__ || Object.getPrototypeOf(SetLocalSessionDescriptionState)).apply(this, arguments));
    }

    _createClass(SetLocalSessionDescriptionState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;

            // fix/modify SDP as needed here, before setLocalDescription
            var localDescription = self._rtcSession._localSessionDescription;
            var sdpOptions = new _utils.SdpOptions();
            if (self._rtcSession._forceAudioCodec) {
                sdpOptions.forceCodec['audio'] = self._rtcSession._forceAudioCodec;
            }
            sdpOptions.enableOpusDtx = self._rtcSession._enableOpusDtx;
            localDescription.sdp = (0, _utils.transformSdp)(localDescription.sdp, sdpOptions);

            self.logger.info('LocalSD', self._rtcSession._localSessionDescription);
            self._rtcSession._pc.setLocalDescription(self._rtcSession._localSessionDescription).then(function () {
                var initializationTime = Date.now() - self._rtcSession._connectTimeStamp;
                self._rtcSession._sessionReport.initializationTimeMillis = initializationTime;
                self._rtcSession._onSessionInitialized(self._rtcSession, initializationTime);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = false;
                self.transit(new ConnectSignalingAndIceCollectionState(self._rtcSession));
            }).catch(function (e) {
                self.logger.error('SetLocalDescription failed', e);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = true;
                self.transit(new FailedState(self._rtcSession, _rtc_const.RTC_ERRORS.SET_LOCAL_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: 'name',
        get: function get() {
            return "SetLocalSessionDescriptionState";
        }
    }]);

    return SetLocalSessionDescriptionState;
}(RTCSessionState);

var ConnectSignalingAndIceCollectionState = exports.ConnectSignalingAndIceCollectionState = function (_RTCSessionState4) {
    _inherits(ConnectSignalingAndIceCollectionState, _RTCSessionState4);

    function ConnectSignalingAndIceCollectionState(rtcSession) {
        _classCallCheck(this, ConnectSignalingAndIceCollectionState);

        var _this4 = _possibleConstructorReturn(this, (ConnectSignalingAndIceCollectionState.__proto__ || Object.getPrototypeOf(ConnectSignalingAndIceCollectionState)).call(this, rtcSession));

        _this4._iceCandidates = [];
        _this4._iceCandidateFoundationsMap = {};
        return _this4;
    }

    _createClass(ConnectSignalingAndIceCollectionState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            self._startTime = Date.now();
            setTimeout(function () {
                if (self._isCurrentState() && !self._iceCompleted) {
                    self.logger.warn('ICE collection timed out');
                    self.reportIceCompleted(true);
                }
            }, self._rtcSession._iceTimeoutMillis);
            self._rtcSession._createSignalingChannel().connect();
        }
    }, {
        key: 'onSignalingConnected',
        value: function onSignalingConnected() {
            this._rtcSession._signallingConnectTimestamp = Date.now();
            this._rtcSession._sessionReport.signallingConnectTimeMillis = this._rtcSession._signallingConnectTimestamp - this._startTime;
            this._signalingConnected = true;
            this._rtcSession._onSignalingConnected(this._rtcSession);
            this._rtcSession._sessionReport.signallingConnectionFailure = false;
            this._checkAndTransit();
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            this._rtcSession._sessionReport.signallingConnectTimeMillis = Date.now() - this._startTime;
            this.logger.error('Failed connecting to signaling server', e);
            this._rtcSession._sessionReport.signallingConnectionFailure = true;
            this.transit(new FailedState(this._rtcSession, _rtc_const.RTC_ERRORS.SIGNALLING_CONNECTION_FAILURE));
        }
    }, {
        key: '_createLocalCandidate',
        value: function _createLocalCandidate(initDict) {
            return new RTCIceCandidate(initDict);
        }
    }, {
        key: 'onIceCandidate',
        value: function onIceCandidate(evt) {
            var candidate = evt.candidate;
            this.logger.log('onicecandidate', candidate);
            if (candidate) {
                this._iceCandidates.push(this._createLocalCandidate(candidate));
                if (!this._iceCompleted) {
                    this._checkCandidatesSufficient(candidate);
                }
            } else {
                this.reportIceCompleted(false);
            }
        }
    }, {
        key: '_checkCandidatesSufficient',
        value: function _checkCandidatesSufficient(candidate) {
            //check if we collected both candidates from single media server by checking the same foundation collected twice
            //meaning both RTP and RTCP candidates are collected.
            var candidateAttributesString = candidate.candidate || "";
            var candidateAttributes = candidateAttributesString.split(" ");
            var candidateFoundation = candidateAttributes[0];
            var transportSP = candidateAttributes[1];
            if (candidateFoundation && transportSP) {
                var transportSPsList = this._iceCandidateFoundationsMap[candidateFoundation] || [];
                if (transportSPsList.length > 0 && !transportSPsList.includes(transportSP)) {
                    this.reportIceCompleted(false);
                }
                transportSPsList.push(transportSP);
                this._iceCandidateFoundationsMap[candidateFoundation] = transportSPsList;
            }
        }
    }, {
        key: 'reportIceCompleted',
        value: function reportIceCompleted(isTimeout) {
            this._rtcSession._sessionReport.iceCollectionTimeMillis = Date.now() - this._startTime;
            this._iceCompleted = true;
            this._rtcSession._onIceCollectionComplete(this._rtcSession, isTimeout, this._iceCandidates.length);
            if (this._iceCandidates.length > 0) {
                this._rtcSession._sessionReport.iceCollectionFailure = false;
                this._checkAndTransit();
            } else {
                this.logger.error('No ICE candidate');
                this._rtcSession._sessionReport.iceCollectionFailure = true;
                this.transit(new FailedState(this._rtcSession, _rtc_const.RTC_ERRORS.ICE_COLLECTION_TIMEOUT));
            }
        }
    }, {
        key: '_checkAndTransit',
        value: function _checkAndTransit() {
            if (this._iceCompleted && this._signalingConnected) {
                this.transit(new InviteAnswerState(this._rtcSession, this._iceCandidates));
            } else if (!this._iceCompleted) {
                this.logger.log('Pending ICE collection');
            } else {
                //implies _signalingConnected == false
                this.logger.log('Pending signaling connection');
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "ConnectSignalingAndIceCollectionState";
        }
    }]);

    return ConnectSignalingAndIceCollectionState;
}(RTCSessionState);

var InviteAnswerState = exports.InviteAnswerState = function (_RTCSessionState5) {
    _inherits(InviteAnswerState, _RTCSessionState5);

    function InviteAnswerState(rtcSession, iceCandidates) {
        _classCallCheck(this, InviteAnswerState);

        var _this5 = _possibleConstructorReturn(this, (InviteAnswerState.__proto__ || Object.getPrototypeOf(InviteAnswerState)).call(this, rtcSession));

        _this5._iceCandidates = iceCandidates;
        return _this5;
    }

    _createClass(InviteAnswerState, [{
        key: 'onEnter',
        value: function onEnter() {
            var rtcSession = this._rtcSession;
            rtcSession._onSignalingStarted(rtcSession);
            rtcSession._signalingChannel.invite(rtcSession._localSessionDescription.sdp, this._iceCandidates);
        }
    }, {
        key: 'onSignalingAnswered',
        value: function onSignalingAnswered(sdp, candidates) {
            this._rtcSession._sessionReport.userBusyFailure = false;
            this._rtcSession._sessionReport.handshakingFailure = false;
            this.transit(new AcceptState(this._rtcSession, sdp, candidates));
        }
    }, {
        key: 'onSignalingFailed',
        value: function onSignalingFailed(e) {
            var reason;
            if (e.name == _exceptions.BusyExceptionName) {
                this.logger.error('User Busy, possibly multiple CCP windows open', e);
                this._rtcSession._sessionReport.userBusyFailure = true;
                this._rtcSession._sessionReport.handshakingFailure = true;
                reason = _rtc_const.RTC_ERRORS.USER_BUSY;
            } else if (e.name == _exceptions.CallNotFoundExceptionName) {
                this.logger.error('Call not found. One of the participant probably hungup.', e);
                reason = _rtc_const.RTC_ERRORS.CALL_NOT_FOUND;
                this._rtcSession._sessionReport.handshakingFailure = true;
            } else {
                this.logger.error('Failed handshaking with signaling server', e);
                this._rtcSession._sessionReport.userBusyFailure = false;
                this._rtcSession._sessionReport.handshakingFailure = true;
                reason = _rtc_const.RTC_ERRORS.SIGNALLING_HANDSHAKE_FAILURE;
            }
            this.transit(new FailedState(this._rtcSession, reason));
        }
    }, {
        key: 'name',
        get: function get() {
            return "InviteAnswerState";
        }
    }]);

    return InviteAnswerState;
}(RTCSessionState);

var AcceptState = exports.AcceptState = function (_RTCSessionState6) {
    _inherits(AcceptState, _RTCSessionState6);

    function AcceptState(rtcSession, sdp, candidates) {
        _classCallCheck(this, AcceptState);

        var _this6 = _possibleConstructorReturn(this, (AcceptState.__proto__ || Object.getPrototypeOf(AcceptState)).call(this, rtcSession));

        _this6._sdp = sdp;
        _this6._candidates = candidates;
        return _this6;
    }

    _createClass(AcceptState, [{
        key: '_createSessionDescription',
        value: function _createSessionDescription(initDict) {
            return new RTCSessionDescription(initDict);
        }
    }, {
        key: '_createRemoteCandidate',
        value: function _createRemoteCandidate(initDict) {
            return new RTCIceCandidate(initDict);
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            var rtcSession = self._rtcSession;

            if (!self._sdp) {
                self.logger.error('Invalid remote SDP');
                rtcSession._stopSession();
                rtcSession._sessionReport.invalidRemoteSDPFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.INVALID_REMOTE_SDP));
                return;
            } else if (!self._candidates || self._candidates.length < 1) {
                self.logger.error('No remote ICE candidate');
                rtcSession._stopSession();
                rtcSession._sessionReport.noRemoteIceCandidateFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.NO_REMOTE_ICE_CANDIDATE));
                return;
            }

            rtcSession._sessionReport.invalidRemoteSDPFailure = false;
            rtcSession._sessionReport.noRemoteIceCandidateFailure = false;
            var setRemoteDescriptionPromise = rtcSession._pc.setRemoteDescription(self._createSessionDescription({
                type: 'answer',
                sdp: self._sdp
            }));
            setRemoteDescriptionPromise.catch(function (e) {
                self.logger.error('SetRemoteDescription failed', e);
            });
            setRemoteDescriptionPromise.then(function () {
                var remoteCandidatePromises = Promise.all(self._candidates.map(function (candidate) {
                    var remoteCandidate = self._createRemoteCandidate(candidate);
                    self.logger.info('Adding remote candidate', remoteCandidate);
                    return rtcSession._pc.addIceCandidate(remoteCandidate);
                }));
                remoteCandidatePromises.catch(function (reason) {
                    self.logger.warn('Error adding remote candidate', reason);
                });
                return remoteCandidatePromises;
            }).then(function () {
                rtcSession._sessionReport.setRemoteDescriptionFailure = false;
                self._remoteDescriptionSet = true;
                self._checkAndTransit();
            }).catch(function () {
                rtcSession._stopSession();
                rtcSession._sessionReport.setRemoteDescriptionFailure = true;
                self.transit(new FailedState(rtcSession, _rtc_const.RTC_ERRORS.SET_REMOTE_DESCRIPTION_FAILURE));
            });
        }
    }, {
        key: 'onSignalingHandshaked',
        value: function onSignalingHandshaked() {
            this._rtcSession._sessionReport.handshakingTimeMillis = Date.now() - this._rtcSession._signallingConnectTimestamp;
            this._signalingHandshaked = true;
            this._checkAndTransit();
        }
    }, {
        key: '_checkAndTransit',
        value: function _checkAndTransit() {
            if (this._signalingHandshaked && this._remoteDescriptionSet) {
                this.transit(new TalkingState(this._rtcSession));
            } else if (!this._signalingHandshaked) {
                this.logger.log('Pending handshaking');
            } else {
                //implies _remoteDescriptionSet == false
                this.logger.log('Pending setting remote description');
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "AcceptState";
        }
    }]);

    return AcceptState;
}(RTCSessionState);

var TalkingState = exports.TalkingState = function (_RTCSessionState7) {
    _inherits(TalkingState, _RTCSessionState7);

    function TalkingState() {
        _classCallCheck(this, TalkingState);

        return _possibleConstructorReturn(this, (TalkingState.__proto__ || Object.getPrototypeOf(TalkingState)).apply(this, arguments));
    }

    _createClass(TalkingState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._startTime = Date.now();
            this._rtcSession._sessionReport.preTalkingTimeMillis = this._startTime - this._rtcSession._connectTimeStamp;
            this._rtcSession._onSessionConnected(this._rtcSession);
        }
    }, {
        key: 'onSignalingReconnected',
        value: function onSignalingReconnected() {}
    }, {
        key: 'onRemoteHungup',
        value: function onRemoteHungup() {
            this._rtcSession._signalingChannel.hangup();
            this.transit(new DisconnectedState(this._rtcSession));
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this._rtcSession._signalingChannel.hangup();
            this.transit(new DisconnectedState(this._rtcSession));
        }
    }, {
        key: 'onExit',
        value: function onExit() {
            this._rtcSession._sessionReport.talkingTimeMillis = Date.now() - this._startTime;
            this._rtcSession._detachMedia();
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionCompleted(this._rtcSession);
        }
    }, {
        key: 'name',
        get: function get() {
            return "TalkingState";
        }
    }]);

    return TalkingState;
}(RTCSessionState);

var CleanUpState = exports.CleanUpState = function (_RTCSessionState8) {
    _inherits(CleanUpState, _RTCSessionState8);

    function CleanUpState() {
        _classCallCheck(this, CleanUpState);

        return _possibleConstructorReturn(this, (CleanUpState.__proto__ || Object.getPrototypeOf(CleanUpState)).apply(this, arguments));
    }

    _createClass(CleanUpState, [{
        key: 'onEnter',
        value: function onEnter() {
            this._startTime = Date.now();
            this._rtcSession._stopSession();
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            //do nothing, already at the end of lifecycle
        }
    }, {
        key: 'onExit',
        value: function onExit() {
            this._rtcSession._sessionReport.cleanupTimeMillis = Date.now() - this._startTime;
        }
    }, {
        key: 'name',
        get: function get() {
            return "CleanUpState";
        }
    }]);

    return CleanUpState;
}(RTCSessionState);

var DisconnectedState = exports.DisconnectedState = function (_CleanUpState) {
    _inherits(DisconnectedState, _CleanUpState);

    function DisconnectedState() {
        _classCallCheck(this, DisconnectedState);

        return _possibleConstructorReturn(this, (DisconnectedState.__proto__ || Object.getPrototypeOf(DisconnectedState)).apply(this, arguments));
    }

    _createClass(DisconnectedState, [{
        key: 'name',
        get: function get() {
            return "DisconnectedState";
        }
    }]);

    return DisconnectedState;
}(CleanUpState);

var FailedState = exports.FailedState = function (_CleanUpState2) {
    _inherits(FailedState, _CleanUpState2);

    function FailedState(rtcSession, failureReason) {
        _classCallCheck(this, FailedState);

        var _this10 = _possibleConstructorReturn(this, (FailedState.__proto__ || Object.getPrototypeOf(FailedState)).call(this, rtcSession));

        _this10._failureReason = failureReason;
        return _this10;
    }

    _createClass(FailedState, [{
        key: 'onEnter',
        value: function onEnter() {
            _get(FailedState.prototype.__proto__ || Object.getPrototypeOf(FailedState.prototype), 'onEnter', this).call(this);
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionFailed(this._rtcSession, this._failureReason);
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailedState";
        }
    }]);

    return FailedState;
}(CleanUpState);

var RtcSession = function () {
    /**
     * Build an AmazonConnect RTC session.
     * @param {*} signalingUri
     * @param {*} iceServers Array of ice servers
     * @param {*} contactToken
     * @param {*} logger An object provides logging functions, such as console
     * @param {*} contactId Must be UUID, uniquely identifies the session.
     */
    function RtcSession(signalingUri, iceServers, contactToken, logger, contactId) {
        _classCallCheck(this, RtcSession);

        if (typeof signalingUri !== 'string' || signalingUri.trim().length === 0) {
            throw new _exceptions.IllegalParameters('signalingUri required');
        }
        if (!iceServers) {
            throw new _exceptions.IllegalParameters('iceServers required');
        }
        if (typeof contactToken !== 'string' || contactToken.trim().length === 0) {
            throw new _exceptions.IllegalParameters('contactToken required');
        }
        if ((typeof logger === 'undefined' ? 'undefined' : _typeof(logger)) !== 'object') {
            throw new _exceptions.IllegalParameters('logger required');
        }
        if (!contactId) {
            this._callId = (0, _v2.default)();
        } else {
            this._callId = contactId;
        }

        this._sessionReport = new _session_report.SessionReport();
        this._signalingUri = signalingUri;
        this._iceServers = iceServers;
        this._contactToken = contactToken;
        this._originalLogger = logger;
        this._logger = (0, _utils.wrapLogger)(this._originalLogger, this._callId, 'SESSION');
        this._iceTimeoutMillis = _rtc_const.DEFAULT_ICE_TIMEOUT_MS;
        this._gumTimeoutMillis = _rtc_const.DEFAULT_GUM_TIMEOUT_MS;

        this._enableAudio = true;
        this._enableVideo = false;
        this._facingMode = 'user';

        this._onGumError = this._onGumSuccess = this._onLocalStreamAdded = this._onSessionFailed = this._onSessionInitialized = this._onSignalingConnected = this._onIceCollectionComplete = this._onSignalingStarted = this._onSessionConnected = this._onRemoteStreamAdded = this._onSessionCompleted = function () {};
    }

    _createClass(RtcSession, [{
        key: 'transit',
        value: function transit(nextState) {
            try {
                this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
                if (this._state && this._state.onExit) {
                    this._state.onExit();
                }
            } finally {
                this._state = nextState;
                if (nextState.onEnter) {
                    try {
                        nextState.onEnter();
                    } catch (e) {
                        this._logger.warn(nextState.name + '#onEnter failed', e);
                        throw e; // eslint-disable-line no-unsafe-finally
                    }
                }
            }
        }
    }, {
        key: '_createSignalingChannel',
        value: function _createSignalingChannel() {
            var signalingChannel = new _signaling2.default(this._callId, this._signalingUri, this._contactToken, this._originalLogger, this._signalingConnectTimeout);
            signalingChannel.onConnected = (0, _utils.hitch)(this, this._signalingConnected);
            signalingChannel.onAnswered = (0, _utils.hitch)(this, this._signalingAnswered);
            signalingChannel.onHandshaked = (0, _utils.hitch)(this, this._signalingHandshaked);
            signalingChannel.onRemoteHungup = (0, _utils.hitch)(this, this._signalingRemoteHungup);
            signalingChannel.onFailed = (0, _utils.hitch)(this, this._signalingFailed);
            signalingChannel.onDisconnected = (0, _utils.hitch)(this, this._signalingDisconnected);

            this._signalingChannel = signalingChannel;

            return signalingChannel;
        }
    }, {
        key: '_signalingConnected',
        value: function _signalingConnected() {
            this._state.onSignalingConnected();
        }
    }, {
        key: '_signalingAnswered',
        value: function _signalingAnswered(sdp, candidates) {
            this._state.onSignalingAnswered(sdp, candidates);
        }
    }, {
        key: '_signalingHandshaked',
        value: function _signalingHandshaked() {
            this._state.onSignalingHandshaked();
        }
    }, {
        key: '_signalingRemoteHungup',
        value: function _signalingRemoteHungup() {
            this._state.onRemoteHungup();
        }
    }, {
        key: '_signalingFailed',
        value: function _signalingFailed(e) {
            this._state.onSignalingFailed(e);
        }
    }, {
        key: '_signalingDisconnected',
        value: function _signalingDisconnected() {}
    }, {
        key: '_createPeerConnection',
        value: function _createPeerConnection(configuration) {
            return new RTCPeerConnection(configuration);
        }
    }, {
        key: 'connect',
        value: function connect() {
            var self = this;
            var now = new Date();
            self._sessionReport.sessionStartTime = now;
            self._connectTimeStamp = now.getTime();

            self._pc = self._createPeerConnection({
                iceServers: self._iceServers,
                iceTransportPolicy: 'relay',
                bundlePolicy: 'balanced' //maybe 'max-compat', test stereo sound
            }, {
                optional: [{
                    googDscp: true
                }]
            });

            self._pc.ontrack = (0, _utils.hitch)(self, self._ontrack);
            self._pc.onicecandidate = (0, _utils.hitch)(self, self._onIceCandidate);

            self.transit(new GrabLocalMediaState(self));
        }
    }, {
        key: 'accept',
        value: function accept() {
            throw new _exceptions.UnsupportedOperation('accept does not go through signaling channel at this moment');
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this._state.hangup();
        }
        /**
         * Get a promise of AudioRtpStats object for remote audio (from Amazon Connect to client).
         * @return Rejected promise if failed to get AudioRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getRemoteAudioStats',
        value: function getRemoteAudioStats() {
            var timestamp = new Date();
            if (this._pc && this._pc.signalingState === 'stable' && this._remoteAudioStream) {
                var audioTracks = this._remoteAudioStream.getAudioTracks();
                return this._pc.getStats(audioTracks[0]).then(function (stats) {
                    var rtcJsStats = (0, _rtpStats.extractAudioStatsFromStats)(timestamp, stats, 'audio_output');
                    if (!rtcJsStats) {
                        throw new Error('Failed to extract AudioRtpStats from RTCStatsReport');
                    }
                    return rtcJsStats;
                });
            } else {
                return Promise.reject(new _exceptions.IllegalState());
            }
        }

        /**
         * Get a promise of AudioRtpStats object for user audio (from client to Amazon Connect).
         * @return Rejected promise if failed to get AudioRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getUserAudioStats',
        value: function getUserAudioStats() {
            var stream = this._userAudioStream || this._streamToBeClosed;
            var timestamp = new Date();
            if (this._pc && this._pc.signalingState === 'stable' && stream) {
                var audioTracks = stream.getAudioTracks();
                return this._pc.getStats(audioTracks[0]).then(function (stats) {
                    var rtcJsStats = (0, _rtpStats.extractAudioStatsFromStats)(timestamp, stats, 'audio_input');
                    if (!rtcJsStats) {
                        throw new Error('Failed to extract AudioRtpStats from RTCStatsReport');
                    }
                    return rtcJsStats;
                });
            } else {
                return Promise.reject(new _exceptions.IllegalState());
            }
        }
    }, {
        key: '_onIceCandidate',
        value: function _onIceCandidate(evt) {
            this._state.onIceCandidate(evt);
        }
        /**
         * Attach remote media stream to web element.
         */

    }, {
        key: '_ontrack',
        value: function _ontrack(evt) {
            if (evt.streams.length > 1) {
                this._logger.warn('Found more than 1 streams for ' + evt.track.kind + ' track ' + evt.track.id + ' : ' + evt.streams.map(function (stream) {
                    return stream.id;
                }).join(','));
            }
            if (evt.track.kind === 'video' && this._remoteVideoElement) {
                this._remoteVideoElement.srcObject = evt.streams[0];
            } else if (evt.track.kind === 'audio' && this._remoteAudioElement) {
                this._remoteAudioElement.srcObject = evt.streams[0];
                this._remoteAudioStream = evt.streams[0];
            }
            this._onRemoteStreamAdded(this, evt.streams[0]);
        }
    }, {
        key: '_detachMedia',
        value: function _detachMedia() {
            if (this._remoteVideoElement) {
                this._remoteVideoElement.srcObject = null;
            }
            if (this._remoteAudioElement) {
                this._remoteAudioElement.srcObject = null;
                this._remoteAudioStream = null;
            }
        }
    }, {
        key: '_stopSession',
        value: function _stopSession() {
            try {
                if (this._streamToBeClosed) {
                    (0, _utils.closeStream)(this._streamToBeClosed);
                    this._streamToBeClosed = null;
                }
            } finally {
                try {
                    if (this._pc) {
                        this._pc.close();
                    }
                } catch (e) {
                    // eat exception
                } finally {
                    this._pc = null;
                }
            }
        }
    }, {
        key: '_buildMediaConstraints',
        value: function _buildMediaConstraints() {
            var self = this;
            var mediaConstraints = {};

            if (self._enableAudio) {
                var audioConstraints = {};
                if (typeof self._echoCancellation !== 'undefined') {
                    audioConstraints.echoCancellation = !!self._echoCancellation;
                }
                if (Object.keys(audioConstraints).length > 0) {
                    mediaConstraints.audio = audioConstraints;
                } else {
                    mediaConstraints.audio = true;
                }
            } else {
                mediaConstraints.audio = false;
            }

            if (self._enableVideo) {
                var videoConstraints = {};
                var widthConstraints = {};
                var heightConstraints = {};
                var frameRateConstraints = {};

                //build video width constraints
                if (typeof self._idealVideoWidth !== 'undefined') {
                    widthConstraints.ideal = self._idealVideoWidth;
                }
                if (typeof self._maxVideoWidth !== 'undefined') {
                    widthConstraints.max = self._maxVideoWidth;
                }
                if (typeof self._minVideoWidth !== 'undefined') {
                    widthConstraints.min = self._minVideoWidth;
                }
                // build video height constraints
                if (typeof self._idealVideoHeight !== 'undefined') {
                    heightConstraints.ideal = self._idealVideoHeight;
                }
                if (typeof self._maxVideoHeight !== 'undefined') {
                    heightConstraints.max = self._maxVideoHeight;
                }
                if (typeof self._minVideoHeight !== 'undefined') {
                    heightConstraints.min = self._minVideoHeight;
                }
                if (Object.keys(widthConstraints).length > 0 && Object.keys(heightConstraints).length > 0) {
                    videoConstraints.width = widthConstraints;
                    videoConstraints.height = heightConstraints;
                }
                // build frame rate constraints
                if (typeof self._videoFrameRate !== 'undefined') {
                    frameRateConstraints.ideal = self._videoFrameRate;
                }
                if (typeof self._minVideoFrameRate !== 'undefined') {
                    frameRateConstraints.min = self._minVideoFrameRate;
                }
                if (typeof self._maxVideoFrameRate !== 'undefined') {
                    frameRateConstraints.max = self._maxVideoFrameRate;
                }
                if (Object.keys(frameRateConstraints).length > 0) {
                    videoConstraints.frameRate = frameRateConstraints;
                }

                // build facing mode constraints
                if (self._facingMode !== 'user' && self._facingMode !== "environment") {
                    self._facingMode = 'user';
                }
                videoConstraints.facingMode = self._facingMode;

                // set video constraints
                if (Object.keys(videoConstraints).length > 0) {
                    mediaConstraints.video = videoConstraints;
                } else {
                    mediaConstraints.video = true;
                }
            }

            return mediaConstraints;
        }
    }, {
        key: 'sessionReport',
        get: function get() {
            return this._sessionReport;
        }
    }, {
        key: 'callId',
        get: function get() {
            return this._callId;
        }
    }, {
        key: 'mediaStream',
        get: function get() {
            return this._userAudioStream;
        }
        /**
         * Callback when gUM succeeds.
         * First param is RtcSession object.
         */
        ,

        /**
         * Optional. RtcSession will grab input device if this is not specified.
         */
        set: function set(input) {
            this._userAudioStream = input;
        }
        /**
         * Needed, expect an audio element that can be used to play remote audio stream.
         */

    }, {
        key: 'onGumSuccess',
        set: function set(handler) {
            this._onGumSuccess = handler;
        }
        /**
         * Callback when gUM fails.
         * First param is RtcSession object.
         * Second param is the error.
         */

    }, {
        key: 'onGumError',
        set: function set(handler) {
            this._onGumError = handler;
        }
        /**
         * Callback if failed initializing local resources
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionFailed',
        set: function set(handler) {
            this._onSessionFailed = handler;
        }
        /**
         * Callback after local user media stream is added to the session.
         * First param is RtcSession object.
         * Second param is media stream
         */

    }, {
        key: 'onLocalStreamAdded',
        set: function set(handler) {
            this._onLocalStreamAdded = handler;
        }
        /**
         * Callback when all local resources are ready. Establishing signaling chanel and ICE collection happens at the same time after this.
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionInitialized',
        set: function set(handler) {
            this._onSessionInitialized = handler;
        }
        /**
         * Callback when signaling channel is established.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         */

    }, {
        key: 'onSignalingConnected',
        set: function set(handler) {
            this._onSignalingConnected = handler;
        }
        /**
         * Callback when ICE collection completes either because there is no more candidate or collection timed out.
         * RTC session will move forward only if onSignalingConnected and onIceCollectionComplete are both called.
         *
         * First param is RtcSession object.
         * Second param is boolean, TRUE - ICE collection timed out.
         * Third param is number of candidates collected.
         */

    }, {
        key: 'onIceCollectionComplete',
        set: function set(handler) {
            this._onIceCollectionComplete = handler;
        }
        /**
         * Callback when signaling channel is established and ICE collection completed with at least one candidate.
         * First param is RtcSession object.
         */

    }, {
        key: 'onSignalingStarted',
        set: function set(handler) {
            this._onSignalingStarted = handler;
        }
        /**
         * Callback when the call is established (handshaked and media stream should be flowing)
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionConnected',
        set: function set(handler) {
            this._onSessionConnected = handler;
        }
        /**
         * Callback after remote media stream is added to the session.
         * This could be called multiple times with the same stream if multiple tracks are included in the same stream.
         *
         * First param is RtcSession object.
         * Second param is media stream track.
         */

    }, {
        key: 'onRemoteStreamAdded',
        set: function set(handler) {
            this._onRemoteStreamAdded = handler;
        }
        /**
         * Callback when the hangup is acked
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionCompleted',
        set: function set(handler) {
            this._onSessionCompleted = handler;
        }
    }, {
        key: 'enableAudio',
        set: function set(flag) {
            this._enableAudio = flag;
        }
    }, {
        key: 'echoCancellation',
        set: function set(flag) {
            this._echoCancellation = flag;
        }
    }, {
        key: 'enableVideo',
        set: function set(flag) {
            this._enableVideo = flag;
        }
    }, {
        key: 'maxVideoFrameRate',
        set: function set(frameRate) {
            this._maxVideoFrameRate = frameRate;
        }
    }, {
        key: 'minVideoFrameRate',
        set: function set(frameRate) {
            this._minVideoFrameRate = frameRate;
        }
    }, {
        key: 'videoFrameRate',
        set: function set(frameRate) {
            this._videoFrameRate = frameRate;
        }
    }, {
        key: 'maxVideoWidth',
        set: function set(width) {
            this._maxVideoWidth = width;
        }
    }, {
        key: 'minVideoWidth',
        set: function set(width) {
            this._minVideoWidth = width;
        }
    }, {
        key: 'idealVideoWidth',
        set: function set(width) {
            this._idealVideoWidth = width;
        }
    }, {
        key: 'maxVideoHeight',
        set: function set(height) {
            this._maxVideoHeight = height;
        }
    }, {
        key: 'minVideoHeight',
        set: function set(height) {
            this._minVideoHeight = height;
        }
    }, {
        key: 'idealVideoHeight',
        set: function set(height) {
            this._idealVideoHeight = height;
        }
    }, {
        key: 'facingMode',
        set: function set(mode) {
            this._facingMode = mode;
        }
    }, {
        key: 'remoteAudioElement',
        set: function set(element) {
            this._remoteAudioElement = element;
        }
    }, {
        key: 'remoteVideoElement',
        set: function set(element) {
            this._remoteVideoElement = element;
        }
        /**
         * Override the default signaling connect time out.
         */

    }, {
        key: 'signalingConnectTimeout',
        set: function set(ms) {
            this._signalingConnectTimeout = ms;
        }
        /**
         * Override the default ICE collection time limit.
         */

    }, {
        key: 'iceTimeoutMillis',
        set: function set(timeoutMillis) {
            this._iceTimeoutMillis = timeoutMillis;
        }

        /**
         * Override the default GUM timeout time limit.
         */

    }, {
        key: 'gumTimeoutMillis',
        set: function set(timeoutMillis) {
            this._gumTimeoutMillis = timeoutMillis;
        }

        /**
         * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
         * Setting this attribute will force connect-rtc-js to only use specified codec.
         * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
         * Supported codecs: opus.
         */

    }, {
        key: 'forceAudioCodec',
        set: function set(audioCodec) {
            this._forceAudioCodec = audioCodec;
        }

        /**
         * connect-rtc-js disables OPUS DTX by default because it harms audio quality.
         * @param flag boolean
         */

    }, {
        key: 'enableOpusDtx',
        set: function set(flag) {
            this._enableOpusDtx = flag;
        }
    }]);

    return RtcSession;
}();

exports.default = RtcSession;

},{"./exceptions":15,"./rtc_const":16,"./rtp-stats":18,"./session_report":19,"./signaling":20,"./utils":21,"uuid/v4":4}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.extractAudioStatsFromStats = extractAudioStatsFromStats;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/
function extractAudioStatsFromStats(timestamp, stats, streamType) {
    var callStats = null;
    if (!stats) {
        return callStats;
    }
    var statsReports = Object.keys(stats);
    if (statsReports) {
        for (var i = 0; i < statsReports.length; i++) {
            var statsReport = stats[statsReports[i]];
            if (statsReport) {
                var packetsLost = 0;
                var audioLevel = null;
                if (statsReport.type === 'ssrc') {
                    //chrome, opera case. chrome reports stats for all streams, not just the stream passed in.
                    if (typeof statsReport.packetsSent !== 'undefined' && streamType === 'audio_input') {
                        if (typeof statsReport.audioInputLevel !== 'undefined') {
                            audioLevel = statsReport.audioInputLevel;
                        }
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        var rttMs = null;
                        if (typeof statsReport.googRtt !== 'undefined') {
                            rttMs = statsReport.googRtt;
                        }
                        callStats = new AudioRtpStats(timestamp, packetsLost, statsReport.packetsSent, audioLevel, rttMs, null);
                    } else if (typeof statsReport.packetsReceived !== 'undefined' && streamType === 'audio_output') {
                        if (typeof statsReport.audioOutputLevel !== 'undefined') {
                            audioLevel = statsReport.audioOutputLevel;
                        }
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        var jbMs = null;
                        if (typeof statsReport.googJitterBufferMs !== 'undefined') {
                            jbMs = statsReport.googJitterBufferMs;
                        }
                        callStats = new AudioRtpStats(timestamp, packetsLost, statsReport.packetsReceived, audioLevel, null, jbMs);
                    }
                } else if (statsReport.type === 'inboundrtp') {
                    //Firefox case. Firefox reports packetsLost parameter only in inboundrtp type, and doesn't report in outboundrtp type.
                    //So we only pull from inboundrtp. Firefox reports only stats for the stream passed in.
                    if (typeof statsReport.packetsLost !== 'undefined' && typeof statsReport.packetsReceived !== 'undefined') {
                        //no audio level in firefox
                        if (typeof statsReport.audioInputLevel !== 'undefined') {
                            audioLevel = statsReport.audioInputLevel;
                        }
                        if (statsReport.packetsLost > 0) {
                            packetsLost = statsReport.packetsLost;
                        }
                        // no jb size in firefox
                        // rtt is broken https://bugzilla.mozilla.org/show_bug.cgi?id=1241066
                        callStats = new AudioRtpStats(timestamp, packetsLost, statsReport.packetsReceived, audioLevel);
                    }
                }
            }
        }
    }
    return callStats;
}

/**
* Basic RTP statistics object, represents statistics of an audio or video stream.
*/

var AudioRtpStats = function () {
    function AudioRtpStats(timestamp, packetsLost, packetsCount, audioLevel, rttMilliseconds, jbMilliseconds) {
        _classCallCheck(this, AudioRtpStats);

        this._timestamp = timestamp;
        this._packetsLost = packetsLost;
        this._packetsCount = packetsCount;
        this._audioLevel = audioLevel;
        this._rttMilliseconds = rttMilliseconds;
        this._jbMilliseconds = jbMilliseconds;
    }
    /** {number} number of packets sent to the channel */


    _createClass(AudioRtpStats, [{
        key: 'packetsCount',
        get: function get() {
            return this._packetsCount;
        }
        /** {number} number of packets lost after travelling through the channel */

    }, {
        key: 'packetsLost',
        get: function get() {
            return this._packetsLost;
        }
        /** {number} number of packets lost after travelling through the channel */

    }, {
        key: 'packetLossPercentage',
        get: function get() {
            return this._packetsCount > 0 ? this._packetsLost / this._packetsCount : 0;
        }
        /** Audio volume level
        * Currently firefox doesn't provide audio level in rtp stats.
        */

    }, {
        key: 'audioLevel',
        get: function get() {
            return this._audioLevel;
        }
        /** Timestamp when stats are collected. */

    }, {
        key: 'timestamp',
        get: function get() {
            return this._timestamp;
        }
        /** {number} Round trip time calculated with RTCP reports */

    }, {
        key: 'rttMilliseconds',
        get: function get() {
            return this._rttMilliseconds;
        }
        /** {number} Browser/client side jitter buffer length */

    }, {
        key: 'jbMilliseconds',
        get: function get() {
            return this._jbMilliseconds;
        }
    }]);

    return AudioRtpStats;
}();

},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 *
 *   http://aws.amazon.com/asl/
 *
 * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

var SessionReport = exports.SessionReport = function () {
    /**
     * @class Prototype for tracking various RTC session report
     * @constructs
     */
    function SessionReport() {
        _classCallCheck(this, SessionReport);

        this._sessionStartTime = null;
        this.sessionEndTime = null;
        this._gumTimeMillis = null;
        this._initializationTimeMillis = null;
        this._iceCollectionTimeMillis = null;
        this._signallingConnectTimeMillis = null;
        this._handshakingTimeMillis = null;
        this._preTalkingTimeMillis = null;
        this._talkingTimeMillis = null;
        this._cleanupTimeMillis = null;
        this._iceCollectionFailure = null;
        this._signallingConnectionFailure = null;
        this._handshakingFailure = null;
        this._gumOtherFailure = null;
        this._gumTimeoutFailure = null;
        this._createOfferFailure = null;
        this._setLocalDescriptionFailure = null;
        this._userBusyFailure = null;
        this._invalidRemoteSDPFailure = null;
        this._noRemoteIceCandidateFailure = null;
        this._setRemoteDescriptionFailure = null;
        this._streamStats = [];
    }
    /**
     *Timestamp when RTCSession started.
     */


    _createClass(SessionReport, [{
        key: "sessionStartTime",
        get: function get() {
            return this._sessionStartTime;
        }
        /**
         * Timestamp when RTCSession ended.
         */
        ,
        set: function set(value) {
            this._sessionStartTime = value;
        }
    }, {
        key: "sessionEndTime",
        get: function get() {
            return this._sessionEndTime;
        }
        /**
         * Time taken for grabbing user microphone at the time of connecting RTCSession.
         */
        ,
        set: function set(value) {
            this._sessionEndTime = value;
        }
    }, {
        key: "gumTimeMillis",
        get: function get() {
            return this._gumTimeMillis;
        }
        /**
         * Time taken for session initialization in millis. Includes time spent in GrabLocalMedia, SetLocalSDP states.
         */
        ,
        set: function set(value) {
            this._gumTimeMillis = value;
        }
    }, {
        key: "initializationTimeMillis",
        get: function get() {
            return this._initializationTimeMillis;
        }
        /**
         * Time spent on ICECollection in millis
         */
        ,
        set: function set(value) {
            this._initializationTimeMillis = value;
        }
    }, {
        key: "iceCollectionTimeMillis",
        get: function get() {
            return this._iceCollectionTimeMillis;
        }
        /**
         * Time taken for connecting the signalling in millis.
         */
        ,
        set: function set(value) {
            this._iceCollectionTimeMillis = value;
        }
    }, {
        key: "signallingConnectTimeMillis",
        get: function get() {
            return this._signallingConnectTimeMillis;
        }
        /**
         * Times spent from RTCSession connection until entering Talking state in millis.
         */
        ,
        set: function set(value) {
            this._signallingConnectTimeMillis = value;
        }
    }, {
        key: "preTalkingTimeMillis",
        get: function get() {
            return this._preTalkingTimeMillis;
        }
        /**
         *  Times spent in completing handshaking process of the RTCSession in millis.
         */
        ,
        set: function set(value) {
            this._preTalkingTimeMillis = value;
        }
    }, {
        key: "handshakingTimeMillis",
        get: function get() {
            return this._handshakingTimeMillis;
        }
        /**
         *  Times spent in Talking state in millis
         */
        ,
        set: function set(value) {
            this._handshakingTimeMillis = value;
        }
    }, {
        key: "talkingTimeMillis",
        get: function get() {
            return this._talkingTimeMillis;
        }
        /**
         * Times spent in Cleanup state in millis
         */
        ,
        set: function set(value) {
            this._talkingTimeMillis = value;
        }
    }, {
        key: "cleanupTimeMillis",
        get: function get() {
            return this._cleanupTimeMillis;
        }
        /**
         * Tells if the RTCSession fails in ICECollection.
         */
        ,
        set: function set(value) {
            this._cleanupTimeMillis = value;
        }
    }, {
        key: "iceCollectionFailure",
        get: function get() {
            return this._iceCollectionFailure;
        }
        /**
         * Tells if the RTCSession failed in signalling connect stage.
         */
        ,
        set: function set(value) {
            this._iceCollectionFailure = value;
        }
    }, {
        key: "signallingConnectionFailure",
        get: function get() {
            return this._signallingConnectionFailure;
        }
        /**
         * Handshaking failure of the RTCSession
         */
        ,
        set: function set(value) {
            this._signallingConnectionFailure = value;
        }
    }, {
        key: "handshakingFailure",
        get: function get() {
            return this._handshakingFailure;
        }
        /**
         * Gum failed due to timeout at the time of new RTCSession connection
         */
        ,
        set: function set(value) {
            this._handshakingFailure = value;
        }
    }, {
        key: "gumTimeoutFailure",
        get: function get() {
            return this._gumTimeoutFailure;
        }
        /**
         * Gum failed due to other reasons (other than Timeout)
         */
        ,
        set: function set(value) {
            this._gumTimeoutFailure = value;
        }
    }, {
        key: "gumOtherFailure",
        get: function get() {
            return this._gumOtherFailure;
        }
        /**
         * RTC Session failed in create Offer state.
         */
        ,
        set: function set(value) {
            this._gumOtherFailure = value;
        }
    }, {
        key: "createOfferFailure",
        get: function get() {
            return this._createOfferFailure;
        }
        /**
         * Tells if setLocalDescription failed for the RTC Session.
         */
        ,
        set: function set(value) {
            this._createOfferFailure = value;
        }
    }, {
        key: "setLocalDescriptionFailure",
        get: function get() {
            return this._setLocalDescriptionFailure;
        }
        /**
         * Tells if handshaking failed due to user busy case,
         * happens when multiple softphone calls are initiated at same time.
         */
        ,
        set: function set(value) {
            this._setLocalDescriptionFailure = value;
        }
    }, {
        key: "userBusyFailure",
        get: function get() {
            return this._userBusyFailure;
        }
        /**
         * Tells it remote SDP is invalid.
         */
        ,
        set: function set(value) {
            this._userBusyFailure = value;
        }
    }, {
        key: "invalidRemoteSDPFailure",
        get: function get() {
            return this._invalidRemoteSDPFailure;
        }
        /**
         * Tells if the setRemoteDescription failed for the RTC Session.
         */
        ,
        set: function set(value) {
            this._invalidRemoteSDPFailure = value;
        }
    }, {
        key: "setRemoteDescriptionFailure",
        get: function get() {
            return this._setRemoteDescriptionFailure;
        }
        /**
         * A failure case when there is no RemoteIceCandidate.
         */
        ,
        set: function set(value) {
            this._setRemoteDescriptionFailure = value;
        }
    }, {
        key: "noRemoteIceCandidateFailure",
        get: function get() {
            return this._noRemoteIceCandidateFailure;
        }
        /**
         * Statistics for each stream(audio-in, audio-out, video-in, video-out) of the RTCSession.
         */
        ,
        set: function set(value) {
            this._noRemoteIceCandidateFailure = value;
        }
    }, {
        key: "streamStats",
        get: function get() {
            return this._streamStats;
        },
        set: function set(value) {
            this._streamStats = value;
        }
    }]);

    return SessionReport;
}();

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FailedState = exports.DisconnectedState = exports.PendingLocalHangupState = exports.PendingRemoteHangupState = exports.PendingReconnectState = exports.TalkingState = exports.PendingAcceptAckState = exports.PendingAcceptState = exports.PendingAnswerState = exports.PendingInviteState = exports.PendingConnectState = exports.FailOnTimeoutState = exports.SignalingState = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   http://aws.amazon.com/asl/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _utils = require('./utils');

var _rtc_const = require('./rtc_const');

var _exceptions = require('./exceptions');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var reqIdSeq = 1;

/**
 * Abstract signaling state class.
 */

var SignalingState = exports.SignalingState = function () {
    /**
     * @param {AmznRtcSignaling} signaling Signaling object.
     */
    function SignalingState(signaling) {
        _classCallCheck(this, SignalingState);

        this._signaling = signaling;
    }

    _createClass(SignalingState, [{
        key: 'setStateTimeout',
        value: function setStateTimeout(timeoutMs) {
            setTimeout((0, _utils.hitch)(this, this._onTimeoutChecked), timeoutMs);
        }
    }, {
        key: 'onEnter',
        value: function onEnter() {}
    }, {
        key: '_onTimeoutChecked',
        value: function _onTimeoutChecked() {
            if (this.isCurrentState) {
                this.onTimeout();
            }
        }
    }, {
        key: 'onTimeout',
        value: function onTimeout() {
            throw new _exceptions.UnsupportedOperation();
        }
    }, {
        key: 'transit',
        value: function transit(newState) {
            this._signaling.transit(newState);
        }
    }, {
        key: 'onExit',
        value: function onExit() {}
    }, {
        key: 'onOpen',
        value: function onOpen() {
            throw new _exceptions.UnsupportedOperation('onOpen not supported by ' + this.name);
        }
    }, {
        key: 'onError',
        value: function onError() {
            this.channelDown();
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.channelDown();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            throw new _exceptions.UnsupportedOperation('channelDown not supported by ' + this.name);
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg(rpcMsg) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('onRpcMsg not supported by ' + this.name);
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            // eslint-disable-line no-unused-vars
            throw new _exceptions.UnsupportedOperation('invite not supported by ' + this.name);
        }
    }, {
        key: 'accept',
        value: function accept() {
            throw new _exceptions.UnsupportedOperation('accept not supported by ' + this.name);
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            throw new _exceptions.UnsupportedOperation('hangup not supported by ' + this.name);
        }
    }, {
        key: 'isCurrentState',
        get: function get() {
            return this === this._signaling.state;
        }
    }, {
        key: 'name',
        get: function get() {
            return "SignalingState";
        }
    }, {
        key: 'logger',
        get: function get() {
            return this._signaling._logger;
        }
    }]);

    return SignalingState;
}();

var FailOnTimeoutState = exports.FailOnTimeoutState = function (_SignalingState) {
    _inherits(FailOnTimeoutState, _SignalingState);

    function FailOnTimeoutState(signaling, timeoutMs) {
        _classCallCheck(this, FailOnTimeoutState);

        var _this = _possibleConstructorReturn(this, (FailOnTimeoutState.__proto__ || Object.getPrototypeOf(FailOnTimeoutState)).call(this, signaling));

        _this._stateTimeoutMs = timeoutMs;
        return _this;
    }

    _createClass(FailOnTimeoutState, [{
        key: 'onEnter',
        value: function onEnter() {
            this.setStateTimeout(this._stateTimeoutMs);
        }
    }, {
        key: 'onTimeout',
        value: function onTimeout() {
            this.transit(new FailedState(this._signaling, new _exceptions.Timeout()));
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailOnTimeoutState";
        }
    }]);

    return FailOnTimeoutState;
}(SignalingState);

var PendingConnectState = exports.PendingConnectState = function (_FailOnTimeoutState) {
    _inherits(PendingConnectState, _FailOnTimeoutState);

    function PendingConnectState(signaling, timeoutMs) {
        _classCallCheck(this, PendingConnectState);

        return _possibleConstructorReturn(this, (PendingConnectState.__proto__ || Object.getPrototypeOf(PendingConnectState)).call(this, signaling, timeoutMs));
    }

    _createClass(PendingConnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new PendingInviteState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling, new Error('channelDown')));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingConnectState";
        }
    }]);

    return PendingConnectState;
}(FailOnTimeoutState);

var PendingInviteState = exports.PendingInviteState = function (_SignalingState2) {
    _inherits(PendingInviteState, _SignalingState2);

    function PendingInviteState() {
        _classCallCheck(this, PendingInviteState);

        return _possibleConstructorReturn(this, (PendingInviteState.__proto__ || Object.getPrototypeOf(PendingInviteState)).apply(this, arguments));
    }

    _createClass(PendingInviteState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyConnected(resolve) {
                self._signaling._connectedHandler();
                resolve();
            });
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            var self = this;
            var inviteId = reqIdSeq++;

            var inviteParams = {
                sdp: sdp,
                candidates: iceCandidates
            };
            self.logger.log('Sending SDP', sdp);
            self._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'invite',
                params: inviteParams,
                id: inviteId
            }));
            self.transit(new PendingAnswerState(self._signaling, inviteId));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingInviteState";
        }
    }]);

    return PendingInviteState;
}(SignalingState);

var PendingAnswerState = exports.PendingAnswerState = function (_FailOnTimeoutState2) {
    _inherits(PendingAnswerState, _FailOnTimeoutState2);

    function PendingAnswerState(signaling, inviteId) {
        _classCallCheck(this, PendingAnswerState);

        var _this4 = _possibleConstructorReturn(this, (PendingAnswerState.__proto__ || Object.getPrototypeOf(PendingAnswerState)).call(this, signaling, _rtc_const.MAX_INVITE_DELAY_MS));

        _this4._inviteId = inviteId;
        return _this4;
    }

    _createClass(PendingAnswerState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            var self = this;
            if (msg.id === this._inviteId) {
                if (msg.error || !msg.result) {
                    this.transit(new FailedState(this._signaling, self.translateInviteError(msg)));
                } else {
                    new Promise(function notifyAnswered(resolve) {
                        self.logger.log('Received SDP', msg.result.sdp);
                        self._signaling._answeredHandler(msg.result.sdp, msg.result.candidates);
                        resolve();
                    });
                    this.transit(new PendingAcceptState(this._signaling, this._signaling._autoAnswer));
                }
            }
        }
    }, {
        key: 'translateInviteError',
        value: function translateInviteError(msg) {
            if (msg.error && msg.error.code == 486) {
                return new _exceptions.BusyException(msg.error.message);
            } else if (msg.error && msg.error.code == 404) {
                return new _exceptions.CallNotFoundException(msg.error.message);
            } else {
                return new _exceptions.UnknownSignalingError();
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAnswerState";
        }
    }]);

    return PendingAnswerState;
}(FailOnTimeoutState);

var PendingAcceptState = exports.PendingAcceptState = function (_SignalingState3) {
    _inherits(PendingAcceptState, _SignalingState3);

    function PendingAcceptState(signaling, autoAnswer) {
        _classCallCheck(this, PendingAcceptState);

        var _this5 = _possibleConstructorReturn(this, (PendingAcceptState.__proto__ || Object.getPrototypeOf(PendingAcceptState)).call(this, signaling));

        _this5._autoAnswer = autoAnswer;
        return _this5;
    }

    _createClass(PendingAcceptState, [{
        key: 'onEnter',
        value: function onEnter() {
            if (this._autoAnswer) {
                this.accept();
            }
        }
    }, {
        key: 'accept',
        value: function accept() {
            var acceptId = reqIdSeq++;
            this._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'accept',
                params: {},
                id: acceptId
            }));
            this.transit(new PendingAcceptAckState(this._signaling, acceptId));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAcceptState";
        }
    }]);

    return PendingAcceptState;
}(SignalingState);

var PendingAcceptAckState = exports.PendingAcceptAckState = function (_FailOnTimeoutState3) {
    _inherits(PendingAcceptAckState, _FailOnTimeoutState3);

    function PendingAcceptAckState(signaling, acceptId) {
        _classCallCheck(this, PendingAcceptAckState);

        var _this6 = _possibleConstructorReturn(this, (PendingAcceptAckState.__proto__ || Object.getPrototypeOf(PendingAcceptAckState)).call(this, signaling, _rtc_const.MAX_ACCEPT_BYE_DELAY_MS));

        _this6._acceptId = acceptId;
        return _this6;
    }

    _createClass(PendingAcceptAckState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.id === this._acceptId) {
                if (msg.error) {
                    this.transit(new FailedState(this._signaling));
                } else {
                    this._signaling._clientToken = msg.result.clientToken;
                    this.transit(new TalkingState(this._signaling));
                }
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingAcceptAckState";
        }
    }]);

    return PendingAcceptAckState;
}(FailOnTimeoutState);

var TalkingState = exports.TalkingState = function (_SignalingState4) {
    _inherits(TalkingState, _SignalingState4);

    function TalkingState() {
        _classCallCheck(this, TalkingState);

        return _possibleConstructorReturn(this, (TalkingState.__proto__ || Object.getPrototypeOf(TalkingState)).apply(this, arguments));
    }

    _createClass(TalkingState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyHandshaked(resolve) {
                self._signaling._handshakedHandler();
                resolve();
            });
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            var byeId = reqIdSeq++;
            this._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                method: 'bye',
                params: {},
                id: byeId
            }));
            this.transit(new PendingRemoteHangupState(this._signaling, byeId));
        }
    }, {
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.method === 'bye') {
                this.transit(new PendingLocalHangupState(this._signaling, msg.id));
            } else if (msg.method === 'renewClientToken') {
                this._signaling._clientToken = msg.params.clientToken;
            }
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this._signaling._reconnect();
            this._signaling.transit(new PendingReconnectState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "TalkingState";
        }
    }]);

    return TalkingState;
}(SignalingState);

var PendingReconnectState = exports.PendingReconnectState = function (_FailOnTimeoutState4) {
    _inherits(PendingReconnectState, _FailOnTimeoutState4);

    function PendingReconnectState(signaling) {
        _classCallCheck(this, PendingReconnectState);

        return _possibleConstructorReturn(this, (PendingReconnectState.__proto__ || Object.getPrototypeOf(PendingReconnectState)).call(this, signaling, _rtc_const.DEFAULT_CONNECT_TIMEOUT_MS));
    }

    _createClass(PendingReconnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new TalkingState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new FailedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingReconnectState";
        }
    }]);

    return PendingReconnectState;
}(FailOnTimeoutState);

var PendingRemoteHangupState = exports.PendingRemoteHangupState = function (_FailOnTimeoutState5) {
    _inherits(PendingRemoteHangupState, _FailOnTimeoutState5);

    function PendingRemoteHangupState(signaling, byeId) {
        _classCallCheck(this, PendingRemoteHangupState);

        var _this9 = _possibleConstructorReturn(this, (PendingRemoteHangupState.__proto__ || Object.getPrototypeOf(PendingRemoteHangupState)).call(this, signaling, _rtc_const.MAX_ACCEPT_BYE_DELAY_MS));

        _this9._byeId = byeId;
        return _this9;
    }

    _createClass(PendingRemoteHangupState, [{
        key: 'onRpcMsg',
        value: function onRpcMsg(msg) {
            if (msg.id === this._byeId) {
                this.transit(new DisconnectedState(this._signaling));
            }
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingRemoteHangupState";
        }
    }]);

    return PendingRemoteHangupState;
}(FailOnTimeoutState);

var PendingLocalHangupState = exports.PendingLocalHangupState = function (_SignalingState5) {
    _inherits(PendingLocalHangupState, _SignalingState5);

    function PendingLocalHangupState(signaling, byeId) {
        _classCallCheck(this, PendingLocalHangupState);

        var _this10 = _possibleConstructorReturn(this, (PendingLocalHangupState.__proto__ || Object.getPrototypeOf(PendingLocalHangupState)).call(this, signaling));

        _this10._byeId = byeId;
        return _this10;
    }

    _createClass(PendingLocalHangupState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyRemoteHungup(resolve) {
                self._signaling._remoteHungupHandler();
                resolve();
            });
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            var self = this;
            self._signaling._wss.send(JSON.stringify({
                jsonrpc: '2.0',
                result: {},
                id: self._byeId
            }));
            self.transit(new DisconnectedState(self._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            this.transit(new DisconnectedState(this._signaling));
        }
    }, {
        key: 'name',
        get: function get() {
            return "PendingLocalHangupState";
        }
    }]);

    return PendingLocalHangupState;
}(SignalingState);

var DisconnectedState = exports.DisconnectedState = function (_SignalingState6) {
    _inherits(DisconnectedState, _SignalingState6);

    function DisconnectedState() {
        _classCallCheck(this, DisconnectedState);

        return _possibleConstructorReturn(this, (DisconnectedState.__proto__ || Object.getPrototypeOf(DisconnectedState)).apply(this, arguments));
    }

    _createClass(DisconnectedState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyDisconnected(resolve) {
                self._signaling._disconnectedHandler();
                resolve();
            });
            this._signaling._wss.close();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            //Do nothing
        }
    }, {
        key: 'name',
        get: function get() {
            return "DisconnectedState";
        }
    }]);

    return DisconnectedState;
}(SignalingState);

var FailedState = exports.FailedState = function (_SignalingState7) {
    _inherits(FailedState, _SignalingState7);

    function FailedState(signaling, exception) {
        _classCallCheck(this, FailedState);

        var _this12 = _possibleConstructorReturn(this, (FailedState.__proto__ || Object.getPrototypeOf(FailedState)).call(this, signaling));

        _this12._exception = exception;
        return _this12;
    }

    _createClass(FailedState, [{
        key: 'onEnter',
        value: function onEnter() {
            var self = this;
            new Promise(function notifyFailed(resolve) {
                self._signaling._failedHandler(self._exception);
                resolve();
            });
            this._signaling._wss.close();
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            //Do nothing
        }
    }, {
        key: 'name',
        get: function get() {
            return "FailedState";
        }
    }, {
        key: 'exception',
        get: function get() {
            return this._exception;
        }
    }]);

    return FailedState;
}(SignalingState);

var AmznRtcSignaling = function () {
    function AmznRtcSignaling(callId, signalingUri, contactToken, logger, connectTimeoutMs) {
        _classCallCheck(this, AmznRtcSignaling);

        this._callId = callId;
        this._connectTimeoutMs = connectTimeoutMs || _rtc_const.DEFAULT_CONNECT_TIMEOUT_MS;
        this._autoAnswer = true;
        this._signalingUri = signalingUri;
        this._contactToken = contactToken;
        this._logger = (0, _utils.wrapLogger)(logger, callId, 'SIGNALING');

        //empty event handlers
        this._connectedHandler = this._answeredHandler = this._handshakedHandler = this._reconnectedHandler = this._remoteHungupHandler = this._disconnectedHandler = this._failedHandler = function noOp() {};
    }

    _createClass(AmznRtcSignaling, [{
        key: 'connect',
        value: function connect() {
            this._wss = this._connectWebSocket(this._buildInviteUri());
            this.transit(new PendingConnectState(this, this._connectTimeoutMs));
        }
    }, {
        key: 'transit',
        value: function transit(nextState) {
            try {
                this._logger.info((this._state ? this._state.name : 'null') + ' => ' + nextState.name);
                if (this.state && this.state.onExit) {
                    this.state.onExit();
                }
            } finally {
                this._state = nextState;
                if (this._state.onEnter) {
                    this._state.onEnter();
                }
            }
        }
    }, {
        key: '_connectWebSocket',
        value: function _connectWebSocket(uri) {
            var wsConnection = new WebSocket(uri);
            wsConnection.onopen = (0, _utils.hitch)(this, this._onOpen);
            wsConnection.onmessage = (0, _utils.hitch)(this, this._onMessage);
            wsConnection.onerror = (0, _utils.hitch)(this, this._onError);
            wsConnection.onclose = (0, _utils.hitch)(this, this._onClose);
            return wsConnection;
        }
    }, {
        key: '_buildInviteUri',
        value: function _buildInviteUri() {
            return this._buildUriBase() + '&contactCtx=' + encodeURIComponent(this._contactToken);
        }
    }, {
        key: '_buildReconnectUri',
        value: function _buildReconnectUri() {
            return this._buildUriBase() + '&clientToken=' + encodeURIComponent(this._clientToken);
        }
    }, {
        key: '_buildUriBase',
        value: function _buildUriBase() {
            return this._signalingUri + '?callId=' + encodeURIComponent(this._callId);
        }
    }, {
        key: '_onMessage',
        value: function _onMessage(evt) {
            this.state.onRpcMsg(JSON.parse(evt.data));
        }
    }, {
        key: '_onOpen',
        value: function _onOpen(evt) {
            this.state.onOpen(evt);
        }
    }, {
        key: '_onError',
        value: function _onError(evt) {
            this.state.onError(evt);
        }
    }, {
        key: '_onClose',
        value: function _onClose(evt) {
            this._logger.log('WebSocket onclose code=' + evt.code + ', reason=' + evt.reason);
            this.state.onClose(evt);
        }
    }, {
        key: '_reconnect',
        value: function _reconnect() {
            this._wss = this._connectWebSocket(this._buildReconnectUri());
        }
    }, {
        key: 'invite',
        value: function invite(sdp, iceCandidates) {
            this.state.invite(sdp, iceCandidates);
        }
    }, {
        key: 'accept',
        value: function accept() {
            this.state.accept();
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            this.state.hangup();
        }
    }, {
        key: 'callId',
        get: function get() {
            return this._callId;
        }
    }, {
        key: 'onConnected',
        set: function set(connectedHandler) {
            this._connectedHandler = connectedHandler;
        }
    }, {
        key: 'onAnswered',
        set: function set(answeredHandler) {
            this._answeredHandler = answeredHandler;
        }
    }, {
        key: 'onHandshaked',
        set: function set(handshakedHandler) {
            this._handshakedHandler = handshakedHandler;
        }
    }, {
        key: 'onReconnected',
        set: function set(reconnectedHandler) {
            this._reconnectedHandler = reconnectedHandler;
        }
    }, {
        key: 'onRemoteHungup',
        set: function set(remoteHungupHandler) {
            this._remoteHungupHandler = remoteHungupHandler;
        }
    }, {
        key: 'onDisconnected',
        set: function set(disconnectedHandler) {
            this._disconnectedHandler = disconnectedHandler;
        }
    }, {
        key: 'onFailed',
        set: function set(failedHandler) {
            this._failedHandler = failedHandler;
        }
    }, {
        key: 'state',
        get: function get() {
            return this._state;
        }
    }]);

    return AmznRtcSignaling;
}();

exports.default = AmznRtcSignaling;

},{"./exceptions":15,"./rtc_const":16,"./utils":21}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SdpOptions = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   http://aws.amazon.com/asl/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * or in the "LICENSE" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

exports.hitch = hitch;
exports.wrapLogger = wrapLogger;
exports.closeStream = closeStream;
exports.transformSdp = transformSdp;

var _exceptions = require('./exceptions');

var _sdp = require('sdp');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * All logging methods used by connect-rtc.
 */
var logMethods = ['log', 'info', 'warn', 'error'];

/**
* Binds the given instance object as the context for
* the method provided.
*
* @param scope The instance object to be set as the scope
*    of the function.
* @param method The method to be encapsulated.
*
* All other arguments, if any, are bound to the method
* invocation inside the closure.
*
* @return A closure encapsulating the invocation of the
*    method provided in context of the given instance.
*/
function hitch() {
    var args = Array.prototype.slice.call(arguments);
    var scope = args.shift();
    var method = args.shift();

    if (!scope) {
        throw new _exceptions.IllegalParameters('utils.hitch(): scope is required!');
    }

    if (!method) {
        throw new _exceptions.IllegalParameters('utils.hitch(): method is required!');
    }

    if (typeof method !== 'function') {
        throw new _exceptions.IllegalParameters('utils.hitch(): method is not a function!');
    }

    return function _hitchedFunction() {
        var closureArgs = Array.prototype.slice.call(arguments);
        return method.apply(scope, args.concat(closureArgs));
    };
}

function wrapLogger(logger, callId, logCategory) {
    var _logger = {};
    logMethods.forEach(function (logMethod) {
        if (!logger[logMethod]) {
            throw new Error('Logging method ' + logMethod + ' required');
        }
        _logger[logMethod] = hitch(logger, logger[logMethod], callId, logCategory);
    });
    return _logger;
}

function closeStream(stream) {
    if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            try {
                track.stop();
            } catch (e) {
                // eat exception
            }
        }
    }
}

/**
 * A parameter of transformSdp.
 * This defines all the SDP options connect-rtc-js supports.
 */

var SdpOptions = exports.SdpOptions = function () {
    function SdpOptions() {
        _classCallCheck(this, SdpOptions);

        this._forceCodec = {};
    }

    _createClass(SdpOptions, [{
        key: '_shouldDeleteCodec',


        /**
         * Test if given codec should be removed from SDP.
         * @param mediaType audio|video
         * @param codecName case insensitive
         * @return TRUE - should remove
         */
        value: function _shouldDeleteCodec(mediaType, codecName) {
            var upperCaseCodecName = codecName.toUpperCase();
            return this._forceCodec[mediaType] && upperCaseCodecName !== this._forceCodec[mediaType].toUpperCase() && upperCaseCodecName !== 'TELEPHONE-EVENT';
        }
    }, {
        key: 'enableOpusDtx',
        get: function get() {
            return this._enableOpusDtx;
        }

        /**
         * By default transformSdp disables dtx for OPUS codec.
         * Setting this to true would force it to turn on DTX.
         */
        ,
        set: function set(flag) {
            this._enableOpusDtx = flag;
        }

        /**
         * A map from media type (audio/video) to codec (case insensitive).
         * Add entry for force connect-rtc-js to use specified codec for certain media type.
         * For example: sdpOptions.forceCodec['audio'] = 'opus';
         */

    }, {
        key: 'forceCodec',
        get: function get() {
            return this._forceCodec;
        }
    }]);

    return SdpOptions;
}();

/**
 * Modifies input SDP according to sdpOptions.
 * See SdpOptions for available options.
 */


function transformSdp(sdp, sdpOptions) {
    var sections = (0, _sdp.splitSections)(sdp);
    for (var i = 1; i < sections.length; i++) {
        var mediaType = (0, _sdp.getKind)(sections[i]);
        var rtpParams = (0, _sdp.parseRtpParameters)(sections[i]);
        // a map from payload type (string) to codec object
        var codecMap = rtpParams.codecs.reduce(function (map, codec) {
            map['' + codec.payloadType] = codec;
            return map;
        }, {});
        sections[i] = (0, _sdp.splitLines)(sections[i]).map(function (line) {
            if (line.startsWith('m=')) {
                // modify m= line if SdpOptions#forceCodec specifies codec for current media type
                if (sdpOptions.forceCodec[mediaType]) {
                    var targetCodecPts = Object.keys(codecMap).filter(function (pt) {
                        return !sdpOptions._shouldDeleteCodec(mediaType, codecMap[pt].name);
                    });
                    return line.substring(0, line.indexOf('UDP/TLS/RTP/SAVPF ') + 'UDP/TLS/RTP/SAVPF '.length) + targetCodecPts.join(' ');
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtpmap:')) {
                var rtpMap = (0, _sdp.parseRtpMap)(line);
                var currentCodec = codecMap[rtpMap.payloadType];

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                // append a=fmtp line immediately if current codec is OPUS (to explicitly specify OPUS parameters)
                if (currentCodec.name.toUpperCase() === 'OPUS') {
                    currentCodec.parameters.usedtx = sdpOptions.enableOpusDtx ? 1 : 0;
                    // generate fmtp line immediately after rtpmap line, and remove original fmtp line once we see it
                    return (line + "\r\n" + (0, _sdp.writeFmtp)(currentCodec)).trim();
                } else {
                    return line;
                }
            } else if (line.startsWith('a=fmtp:')) {
                var pt = line.substring('a=fmtp:'.length, line.indexOf(' '));
                var currentCodec = codecMap[pt]; // eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                }

                if (currentCodec.name.toUpperCase() === 'OPUS') {
                    // this is a line for OPUS, remove it because FMTP line is already generated when rtpmap line is processed
                    return null;
                } else {
                    return line;
                }
            } else if (line.startsWith('a=rtcp-fb:')) {
                var pt = line.substring(line.indexOf(':') + 1, line.indexOf(' ')); // eslint-disable-line no-redeclare
                var currentCodec = codecMap[pt]; // eslint-disable-line no-redeclare

                // remove this codec if SdpOptions#forceCodec specifies a different codec for current media type
                if (sdpOptions._shouldDeleteCodec(mediaType, currentCodec.name)) {
                    return null;
                } else {
                    return line;
                }
            } else {
                return line;
            }
        }).filter(function (line) {
            return line !== null;
        }).join('\r\n');
    }
    return sections.map(function (section) {
        return section.trim();
    }).join('\r\n') + '\r\n';
}

},{"./exceptions":15,"sdp":1}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc2RwL3NkcC5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2xpYi9ieXRlc1RvVXVpZC5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2xpYi9ybmctYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL3Y0LmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9hZGFwdGVyX2NvcmUuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2Nocm9tZS9jaHJvbWVfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2dldHVzZXJtZWRpYS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZWRnZS9lZGdlX3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZ2V0dXNlcm1lZGlhLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9maXJlZm94L2ZpcmVmb3hfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZmlyZWZveC9nZXR1c2VybWVkaWEuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3NhZmFyaS9zYWZhcmlfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvdXRpbHMuanMiLCJzcmMvanMvY29ubmVjdC1ydGMuanMiLCJzcmMvanMvZXhjZXB0aW9ucy5qcyIsInNyYy9qcy9ydGNfY29uc3QuanMiLCJzcmMvanMvcnRjX3Nlc3Npb24uanMiLCJzcmMvanMvcnRwLXN0YXRzLmpzIiwic3JjL2pzL3Nlc3Npb25fcmVwb3J0LmpzIiwic3JjL2pzL3NpZ25hbGluZy5qcyIsInNyYy9qcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdm1DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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VUE7QUFDSCx1QkFBTyxJQUFQO0FBQ0g7QUFDSixTQXREYSxFQXNEWCxNQXREVyxDQXNESjtBQUFBLG1CQUFRLFNBQVMsSUFBakI7QUFBQSxTQXRESSxFQXNEbUIsSUF0RG5CLENBc0R3QixNQXREeEIsQ0FBZDtBQXdESDtBQUNELFdBQU8sU0FBUyxHQUFULENBQWE7QUFBQSxlQUFXLFFBQVEsSUFBUixFQUFYO0FBQUEsS0FBYixFQUF3QyxJQUF4QyxDQUE2QyxNQUE3QyxJQUF1RCxNQUE5RDtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gU0RQIGhlbHBlcnMuXG52YXIgU0RQVXRpbHMgPSB7fTtcblxuLy8gR2VuZXJhdGUgYW4gYWxwaGFudW1lcmljIGlkZW50aWZpZXIgZm9yIGNuYW1lIG9yIG1pZHMuXG4vLyBUT0RPOiB1c2UgVVVJRHMgaW5zdGVhZD8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgMTApO1xufTtcblxuLy8gVGhlIFJUQ1AgQ05BTUUgdXNlZCBieSBhbGwgcGVlcmNvbm5lY3Rpb25zIGZyb20gdGhlIHNhbWUgSlMuXG5TRFBVdGlscy5sb2NhbENOYW1lID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbi8vIFNwbGl0cyBTRFAgaW50byBsaW5lcywgZGVhbGluZyB3aXRoIGJvdGggQ1JMRiBhbmQgTEYuXG5TRFBVdGlscy5zcGxpdExpbmVzID0gZnVuY3Rpb24oYmxvYikge1xuICByZXR1cm4gYmxvYi50cmltKCkuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUudHJpbSgpO1xuICB9KTtcbn07XG4vLyBTcGxpdHMgU0RQIGludG8gc2Vzc2lvbnBhcnQgYW5kIG1lZGlhc2VjdGlvbnMuIEVuc3VyZXMgQ1JMRi5cblNEUFV0aWxzLnNwbGl0U2VjdGlvbnMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHZhciBwYXJ0cyA9IGJsb2Iuc3BsaXQoJ1xcbm09Jyk7XG4gIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCwgaW5kZXgpIHtcbiAgICByZXR1cm4gKGluZGV4ID4gMCA/ICdtPScgKyBwYXJ0IDogcGFydCkudHJpbSgpICsgJ1xcclxcbic7XG4gIH0pO1xufTtcblxuLy8gUmV0dXJucyBsaW5lcyB0aGF0IHN0YXJ0IHdpdGggYSBjZXJ0YWluIHByZWZpeC5cblNEUFV0aWxzLm1hdGNoUHJlZml4ID0gZnVuY3Rpb24oYmxvYiwgcHJlZml4KSB7XG4gIHJldHVybiBTRFBVdGlscy5zcGxpdExpbmVzKGJsb2IpLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZihwcmVmaXgpID09PSAwO1xuICB9KTtcbn07XG5cbi8vIFBhcnNlcyBhbiBJQ0UgY2FuZGlkYXRlIGxpbmUuIFNhbXBsZSBpbnB1dDpcbi8vIGNhbmRpZGF0ZTo3MDI3ODYzNTAgMiB1ZHAgNDE4MTk5MDIgOC44LjguOCA2MDc2OSB0eXAgcmVsYXkgcmFkZHIgOC44LjguOFxuLy8gcnBvcnQgNTU5OTZcIlxuU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cztcbiAgLy8gUGFyc2UgYm90aCB2YXJpYW50cy5cbiAgaWYgKGxpbmUuaW5kZXhPZignYT1jYW5kaWRhdGU6JykgPT09IDApIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEyKS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTApLnNwbGl0KCcgJyk7XG4gIH1cblxuICB2YXIgY2FuZGlkYXRlID0ge1xuICAgIGZvdW5kYXRpb246IHBhcnRzWzBdLFxuICAgIGNvbXBvbmVudDogcGFyc2VJbnQocGFydHNbMV0sIDEwKSxcbiAgICBwcm90b2NvbDogcGFydHNbMl0udG9Mb3dlckNhc2UoKSxcbiAgICBwcmlvcml0eTogcGFyc2VJbnQocGFydHNbM10sIDEwKSxcbiAgICBpcDogcGFydHNbNF0sXG4gICAgcG9ydDogcGFyc2VJbnQocGFydHNbNV0sIDEwKSxcbiAgICAvLyBza2lwIHBhcnRzWzZdID09ICd0eXAnXG4gICAgdHlwZTogcGFydHNbN11cbiAgfTtcblxuICBmb3IgKHZhciBpID0gODsgaSA8IHBhcnRzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgc3dpdGNoIChwYXJ0c1tpXSkge1xuICAgICAgY2FzZSAncmFkZHInOlxuICAgICAgICBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncnBvcnQnOlxuICAgICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQgPSBwYXJzZUludChwYXJ0c1tpICsgMV0sIDEwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0Y3B0eXBlJzpcbiAgICAgICAgY2FuZGlkYXRlLnRjcFR5cGUgPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gZXh0ZW5zaW9uIGhhbmRsaW5nLCBpbiBwYXJ0aWN1bGFyIHVmcmFnXG4gICAgICAgIGNhbmRpZGF0ZVtwYXJ0c1tpXV0gPSBwYXJ0c1tpICsgMV07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY2FuZGlkYXRlO1xufTtcblxuLy8gVHJhbnNsYXRlcyBhIGNhbmRpZGF0ZSBvYmplY3QgaW50byBTRFAgY2FuZGlkYXRlIGF0dHJpYnV0ZS5cblNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gIHZhciBzZHAgPSBbXTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmZvdW5kYXRpb24pO1xuICBzZHAucHVzaChjYW5kaWRhdGUuY29tcG9uZW50KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByb3RvY29sLnRvVXBwZXJDYXNlKCkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUucHJpb3JpdHkpO1xuICBzZHAucHVzaChjYW5kaWRhdGUuaXApO1xuICBzZHAucHVzaChjYW5kaWRhdGUucG9ydCk7XG5cbiAgdmFyIHR5cGUgPSBjYW5kaWRhdGUudHlwZTtcbiAgc2RwLnB1c2goJ3R5cCcpO1xuICBzZHAucHVzaCh0eXBlKTtcbiAgaWYgKHR5cGUgIT09ICdob3N0JyAmJiBjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MgJiZcbiAgICAgIGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCkge1xuICAgIHNkcC5wdXNoKCdyYWRkcicpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkQWRkcmVzcyk7IC8vIHdhczogcmVsQWRkclxuICAgIHNkcC5wdXNoKCdycG9ydCcpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS5yZWxhdGVkUG9ydCk7IC8vIHdhczogcmVsUG9ydFxuICB9XG4gIGlmIChjYW5kaWRhdGUudGNwVHlwZSAmJiBjYW5kaWRhdGUucHJvdG9jb2wudG9Mb3dlckNhc2UoKSA9PT0gJ3RjcCcpIHtcbiAgICBzZHAucHVzaCgndGNwdHlwZScpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS50Y3BUeXBlKTtcbiAgfVxuICByZXR1cm4gJ2NhbmRpZGF0ZTonICsgc2RwLmpvaW4oJyAnKTtcbn07XG5cbi8vIFBhcnNlcyBhbiBpY2Utb3B0aW9ucyBsaW5lLCByZXR1cm5zIGFuIGFycmF5IG9mIG9wdGlvbiB0YWdzLlxuLy8gYT1pY2Utb3B0aW9uczpmb28gYmFyXG5TRFBVdGlscy5wYXJzZUljZU9wdGlvbnMgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHJldHVybiBsaW5lLnN1YnN0cigxNCkuc3BsaXQoJyAnKTtcbn1cblxuLy8gUGFyc2VzIGFuIHJ0cG1hcCBsaW5lLCByZXR1cm5zIFJUQ1J0cENvZGRlY1BhcmFtZXRlcnMuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRwbWFwOjExMSBvcHVzLzQ4MDAwLzJcblNEUFV0aWxzLnBhcnNlUnRwTWFwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cig5KS5zcGxpdCgnICcpO1xuICB2YXIgcGFyc2VkID0ge1xuICAgIHBheWxvYWRUeXBlOiBwYXJzZUludChwYXJ0cy5zaGlmdCgpLCAxMCkgLy8gd2FzOiBpZFxuICB9O1xuXG4gIHBhcnRzID0gcGFydHNbMF0uc3BsaXQoJy8nKTtcblxuICBwYXJzZWQubmFtZSA9IHBhcnRzWzBdO1xuICBwYXJzZWQuY2xvY2tSYXRlID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKTsgLy8gd2FzOiBjbG9ja3JhdGVcbiAgLy8gd2FzOiBjaGFubmVsc1xuICBwYXJzZWQubnVtQ2hhbm5lbHMgPSBwYXJ0cy5sZW5ndGggPT09IDMgPyBwYXJzZUludChwYXJ0c1syXSwgMTApIDogMTtcbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlIGFuIGE9cnRwbWFwIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3Jcbi8vIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwTWFwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICByZXR1cm4gJ2E9cnRwbWFwOicgKyBwdCArICcgJyArIGNvZGVjLm5hbWUgKyAnLycgKyBjb2RlYy5jbG9ja1JhdGUgK1xuICAgICAgKGNvZGVjLm51bUNoYW5uZWxzICE9PSAxID8gJy8nICsgY29kZWMubnVtQ2hhbm5lbHMgOiAnJykgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBhPWV4dG1hcCBsaW5lIChoZWFkZXJleHRlbnNpb24gZnJvbSBSRkMgNTI4NSkuIFNhbXBsZSBpbnB1dDpcbi8vIGE9ZXh0bWFwOjIgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuLy8gYT1leHRtYXA6Mi9zZW5kb25seSB1cm46aWV0ZjpwYXJhbXM6cnRwLWhkcmV4dDp0b2Zmc2V0XG5TRFBVdGlscy5wYXJzZUV4dG1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICBpZDogcGFyc2VJbnQocGFydHNbMF0sIDEwKSxcbiAgICBkaXJlY3Rpb246IHBhcnRzWzBdLmluZGV4T2YoJy8nKSA+IDAgPyBwYXJ0c1swXS5zcGxpdCgnLycpWzFdIDogJ3NlbmRyZWN2JyxcbiAgICB1cmk6IHBhcnRzWzFdXG4gIH07XG59O1xuXG4vLyBHZW5lcmF0ZXMgYT1leHRtYXAgbGluZSBmcm9tIFJUQ1J0cEhlYWRlckV4dGVuc2lvblBhcmFtZXRlcnMgb3Jcbi8vIFJUQ1J0cEhlYWRlckV4dGVuc2lvbi5cblNEUFV0aWxzLndyaXRlRXh0bWFwID0gZnVuY3Rpb24oaGVhZGVyRXh0ZW5zaW9uKSB7XG4gIHJldHVybiAnYT1leHRtYXA6JyArIChoZWFkZXJFeHRlbnNpb24uaWQgfHwgaGVhZGVyRXh0ZW5zaW9uLnByZWZlcnJlZElkKSArXG4gICAgICAoaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvbiAmJiBoZWFkZXJFeHRlbnNpb24uZGlyZWN0aW9uICE9PSAnc2VuZHJlY3YnXG4gICAgICAgICAgPyAnLycgKyBoZWFkZXJFeHRlbnNpb24uZGlyZWN0aW9uXG4gICAgICAgICAgOiAnJykgK1xuICAgICAgJyAnICsgaGVhZGVyRXh0ZW5zaW9uLnVyaSArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIGFuIGZ0bXAgbGluZSwgcmV0dXJucyBkaWN0aW9uYXJ5LiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWZtdHA6OTYgdmJyPW9uO2NuZz1vblxuLy8gQWxzbyBkZWFscyB3aXRoIHZicj1vbjsgY25nPW9uXG5TRFBVdGlscy5wYXJzZUZtdHAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGt2O1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCc7Jyk7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICBrdiA9IHBhcnRzW2pdLnRyaW0oKS5zcGxpdCgnPScpO1xuICAgIHBhcnNlZFtrdlswXS50cmltKCldID0ga3ZbMV07XG4gIH1cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cbi8vIEdlbmVyYXRlcyBhbiBhPWZ0bXAgbGluZSBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZUZtdHAgPSBmdW5jdGlvbihjb2RlYykge1xuICB2YXIgbGluZSA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5wYXJhbWV0ZXJzICYmIE9iamVjdC5rZXlzKGNvZGVjLnBhcmFtZXRlcnMpLmxlbmd0aCkge1xuICAgIHZhciBwYXJhbXMgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICBwYXJhbXMucHVzaChwYXJhbSArICc9JyArIGNvZGVjLnBhcmFtZXRlcnNbcGFyYW1dKTtcbiAgICB9KTtcbiAgICBsaW5lICs9ICdhPWZtdHA6JyArIHB0ICsgJyAnICsgcGFyYW1zLmpvaW4oJzsnKSArICdcXHJcXG4nO1xuICB9XG4gIHJldHVybiBsaW5lO1xufTtcblxuLy8gUGFyc2VzIGFuIHJ0Y3AtZmIgbGluZSwgcmV0dXJucyBSVENQUnRjcEZlZWRiYWNrIG9iamVjdC4gU2FtcGxlIGlucHV0OlxuLy8gYT1ydGNwLWZiOjk4IG5hY2sgcnBzaVxuU0RQVXRpbHMucGFyc2VSdGNwRmIgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKGxpbmUuaW5kZXhPZignICcpICsgMSkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBwYXJ0cy5zaGlmdCgpLFxuICAgIHBhcmFtZXRlcjogcGFydHMuam9pbignICcpXG4gIH07XG59O1xuLy8gR2VuZXJhdGUgYT1ydGNwLWZiIGxpbmVzIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yIFJUQ1J0cENvZGVjUGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRjcEZiID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmVzID0gJyc7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgaWYgKGNvZGVjLnJ0Y3BGZWVkYmFjayAmJiBjb2RlYy5ydGNwRmVlZGJhY2subGVuZ3RoKSB7XG4gICAgLy8gRklYTUU6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyci1pbnQ/XG4gICAgY29kZWMucnRjcEZlZWRiYWNrLmZvckVhY2goZnVuY3Rpb24oZmIpIHtcbiAgICAgIGxpbmVzICs9ICdhPXJ0Y3AtZmI6JyArIHB0ICsgJyAnICsgZmIudHlwZSArXG4gICAgICAoZmIucGFyYW1ldGVyICYmIGZiLnBhcmFtZXRlci5sZW5ndGggPyAnICcgKyBmYi5wYXJhbWV0ZXIgOiAnJykgK1xuICAgICAgICAgICdcXHJcXG4nO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBsaW5lcztcbn07XG5cbi8vIFBhcnNlcyBhbiBSRkMgNTU3NiBzc3JjIG1lZGlhIGF0dHJpYnV0ZS4gU2FtcGxlIGlucHV0OlxuLy8gYT1zc3JjOjM3MzU5Mjg1NTkgY25hbWU6c29tZXRoaW5nXG5TRFBVdGlscy5wYXJzZVNzcmNNZWRpYSA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHNwID0gbGluZS5pbmRleE9mKCcgJyk7XG4gIHZhciBwYXJ0cyA9IHtcbiAgICBzc3JjOiBwYXJzZUludChsaW5lLnN1YnN0cig3LCBzcCAtIDcpLCAxMClcbiAgfTtcbiAgdmFyIGNvbG9uID0gbGluZS5pbmRleE9mKCc6Jywgc3ApO1xuICBpZiAoY29sb24gPiAtMSkge1xuICAgIHBhcnRzLmF0dHJpYnV0ZSA9IGxpbmUuc3Vic3RyKHNwICsgMSwgY29sb24gLSBzcCAtIDEpO1xuICAgIHBhcnRzLnZhbHVlID0gbGluZS5zdWJzdHIoY29sb24gKyAxKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEpO1xuICB9XG4gIHJldHVybiBwYXJ0cztcbn07XG5cbi8vIEV4dHJhY3RzIHRoZSBNSUQgKFJGQyA1ODg4KSBmcm9tIGEgbWVkaWEgc2VjdGlvbi5cbi8vIHJldHVybnMgdGhlIE1JRCBvciB1bmRlZmluZWQgaWYgbm8gbWlkIGxpbmUgd2FzIGZvdW5kLlxuU0RQVXRpbHMuZ2V0TWlkID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKVswXTtcbiAgaWYgKG1pZCkge1xuICAgIHJldHVybiBtaWQuc3Vic3RyKDYpO1xuICB9XG59XG5cblNEUFV0aWxzLnBhcnNlRmluZ2VycHJpbnQgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDE0KS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIGFsZ29yaXRobTogcGFydHNbMF0udG9Mb3dlckNhc2UoKSwgLy8gYWxnb3JpdGhtIGlzIGNhc2Utc2Vuc2l0aXZlIGluIEVkZ2UuXG4gICAgdmFsdWU6IHBhcnRzWzFdXG4gIH07XG59O1xuXG4vLyBFeHRyYWN0cyBEVExTIHBhcmFtZXRlcnMgZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGZpbmdlcnByaW50IGxpbmUgYXMgaW5wdXQuIFNlZSBhbHNvIGdldEljZVBhcmFtZXRlcnMuXG5TRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uICsgc2Vzc2lvbnBhcnQsXG4gICAgICAnYT1maW5nZXJwcmludDonKTtcbiAgLy8gTm90ZTogYT1zZXR1cCBsaW5lIGlzIGlnbm9yZWQgc2luY2Ugd2UgdXNlIHRoZSAnYXV0bycgcm9sZS5cbiAgLy8gTm90ZTI6ICdhbGdvcml0aG0nIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZSBleGNlcHQgaW4gRWRnZS5cbiAgcmV0dXJuIHtcbiAgICByb2xlOiAnYXV0bycsXG4gICAgZmluZ2VycHJpbnRzOiBsaW5lcy5tYXAoU0RQVXRpbHMucGFyc2VGaW5nZXJwcmludClcbiAgfTtcbn07XG5cbi8vIFNlcmlhbGl6ZXMgRFRMUyBwYXJhbWV0ZXJzIHRvIFNEUC5cblNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMsIHNldHVwVHlwZSkge1xuICB2YXIgc2RwID0gJ2E9c2V0dXA6JyArIHNldHVwVHlwZSArICdcXHJcXG4nO1xuICBwYXJhbXMuZmluZ2VycHJpbnRzLmZvckVhY2goZnVuY3Rpb24oZnApIHtcbiAgICBzZHAgKz0gJ2E9ZmluZ2VycHJpbnQ6JyArIGZwLmFsZ29yaXRobSArICcgJyArIGZwLnZhbHVlICsgJ1xcclxcbic7XG4gIH0pO1xuICByZXR1cm4gc2RwO1xufTtcbi8vIFBhcnNlcyBJQ0UgaW5mb3JtYXRpb24gZnJvbSBTRFAgbWVkaWEgc2VjdGlvbiBvciBzZXNzaW9ucGFydC5cbi8vIEZJWE1FOiBmb3IgY29uc2lzdGVuY3kgd2l0aCBvdGhlciBmdW5jdGlvbnMgdGhpcyBzaG91bGQgb25seVxuLy8gICBnZXQgdGhlIGljZS11ZnJhZyBhbmQgaWNlLXB3ZCBsaW5lcyBhcyBpbnB1dC5cblNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgLy8gU2VhcmNoIGluIHNlc3Npb24gcGFydCwgdG9vLlxuICBsaW5lcyA9IGxpbmVzLmNvbmNhdChTRFBVdGlscy5zcGxpdExpbmVzKHNlc3Npb25wYXJ0KSk7XG4gIHZhciBpY2VQYXJhbWV0ZXJzID0ge1xuICAgIHVzZXJuYW1lRnJhZ21lbnQ6IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgICByZXR1cm4gbGluZS5pbmRleE9mKCdhPWljZS11ZnJhZzonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTIpLFxuICAgIHBhc3N3b3JkOiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtcHdkOicpID09PSAwO1xuICAgIH0pWzBdLnN1YnN0cigxMClcbiAgfTtcbiAgcmV0dXJuIGljZVBhcmFtZXRlcnM7XG59O1xuXG4vLyBTZXJpYWxpemVzIElDRSBwYXJhbWV0ZXJzIHRvIFNEUC5cblNEUFV0aWxzLndyaXRlSWNlUGFyYW1ldGVycyA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICByZXR1cm4gJ2E9aWNlLXVmcmFnOicgKyBwYXJhbXMudXNlcm5hbWVGcmFnbWVudCArICdcXHJcXG4nICtcbiAgICAgICdhPWljZS1wd2Q6JyArIHBhcmFtcy5wYXNzd29yZCArICdcXHJcXG4nO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBSVENSdHBQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBkZXNjcmlwdGlvbiA9IHtcbiAgICBjb2RlY3M6IFtdLFxuICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgIGZlY01lY2hhbmlzbXM6IFtdLFxuICAgIHJ0Y3A6IFtdXG4gIH07XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcbiAgZm9yICh2YXIgaSA9IDM7IGkgPCBtbGluZS5sZW5ndGg7IGkrKykgeyAvLyBmaW5kIGFsbCBjb2RlY3MgZnJvbSBtbGluZVszLi5dXG4gICAgdmFyIHB0ID0gbWxpbmVbaV07XG4gICAgdmFyIHJ0cG1hcGxpbmUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydHBtYXA6JyArIHB0ICsgJyAnKVswXTtcbiAgICBpZiAocnRwbWFwbGluZSkge1xuICAgICAgdmFyIGNvZGVjID0gU0RQVXRpbHMucGFyc2VSdHBNYXAocnRwbWFwbGluZSk7XG4gICAgICB2YXIgZm10cHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChcbiAgICAgICAgICBtZWRpYVNlY3Rpb24sICdhPWZtdHA6JyArIHB0ICsgJyAnKTtcbiAgICAgIC8vIE9ubHkgdGhlIGZpcnN0IGE9Zm10cDo8cHQ+IGlzIGNvbnNpZGVyZWQuXG4gICAgICBjb2RlYy5wYXJhbWV0ZXJzID0gZm10cHMubGVuZ3RoID8gU0RQVXRpbHMucGFyc2VGbXRwKGZtdHBzWzBdKSA6IHt9O1xuICAgICAgY29kZWMucnRjcEZlZWRiYWNrID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1ydGNwLWZiOicgKyBwdCArICcgJylcbiAgICAgICAgLm1hcChTRFBVdGlscy5wYXJzZVJ0Y3BGYik7XG4gICAgICBkZXNjcmlwdGlvbi5jb2RlY3MucHVzaChjb2RlYyk7XG4gICAgICAvLyBwYXJzZSBGRUMgbWVjaGFuaXNtcyBmcm9tIHJ0cG1hcCBsaW5lcy5cbiAgICAgIHN3aXRjaCAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ1JFRCc6XG4gICAgICAgIGNhc2UgJ1VMUEZFQyc6XG4gICAgICAgICAgZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5wdXNoKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IC8vIG9ubHkgUkVEIGFuZCBVTFBGRUMgYXJlIHJlY29nbml6ZWQgYXMgRkVDIG1lY2hhbmlzbXMuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9ZXh0bWFwOicpLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgIGRlc2NyaXB0aW9uLmhlYWRlckV4dGVuc2lvbnMucHVzaChTRFBVdGlscy5wYXJzZUV4dG1hcChsaW5lKSk7XG4gIH0pO1xuICAvLyBGSVhNRTogcGFyc2UgcnRjcC5cbiAgcmV0dXJuIGRlc2NyaXB0aW9uO1xufTtcblxuLy8gR2VuZXJhdGVzIHBhcnRzIG9mIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBkZXNjcmliaW5nIHRoZSBjYXBhYmlsaXRpZXMgL1xuLy8gcGFyYW1ldGVycy5cblNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24gPSBmdW5jdGlvbihraW5kLCBjYXBzKSB7XG4gIHZhciBzZHAgPSAnJztcblxuICAvLyBCdWlsZCB0aGUgbWxpbmUuXG4gIHNkcCArPSAnbT0nICsga2luZCArICcgJztcbiAgc2RwICs9IGNhcHMuY29kZWNzLmxlbmd0aCA+IDAgPyAnOScgOiAnMCc7IC8vIHJlamVjdCBpZiBubyBjb2RlY3MuXG4gIHNkcCArPSAnIFVEUC9UTFMvUlRQL1NBVlBGICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5tYXAoZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICAgIH1cbiAgICByZXR1cm4gY29kZWMucGF5bG9hZFR5cGU7XG4gIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuXG4gIHNkcCArPSAnYz1JTiBJUDQgMC4wLjAuMFxcclxcbic7XG4gIHNkcCArPSAnYT1ydGNwOjkgSU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuXG4gIC8vIEFkZCBhPXJ0cG1hcCBsaW5lcyBmb3IgZWFjaCBjb2RlYy4gQWxzbyBmbXRwIGFuZCBydGNwLWZiLlxuICBjYXBzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRwTWFwKGNvZGVjKTtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVGbXRwKGNvZGVjKTtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVSdGNwRmIoY29kZWMpO1xuICB9KTtcbiAgdmFyIG1heHB0aW1lID0gMDtcbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIGlmIChjb2RlYy5tYXhwdGltZSA+IG1heHB0aW1lKSB7XG4gICAgICBtYXhwdGltZSA9IGNvZGVjLm1heHB0aW1lO1xuICAgIH1cbiAgfSk7XG4gIGlmIChtYXhwdGltZSA+IDApIHtcbiAgICBzZHAgKz0gJ2E9bWF4cHRpbWU6JyArIG1heHB0aW1lICsgJ1xcclxcbic7XG4gIH1cbiAgc2RwICs9ICdhPXJ0Y3AtbXV4XFxyXFxuJztcblxuICBjYXBzLmhlYWRlckV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVFeHRtYXAoZXh0ZW5zaW9uKTtcbiAgfSk7XG4gIC8vIEZJWE1FOiB3cml0ZSBmZWNNZWNoYW5pc21zLlxuICByZXR1cm4gc2RwO1xufTtcblxuLy8gUGFyc2VzIHRoZSBTRFAgbWVkaWEgc2VjdGlvbiBhbmQgcmV0dXJucyBhbiBhcnJheSBvZlxuLy8gUlRDUnRwRW5jb2RpbmdQYXJhbWV0ZXJzLlxuU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGVuY29kaW5nUGFyYW1ldGVycyA9IFtdO1xuICB2YXIgZGVzY3JpcHRpb24gPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIGhhc1JlZCA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignUkVEJykgIT09IC0xO1xuICB2YXIgaGFzVWxwZmVjID0gZGVzY3JpcHRpb24uZmVjTWVjaGFuaXNtcy5pbmRleE9mKCdVTFBGRUMnKSAhPT0gLTE7XG5cbiAgLy8gZmlsdGVyIGE9c3NyYzouLi4gY25hbWU6LCBpZ25vcmUgUGxhbkItbXNpZFxuICB2YXIgc3NyY3MgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICB9KVxuICAuZmlsdGVyKGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgfSk7XG4gIHZhciBwcmltYXJ5U3NyYyA9IHNzcmNzLmxlbmd0aCA+IDAgJiYgc3NyY3NbMF0uc3NyYztcbiAgdmFyIHNlY29uZGFyeVNzcmM7XG5cbiAgdmFyIGZsb3dzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjLWdyb3VwOkZJRCcpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJyAnKTtcbiAgICBwYXJ0cy5zaGlmdCgpO1xuICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBhcnQsIDEwKTtcbiAgICB9KTtcbiAgfSk7XG4gIGlmIChmbG93cy5sZW5ndGggPiAwICYmIGZsb3dzWzBdLmxlbmd0aCA+IDEgJiYgZmxvd3NbMF1bMF0gPT09IHByaW1hcnlTc3JjKSB7XG4gICAgc2Vjb25kYXJ5U3NyYyA9IGZsb3dzWzBdWzFdO1xuICB9XG5cbiAgZGVzY3JpcHRpb24uY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnUlRYJyAmJiBjb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xuICAgICAgdmFyIGVuY1BhcmFtID0ge1xuICAgICAgICBzc3JjOiBwcmltYXJ5U3NyYyxcbiAgICAgICAgY29kZWNQYXlsb2FkVHlwZTogcGFyc2VJbnQoY29kZWMucGFyYW1ldGVycy5hcHQsIDEwKSxcbiAgICAgICAgcnR4OiB7XG4gICAgICAgICAgc3NyYzogc2Vjb25kYXJ5U3NyY1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgaWYgKGhhc1JlZCkge1xuICAgICAgICBlbmNQYXJhbSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZW5jUGFyYW0pKTtcbiAgICAgICAgZW5jUGFyYW0uZmVjID0ge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmMsXG4gICAgICAgICAgbWVjaGFuaXNtOiBoYXNVbHBmZWMgPyAncmVkK3VscGZlYycgOiAncmVkJ1xuICAgICAgICB9O1xuICAgICAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaChlbmNQYXJhbSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKGVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGggPT09IDAgJiYgcHJpbWFyeVNzcmMpIHtcbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMucHVzaCh7XG4gICAgICBzc3JjOiBwcmltYXJ5U3NyY1xuICAgIH0pO1xuICB9XG5cbiAgLy8gd2Ugc3VwcG9ydCBib3RoIGI9QVMgYW5kIGI9VElBUyBidXQgaW50ZXJwcmV0IEFTIGFzIFRJQVMuXG4gIHZhciBiYW5kd2lkdGggPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdiPScpO1xuICBpZiAoYmFuZHdpZHRoLmxlbmd0aCkge1xuICAgIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1USUFTOicpID09PSAwKSB7XG4gICAgICBiYW5kd2lkdGggPSBwYXJzZUludChiYW5kd2lkdGhbMF0uc3Vic3RyKDcpLCAxMCk7XG4gICAgfSBlbHNlIGlmIChiYW5kd2lkdGhbMF0uaW5kZXhPZignYj1BUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig1KSwgMTApO1xuICAgIH1cbiAgICBlbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgIHBhcmFtcy5tYXhCaXRyYXRlID0gYmFuZHdpZHRoO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBlbmNvZGluZ1BhcmFtZXRlcnM7XG59O1xuXG4vLyBwYXJzZXMgaHR0cDovL2RyYWZ0Lm9ydGMub3JnLyNydGNydGNwcGFyYW1ldGVycypcblNEUFV0aWxzLnBhcnNlUnRjcFBhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIHJ0Y3BQYXJhbWV0ZXJzID0ge307XG5cbiAgdmFyIGNuYW1lO1xuICAvLyBHZXRzIHRoZSBmaXJzdCBTU1JDLiBOb3RlIHRoYXQgd2l0aCBSVFggdGhlcmUgbWlnaHQgYmUgbXVsdGlwbGVcbiAgLy8gU1NSQ3MuXG4gIHZhciByZW1vdGVTc3JjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gICAgICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmouYXR0cmlidXRlID09PSAnY25hbWUnO1xuICAgICAgfSlbMF07XG4gIGlmIChyZW1vdGVTc3JjKSB7XG4gICAgcnRjcFBhcmFtZXRlcnMuY25hbWUgPSByZW1vdGVTc3JjLnZhbHVlO1xuICAgIHJ0Y3BQYXJhbWV0ZXJzLnNzcmMgPSByZW1vdGVTc3JjLnNzcmM7XG4gIH1cblxuICAvLyBFZGdlIHVzZXMgdGhlIGNvbXBvdW5kIGF0dHJpYnV0ZSBpbnN0ZWFkIG9mIHJlZHVjZWRTaXplXG4gIC8vIGNvbXBvdW5kIGlzICFyZWR1Y2VkU2l6ZVxuICB2YXIgcnNpemUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXJ0Y3AtcnNpemUnKTtcbiAgcnRjcFBhcmFtZXRlcnMucmVkdWNlZFNpemUgPSByc2l6ZS5sZW5ndGggPiAwO1xuICBydGNwUGFyYW1ldGVycy5jb21wb3VuZCA9IHJzaXplLmxlbmd0aCA9PT0gMDtcblxuICAvLyBwYXJzZXMgdGhlIHJ0Y3AtbXV4IGF0dHLRlmJ1dGUuXG4gIC8vIE5vdGUgdGhhdCBFZGdlIGRvZXMgbm90IHN1cHBvcnQgdW5tdXhlZCBSVENQLlxuICB2YXIgbXV4ID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1ydGNwLW11eCcpO1xuICBydGNwUGFyYW1ldGVycy5tdXggPSBtdXgubGVuZ3RoID4gMDtcblxuICByZXR1cm4gcnRjcFBhcmFtZXRlcnM7XG59O1xuXG4vLyBwYXJzZXMgZWl0aGVyIGE9bXNpZDogb3IgYT1zc3JjOi4uLiBtc2lkIGxpbmVzIGFuIHJldHVybnNcbi8vIHRoZSBpZCBvZiB0aGUgTWVkaWFTdHJlYW0gYW5kIE1lZGlhU3RyZWFtVHJhY2suXG5TRFBVdGlscy5wYXJzZU1zaWQgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIHBhcnRzO1xuICB2YXIgc3BlYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9bXNpZDonKTtcbiAgaWYgKHNwZWMubGVuZ3RoID09PSAxKSB7XG4gICAgcGFydHMgPSBzcGVjWzBdLnN1YnN0cig3KS5zcGxpdCgnICcpO1xuICAgIHJldHVybiB7c3RyZWFtOiBwYXJ0c1swXSwgdHJhY2s6IHBhcnRzWzFdfTtcbiAgfVxuICB2YXIgcGxhbkIgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICB9KVxuICAuZmlsdGVyKGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ21zaWQnO1xuICB9KTtcbiAgaWYgKHBsYW5CLmxlbmd0aCA+IDApIHtcbiAgICBwYXJ0cyA9IHBsYW5CWzBdLnZhbHVlLnNwbGl0KCcgJyk7XG4gICAgcmV0dXJuIHtzdHJlYW06IHBhcnRzWzBdLCB0cmFjazogcGFydHNbMV19O1xuICB9XG59O1xuXG5TRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBGSVhNRTogc2Vzcy1pZCBzaG91bGQgYmUgYW4gTlRQIHRpbWVzdGFtcC5cbiAgcmV0dXJuICd2PTBcXHJcXG4nICtcbiAgICAgICdvPXRoaXNpc2FkYXB0ZXJvcnRjIDgxNjk2Mzk5MTU2NDY5NDMxMzcgMiBJTiBJUDQgMTI3LjAuMC4xXFxyXFxuJyArXG4gICAgICAncz0tXFxyXFxuJyArXG4gICAgICAndD0wIDBcXHJcXG4nO1xufTtcblxuU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24gPSBmdW5jdGlvbih0cmFuc2NlaXZlciwgY2FwcywgdHlwZSwgc3RyZWFtKSB7XG4gIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uKHRyYW5zY2VpdmVyLmtpbmQsIGNhcHMpO1xuXG4gIC8vIE1hcCBJQ0UgcGFyYW1ldGVycyAodWZyYWcsIHB3ZCkgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuZ2V0TG9jYWxQYXJhbWV0ZXJzKCkpO1xuXG4gIC8vIE1hcCBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVEdGxzUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuZ2V0TG9jYWxQYXJhbWV0ZXJzKCksXG4gICAgICB0eXBlID09PSAnb2ZmZXInID8gJ2FjdHBhc3MnIDogJ2FjdGl2ZScpO1xuXG4gIHNkcCArPSAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xuXG4gIGlmICh0cmFuc2NlaXZlci5kaXJlY3Rpb24pIHtcbiAgICBzZHAgKz0gJ2E9JyArIHRyYW5zY2VpdmVyLmRpcmVjdGlvbiArICdcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlciAmJiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgIHNkcCArPSAnYT1zZW5kcmVjdlxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgc2RwICs9ICdhPXNlbmRvbmx5XFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBSZWNlaXZlcikge1xuICAgIHNkcCArPSAnYT1yZWN2b25seVxcclxcbic7XG4gIH0gZWxzZSB7XG4gICAgc2RwICs9ICdhPWluYWN0aXZlXFxyXFxuJztcbiAgfVxuXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAvLyBzcGVjLlxuICAgIHZhciBtc2lkID0gJ21zaWQ6JyArIHN0cmVhbS5pZCArICcgJyArXG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci50cmFjay5pZCArICdcXHJcXG4nO1xuICAgIHNkcCArPSAnYT0nICsgbXNpZDtcblxuICAgIC8vIGZvciBDaHJvbWUuXG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAgICcgJyArIG1zaWQ7XG4gICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4KSB7XG4gICAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXG4gICAgICAgICAgJyAnICsgbXNpZDtcbiAgICAgIHNkcCArPSAnYT1zc3JjLWdyb3VwOkZJRCAnICtcbiAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgKyAnICcgK1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xuICAgICAgICAgICdcXHJcXG4nO1xuICAgIH1cbiAgfVxuICAvLyBGSVhNRTogdGhpcyBzaG91bGQgYmUgd3JpdHRlbiBieSB3cml0ZVJ0cERlc2NyaXB0aW9uLlxuICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcbiAgICAgICcgY25hbWU6JyArIFNEUFV0aWxzLmxvY2FsQ05hbWUgKyAnXFxyXFxuJztcbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlciAmJiB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xuICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcbiAgICAgICAgJyBjbmFtZTonICsgU0RQVXRpbHMubG9jYWxDTmFtZSArICdcXHJcXG4nO1xuICB9XG4gIHJldHVybiBzZHA7XG59O1xuXG4vLyBHZXRzIHRoZSBkaXJlY3Rpb24gZnJvbSB0aGUgbWVkaWFTZWN0aW9uIG9yIHRoZSBzZXNzaW9ucGFydC5cblNEUFV0aWxzLmdldERpcmVjdGlvbiA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpIHtcbiAgLy8gTG9vayBmb3Igc2VuZHJlY3YsIHNlbmRvbmx5LCByZWN2b25seSwgaW5hY3RpdmUsIGRlZmF1bHQgdG8gc2VuZHJlY3YuXG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHN3aXRjaCAobGluZXNbaV0pIHtcbiAgICAgIGNhc2UgJ2E9c2VuZHJlY3YnOlxuICAgICAgY2FzZSAnYT1zZW5kb25seSc6XG4gICAgICBjYXNlICdhPXJlY3Zvbmx5JzpcbiAgICAgIGNhc2UgJ2E9aW5hY3RpdmUnOlxuICAgICAgICByZXR1cm4gbGluZXNbaV0uc3Vic3RyKDIpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gRklYTUU6IFdoYXQgc2hvdWxkIGhhcHBlbiBoZXJlP1xuICAgIH1cbiAgfVxuICBpZiAoc2Vzc2lvbnBhcnQpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMuZ2V0RGlyZWN0aW9uKHNlc3Npb25wYXJ0KTtcbiAgfVxuICByZXR1cm4gJ3NlbmRyZWN2Jztcbn07XG5cblNEUFV0aWxzLmdldEtpbmQgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICB2YXIgbWxpbmUgPSBsaW5lc1swXS5zcGxpdCgnICcpO1xuICByZXR1cm4gbWxpbmVbMF0uc3Vic3RyKDIpO1xufTtcblxuU0RQVXRpbHMuaXNSZWplY3RlZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICByZXR1cm4gbWVkaWFTZWN0aW9uLnNwbGl0KCcgJywgMilbMV0gPT09ICcwJztcbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gU0RQVXRpbHM7XG4iLCIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xudmFyIGJ5dGVUb0hleCA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4O1xuICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBieXRlc1RvVXVpZDtcbiIsIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBJbiB0aGVcbi8vIGJyb3dzZXIgdGhpcyBpcyBhIGxpdHRsZSBjb21wbGljYXRlZCBkdWUgdG8gdW5rbm93biBxdWFsaXR5IG9mIE1hdGgucmFuZG9tKClcbi8vIGFuZCBpbmNvbnNpc3RlbnQgc3VwcG9ydCBmb3IgdGhlIGBjcnlwdG9gIEFQSS4gIFdlIGRvIHRoZSBiZXN0IHdlIGNhbiB2aWFcbi8vIGZlYXR1cmUtZGV0ZWN0aW9uXG52YXIgcm5nO1xuXG52YXIgY3J5cHRvID0gZ2xvYmFsLmNyeXB0byB8fCBnbG9iYWwubXNDcnlwdG87IC8vIGZvciBJRSAxMVxuaWYgKGNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gIC8vIFdIQVRXRyBjcnlwdG8gUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICB2YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG4gIHJuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbiAgICByZXR1cm4gcm5kczg7XG4gIH07XG59XG5cbmlmICghcm5nKSB7XG4gIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgLy9cbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgLy8gcXVhbGl0eS5cbiAgdmFyICBybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgIHJuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJuZHM7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm5nO1xuIiwidmFyIHJuZyA9IHJlcXVpcmUoJy4vbGliL3JuZycpO1xudmFyIGJ5dGVzVG9VdWlkID0gcmVxdWlyZSgnLi9saWIvYnl0ZXNUb1V1aWQnKTtcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQXJyYXkoMTYpIDogbnVsbDtcbiAgICBvcHRpb25zID0gbnVsbDtcbiAgfVxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7XG5cbiAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgaWYgKGJ1Zikge1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgKytpaSkge1xuICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmIHx8IGJ5dGVzVG9VdWlkKHJuZHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHY0O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gU2hpbW1pbmcgc3RhcnRzIGhlcmUuXG4oZnVuY3Rpb24oKSB7XG4gIC8vIFV0aWxzLlxuICB2YXIgbG9nZ2luZyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5sb2c7XG4gIHZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcbiAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlckRldGFpbHMgPSBicm93c2VyRGV0YWlscztcbiAgbW9kdWxlLmV4cG9ydHMuZXh0cmFjdFZlcnNpb24gPSByZXF1aXJlKCcuL3V0aWxzJykuZXh0cmFjdFZlcnNpb247XG4gIG1vZHVsZS5leHBvcnRzLmRpc2FibGVMb2cgPSByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZztcblxuICAvLyBVbmNvbW1lbnQgdGhlIGxpbmUgYmVsb3cgaWYgeW91IHdhbnQgbG9nZ2luZyB0byBvY2N1ciwgaW5jbHVkaW5nIGxvZ2dpbmdcbiAgLy8gZm9yIHRoZSBzd2l0Y2ggc3RhdGVtZW50IGJlbG93LiBDYW4gYWxzbyBiZSB0dXJuZWQgb24gaW4gdGhlIGJyb3dzZXIgdmlhXG4gIC8vIGFkYXB0ZXIuZGlzYWJsZUxvZyhmYWxzZSksIGJ1dCB0aGVuIGxvZ2dpbmcgZnJvbSB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvd1xuICAvLyB3aWxsIG5vdCBhcHBlYXIuXG4gIC8vIHJlcXVpcmUoJy4vdXRpbHMnKS5kaXNhYmxlTG9nKGZhbHNlKTtcblxuICAvLyBCcm93c2VyIHNoaW1zLlxuICB2YXIgY2hyb21lU2hpbSA9IHJlcXVpcmUoJy4vY2hyb21lL2Nocm9tZV9zaGltJykgfHwgbnVsbDtcbiAgdmFyIGVkZ2VTaGltID0gcmVxdWlyZSgnLi9lZGdlL2VkZ2Vfc2hpbScpIHx8IG51bGw7XG4gIHZhciBmaXJlZm94U2hpbSA9IHJlcXVpcmUoJy4vZmlyZWZveC9maXJlZm94X3NoaW0nKSB8fCBudWxsO1xuICB2YXIgc2FmYXJpU2hpbSA9IHJlcXVpcmUoJy4vc2FmYXJpL3NhZmFyaV9zaGltJykgfHwgbnVsbDtcblxuICAvLyBTaGltIGJyb3dzZXIgaWYgZm91bmQuXG4gIHN3aXRjaCAoYnJvd3NlckRldGFpbHMuYnJvd3Nlcikge1xuICAgIGNhc2UgJ29wZXJhJzogLy8gZmFsbHRocm91Z2ggYXMgaXQgdXNlcyBjaHJvbWUgc2hpbXNcbiAgICBjYXNlICdjaHJvbWUnOlxuICAgICAgaWYgKCFjaHJvbWVTaGltIHx8ICFjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdDaHJvbWUgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgY2hyb21lLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gY2hyb21lU2hpbTtcblxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1NZWRpYVN0cmVhbSgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgY2hyb21lU2hpbS5zaGltT25UcmFjaygpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmlyZWZveCc6XG4gICAgICBpZiAoIWZpcmVmb3hTaGltIHx8ICFmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnRmlyZWZveCBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBmaXJlZm94LicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJTaGltID0gZmlyZWZveFNoaW07XG5cbiAgICAgIGZpcmVmb3hTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QoKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1QZWVyQ29ubmVjdGlvbigpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VkZ2UnOlxuICAgICAgaWYgKCFlZGdlU2hpbSB8fCAhZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ01TIGVkZ2Ugc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZWRnZS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGVkZ2VTaGltO1xuXG4gICAgICBlZGdlU2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NhZmFyaSc6XG4gICAgICBpZiAoIXNhZmFyaVNoaW0pIHtcbiAgICAgICAgbG9nZ2luZygnU2FmYXJpIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIHNhZmFyaS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IHNhZmFyaVNoaW07XG5cbiAgICAgIHNhZmFyaVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZ2dpbmcoJ1Vuc3VwcG9ydGVkIGJyb3dzZXIhJyk7XG4gIH1cbn0pKCk7XG4iLCJcbi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJykuYnJvd3NlckRldGFpbHM7XG5cbnZhciBjaHJvbWVTaGltID0ge1xuICBzaGltTWVkaWFTdHJlYW06IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5NZWRpYVN0cmVhbSA9IHdpbmRvdy5NZWRpYVN0cmVhbSB8fCB3aW5kb3cud2Via2l0TWVkaWFTdHJlYW07XG4gIH0sXG5cbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgLy8gb25hZGRzdHJlYW0gZG9lcyBub3QgZmlyZSB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgdG8gYW4gZXhpc3RpbmdcbiAgICAgICAgICAgIC8vIHN0cmVhbS4gQnV0IHN0cmVhbS5vbmFkZHRyYWNrIGlzIGltcGxlbWVudGVkIHNvIHdlIHVzZSB0aGF0LlxuICAgICAgICAgICAgZS5zdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbih0ZSkge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdGUudHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0ZS50cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBzaGltU291cmNlT2JqZWN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zcmNPYmplY3Q7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgLy8gVXNlIF9zcmNPYmplY3QgYXMgYSBwcml2YXRlIHByb3BlcnR5IGZvciB0aGlzIHNoaW1cbiAgICAgICAgICAgIHRoaXMuX3NyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3JjKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFzdHJlYW0pIHtcbiAgICAgICAgICAgICAgdGhpcy5zcmMgPSAnJztcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBibG9iIHVybCB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgb3JcbiAgICAgICAgICAgIC8vIHJlbW92ZWQuIERvaW5nIGl0IG1hbnVhbGx5IHNpbmNlIHdlIHdhbnQgdG8gYXZvaWQgYSByZWN1cnNpb24uXG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdyZW1vdmV0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xuICAgICAgLy8gVHJhbnNsYXRlIGljZVRyYW5zcG9ydFBvbGljeSB0byBpY2VUcmFuc3BvcnRzLFxuICAgICAgLy8gc2VlIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3Avd2VicnRjL2lzc3Vlcy9kZXRhaWw/aWQ9NDg2OVxuICAgICAgbG9nZ2luZygnUGVlckNvbm5lY3Rpb24nKTtcbiAgICAgIGlmIChwY0NvbmZpZyAmJiBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgcGNDb25maWcuaWNlVHJhbnNwb3J0cyA9IHBjQ29uZmlnLmljZVRyYW5zcG9ydFBvbGljeTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBjID0gbmV3IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIHZhciBvcmlnR2V0U3RhdHMgPSBwYy5nZXRTdGF0cy5iaW5kKHBjKTtcbiAgICAgIHBjLmdldFN0YXRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIC8vIElmIHNlbGVjdG9yIGlzIGEgZnVuY3Rpb24gdGhlbiB3ZSBhcmUgaW4gdGhlIG9sZCBzdHlsZSBzdGF0cyBzbyBqdXN0XG4gICAgICAgIC8vIHBhc3MgYmFjayB0aGUgb3JpZ2luYWwgZ2V0U3RhdHMgZm9ybWF0IHRvIGF2b2lkIGJyZWFraW5nIG9sZCB1c2Vycy5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMoc2VsZWN0b3IsIHN1Y2Nlc3NDYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZml4Q2hyb21lU3RhdHNfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICB2YXIgc3RhbmRhcmRSZXBvcnQgPSB7fTtcbiAgICAgICAgICB2YXIgcmVwb3J0cyA9IHJlc3BvbnNlLnJlc3VsdCgpO1xuICAgICAgICAgIHJlcG9ydHMuZm9yRWFjaChmdW5jdGlvbihyZXBvcnQpIHtcbiAgICAgICAgICAgIHZhciBzdGFuZGFyZFN0YXRzID0ge1xuICAgICAgICAgICAgICBpZDogcmVwb3J0LmlkLFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IHJlcG9ydC50aW1lc3RhbXAsXG4gICAgICAgICAgICAgIHR5cGU6IHJlcG9ydC50eXBlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVwb3J0Lm5hbWVzKCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgIHN0YW5kYXJkU3RhdHNbbmFtZV0gPSByZXBvcnQuc3RhdChuYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RhbmRhcmRSZXBvcnRbc3RhbmRhcmRTdGF0cy5pZF0gPSBzdGFuZGFyZFN0YXRzO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHN0YW5kYXJkUmVwb3J0O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICAgICAgdmFyIG1ha2VNYXBTdGF0cyA9IGZ1bmN0aW9uKHN0YXRzLCBsZWdhY3lTdGF0cykge1xuICAgICAgICAgIHZhciBtYXAgPSBuZXcgTWFwKE9iamVjdC5rZXlzKHN0YXRzKS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm5ba2V5LCBzdGF0c1trZXldXTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgbGVnYWN5U3RhdHMgPSBsZWdhY3lTdGF0cyB8fCBzdGF0cztcbiAgICAgICAgICBPYmplY3Qua2V5cyhsZWdhY3lTdGF0cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIG1hcFtrZXldID0gbGVnYWN5U3RhdHNba2V5XTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICB2YXIgc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgYXJnc1sxXShtYWtlTWFwU3RhdHMoZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSkpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIFtzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyxcbiAgICAgICAgICAgICAgYXJndW1lbnRzWzBdXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcm9taXNlLXN1cHBvcnRcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBvcmlnR2V0U3RhdHMuYXBwbHkoc2VsZiwgW1xuICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobWFrZU1hcFN0YXRzKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpKTtcbiAgICAgICAgICAgICAgfSwgcmVqZWN0XSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFByZXNlcnZlIGxlZ2FjeSBjaHJvbWUgc3RhdHMgb25seSBvbiBsZWdhY3kgYWNjZXNzIG9mIHN0YXRzIG9ialxuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsIFtcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG1ha2VNYXBTdGF0cyhmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpLFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5yZXN1bHQoKSkpO1xuICAgICAgICAgICAgICB9LCByZWplY3RdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBwYztcbiAgICB9O1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG5cbiAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgIGlmICh3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgWydjcmVhdGVPZmZlcicsICdjcmVhdGVBbnN3ZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEgfHwgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkoc2VsZiwgW3Jlc29sdmUsIHJlamVjdCwgb3B0c10pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgcHJvbWlzZSBzdXBwb3J0IC0tIG5hdGl2ZWx5IGF2YWlsYWJsZSBpbiBDaHJvbWUgNTFcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDUxKSB7XG4gICAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFthcmdzWzBdLCByZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFyZ3NbMV0uYXBwbHkobnVsbCwgW10pO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgICAgYXJnc1syXS5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gc2hpbSBpbXBsaWNpdCBjcmVhdGlvbiBvZiBSVENTZXNzaW9uRGVzY3JpcHRpb24vUlRDSWNlQ2FuZGlkYXRlXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZEljZUNhbmRpZGF0ZShudWxsKVxuICAgIHZhciBuYXRpdmVBZGRJY2VDYW5kaWRhdGUgPVxuICAgICAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xuICAgIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IG51bGwpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1sxXSkge1xuICAgICAgICAgIGFyZ3VtZW50c1sxXS5hcHBseShudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlQWRkSWNlQ2FuZGlkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxufTtcblxuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbU1lZGlhU3RyZWFtOiBjaHJvbWVTaGltLnNoaW1NZWRpYVN0cmVhbSxcbiAgc2hpbU9uVHJhY2s6IGNocm9tZVNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCxcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbixcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKVxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmxvZztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbnN0cmFpbnRzVG9DaHJvbWVfID0gZnVuY3Rpb24oYykge1xuICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5tYW5kYXRvcnkgfHwgYy5vcHRpb25hbCkge1xuICAgICAgcmV0dXJuIGM7XG4gICAgfVxuICAgIHZhciBjYyA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVxdWlyZScgfHwga2V5ID09PSAnYWR2YW5jZWQnIHx8IGtleSA9PT0gJ21lZGlhU291cmNlJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgciA9ICh0eXBlb2YgY1trZXldID09PSAnb2JqZWN0JykgPyBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ID09PSAnbnVtYmVyJykge1xuICAgICAgICByLm1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgIH1cbiAgICAgIHZhciBvbGRuYW1lXyA9IGZ1bmN0aW9uKHByZWZpeCwgbmFtZSkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmFtZSA9PT0gJ2RldmljZUlkJykgPyAnc291cmNlSWQnIDogbmFtZTtcbiAgICAgIH07XG4gICAgICBpZiAoci5pZGVhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNjLm9wdGlvbmFsID0gY2Mub3B0aW9uYWwgfHwgW107XG4gICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21pbicsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgICBvYyA9IHt9O1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtYXgnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJycsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8oJycsIGtleSldID0gci5leGFjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFsnbWluJywgJ21heCddLmZvckVhY2goZnVuY3Rpb24obWl4KSB7XG4gICAgICAgICAgaWYgKHJbbWl4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjYy5tYW5kYXRvcnkgPSBjYy5tYW5kYXRvcnkgfHwge307XG4gICAgICAgICAgICBjYy5tYW5kYXRvcnlbb2xkbmFtZV8obWl4LCBrZXkpXSA9IHJbbWl4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChjLmFkdmFuY2VkKSB7XG4gICAgICBjYy5vcHRpb25hbCA9IChjYy5vcHRpb25hbCB8fCBbXSkuY29uY2F0KGMuYWR2YW5jZWQpO1xuICAgIH1cbiAgICByZXR1cm4gY2M7XG4gIH07XG5cbiAgdmFyIHNoaW1Db25zdHJhaW50c18gPSBmdW5jdGlvbihjb25zdHJhaW50cywgZnVuYykge1xuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIGlmIChjb25zdHJhaW50cyAmJiBjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgY29uc3RyYWludHMuYXVkaW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgfVxuICAgIGlmIChjb25zdHJhaW50cyAmJiB0eXBlb2YgY29uc3RyYWludHMudmlkZW8gPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyBTaGltIGZhY2luZ01vZGUgZm9yIG1vYmlsZSwgd2hlcmUgaXQgZGVmYXVsdHMgdG8gXCJ1c2VyXCIuXG4gICAgICB2YXIgZmFjZSA9IGNvbnN0cmFpbnRzLnZpZGVvLmZhY2luZ01vZGU7XG4gICAgICBmYWNlID0gZmFjZSAmJiAoKHR5cGVvZiBmYWNlID09PSAnb2JqZWN0JykgPyBmYWNlIDoge2lkZWFsOiBmYWNlfSk7XG5cbiAgICAgIGlmICgoZmFjZSAmJiAoZmFjZS5leGFjdCA9PT0gJ3VzZXInIHx8IGZhY2UuZXhhY3QgPT09ICdlbnZpcm9ubWVudCcgfHxcbiAgICAgICAgICAgICAgICAgICAgZmFjZS5pZGVhbCA9PT0gJ3VzZXInIHx8IGZhY2UuaWRlYWwgPT09ICdlbnZpcm9ubWVudCcpKSAmJlxuICAgICAgICAgICEobmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRTdXBwb3J0ZWRDb25zdHJhaW50cyAmJlxuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRTdXBwb3J0ZWRDb25zdHJhaW50cygpLmZhY2luZ01vZGUpKSB7XG4gICAgICAgIGRlbGV0ZSBjb25zdHJhaW50cy52aWRlby5mYWNpbmdNb2RlO1xuICAgICAgICBpZiAoZmFjZS5leGFjdCA9PT0gJ2Vudmlyb25tZW50JyB8fCBmYWNlLmlkZWFsID09PSAnZW52aXJvbm1lbnQnKSB7XG4gICAgICAgICAgLy8gTG9vayBmb3IgXCJiYWNrXCIgaW4gbGFiZWwsIG9yIHVzZSBsYXN0IGNhbSAodHlwaWNhbGx5IGJhY2sgY2FtKS5cbiAgICAgICAgICByZXR1cm4gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzKClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihkZXZpY2VzKSB7XG4gICAgICAgICAgICBkZXZpY2VzID0gZGV2aWNlcy5maWx0ZXIoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICByZXR1cm4gZC5raW5kID09PSAndmlkZW9pbnB1dCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBiYWNrID0gZGV2aWNlcy5maW5kKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGQubGFiZWwudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdiYWNrJykgIT09IC0xO1xuICAgICAgICAgICAgfSkgfHwgKGRldmljZXMubGVuZ3RoICYmIGRldmljZXNbZGV2aWNlcy5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICBpZiAoYmFjaykge1xuICAgICAgICAgICAgICBjb25zdHJhaW50cy52aWRlby5kZXZpY2VJZCA9IGZhY2UuZXhhY3QgPyB7ZXhhY3Q6IGJhY2suZGV2aWNlSWR9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2lkZWFsOiBiYWNrLmRldmljZUlkfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgICAgICAgbG9nZ2luZygnY2hyb21lOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jKGNvbnN0cmFpbnRzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvQ2hyb21lXyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgfVxuICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgcmV0dXJuIGZ1bmMoY29uc3RyYWludHMpO1xuICB9O1xuXG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIFBlcm1pc3Npb25EZW5pZWRFcnJvcjogJ05vdEFsbG93ZWRFcnJvcicsXG4gICAgICAgIENvbnN0cmFpbnROb3RTYXRpc2ZpZWRFcnJvcjogJ092ZXJjb25zdHJhaW5lZEVycm9yJ1xuICAgICAgfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludE5hbWUsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyAodGhpcy5tZXNzYWdlICYmICc6ICcpICsgdGhpcy5tZXNzYWdlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgc2hpbUNvbnN0cmFpbnRzXyhjb25zdHJhaW50cywgZnVuY3Rpb24oYykge1xuICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYShjLCBvblN1Y2Nlc3MsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgb25FcnJvcihzaGltRXJyb3JfKGUpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBnZXRVc2VyTWVkaWFfO1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdCBvZiBnZXRVc2VyTWVkaWEgYXMgYSBQcm9taXNlLlxuICB2YXIgZ2V0VXNlck1lZGlhUHJvbWlzZV8gPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyA9IHtcbiAgICAgIGdldFVzZXJNZWRpYTogZ2V0VXNlck1lZGlhUHJvbWlzZV8sXG4gICAgICBlbnVtZXJhdGVEZXZpY2VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICB2YXIga2luZHMgPSB7YXVkaW86ICdhdWRpb2lucHV0JywgdmlkZW86ICd2aWRlb2lucHV0J307XG4gICAgICAgICAgcmV0dXJuIE1lZGlhU3RyZWFtVHJhY2suZ2V0U291cmNlcyhmdW5jdGlvbihkZXZpY2VzKSB7XG4gICAgICAgICAgICByZXNvbHZlKGRldmljZXMubWFwKGZ1bmN0aW9uKGRldmljZSkge1xuICAgICAgICAgICAgICByZXR1cm4ge2xhYmVsOiBkZXZpY2UubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAga2luZDoga2luZHNbZGV2aWNlLmtpbmRdLFxuICAgICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiBkZXZpY2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZDogJyd9O1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQSBzaGltIGZvciBnZXRVc2VyTWVkaWEgbWV0aG9kIG9uIHRoZSBtZWRpYURldmljZXMgb2JqZWN0LlxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgICByZXR1cm4gZ2V0VXNlck1lZGlhUHJvbWlzZV8oY29uc3RyYWludHMpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gRXZlbiB0aG91Z2ggQ2hyb21lIDQ1IGhhcyBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzIGFuZCBhIGdldFVzZXJNZWRpYVxuICAgIC8vIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBQcm9taXNlLCBpdCBkb2VzIG5vdCBhY2NlcHQgc3BlYy1zdHlsZVxuICAgIC8vIGNvbnN0cmFpbnRzLlxuICAgIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjcykge1xuICAgICAgcmV0dXJuIHNoaW1Db25zdHJhaW50c18oY3MsIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykudGhlbihmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICBpZiAoYy5hdWRpbyAmJiAhc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoIHx8XG4gICAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCcnLCAnTm90Rm91bmRFcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICAvLyBEdW1teSBkZXZpY2VjaGFuZ2UgZXZlbnQgbWV0aG9kcy5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9nZ2luZygnRHVtbXkgbWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgY2FsbGVkLicpO1xuICAgIH07XG4gIH1cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNEUFV0aWxzID0gcmVxdWlyZSgnc2RwJyk7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgZWRnZVNoaW0gPSB7XG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHdpbmRvdy5SVENJY2VHYXRoZXJlcikge1xuICAgICAgLy8gT1JUQyBkZWZpbmVzIGFuIFJUQ0ljZUNhbmRpZGF0ZSBvYmplY3QgYnV0IG5vIGNvbnN0cnVjdG9yLlxuICAgICAgLy8gTm90IGltcGxlbWVudGVkIGluIEVkZ2UuXG4gICAgICBpZiAoIXdpbmRvdy5SVENJY2VDYW5kaWRhdGUpIHtcbiAgICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gYXJncztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIE9SVEMgZG9lcyBub3QgaGF2ZSBhIHNlc3Npb24gZGVzY3JpcHRpb24gb2JqZWN0IGJ1dFxuICAgICAgLy8gb3RoZXIgYnJvd3NlcnMgKGkuZS4gQ2hyb21lKSB0aGF0IHdpbGwgc3VwcG9ydCBib3RoIFBDIGFuZCBPUlRDXG4gICAgICAvLyBpbiB0aGUgZnV0dXJlIG1pZ2h0IGhhdmUgdGhpcyBkZWZpbmVkIGFscmVhZHkuXG4gICAgICBpZiAoIXdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24pIHtcbiAgICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gYXJncztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIHRoaXMgYWRkcyBhbiBhZGRpdGlvbmFsIGV2ZW50IGxpc3RlbmVyIHRvIE1lZGlhU3RyYWNrVHJhY2sgdGhhdCBzaWduYWxzXG4gICAgICAvLyB3aGVuIGEgdHJhY2tzIGVuYWJsZWQgcHJvcGVydHkgd2FzIGNoYW5nZWQuXG4gICAgICB2YXIgb3JpZ01TVEVuYWJsZWQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFxuICAgICAgICAgIE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLCAnZW5hYmxlZCcpO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLCAnZW5hYmxlZCcsIHtcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIG9yaWdNU1RFbmFibGVkLnNldC5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgICB2YXIgZXYgPSBuZXcgRXZlbnQoJ2VuYWJsZWQnKTtcbiAgICAgICAgICBldi5lbmFibGVkID0gdmFsdWU7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBfZXZlbnRUYXJnZXQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBbJ2FkZEV2ZW50TGlzdGVuZXInLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdkaXNwYXRjaEV2ZW50J11cbiAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIHNlbGZbbWV0aG9kXSA9IF9ldmVudFRhcmdldFttZXRob2RdLmJpbmQoX2V2ZW50VGFyZ2V0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgdGhpcy5vbmljZWNhbmRpZGF0ZSA9IG51bGw7XG4gICAgICB0aGlzLm9uYWRkc3RyZWFtID0gbnVsbDtcbiAgICAgIHRoaXMub250cmFjayA9IG51bGw7XG4gICAgICB0aGlzLm9ucmVtb3Zlc3RyZWFtID0gbnVsbDtcbiAgICAgIHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgIHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZCA9IG51bGw7XG4gICAgICB0aGlzLm9uZGF0YWNoYW5uZWwgPSBudWxsO1xuXG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5yZW1vdGVTdHJlYW1zID0gW107XG4gICAgICB0aGlzLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5sb2NhbFN0cmVhbXM7XG4gICAgICB9O1xuICAgICAgdGhpcy5nZXRSZW1vdGVTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnJlbW90ZVN0cmVhbXM7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmxvY2FsRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbiA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnJyxcbiAgICAgICAgc2RwOiAnJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gJ3N0YWJsZSc7XG4gICAgICB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSA9ICduZXcnO1xuICAgICAgdGhpcy5pY2VHYXRoZXJpbmdTdGF0ZSA9ICduZXcnO1xuXG4gICAgICB0aGlzLmljZU9wdGlvbnMgPSB7XG4gICAgICAgIGdhdGhlclBvbGljeTogJ2FsbCcsXG4gICAgICAgIGljZVNlcnZlcnM6IFtdXG4gICAgICB9O1xuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHN3aXRjaCAoY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgY2FzZSAncmVsYXknOlxuICAgICAgICAgICAgdGhpcy5pY2VPcHRpb25zLmdhdGhlclBvbGljeSA9IGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgIC8vIEZJWE1FOiByZW1vdmUgb25jZSBpbXBsZW1lbnRhdGlvbiBhbmQgc3BlYyBoYXZlIGFkZGVkIHRoaXMuXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpY2VUcmFuc3BvcnRQb2xpY3kgXCJub25lXCIgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBkb24ndCBzZXQgaWNlVHJhbnNwb3J0UG9saWN5LlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMudXNpbmdCdW5kbGUgPSBjb25maWcgJiYgY29uZmlnLmJ1bmRsZVBvbGljeSA9PT0gJ21heC1idW5kbGUnO1xuXG4gICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5pY2VTZXJ2ZXJzKSB7XG4gICAgICAgIC8vIEVkZ2UgZG9lcyBub3QgbGlrZVxuICAgICAgICAvLyAxKSBzdHVuOlxuICAgICAgICAvLyAyKSB0dXJuOiB0aGF0IGRvZXMgbm90IGhhdmUgYWxsIG9mIHR1cm46aG9zdDpwb3J0P3RyYW5zcG9ydD11ZHBcbiAgICAgICAgLy8gMykgdHVybjogd2l0aCBpcHY2IGFkZHJlc3Nlc1xuICAgICAgICB2YXIgaWNlU2VydmVycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uZmlnLmljZVNlcnZlcnMpKTtcbiAgICAgICAgdGhpcy5pY2VPcHRpb25zLmljZVNlcnZlcnMgPSBpY2VTZXJ2ZXJzLmZpbHRlcihmdW5jdGlvbihzZXJ2ZXIpIHtcbiAgICAgICAgICBpZiAoc2VydmVyICYmIHNlcnZlci51cmxzKSB7XG4gICAgICAgICAgICB2YXIgdXJscyA9IHNlcnZlci51cmxzO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB1cmxzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICB1cmxzID0gW3VybHNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXJscyA9IHVybHMuZmlsdGVyKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICByZXR1cm4gKHVybC5pbmRleE9mKCd0dXJuOicpID09PSAwICYmXG4gICAgICAgICAgICAgICAgICB1cmwuaW5kZXhPZigndHJhbnNwb3J0PXVkcCcpICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgdXJsLmluZGV4T2YoJ3R1cm46WycpID09PSAtMSkgfHxcbiAgICAgICAgICAgICAgICAgICh1cmwuaW5kZXhPZignc3R1bjonKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICBicm93c2VyRGV0YWlscy52ZXJzaW9uID49IDE0MzkzKTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgcmV0dXJuICEhdXJscztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcblxuICAgICAgLy8gcGVyLXRyYWNrIGljZUdhdGhlcnMsIGljZVRyYW5zcG9ydHMsIGR0bHNUcmFuc3BvcnRzLCBydHBTZW5kZXJzLCAuLi5cbiAgICAgIC8vIGV2ZXJ5dGhpbmcgdGhhdCBpcyBuZWVkZWQgdG8gZGVzY3JpYmUgYSBTRFAgbS1saW5lLlxuICAgICAgdGhpcy50cmFuc2NlaXZlcnMgPSBbXTtcblxuICAgICAgLy8gc2luY2UgdGhlIGljZUdhdGhlcmVyIGlzIGN1cnJlbnRseSBjcmVhdGVkIGluIGNyZWF0ZU9mZmVyIGJ1dCB3ZVxuICAgICAgLy8gbXVzdCBub3QgZW1pdCBjYW5kaWRhdGVzIHVudGlsIGFmdGVyIHNldExvY2FsRGVzY3JpcHRpb24gd2UgYnVmZmVyXG4gICAgICAvLyB0aGVtIGluIHRoaXMgYXJyYXkuXG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIgPSBbXTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgIC8vIEZJWE1FOiBuZWVkIHRvIGFwcGx5IGljZSBjYW5kaWRhdGVzIGluIGEgd2F5IHdoaWNoIGlzIGFzeW5jIGJ1dFxuICAgICAgLy8gaW4tb3JkZXJcbiAgICAgIHRoaXMuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBlbmQgPSAhZXZlbnQuY2FuZGlkYXRlIHx8IE9iamVjdC5rZXlzKGV2ZW50LmNhbmRpZGF0ZSkubGVuZ3RoID09PSAwO1xuICAgICAgICBpZiAoZW5kKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBzZWN0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHNlY3Rpb25zW2pdLmluZGV4T2YoJ1xcclxcbmE9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgc2VjdGlvbnNbal0gKz0gJ2E9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlLmluZGV4T2YoJ3R5cCBlbmRPZkNhbmRpZGF0ZXMnKVxuICAgICAgICAgICAgPT09IC0xKSB7XG4gICAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXggKyAxXSArPVxuICAgICAgICAgICAgICAnYT0nICsgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSArICdcXHJcXG4nO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBzZWxmLm9uaWNlY2FuZGlkYXRlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWV2ZW50LmNhbmRpZGF0ZSAmJiBzZWxmLmljZUdhdGhlcmluZ1N0YXRlICE9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgdmFyIGNvbXBsZXRlID0gc2VsZi50cmFuc2NlaXZlcnMuZXZlcnkoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJlxuICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnY29tcGxldGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIgPSBbXTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRDb25maWd1cmF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgLy8gQ2xvbmUgaXMgbmVjZXNzYXJ5IGZvciBsb2NhbCBkZW1vcyBtb3N0bHksIGF0dGFjaGluZyBkaXJlY3RseVxuICAgICAgLy8gdG8gdHdvIGRpZmZlcmVudCBzZW5kZXJzIGRvZXMgbm90IHdvcmsgKGJ1aWxkIDEwNTQ3KS5cbiAgICAgIHZhciBjbG9uZWRTdHJlYW0gPSBzdHJlYW0uY2xvbmUoKTtcbiAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrLCBpZHgpIHtcbiAgICAgICAgdmFyIGNsb25lZFRyYWNrID0gY2xvbmVkU3RyZWFtLmdldFRyYWNrcygpW2lkeF07XG4gICAgICAgIHRyYWNrLmFkZEV2ZW50TGlzdGVuZXIoJ2VuYWJsZWQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGNsb25lZFRyYWNrLmVuYWJsZWQgPSBldmVudC5lbmFibGVkO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMucHVzaChjbG9uZWRTdHJlYW0pO1xuICAgICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBpZHggPSB0aGlzLmxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XG4gICAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgICAgdGhpcy5sb2NhbFN0cmVhbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIHRoaXMuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U2VuZGVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNjZWl2ZXJzLmZpbHRlcihmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICByZXR1cm4gISF0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gICAgICB9KVxuICAgICAgLm1hcChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0UmVjZWl2ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2NlaXZlcnMuZmlsdGVyKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHJldHVybiAhIXRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgfSlcbiAgICAgIC5tYXAoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIERldGVybWluZXMgdGhlIGludGVyc2VjdGlvbiBvZiBsb2NhbCBhbmQgcmVtb3RlIGNhcGFiaWxpdGllcy5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9nZXRDb21tb25DYXBhYmlsaXRpZXMgPVxuICAgICAgICBmdW5jdGlvbihsb2NhbENhcGFiaWxpdGllcywgcmVtb3RlQ2FwYWJpbGl0aWVzKSB7XG4gICAgICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHtcbiAgICAgICAgICAgIGNvZGVjczogW10sXG4gICAgICAgICAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICAgICAgICAgIGZlY01lY2hhbmlzbXM6IFtdXG4gICAgICAgICAgfTtcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihsQ29kZWMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgckNvZGVjID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjc1tpXTtcbiAgICAgICAgICAgICAgaWYgKGxDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IHJDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICAgIGxDb2RlYy5jbG9ja1JhdGUgPT09IHJDb2RlYy5jbG9ja1JhdGUpIHtcbiAgICAgICAgICAgICAgICAvLyBudW1iZXIgb2YgY2hhbm5lbHMgaXMgdGhlIGhpZ2hlc3QgY29tbW9uIG51bWJlciBvZiBjaGFubmVsc1xuICAgICAgICAgICAgICAgIHJDb2RlYy5udW1DaGFubmVscyA9IE1hdGgubWluKGxDb2RlYy5udW1DaGFubmVscyxcbiAgICAgICAgICAgICAgICAgICAgckNvZGVjLm51bUNoYW5uZWxzKTtcbiAgICAgICAgICAgICAgICAvLyBwdXNoIHJDb2RlYyBzbyB3ZSByZXBseSB3aXRoIG9mZmVyZXIgcGF5bG9hZCB0eXBlXG4gICAgICAgICAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmNvZGVjcy5wdXNoKHJDb2RlYyk7XG5cbiAgICAgICAgICAgICAgICAvLyBkZXRlcm1pbmUgY29tbW9uIGZlZWRiYWNrIG1lY2hhbmlzbXNcbiAgICAgICAgICAgICAgICByQ29kZWMucnRjcEZlZWRiYWNrID0gckNvZGVjLnJ0Y3BGZWVkYmFjay5maWx0ZXIoZnVuY3Rpb24oZmIpIHtcbiAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbENvZGVjLnJ0Y3BGZWVkYmFjay5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobENvZGVjLnJ0Y3BGZWVkYmFja1tqXS50eXBlID09PSBmYi50eXBlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsQ29kZWMucnRjcEZlZWRiYWNrW2pdLnBhcmFtZXRlciA9PT0gZmIucGFyYW1ldGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWxzbyBuZWVkIHRvIGRldGVybWluZSAucGFyYW1ldGVyc1xuICAgICAgICAgICAgICAgIC8vICBzZWUgaHR0cHM6Ly9naXRodWIuY29tL29wZW5wZWVyL29ydGMvaXNzdWVzLzU2OVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zXG4gICAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGxIZWFkZXJFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgIGkrKykge1xuICAgICAgICAgICAgICAgICAgdmFyIHJIZWFkZXJFeHRlbnNpb24gPSByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgIGlmIChsSGVhZGVyRXh0ZW5zaW9uLnVyaSA9PT0gckhlYWRlckV4dGVuc2lvbi51cmkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMucHVzaChySGVhZGVyRXh0ZW5zaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEZJWE1FOiBmZWNNZWNoYW5pc21zXG4gICAgICAgICAgcmV0dXJuIGNvbW1vbkNhcGFiaWxpdGllcztcbiAgICAgICAgfTtcblxuICAgIC8vIENyZWF0ZSBJQ0UgZ2F0aGVyZXIsIElDRSB0cmFuc3BvcnQgYW5kIERUTFMgdHJhbnNwb3J0LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzID1cbiAgICAgICAgZnVuY3Rpb24obWlkLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBpY2VHYXRoZXJlciA9IG5ldyBSVENJY2VHYXRoZXJlcihzZWxmLmljZU9wdGlvbnMpO1xuICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSBuZXcgUlRDSWNlVHJhbnNwb3J0KGljZUdhdGhlcmVyKTtcbiAgICAgICAgICBpY2VHYXRoZXJlci5vbmxvY2FsY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpO1xuICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlID0ge3NkcE1pZDogbWlkLCBzZHBNTGluZUluZGV4OiBzZHBNTGluZUluZGV4fTtcblxuICAgICAgICAgICAgdmFyIGNhbmQgPSBldnQuY2FuZGlkYXRlO1xuICAgICAgICAgICAgdmFyIGVuZCA9ICFjYW5kIHx8IE9iamVjdC5rZXlzKGNhbmQpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIC8vIEVkZ2UgZW1pdHMgYW4gZW1wdHkgb2JqZWN0IGZvciBSVENJY2VDYW5kaWRhdGVDb21wbGV0ZeKApVxuICAgICAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgICAgICAvLyBwb2x5ZmlsbCBzaW5jZSBSVENJY2VHYXRoZXJlci5zdGF0ZSBpcyBub3QgaW1wbGVtZW50ZWQgaW5cbiAgICAgICAgICAgICAgLy8gRWRnZSAxMDU0NyB5ZXQuXG4gICAgICAgICAgICAgIGlmIChpY2VHYXRoZXJlci5zdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXIuc3RhdGUgPSAnY29tcGxldGVkJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEVtaXQgYSBjYW5kaWRhdGUgd2l0aCB0eXBlIGVuZE9mQ2FuZGlkYXRlcyB0byBtYWtlIHRoZSBzYW1wbGVzXG4gICAgICAgICAgICAgIC8vIHdvcmsuIEVkZ2UgcmVxdWlyZXMgYWRkSWNlQ2FuZGlkYXRlIHdpdGggdGhpcyBlbXB0eSBjYW5kaWRhdGVcbiAgICAgICAgICAgICAgLy8gdG8gc3RhcnQgY2hlY2tpbmcuIFRoZSByZWFsIHNvbHV0aW9uIGlzIHRvIHNpZ25hbFxuICAgICAgICAgICAgICAvLyBlbmQtb2YtY2FuZGlkYXRlcyB0byB0aGUgb3RoZXIgc2lkZSB3aGVuIGdldHRpbmcgdGhlIG51bGxcbiAgICAgICAgICAgICAgLy8gY2FuZGlkYXRlIGJ1dCBzb21lIGFwcHMgKGxpa2UgdGhlIHNhbXBsZXMpIGRvbid0IGRvIHRoYXQuXG4gICAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgPVxuICAgICAgICAgICAgICAgICAgJ2NhbmRpZGF0ZToxIDEgdWRwIDEgMC4wLjAuMCA5IHR5cCBlbmRPZkNhbmRpZGF0ZXMnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gUlRDSWNlQ2FuZGlkYXRlIGRvZXNuJ3QgaGF2ZSBhIGNvbXBvbmVudCwgbmVlZHMgdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgY2FuZC5jb21wb25lbnQgPSBpY2VUcmFuc3BvcnQuY29tcG9uZW50ID09PSAnUlRDUCcgPyAyIDogMTtcbiAgICAgICAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9IFNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlKGNhbmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB1cGRhdGUgbG9jYWwgZGVzY3JpcHRpb24uXG4gICAgICAgICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgaWYgKGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUuaW5kZXhPZigndHlwIGVuZE9mQ2FuZGlkYXRlcycpXG4gICAgICAgICAgICAgICAgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHNlY3Rpb25zW2V2ZW50LmNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICsgMV0gKz1cbiAgICAgICAgICAgICAgICAgICdhPScgKyBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlICsgJ1xcclxcbic7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWN0aW9uc1tldmVudC5jYW5kaWRhdGUuc2RwTUxpbmVJbmRleCArIDFdICs9XG4gICAgICAgICAgICAgICAgICAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG5cbiAgICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJlxuICAgICAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEVtaXQgY2FuZGlkYXRlIGlmIGxvY2FsRGVzY3JpcHRpb24gaXMgc2V0LlxuICAgICAgICAgICAgLy8gQWxzbyBlbWl0cyBudWxsIGNhbmRpZGF0ZSB3aGVuIGFsbCBnYXRoZXJlcnMgYXJlIGNvbXBsZXRlLlxuICAgICAgICAgICAgc3dpdGNoIChzZWxmLmljZUdhdGhlcmluZ1N0YXRlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ25ldyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyLnB1c2goZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQgJiYgY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnZ2F0aGVyaW5nJzpcbiAgICAgICAgICAgICAgICBzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbmljZWNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPSAnY29tcGxldGUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnY29tcGxldGUnOlxuICAgICAgICAgICAgICAgIC8vIHNob3VsZCBub3QgaGFwcGVuLi4uIGN1cnJlbnRseSFcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDogLy8gbm8tb3AuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpY2VUcmFuc3BvcnQub25pY2VzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gbmV3IFJUQ0R0bHNUcmFuc3BvcnQoaWNlVHJhbnNwb3J0KTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZHRsc3N0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGR0bHNUcmFuc3BvcnQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gb25lcnJvciBkb2VzIG5vdCBzZXQgc3RhdGUgdG8gZmFpbGVkIGJ5IGl0c2VsZi5cbiAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhdGUgPSAnZmFpbGVkJztcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWNlR2F0aGVyZXI6IGljZUdhdGhlcmVyLFxuICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiBpY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiBkdGxzVHJhbnNwb3J0XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgIC8vIFN0YXJ0IHRoZSBSVFAgU2VuZGVyIGFuZCBSZWNlaXZlciBmb3IgYSB0cmFuc2NlaXZlci5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl90cmFuc2NlaXZlID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgIHNlbmQsIHJlY3YpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB0aGlzLl9nZXRDb21tb25DYXBhYmlsaXRpZXModHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcbiAgICAgIGlmIChzZW5kICYmIHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgICAgICBwYXJhbXMuZW5jb2RpbmdzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgICAgY25hbWU6IFNEUFV0aWxzLmxvY2FsQ05hbWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuc2VuZChwYXJhbXMpO1xuICAgICAgfVxuICAgICAgaWYgKHJlY3YgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgLy8gcmVtb3ZlIFJUWCBmaWVsZCBpbiBFZGdlIDE0OTQyXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nXG4gICAgICAgICAgICAmJiB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwLnJ0eDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbXMuZW5jb2RpbmdzID0gdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgICAgY25hbWU6IHRyYW5zY2VpdmVyLmNuYW1lXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIucmVjZWl2ZShwYXJhbXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldExvY2FsRGVzY3JpcHRpb24gPVxuICAgICAgICBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgc2VjdGlvbnM7XG4gICAgICAgICAgdmFyIHNlc3Npb25wYXJ0O1xuICAgICAgICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInKSB7XG4gICAgICAgICAgICAvLyBGSVhNRTogV2hhdCB3YXMgdGhlIHB1cnBvc2Ugb2YgdGhpcyBlbXB0eSBpZiBzdGF0ZW1lbnQ/XG4gICAgICAgICAgICAvLyBpZiAoIXRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgICAgICAgLy8gVkVSWSBsaW1pdGVkIHN1cHBvcnQgZm9yIFNEUCBtdW5naW5nLiBMaW1pdGVkIHRvOlxuICAgICAgICAgICAgICAvLyAqIGNoYW5naW5nIHRoZSBvcmRlciBvZiBjb2RlY3NcbiAgICAgICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FwcyA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgICAgIHNlbGYuX3BlbmRpbmdPZmZlcltzZHBNTGluZUluZGV4XS5sb2NhbENhcGFiaWxpdGllcyA9IGNhcHM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLnRyYW5zY2VpdmVycyA9IHRoaXMuX3BlbmRpbmdPZmZlcjtcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3BlbmRpbmdPZmZlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdhbnN3ZXInKSB7XG4gICAgICAgICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIGlzSWNlTGl0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxuICAgICAgICAgICAgICAgICdhPWljZS1saXRlJykubGVuZ3RoID4gMDtcbiAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcbiAgICAgICAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgICB2YXIgcmVqZWN0ZWQgPSBtZWRpYVNlY3Rpb24uc3BsaXQoJ1xcbicsIDEpWzBdXG4gICAgICAgICAgICAgICAgICAuc3BsaXQoJyAnLCAyKVsxXSA9PT0gJzAnO1xuXG4gICAgICAgICAgICAgIGlmICghcmVqZWN0ZWQgJiYgIXRyYW5zY2VpdmVyLmlzRGF0YWNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMoXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChpc0ljZUxpdGUpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBjYW5kcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9Y2FuZGlkYXRlOicpXG4gICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmQpO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FuZC5jb21wb25lbnQgPT09ICcxJztcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgLy8gaWNlLWxpdGUgb25seSBpbmNsdWRlcyBob3N0IGNhbmRpZGF0ZXMgaW4gdGhlIFNEUCBzbyB3ZSBjYW5cbiAgICAgICAgICAgICAgICAgIC8vIHVzZSBzZXRSZW1vdGVDYW5kaWRhdGVzICh3aGljaCBpbXBsaWVzIGFuXG4gICAgICAgICAgICAgICAgICAvLyBSVENJY2VDYW5kaWRhdGVDb21wbGV0ZSlcbiAgICAgICAgICAgICAgICAgIGlmIChjYW5kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzSWNlTGl0ZSkge1xuICAgICAgICAgICAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMucm9sZSA9ICdzZXJ2ZXInO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghc2VsZi51c2luZ0J1bmRsZSB8fCBzZHBNTGluZUluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQuc3RhcnQoaWNlR2F0aGVyZXIsIHJlbW90ZUljZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgaXNJY2VMaXRlID8gJ2NvbnRyb2xsaW5nJyA6ICdjb250cm9sbGVkJyk7XG4gICAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXJ0KHJlbW90ZUR0bHNQYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgaW50ZXJzZWN0aW9uIG9mIGNhcGFiaWxpdGllcy5cbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIFJUQ1J0cFNlbmRlci4gVGhlIFJUQ1J0cFJlY2VpdmVyIGZvciB0aGlzXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNjZWl2ZXIgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkIGluIHNldFJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy5jb2RlY3MubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxvY2FsRGVzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICAgICAgICB9O1xuICAgICAgICAgIHN3aXRjaCAoZGVzY3JpcHRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnb2ZmZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnaGF2ZS1sb2NhbC1vZmZlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdzdGFibGUnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICAgICAgICAgJ1wiJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgYSBzdWNjZXNzIGNhbGxiYWNrIHdhcyBwcm92aWRlZCwgZW1pdCBJQ0UgY2FuZGlkYXRlcyBhZnRlciBpdFxuICAgICAgICAgIC8vIGhhcyBiZWVuIGV4ZWN1dGVkLiBPdGhlcndpc2UsIGVtaXQgY2FsbGJhY2sgYWZ0ZXIgdGhlIFByb21pc2UgaXNcbiAgICAgICAgICAvLyByZXNvbHZlZC5cbiAgICAgICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgcC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFoYXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gVXN1YWxseSBjYW5kaWRhdGVzIHdpbGwgYmUgZW1pdHRlZCBlYXJsaWVyLlxuICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChzZWxmLl9lbWl0QnVmZmVyZWRDYW5kaWRhdGVzLmJpbmQoc2VsZiksIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHN0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICAgIHZhciByZWNlaXZlckxpc3QgPSBbXTtcbiAgICAgICAgICB2YXIgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKGRlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgdmFyIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICB2YXIgaXNJY2VMaXRlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoc2Vzc2lvbnBhcnQsXG4gICAgICAgICAgICAgICdhPWljZS1saXRlJykubGVuZ3RoID4gMDtcbiAgICAgICAgICB0aGlzLnVzaW5nQnVuZGxlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoc2Vzc2lvbnBhcnQsXG4gICAgICAgICAgICAgICdhPWdyb3VwOkJVTkRMRSAnKS5sZW5ndGggPiAwO1xuICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICB2YXIgbWxpbmUgPSBsaW5lc1swXS5zdWJzdHIoMikuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgIHZhciBraW5kID0gbWxpbmVbMF07XG4gICAgICAgICAgICB2YXIgcmVqZWN0ZWQgPSBtbGluZVsxXSA9PT0gJzAnO1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IFNEUFV0aWxzLmdldERpcmVjdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcblxuICAgICAgICAgICAgdmFyIG1pZCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9bWlkOicpO1xuICAgICAgICAgICAgaWYgKG1pZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgbWlkID0gbWlkWzBdLnN1YnN0cig2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1pZCA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZWplY3QgZGF0YWNoYW5uZWxzIHdoaWNoIGFyZSBub3QgaW1wbGVtZW50ZWQgeWV0LlxuICAgICAgICAgICAgaWYgKGtpbmQgPT09ICdhcHBsaWNhdGlvbicgJiYgbWxpbmVbMl0gPT09ICdEVExTL1NDVFAnKSB7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgICAgICAgIGlzRGF0YWNoYW5uZWw6IHRydWVcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXI7XG4gICAgICAgICAgICB2YXIgaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICB2YXIgcnRwU2VuZGVyO1xuICAgICAgICAgICAgdmFyIHJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgdmFyIHRyYWNrO1xuICAgICAgICAgICAgLy8gRklYTUU6IGVuc3VyZSB0aGUgbWVkaWFTZWN0aW9uIGhhcyBydGNwLW11eCBzZXQuXG4gICAgICAgICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycztcbiAgICAgICAgICAgIHZhciByZW1vdGVEdGxzUGFyYW1ldGVycztcbiAgICAgICAgICAgIGlmICghcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMucm9sZSA9ICdjbGllbnQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICAgICAgU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcblxuICAgICAgICAgICAgdmFyIGNuYW1lO1xuICAgICAgICAgICAgLy8gR2V0cyB0aGUgZmlyc3QgU1NSQy4gTm90ZSB0aGF0IHdpdGggUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlXG4gICAgICAgICAgICAvLyBTU1JDcy5cbiAgICAgICAgICAgIHZhciByZW1vdGVTc3JjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gICAgICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICBpZiAocmVtb3RlU3NyYykge1xuICAgICAgICAgICAgICBjbmFtZSA9IHJlbW90ZVNzcmMudmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpc0NvbXBsZXRlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgICAgICdhPWVuZC1vZi1jYW5kaWRhdGVzJywgc2Vzc2lvbnBhcnQpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICB2YXIgY2FuZHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWNhbmRpZGF0ZTonKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gY2FuZC5jb21wb25lbnQgPT09ICcxJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInICYmICFyZWplY3RlZCkge1xuICAgICAgICAgICAgICB2YXIgdHJhbnNwb3J0cyA9IHNlbGYudXNpbmdCdW5kbGUgJiYgc2RwTUxpbmVJbmRleCA+IDAgPyB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXI6IHNlbGYudHJhbnNjZWl2ZXJzWzBdLmljZUdhdGhlcmVyLFxuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydDogc2VsZi50cmFuc2NlaXZlcnNbMF0uaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHNlbGYudHJhbnNjZWl2ZXJzWzBdLmR0bHNUcmFuc3BvcnRcbiAgICAgICAgICAgICAgfSA6IHNlbGYuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzKG1pZCwgc2RwTUxpbmVJbmRleCk7XG5cbiAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzID0gUlRDUnRwUmVjZWl2ZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuXG4gICAgICAgICAgICAgIC8vIGZpbHRlciBSVFggdW50aWwgYWRkaXRpb25hbCBzdHVmZiBuZWVkZWQgZm9yIFJUWCBpcyBpbXBsZW1lbnRlZFxuICAgICAgICAgICAgICAvLyBpbiBhZGFwdGVyLmpzXG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcyA9IGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICBmdW5jdGlvbihjb2RlYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29kZWMubmFtZSAhPT0gJ3J0eCc7XG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gW3tcbiAgICAgICAgICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAyKSAqIDEwMDFcbiAgICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcblxuICAgICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyXSk7XG4gICAgICAgICAgICAgIC8vIEZJWE1FOiBub3QgY29ycmVjdCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBzdHJlYW1zIGJ1dCB0aGF0IGlzXG4gICAgICAgICAgICAgIC8vIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkIGluIHRoaXMgc2hpbS5cbiAgICAgICAgICAgICAgc3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcblxuICAgICAgICAgICAgICAvLyBGSVhNRTogbG9vayBhdCBkaXJlY3Rpb24uXG4gICAgICAgICAgICAgIGlmIChzZWxmLmxvY2FsU3RyZWFtcy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICBzZWxmLmxvY2FsU3RyZWFtc1swXS5nZXRUcmFja3MoKS5sZW5ndGggPj0gc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBsb2NhbFRyYWNrO1xuICAgICAgICAgICAgICAgIGlmIChraW5kID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICAgICAgICBsb2NhbFRyYWNrID0gc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0QXVkaW9UcmFja3MoKVswXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgICAgICAgIGxvY2FsVHJhY2sgPSBzZWxmLmxvY2FsU3RyZWFtc1swXS5nZXRWaWRlb1RyYWNrcygpWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobG9jYWxUcmFjaykge1xuICAgICAgICAgICAgICAgICAgcnRwU2VuZGVyID0gbmV3IFJUQ1J0cFNlbmRlcihsb2NhbFRyYWNrLFxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0gPSB7XG4gICAgICAgICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zcG9ydHMuaWNlR2F0aGVyZXIsXG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXM6IGxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllczogcmVtb3RlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgICAgICAgIGNuYW1lOiBjbmFtZSxcbiAgICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzOiBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIFJUQ1J0cFJlY2VpdmVyIG5vdy4gVGhlIFJUUFNlbmRlciBpcyBzdGFydGVkIGluXG4gICAgICAgICAgICAgIC8vIHNldExvY2FsRGVzY3JpcHRpb24uXG4gICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUoc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0sXG4gICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0O1xuICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgcnRwU2VuZGVyID0gdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xuICAgICAgICAgICAgICBydHBSZWNlaXZlciA9IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID1cbiAgICAgICAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJlbW90ZUNhcGFiaWxpdGllcyA9XG4gICAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmNuYW1lID0gY25hbWU7XG5cbiAgICAgICAgICAgICAgaWYgKChpc0ljZUxpdGUgfHwgaXNDb21wbGV0ZSkgJiYgY2FuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICghc2VsZi51c2luZ0J1bmRsZSB8fCBzZHBNTGluZUluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAnY29udHJvbGxpbmcnKTtcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXJ0KHJlbW90ZUR0bHNQYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAncmVjdm9ubHknLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5Jyk7XG5cbiAgICAgICAgICAgICAgaWYgKHJ0cFJlY2VpdmVyICYmXG4gICAgICAgICAgICAgICAgICAoZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5JykpIHtcbiAgICAgICAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXJdKTtcbiAgICAgICAgICAgICAgICBzdHJlYW0uYWRkVHJhY2sodHJhY2spO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBhY3R1YWxseSB0aGUgcmVjZWl2ZXIgc2hvdWxkIGJlIGNyZWF0ZWQgbGF0ZXIuXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtcmVtb3RlLW9mZmVyJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5zd2VyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ3N0YWJsZScpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3Vuc3VwcG9ydGVkIHR5cGUgXCInICsgZGVzY3JpcHRpb24udHlwZSArXG4gICAgICAgICAgICAgICAgICAnXCInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0cmVhbS5nZXRUcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlbGYucmVtb3RlU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdhZGRzdHJlYW0nKTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5vbmFkZHN0cmVhbSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5vbmFkZHN0cmVhbShldmVudCk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZWNlaXZlckxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrID0gaXRlbVswXTtcbiAgICAgICAgICAgICAgICB2YXIgcmVjZWl2ZXIgPSBpdGVtWzFdO1xuICAgICAgICAgICAgICAgIHZhciB0cmFja0V2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnJlY2VpdmVyID0gcmVjZWl2ZXI7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC5zdHJlYW1zID0gW3N0cmVhbV07XG4gICAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vbnRyYWNrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbnRyYWNrKHRyYWNrRXZlbnQpO1xuICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzFdLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAvKiBub3QgeWV0XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VHYXRoZXJlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCkge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gRklYTUU6IGNsZWFuIHVwIHRyYWNrcywgbG9jYWwgc3RyZWFtcywgcmVtb3RlIHN0cmVhbXMsIGV0Y1xuICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2Nsb3NlZCcpO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgdGhlIHNpZ25hbGluZyBzdGF0ZS5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVTaWduYWxpbmdTdGF0ZSA9XG4gICAgICAgIGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnc2lnbmFsaW5nc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIGlmICh0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25zaWduYWxpbmdzdGF0ZWNoYW5nZShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdG8gZmlyZSB0aGUgbmVnb3RpYXRpb25uZWVkZWQgZXZlbnQuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQgPVxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBGaXJlIGF3YXkgKGZvciBub3cpLlxuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnbmVnb3RpYXRpb25uZWVkZWQnKTtcbiAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgIGlmICh0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMub25uZWdvdGlhdGlvbm5lZWRlZChldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBjb25uZWN0aW9uIHN0YXRlLlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIG5ld1N0YXRlO1xuICAgICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICAgJ25ldyc6IDAsXG4gICAgICAgIGNsb3NlZDogMCxcbiAgICAgICAgY29ubmVjdGluZzogMCxcbiAgICAgICAgY2hlY2tpbmc6IDAsXG4gICAgICAgIGNvbm5lY3RlZDogMCxcbiAgICAgICAgY29tcGxldGVkOiAwLFxuICAgICAgICBmYWlsZWQ6IDBcbiAgICAgIH07XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LnN0YXRlXSsrO1xuICAgICAgfSk7XG4gICAgICAvLyBJQ0VUcmFuc3BvcnQuY29tcGxldGVkIGFuZCBjb25uZWN0ZWQgYXJlIHRoZSBzYW1lIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgICBzdGF0ZXMuY29ubmVjdGVkICs9IHN0YXRlcy5jb21wbGV0ZWQ7XG5cbiAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgICBpZiAoc3RhdGVzLmZhaWxlZCA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnZmFpbGVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGVzLmNvbm5lY3RpbmcgPiAwIHx8IHN0YXRlcy5jaGVja2luZyA+IDApIHtcbiAgICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGluZyc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5kaXNjb25uZWN0ZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5uZXcgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0ZWQgPiAwIHx8IHN0YXRlcy5jb21wbGV0ZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RlZCc7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdTdGF0ZSAhPT0gc2VsZi5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgICAgc2VsZi5pY2VDb25uZWN0aW9uU3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKHRoaXMub25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZU9mZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlT2ZmZXIgY2FsbGVkIHdoaWxlIHRoZXJlIGlzIGEgcGVuZGluZyBvZmZlci4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBvZmZlck9wdGlvbnM7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9mZmVyT3B0aW9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG5cbiAgICAgIHZhciB0cmFja3MgPSBbXTtcbiAgICAgIHZhciBudW1BdWRpb1RyYWNrcyA9IDA7XG4gICAgICB2YXIgbnVtVmlkZW9UcmFja3MgPSAwO1xuICAgICAgLy8gRGVmYXVsdCB0byBzZW5kcmVjdi5cbiAgICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgICAgbnVtQXVkaW9UcmFja3MgPSB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aDtcbiAgICAgICAgbnVtVmlkZW9UcmFja3MgPSB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIC8vIERldGVybWluZSBudW1iZXIgb2YgYXVkaW8gYW5kIHZpZGVvIHRyYWNrcyB3ZSBuZWVkIHRvIHNlbmQvcmVjdi5cbiAgICAgIGlmIChvZmZlck9wdGlvbnMpIHtcbiAgICAgICAgLy8gUmVqZWN0IENocm9tZSBsZWdhY3kgY29uc3RyYWludHMuXG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMubWFuZGF0b3J5IHx8IG9mZmVyT3B0aW9ucy5vcHRpb25hbCkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICdMZWdhY3kgbWFuZGF0b3J5L29wdGlvbmFsIGNvbnN0cmFpbnRzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcyA9IG9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZUF1ZGlvO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMubG9jYWxTdHJlYW1zLmxlbmd0aCkge1xuICAgICAgICAvLyBQdXNoIGxvY2FsIHN0cmVhbXMuXG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zWzBdLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICB0cmFja3MucHVzaCh7XG4gICAgICAgICAgICBraW5kOiB0cmFjay5raW5kLFxuICAgICAgICAgICAgdHJhY2s6IHRyYWNrLFxuICAgICAgICAgICAgd2FudFJlY2VpdmU6IHRyYWNrLmtpbmQgPT09ICdhdWRpbycgP1xuICAgICAgICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID4gMCA6IG51bVZpZGVvVHJhY2tzID4gMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0cmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHJhY2sua2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgLy8gQ3JlYXRlIE0tbGluZXMgZm9yIHJlY3Zvbmx5IHN0cmVhbXMuXG4gICAgICB3aGlsZSAobnVtQXVkaW9UcmFja3MgPiAwIHx8IG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgICBpZiAobnVtQXVkaW9UcmFja3MgPiAwKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogJ2F1ZGlvJyxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogJ3ZpZGVvJyxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUoKTtcbiAgICAgIHZhciB0cmFuc2NlaXZlcnMgPSBbXTtcbiAgICAgIHRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKG1saW5lLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgIC8vIEZvciBlYWNoIHRyYWNrLCBjcmVhdGUgYW4gaWNlIGdhdGhlcmVyLCBpY2UgdHJhbnNwb3J0LFxuICAgICAgICAvLyBkdGxzIHRyYW5zcG9ydCwgcG90ZW50aWFsbHkgcnRwc2VuZGVyIGFuZCBydHByZWNlaXZlci5cbiAgICAgICAgdmFyIHRyYWNrID0gbWxpbmUudHJhY2s7XG4gICAgICAgIHZhciBraW5kID0gbWxpbmUua2luZDtcbiAgICAgICAgdmFyIG1pZCA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuXG4gICAgICAgIHZhciB0cmFuc3BvcnRzID0gc2VsZi51c2luZ0J1bmRsZSAmJiBzZHBNTGluZUluZGV4ID4gMCA/IHtcbiAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNjZWl2ZXJzWzBdLmljZUdhdGhlcmVyLFxuICAgICAgICAgIGljZVRyYW5zcG9ydDogdHJhbnNjZWl2ZXJzWzBdLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0OiB0cmFuc2NlaXZlcnNbMF0uZHRsc1RyYW5zcG9ydFxuICAgICAgICB9IDogc2VsZi5fY3JlYXRlSWNlQW5kRHRsc1RyYW5zcG9ydHMobWlkLCBzZHBNTGluZUluZGV4KTtcblxuICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSBSVENSdHBTZW5kZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuICAgICAgICAvLyBmaWx0ZXIgUlRYIHVudGlsIGFkZGl0aW9uYWwgc3R1ZmYgbmVlZGVkIGZvciBSVFggaXMgaW1wbGVtZW50ZWRcbiAgICAgICAgLy8gaW4gYWRhcHRlci5qc1xuICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MgPSBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKFxuICAgICAgICAgICAgZnVuY3Rpb24oY29kZWMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvZGVjLm5hbWUgIT09ICdydHgnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgICAgICAgLy8gd29yayBhcm91bmQgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTY1NTJcbiAgICAgICAgICAvLyBieSBhZGRpbmcgbGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MVxuICAgICAgICAgIGlmIChjb2RlYy5uYW1lID09PSAnSDI2NCcgJiZcbiAgICAgICAgICAgICAgY29kZWMucGFyYW1ldGVyc1snbGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb2RlYy5wYXJhbWV0ZXJzWydsZXZlbC1hc3ltbWV0cnktYWxsb3dlZCddID0gJzEnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHJ0cFNlbmRlcjtcbiAgICAgICAgdmFyIHJ0cFJlY2VpdmVyO1xuXG4gICAgICAgIC8vIGdlbmVyYXRlIGFuIHNzcmMgbm93LCB0byBiZSB1c2VkIGxhdGVyIGluIHJ0cFNlbmRlci5zZW5kXG4gICAgICAgIHZhciBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gW3tcbiAgICAgICAgICBzc3JjOiAoMiAqIHNkcE1MaW5lSW5kZXggKyAxKSAqIDEwMDFcbiAgICAgICAgfV07XG4gICAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAgIHJ0cFNlbmRlciA9IG5ldyBSVENSdHBTZW5kZXIodHJhY2ssIHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWxpbmUud2FudFJlY2VpdmUpIHtcbiAgICAgICAgICBydHBSZWNlaXZlciA9IG5ldyBSVENSdHBSZWNlaXZlcih0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQsIGtpbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgIGljZUdhdGhlcmVyOiB0cmFuc3BvcnRzLmljZUdhdGhlcmVyLFxuICAgICAgICAgIGljZVRyYW5zcG9ydDogdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LFxuICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzOiBsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM6IG51bGwsXG4gICAgICAgICAgcnRwU2VuZGVyOiBydHBTZW5kZXIsXG4gICAgICAgICAgcnRwUmVjZWl2ZXI6IHJ0cFJlY2VpdmVyLFxuICAgICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgICAgbWlkOiBtaWQsXG4gICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVyczogc2VuZEVuY29kaW5nUGFyYW1ldGVycyxcbiAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzOiBudWxsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLnVzaW5nQnVuZGxlKSB7XG4gICAgICAgIHNkcCArPSAnYT1ncm91cDpCVU5ETEUgJyArIHRyYW5zY2VpdmVycy5tYXAoZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0Lm1pZDtcbiAgICAgICAgfSkuam9pbignICcpICsgJ1xcclxcbic7XG4gICAgICB9XG4gICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbihtbGluZSwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlcixcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLCAnb2ZmZXInLCBzZWxmLmxvY2FsU3RyZWFtc1swXSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fcGVuZGluZ09mZmVyID0gdHJhbnNjZWl2ZXJzO1xuICAgICAgdmFyIGRlc2MgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJ29mZmVyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKCk7XG4gICAgICBpZiAodGhpcy51c2luZ0J1bmRsZSkge1xuICAgICAgICBzZHAgKz0gJ2E9Z3JvdXA6QlVORExFICcgKyB0aGlzLnRyYW5zY2VpdmVycy5tYXAoZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0Lm1pZDtcbiAgICAgICAgfSkuam9pbignICcpICsgJ1xcclxcbic7XG4gICAgICB9XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pc0RhdGFjaGFubmVsKSB7XG4gICAgICAgICAgc2RwICs9ICdtPWFwcGxpY2F0aW9uIDAgRFRMUy9TQ1RQIDUwMDBcXHJcXG4nICtcbiAgICAgICAgICAgICAgJ2M9SU4gSVA0IDAuMC4wLjBcXHJcXG4nICtcbiAgICAgICAgICAgICAgJ2E9bWlkOicgKyB0cmFuc2NlaXZlci5taWQgKyAnXFxyXFxuJztcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FsY3VsYXRlIGludGVyc2VjdGlvbiBvZiBjYXBhYmlsaXRpZXMuXG4gICAgICAgIHZhciBjb21tb25DYXBhYmlsaXRpZXMgPSBzZWxmLl9nZXRDb21tb25DYXBhYmlsaXRpZXMoXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyk7XG5cbiAgICAgICAgc2RwICs9IFNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLCBjb21tb25DYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAnYW5zd2VyJywgc2VsZi5sb2NhbFN0cmVhbXNbMF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdhbnN3ZXInLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1swXSwgMCwgZGVzYyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlc2MpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgaWYgKGNhbmRpZGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZSh7fSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1MaW5lSW5kZXggPSBjYW5kaWRhdGUuc2RwTUxpbmVJbmRleDtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zZHBNaWQpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudHJhbnNjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50cmFuc2NlaXZlcnNbaV0ubWlkID09PSBjYW5kaWRhdGUuc2RwTWlkKSB7XG4gICAgICAgICAgICAgIG1MaW5lSW5kZXggPSBpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdGhpcy50cmFuc2NlaXZlcnNbbUxpbmVJbmRleF07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlcikge1xuICAgICAgICAgIHZhciBjYW5kID0gT2JqZWN0LmtleXMoY2FuZGlkYXRlLmNhbmRpZGF0ZSkubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlKGNhbmRpZGF0ZS5jYW5kaWRhdGUpIDoge307XG4gICAgICAgICAgLy8gSWdub3JlIENocm9tZSdzIGludmFsaWQgY2FuZGlkYXRlcyBzaW5jZSBFZGdlIGRvZXMgbm90IGxpa2UgdGhlbS5cbiAgICAgICAgICBpZiAoY2FuZC5wcm90b2NvbCA9PT0gJ3RjcCcgJiYgKGNhbmQucG9ydCA9PT0gMCB8fCBjYW5kLnBvcnQgPT09IDkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElnbm9yZSBSVENQIGNhbmRpZGF0ZXMsIHdlIGFzc3VtZSBSVENQLU1VWC5cbiAgICAgICAgICBpZiAoY2FuZC5jb21wb25lbnQgIT09ICcxJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBBIGRpcnR5IGhhY2sgdG8gbWFrZSBzYW1wbGVzIHdvcmsuXG4gICAgICAgICAgaWYgKGNhbmQudHlwZSA9PT0gJ2VuZE9mQ2FuZGlkYXRlcycpIHtcbiAgICAgICAgICAgIGNhbmQgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZShjYW5kKTtcblxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyh0aGlzLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgc2VjdGlvbnNbbUxpbmVJbmRleCArIDFdICs9IChjYW5kLnR5cGUgPyBjYW5kaWRhdGUuY2FuZGlkYXRlLnRyaW0oKVxuICAgICAgICAgICAgICA6ICdhPWVuZC1vZi1jYW5kaWRhdGVzJykgKyAnXFxyXFxuJztcbiAgICAgICAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMV0sIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgWydydHBTZW5kZXInLCAncnRwUmVjZWl2ZXInLCAnaWNlR2F0aGVyZXInLCAnaWNlVHJhbnNwb3J0JyxcbiAgICAgICAgICAgICdkdGxzVHJhbnNwb3J0J10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgICAgaWYgKHRyYW5zY2VpdmVyW21ldGhvZF0pIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYW5zY2VpdmVyW21ldGhvZF0uZ2V0U3RhdHMoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2IgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgYXJndW1lbnRzWzFdO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgLy8gc2hpbSBnZXRTdGF0cyB3aXRoIG1hcGxpa2Ugc3VwcG9ydFxuICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBNYXAoKTtcbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5zZXQoaWQsIHJlc3VsdFtpZF0pO1xuICAgICAgICAgICAgICByZXN1bHRzW2lkXSA9IHJlc3VsdFtpZF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNiLCAwLCByZXN1bHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJylcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNoaW1FcnJvcl8gPSBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHtQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludCxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGdldFVzZXJNZWRpYSBlcnJvciBzaGltLlxuICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgIH0pO1xuICB9O1xufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgZmlyZWZveFNoaW0gPSB7XG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIGlmICh0aGlzLl9vbnRyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29udHJhY2twb2x5ID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgLy8gRmlyZWZveCBoYXMgc3VwcG9ydGVkIG1velNyY09iamVjdCBzaW5jZSBGRjIyLCB1bnByZWZpeGVkIGluIDQyLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW96U3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHRoaXMubW96U3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICEod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8XG4gICAgICAgIHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbikpIHtcbiAgICAgIHJldHVybjsgLy8gcHJvYmFibHkgbWVkaWEucGVlcmNvbm5lY3Rpb24uZW5hYmxlZD1mYWxzZSBpbiBhYm91dDpjb25maWdcbiAgICB9XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICBpZiAoIXdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgICAgIC8vIC51cmxzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gRkYgPCAzOC5cbiAgICAgICAgICAvLyBjcmVhdGUgUlRDSWNlU2VydmVycyB3aXRoIGEgc2luZ2xlIHVybC5cbiAgICAgICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAgICAgdmFyIG5ld0ljZVNlcnZlcnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGNDb25maWcuaWNlU2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgc2VydmVyID0gcGNDb25maWcuaWNlU2VydmVyc1tpXTtcbiAgICAgICAgICAgICAgaWYgKHNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJscycpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZXJ2ZXIudXJscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgdmFyIG5ld1NlcnZlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2ZXIudXJsc1tqXVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXIudXJsc1tqXS5pbmRleE9mKCd0dXJuJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLnVzZXJuYW1lID0gc2VydmVyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIuY3JlZGVudGlhbCA9IHNlcnZlci5jcmVkZW50aWFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKG5ld1NlcnZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGNDb25maWcuaWNlU2VydmVycyA9IG5ld0ljZVNlcnZlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgbW96UlRDUGVlckNvbm5lY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSBtb3pSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG5cbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgICBpZiAobW96UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IG1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcbiAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBtb3pSVENJY2VDYW5kaWRhdGU7XG4gICAgfVxuXG4gICAgLy8gc2hpbSBhd2F5IG5lZWQgZm9yIG9ic29sZXRlIFJUQ0ljZUNhbmRpZGF0ZS9SVENTZXNzaW9uRGVzY3JpcHRpb24uXG4gICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBuYXRpdmVNZXRob2QgPSBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xuICAgICAgICAgICAgICAgIFJUQ0ljZUNhbmRpZGF0ZSA6IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbikoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGFkZEljZUNhbmRpZGF0ZShudWxsKVxuICAgIHZhciBuYXRpdmVBZGRJY2VDYW5kaWRhdGUgPVxuICAgICAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xuICAgIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IG51bGwpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1sxXSkge1xuICAgICAgICAgIGFyZ3VtZW50c1sxXS5hcHBseShudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlQWRkSWNlQ2FuZGlkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICB2YXIgbWFrZU1hcFN0YXRzID0gZnVuY3Rpb24oc3RhdHMpIHtcbiAgICAgIHZhciBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgbWFwLnNldChrZXksIHN0YXRzW2tleV0pO1xuICAgICAgICBtYXBba2V5XSA9IHN0YXRzW2tleV07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfTtcblxuICAgIHZhciBuYXRpdmVHZXRTdGF0cyA9IFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cztcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbihzZWxlY3Rvciwgb25TdWNjLCBvbkVycikge1xuICAgICAgcmV0dXJuIG5hdGl2ZUdldFN0YXRzLmFwcGx5KHRoaXMsIFtzZWxlY3RvciB8fCBudWxsXSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oc3RhdHMpIHtcbiAgICAgICAgICByZXR1cm4gbWFrZU1hcFN0YXRzKHN0YXRzKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4ob25TdWNjLCBvbkVycik7XG4gICAgfTtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1PblRyYWNrOiBmaXJlZm94U2hpbS5zaGltT25UcmFjayxcbiAgc2hpbVNvdXJjZU9iamVjdDogZmlyZWZveFNoaW0uc2hpbVNvdXJjZU9iamVjdCxcbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJylcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuLi91dGlscycpLmxvZztcbnZhciBicm93c2VyRGV0YWlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIFNlY3VyaXR5RXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxuICAgICAgICBQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InXG4gICAgICB9W2UubmFtZV0gfHwgZS5uYW1lLFxuICAgICAgbWVzc2FnZToge1xuICAgICAgICAnVGhlIG9wZXJhdGlvbiBpcyBpbnNlY3VyZS4nOiAnVGhlIHJlcXVlc3QgaXMgbm90IGFsbG93ZWQgYnkgdGhlICcgK1xuICAgICAgICAndXNlciBhZ2VudCBvciB0aGUgcGxhdGZvcm0gaW4gdGhlIGN1cnJlbnQgY29udGV4dC4nXG4gICAgICB9W2UubWVzc2FnZV0gfHwgZS5tZXNzYWdlLFxuICAgICAgY29uc3RyYWludDogZS5jb25zdHJhaW50LFxuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgKHRoaXMubWVzc2FnZSAmJiAnOiAnKSArIHRoaXMubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGdldFVzZXJNZWRpYSBjb25zdHJhaW50cyBzaGltLlxuICB2YXIgZ2V0VXNlck1lZGlhXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcbiAgICB2YXIgY29uc3RyYWludHNUb0ZGMzdfID0gZnVuY3Rpb24oYykge1xuICAgICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLnJlcXVpcmUpIHtcbiAgICAgICAgcmV0dXJuIGM7XG4gICAgICB9XG4gICAgICB2YXIgcmVxdWlyZSA9IFtdO1xuICAgICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSBjW2tleV0gPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID9cbiAgICAgICAgICAgIGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgICAgaWYgKHIubWluICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIHIubWF4ICE9PSB1bmRlZmluZWQgfHwgci5leGFjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmVxdWlyZS5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICh0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHIuIG1pbiA9IHIubWF4ID0gci5leGFjdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY1trZXldID0gci5leGFjdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHIuZXhhY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGMuYWR2YW5jZWQgPSBjLmFkdmFuY2VkIHx8IFtdO1xuICAgICAgICAgIHZhciBvYyA9IHt9O1xuICAgICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIG9jW2tleV0gPSB7bWluOiByLmlkZWFsLCBtYXg6IHIuaWRlYWx9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvY1trZXldID0gci5pZGVhbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYy5hZHZhbmNlZC5wdXNoKG9jKTtcbiAgICAgICAgICBkZWxldGUgci5pZGVhbDtcbiAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHIpLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVsZXRlIGNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHJlcXVpcmUubGVuZ3RoKSB7XG4gICAgICAgIGMucmVxdWlyZSA9IHJlcXVpcmU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYztcbiAgICB9O1xuICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgIGxvZ2dpbmcoJ3NwZWM6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgaWYgKGNvbnN0cmFpbnRzLmF1ZGlvKSB7XG4gICAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0ZGMzdfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25zdHJhaW50cy52aWRlbykge1xuICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy52aWRlbyk7XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdmZjM3OiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEoY29uc3RyYWludHMsIG9uU3VjY2VzcywgZnVuY3Rpb24oZSkge1xuICAgICAgb25FcnJvcihzaGltRXJyb3JfKGUpKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBnZXRVc2VyTWVkaWFfKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNoaW0gZm9yIG1lZGlhRGV2aWNlcyBvbiBvbGRlciB2ZXJzaW9ucy5cbiAgaWYgKCFuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyA9IHtnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgYWRkRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH0sXG4gICAgICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbigpIHsgfVxuICAgIH07XG4gIH1cbiAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5lbnVtZXJhdGVEZXZpY2VzID1cbiAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyB8fCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICB2YXIgaW5mb3MgPSBbXG4gICAgICAgICAgICB7a2luZDogJ2F1ZGlvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfSxcbiAgICAgICAgICAgIHtraW5kOiAndmlkZW9pbnB1dCcsIGRldmljZUlkOiAnZGVmYXVsdCcsIGxhYmVsOiAnJywgZ3JvdXBJZDogJyd9XG4gICAgICAgICAgXTtcbiAgICAgICAgICByZXNvbHZlKGluZm9zKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDEpIHtcbiAgICAvLyBXb3JrIGFyb3VuZCBodHRwOi8vYnVnemlsLmxhLzExNjk2NjVcbiAgICB2YXIgb3JnRW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcy5iaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG9yZ0VudW1lcmF0ZURldmljZXMoKS50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbiAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0OSkge1xuICAgIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gb3JpZ0dldFVzZXJNZWRpYShjKS50aGVuKGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAvLyBXb3JrIGFyb3VuZCBodHRwczovL2J1Z3ppbC5sYS84MDIzMjZcbiAgICAgICAgaWYgKGMuYXVkaW8gJiYgIXN0cmVhbS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aCB8fFxuICAgICAgICAgICAgYy52aWRlbyAmJiAhc3RyZWFtLmdldFZpZGVvVHJhY2tzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgIHRyYWNrLnN0b3AoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCdUaGUgb2JqZWN0IGNhbiBub3QgYmUgZm91bmQgaGVyZS4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdEZvdW5kRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoc2hpbUVycm9yXyhlKSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0NCkge1xuICAgICAgcmV0dXJuIGdldFVzZXJNZWRpYV8oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2UgRmlyZWZveCA0NCsncyBkZXByZWNhdGlvbiB3YXJuaW5nIHdpdGggdW5wcmVmaXhlZCB2ZXJzaW9uLlxuICAgIGNvbnNvbGUud2FybignbmF2aWdhdG9yLmdldFVzZXJNZWRpYSBoYXMgYmVlbiByZXBsYWNlZCBieSAnICtcbiAgICAgICAgICAgICAgICAgJ25hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhJyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcbiAgfTtcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbid1c2Ugc3RyaWN0JztcbnZhciBzYWZhcmlTaGltID0ge1xuICAvLyBUT0RPOiBEckFsZXgsIHNob3VsZCBiZSBoZXJlLCBkb3VibGUgY2hlY2sgYWdhaW5zdCBMYXlvdXRUZXN0c1xuICAvLyBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7IH0sXG5cbiAgLy8gVE9ETzogb25jZSB0aGUgYmFjay1lbmQgZm9yIHRoZSBtYWMgcG9ydCBpcyBkb25lLCBhZGQuXG4gIC8vIFRPRE86IGNoZWNrIGZvciB3ZWJraXRHVEsrXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24oKSB7IH0sXG5cbiAgc2hpbUdldFVzZXJNZWRpYTogZnVuY3Rpb24oKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWE7XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltR2V0VXNlck1lZGlhOiBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWFcbiAgLy8gVE9ET1xuICAvLyBzaGltT25UcmFjazogc2FmYXJpU2hpbS5zaGltT25UcmFjayxcbiAgLy8gc2hpbVBlZXJDb25uZWN0aW9uOiBzYWZhcmlTaGltLnNoaW1QZWVyQ29ubmVjdGlvblxufTtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nRGlzYWJsZWRfID0gdHJ1ZTtcblxuLy8gVXRpbGl0eSBtZXRob2RzLlxudmFyIHV0aWxzID0ge1xuICBkaXNhYmxlTG9nOiBmdW5jdGlvbihib29sKSB7XG4gICAgaWYgKHR5cGVvZiBib29sICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FyZ3VtZW50IHR5cGU6ICcgKyB0eXBlb2YgYm9vbCArXG4gICAgICAgICAgJy4gUGxlYXNlIHVzZSBhIGJvb2xlYW4uJyk7XG4gICAgfVxuICAgIGxvZ0Rpc2FibGVkXyA9IGJvb2w7XG4gICAgcmV0dXJuIChib29sKSA/ICdhZGFwdGVyLmpzIGxvZ2dpbmcgZGlzYWJsZWQnIDpcbiAgICAgICAgJ2FkYXB0ZXIuanMgbG9nZ2luZyBlbmFibGVkJztcbiAgfSxcblxuICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGxvZ0Rpc2FibGVkXykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRXh0cmFjdCBicm93c2VyIHZlcnNpb24gb3V0IG9mIHRoZSBwcm92aWRlZCB1c2VyIGFnZW50IHN0cmluZy5cbiAgICpcbiAgICogQHBhcmFtIHshc3RyaW5nfSB1YXN0cmluZyB1c2VyQWdlbnQgc3RyaW5nLlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IGV4cHIgUmVndWxhciBleHByZXNzaW9uIHVzZWQgYXMgbWF0Y2ggY3JpdGVyaWEuXG4gICAqIEBwYXJhbSB7IW51bWJlcn0gcG9zIHBvc2l0aW9uIGluIHRoZSB2ZXJzaW9uIHN0cmluZyB0byBiZSByZXR1cm5lZC5cbiAgICogQHJldHVybiB7IW51bWJlcn0gYnJvd3NlciB2ZXJzaW9uLlxuICAgKi9cbiAgZXh0cmFjdFZlcnNpb246IGZ1bmN0aW9uKHVhc3RyaW5nLCBleHByLCBwb3MpIHtcbiAgICB2YXIgbWF0Y2ggPSB1YXN0cmluZy5tYXRjaChleHByKTtcbiAgICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID49IHBvcyAmJiBwYXJzZUludChtYXRjaFtwb3NdLCAxMCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEJyb3dzZXIgZGV0ZWN0b3IuXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gcmVzdWx0IGNvbnRhaW5pbmcgYnJvd3NlciBhbmQgdmVyc2lvblxuICAgKiAgICAgcHJvcGVydGllcy5cbiAgICovXG4gIGRldGVjdEJyb3dzZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vIFJldHVybmVkIHJlc3VsdCBvYmplY3QuXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHJlc3VsdC5icm93c2VyID0gbnVsbDtcbiAgICByZXN1bHQudmVyc2lvbiA9IG51bGw7XG5cbiAgICAvLyBGYWlsIGVhcmx5IGlmIGl0J3Mgbm90IGEgYnJvd3NlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhd2luZG93Lm5hdmlnYXRvcikge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnTm90IGEgYnJvd3Nlci4nO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94LlxuICAgIGlmIChuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdmaXJlZm94JztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9GaXJlZm94XFwvKFswLTldKylcXC4vLCAxKTtcblxuICAgIC8vIGFsbCB3ZWJraXQtYmFzZWQgYnJvd3NlcnNcbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEpIHtcbiAgICAgIC8vIENocm9tZSwgQ2hyb21pdW0sIFdlYnZpZXcsIE9wZXJhLCBhbGwgdXNlIHRoZSBjaHJvbWUgc2hpbSBmb3Igbm93XG4gICAgICBpZiAod2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIHJlc3VsdC5icm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9DaHJvbShlfGl1bSlcXC8oWzAtOV0rKVxcLi8sIDIpO1xuXG4gICAgICAvLyBTYWZhcmkgb3IgdW5rbm93biB3ZWJraXQtYmFzZWRcbiAgICAgIC8vIGZvciB0aGUgdGltZSBiZWluZyBTYWZhcmkgaGFzIHN1cHBvcnQgZm9yIE1lZGlhU3RyZWFtcyBidXQgbm90IHdlYlJUQ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2FmYXJpIFVBIHN1YnN0cmluZ3Mgb2YgaW50ZXJlc3QgZm9yIHJlZmVyZW5jZTpcbiAgICAgICAgLy8gLSB3ZWJraXQgdmVyc2lvbjogICAgICAgICAgIEFwcGxlV2ViS2l0LzYwMi4xLjI1IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vIC0gc2FmYXJpIFVJIHZlcnNpb246ICAgICAgICBWZXJzaW9uLzkuMC4zICh1bmlxdWUgdG8gU2FmYXJpKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB3ZWJraXQgdmVyc2lvbjogU2FmYXJpLzYwMS40LjQgKGFsc28gdXNlZCBpbiBPcCxDcilcbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgdGhlIHdlYmtpdCB2ZXJzaW9uIGFuZCBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb25zIGFyZSBlcXVhbHMsXG4gICAgICAgIC8vIC4uLiB0aGlzIGlzIGEgc3RhYmxlIHZlcnNpb24uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIG9ubHkgdGhlIGludGVybmFsIHdlYmtpdCB2ZXJzaW9uIGlzIGltcG9ydGFudCB0b2RheSB0byBrbm93IGlmXG4gICAgICAgIC8vIG1lZGlhIHN0cmVhbXMgYXJlIHN1cHBvcnRlZFxuICAgICAgICAvL1xuICAgICAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyhcXGQrKS4oXFxkKykvKSkge1xuICAgICAgICAgIHJlc3VsdC5icm93c2VyID0gJ3NhZmFyaSc7XG4gICAgICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICAvQXBwbGVXZWJLaXRcXC8oWzAtOV0rKVxcLi8sIDEpO1xuXG4gICAgICAgIC8vIHVua25vd24gd2Via2l0LWJhc2VkIGJyb3dzZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdVbnN1cHBvcnRlZCB3ZWJraXQtYmFzZWQgYnJvd3NlciAnICtcbiAgICAgICAgICAgICAgJ3dpdGggR1VNIHN1cHBvcnQgYnV0IG5vIFdlYlJUQyBzdXBwb3J0Lic7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgLy8gRWRnZS5cbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci5tZWRpYURldmljZXMgJiZcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRWRnZVxcLyhcXGQrKS4oXFxkKykkLykpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2VkZ2UnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSB0aGlzLmV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8sIDIpO1xuXG4gICAgLy8gRGVmYXVsdCBmYWxsdGhyb3VnaDogbm90IHN1cHBvcnRlZC5cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnTm90IGEgc3VwcG9ydGVkIGJyb3dzZXIuJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufTtcblxuLy8gRXhwb3J0LlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZzogdXRpbHMubG9nLFxuICBkaXNhYmxlTG9nOiB1dGlscy5kaXNhYmxlTG9nLFxuICBicm93c2VyRGV0YWlsczogdXRpbHMuZGV0ZWN0QnJvd3NlcigpLFxuICBleHRyYWN0VmVyc2lvbjogdXRpbHMuZXh0cmFjdFZlcnNpb25cbn07XG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBMaWNlbnNlIGluZm8gZm9yIHdlYnJ0Yy1hZGFwdGVyIG1vZHVsZSBhc3NlbWJsZWQgaW50byBqcyBidW5kbGU6XG4gKiBcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqIFxuICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogXG4gKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiBcbiAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR29vZ2xlIG5vciB0aGUgbmFtZXMgb2YgaXRzIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKiBcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgSE9MREVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuLyoqXG4gKiBAbGljZW5zZVxuICogTGljZW5zZSBpbmZvIGZvciBzZHAgbW9kdWxlIGFzc2VtYmxlZCBpbnRvIGpzIGJ1bmRsZTpcbiAqIFxuICogU2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3NkcFxuICovXG5pbXBvcnQgJ3dlYnJ0Yy1hZGFwdGVyJztcbi8qKlxuICogQGxpY2Vuc2VcbiAqIExpY2Vuc2UgaW5mbyBmb3IgdXVpZCBtb2R1bGUgYXNzZW1ibGVkIGludG8ganMgYnVuZGxlOlxuICogXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqIFxuICogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTYgUm9iZXJ0IEtpZWZmZXIgYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICogXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqIFxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cbmltcG9ydCBSdGNTZXNzaW9uIGZyb20gJy4vcnRjX3Nlc3Npb24nO1xuaW1wb3J0IHtSVENfRVJST1JTfSBmcm9tICcuL3J0Y19jb25zdCc7XG5cbmdsb2JhbC5jb25uZWN0ID0gZ2xvYmFsLmNvbm5lY3QgfHwge307XG5nbG9iYWwuY29ubmVjdC5SVENTZXNzaW9uID0gUnRjU2Vzc2lvbjtcbmdsb2JhbC5jb25uZWN0LlJUQ0Vycm9ycyA9IFJUQ19FUlJPUlM7XG5cbmdsb2JhbC5saWx5ID0gZ2xvYmFsLmxpbHkgfHwge307XG5nbG9iYWwubGlseS5SVENTZXNzaW9uID0gUnRjU2Vzc2lvbjtcbmdsb2JhbC5saWx5LlJUQ0Vycm9ycyA9IFJUQ19FUlJPUlM7IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5leHBvcnQgY29uc3QgVGltZW91dEV4Y2VwdGlvbk5hbWUgPSAnVGltZW91dCc7XG5leHBvcnQgY2xhc3MgVGltZW91dCBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gVGltZW91dEV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgR3VtVGltZW91dEV4Y2VwdGlvbk5hbWUgPSAnR3VtVGltZW91dCc7XG5leHBvcnQgY2xhc3MgR3VtVGltZW91dCBleHRlbmRzIFRpbWVvdXQge1xuICAgIGNvbnN0cnVjdG9yKG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLm5hbWUgPSBHdW1UaW1lb3V0RXhjZXB0aW9uTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBJbGxlZ2FsUGFyYW1ldGVyc0V4Y2VwdGlvbk5hbWUgPSAnSWxsZWdhbFBhcmFtZXRlcnMnO1xuZXhwb3J0IGNsYXNzIElsbGVnYWxQYXJhbWV0ZXJzIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLm5hbWUgPSBJbGxlZ2FsUGFyYW1ldGVyc0V4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgSWxsZWdhbFN0YXRlRXhjZXB0aW9uTmFtZSA9ICdJbGxlZ2FsU3RhdGUnO1xuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZSBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gSWxsZWdhbFN0YXRlRXhjZXB0aW9uTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVbnN1cHBvcnRlZE9wZXJhdGlvbkV4Y2VwdGlvbk5hbWUgPSAnVW5zdXBwb3J0ZWRPcGVyYXRpb24nO1xuZXhwb3J0IGNsYXNzIFVuc3VwcG9ydGVkT3BlcmF0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLm5hbWUgPSBVbnN1cHBvcnRlZE9wZXJhdGlvbkV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgQnVzeUV4Y2VwdGlvbk5hbWUgPSAnQnVzeUV4Y2VwdGlvbic7XG5leHBvcnQgY2xhc3MgQnVzeUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gQnVzeUV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZSA9ICdDYWxsTm90Rm91bmRFeGNlcHRpb24nO1xuZXhwb3J0IGNsYXNzIENhbGxOb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBVbmtub3duU2lnbmFsaW5nRXJyb3JOYW1lID0gJ1Vua25vd25TaWduYWxpbmdFcnJvcic7XG5leHBvcnQgY2xhc3MgVW5rbm93blNpZ25hbGluZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBVbmtub3duU2lnbmFsaW5nRXJyb3JOYW1lO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKipcbiAqIFRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmVyIHJlc3BvbnNlIHRvIGFjY2VwdC9oYW5ndXAgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BWF9BQ0NFUFRfQllFX0RFTEFZX01TID0gMjAwMDtcbi8qKlxuICogVGltZW91dCB3YWl0aW5nIGZvciBzZXJ2ZXIgcmVzcG9uc2UgdG8gaW52aXRlLlxuICovXG5leHBvcnQgY29uc3QgTUFYX0lOVklURV9ERUxBWV9NUyA9IDUwMDA7XG4vKipcbiAqICBEZWZhdWx0IHRpbWVvdXQgb24gb3BlbmluZyBXZWJTb2NrZXQgY29ubmVjdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09OTkVDVF9USU1FT1VUX01TID0gMTAwMDA7XG4vKipcbiAqIERlZmF1bHQgaWNlIGNvbGxlY3Rpb24gdGltZW91dCBpbiBtaWxsaXNlY29uZHMuXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0lDRV9USU1FT1VUX01TID0gODAwMDtcbi8qKlxuICogRGVmYXVsdCBndW0gdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYmUgZW5mb3JjZWQgZHVyaW5nIHN0YXJ0IG9mIGEgY2FsbC5cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfR1VNX1RJTUVPVVRfTVMgPSAxMDAwMDtcblxuLyoqXG4gKiBSVEMgZXJyb3IgbmFtZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBSVENfRVJST1JTID0ge1xuICAgICBJQ0VfQ09MTEVDVElPTl9USU1FT1VUIDogJ0ljZSBDb2xsZWN0aW9uIFRpbWVvdXQnLFxuICAgICBVU0VSX0JVU1kgOiAnVXNlciBCdXN5JyxcbiAgICAgU0lHTkFMTElOR19DT05ORUNUSU9OX0ZBSUxVUkUgOiAnU2lnbmFsbGluZyBDb25uZWN0aW9uIEZhaWx1cmUnLFxuICAgICBTSUdOQUxMSU5HX0hBTkRTSEFLRV9GQUlMVVJFIDogJ1NpZ25hbGxpbmcgSGFuZHNoYWtlIEZhaWx1cmUnLFxuICAgICBTRVRfUkVNT1RFX0RFU0NSSVBUSU9OX0ZBSUxVUkUgOiAnU2V0IFJlbW90ZSBEZXNjcmlwdGlvbiBGYWlsdXJlJyxcbiAgICAgQ1JFQVRFX09GRkVSX0ZBSUxVUkUgOiAnQ3JlYXRlIE9mZmVyIEZhaWx1cmUnLFxuICAgICBTRVRfTE9DQUxfREVTQ1JJUFRJT05fRkFJTFVSRSA6ICdTZXQgTG9jYWwgRGVzY3JpcHRpb24gRmFpbHVyZScsXG4gICAgIElOVkFMSURfUkVNT1RFX1NEUCA6ICdJbnZhbGlkIFJlbW90ZSBTRFAnLFxuICAgICBOT19SRU1PVEVfSUNFX0NBTkRJREFURSA6ICdObyBSZW1vdGUgSUNFIENhbmRpZGF0ZScsXG4gICAgIEdVTV9USU1FT1VUX0ZBSUxVUkUgOiAnR1VNIFRpbWVvdXQgRmFpbHVyZScsXG4gICAgIEdVTV9PVEhFUl9GQUlMVVJFIDogJ0dVTSBPdGhlciBGYWlsdXJlJyxcbiAgICAgQ0FMTF9OT1RfRk9VTkQ6ICdDYWxsIE5vdCBGb3VuZCdcbn07IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQgeyBoaXRjaCwgd3JhcExvZ2dlciwgY2xvc2VTdHJlYW0sIFNkcE9wdGlvbnMsIHRyYW5zZm9ybVNkcCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgU2Vzc2lvblJlcG9ydCB9IGZyb20gJy4vc2Vzc2lvbl9yZXBvcnQnO1xuaW1wb3J0IHsgREVGQVVMVF9JQ0VfVElNRU9VVF9NUywgREVGQVVMVF9HVU1fVElNRU9VVF9NUywgUlRDX0VSUk9SUyB9IGZyb20gJy4vcnRjX2NvbnN0JztcbmltcG9ydCB7IFVuc3VwcG9ydGVkT3BlcmF0aW9uLCBJbGxlZ2FsUGFyYW1ldGVycywgSWxsZWdhbFN0YXRlLCBHdW1UaW1lb3V0LCBCdXN5RXhjZXB0aW9uTmFtZSwgQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZSB9IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQgUnRjU2lnbmFsaW5nIGZyb20gJy4vc2lnbmFsaW5nJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQvdjQnO1xuaW1wb3J0IHtleHRyYWN0QXVkaW9TdGF0c0Zyb21TdGF0c30gZnJvbSAnLi9ydHAtc3RhdHMnO1xuXG5leHBvcnQgY2xhc3MgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihydGNTZXNzaW9uKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24gPSBydGNTZXNzaW9uO1xuICAgIH1cbiAgICBvbkVudGVyKCkge1xuICAgIH1cbiAgICBvbkV4aXQoKSB7XG4gICAgfVxuICAgIF9pc0N1cnJlbnRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J0Y1Nlc3Npb24uX3N0YXRlID09PSB0aGlzO1xuICAgIH1cbiAgICB0cmFuc2l0KG5leHRTdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5faXNDdXJyZW50U3RhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi50cmFuc2l0KG5leHRTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGxvZ2dlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J0Y1Nlc3Npb24uX2xvZ2dlcjtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24pKTtcbiAgICB9XG4gICAgb25JY2VDYW5kaWRhdGUoZXZ0KSB7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgICAvL2lnbm9yZSBjYW5kaWRhdGUgYnkgZGVmYXVsdCwgQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZSB3aWxsIG92ZXJyaWRlIHRvIGNvbGxlY3QgY2FuZGlkYXRlcywgYnV0IGNvbGxlY3RpbmcgcHJvY2VzcyBjb3VsZCBsYXN0IG11Y2ggbG9uZ2VyIHRoYW4gQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZVxuICAgICAgICAvL3dlIGRvbid0IHdhbnQgdG8gc3BhbSB0aGUgY29uc29sZSBsb2dcbiAgICB9XG4gICAgb25SZW1vdGVIdW5ndXAoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25SZW1vdGVIdW5ndXAgbm90IGltcGxlbWVudGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUlRDU2Vzc2lvblN0YXRlXCI7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nQ29ubmVjdGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ29uU2lnbmFsaW5nQ29ubmVjdGVkIG5vdCBpbXBsZW1lbnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdIYW5kc2hha2VkKCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ29uU2lnbmFsaW5nSGFuZHNoYWtlZCBub3QgaW1wbGVtZW50ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nRmFpbGVkKGUpIHsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25TaWduYWxpbmdGYWlsZWQgbm90IGltcGxlbWVudGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHcmFiTG9jYWxNZWRpYVN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAoc2VsZi5fcnRjU2Vzc2lvbi5fdXNlckF1ZGlvU3RyZWFtKSB7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IENyZWF0ZU9mZmVyU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGd1bVRpbWVvdXRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEd1bVRpbWVvdXQoJ0xvY2FsIG1lZGlhIGhhcyBub3QgYmVlbiBpbml0aWFsaXplZCB5ZXQuJykpO1xuICAgICAgICAgICAgICAgIH0sIHNlbGYuX3J0Y1Nlc3Npb24uX2d1bVRpbWVvdXRNaWxsaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgc2Vzc2lvbkd1bVByb21pc2UgPSBzZWxmLl9nVU0oc2VsZi5fcnRjU2Vzc2lvbi5fYnVpbGRNZWRpYUNvbnN0cmFpbnRzKCkpO1xuXG4gICAgICAgICAgICBQcm9taXNlLnJhY2UoW3Nlc3Npb25HdW1Qcm9taXNlLCBndW1UaW1lb3V0UHJvbWlzZV0pXG4gICAgICAgICAgICAgICAgLnRoZW4oc3RyZWFtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1UaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fb25HdW1TdWNjZXNzKHNlbGYuX3J0Y1Nlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zdHJlYW1Ub0JlQ2xvc2VkID0gc3RyZWFtO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bU90aGVyRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bVRpbWVvdXRGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgQ3JlYXRlT2ZmZXJTdGF0ZShzZWxmLl9ydGNTZXNzaW9uKSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvclJlYXNvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHdW1UaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclJlYXNvbiA9IFJUQ19FUlJPUlMuR1VNX1RJTUVPVVRfRkFJTFVSRTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtVGltZW91dEZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1PdGhlckZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yUmVhc29uID0gUlRDX0VSUk9SUy5HVU1fT1RIRVJfRkFJTFVSRTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtT3RoZXJGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtVGltZW91dEZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignTG9jYWwgbWVkaWEgaW5pdGlhbGl6YXRpb24gZmFpbGVkJywgZSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX29uR3VtRXJyb3Ioc2VsZi5fcnRjU2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbiwgZXJyb3JSZWFzb24pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiR3JhYkxvY2FsTWVkaWFTdGF0ZVwiO1xuICAgIH1cbiAgICBfZ1VNKGNvbnN0cmFpbnRzKSB7XG4gICAgICAgIHJldHVybiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIENyZWF0ZU9mZmVyU3RhdGUgZXh0ZW5kcyBSVENTZXNzaW9uU3RhdGUge1xuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHN0cmVhbSA9IHNlbGYuX3J0Y1Nlc3Npb24uX3N0cmVhbVRvQmVDbG9zZWQgfHwgc2VsZi5fcnRjU2Vzc2lvbi5fdXNlckF1ZGlvU3RyZWFtO1xuICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9wYy5hZGRTdHJlYW0oc3RyZWFtKTtcbiAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fb25Mb2NhbFN0cmVhbUFkZGVkKHNlbGYuX3J0Y1Nlc3Npb24sIHN0cmVhbSk7XG4gICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3BjLmNyZWF0ZU9mZmVyKCkudGhlbihydGNTZXNzaW9uRGVzY3JpcHRpb24gPT4ge1xuICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fbG9jYWxTZXNzaW9uRGVzY3JpcHRpb24gPSBydGNTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmNyZWF0ZU9mZmVyRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBTZXRMb2NhbFNlc3Npb25EZXNjcmlwdGlvblN0YXRlKHNlbGYuX3J0Y1Nlc3Npb24pKTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignQ3JlYXRlT2ZmZXIgZmFpbGVkJywgZSk7XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmNyZWF0ZU9mZmVyRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHNlbGYuX3J0Y1Nlc3Npb24sIFJUQ19FUlJPUlMuQ1JFQVRFX09GRkVSX0ZBSUxVUkUpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJDcmVhdGVPZmZlclN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFNldExvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uU3RhdGUgZXh0ZW5kcyBSVENTZXNzaW9uU3RhdGUge1xuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBmaXgvbW9kaWZ5IFNEUCBhcyBuZWVkZWQgaGVyZSwgYmVmb3JlIHNldExvY2FsRGVzY3JpcHRpb25cbiAgICAgICAgdmFyIGxvY2FsRGVzY3JpcHRpb24gPSBzZWxmLl9ydGNTZXNzaW9uLl9sb2NhbFNlc3Npb25EZXNjcmlwdGlvbjtcbiAgICAgICAgdmFyIHNkcE9wdGlvbnMgPSBuZXcgU2RwT3B0aW9ucygpO1xuICAgICAgICBpZiAoc2VsZi5fcnRjU2Vzc2lvbi5fZm9yY2VBdWRpb0NvZGVjKSB7XG4gICAgICAgICAgICBzZHBPcHRpb25zLmZvcmNlQ29kZWNbJ2F1ZGlvJ10gPSBzZWxmLl9ydGNTZXNzaW9uLl9mb3JjZUF1ZGlvQ29kZWM7XG4gICAgICAgIH1cbiAgICAgICAgc2RwT3B0aW9ucy5lbmFibGVPcHVzRHR4ID0gc2VsZi5fcnRjU2Vzc2lvbi5fZW5hYmxlT3B1c0R0eDtcbiAgICAgICAgbG9jYWxEZXNjcmlwdGlvbi5zZHAgPSB0cmFuc2Zvcm1TZHAobG9jYWxEZXNjcmlwdGlvbi5zZHAsIHNkcE9wdGlvbnMpO1xuXG4gICAgICAgIHNlbGYubG9nZ2VyLmluZm8oJ0xvY2FsU0QnLCBzZWxmLl9ydGNTZXNzaW9uLl9sb2NhbFNlc3Npb25EZXNjcmlwdGlvbik7XG4gICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3BjLnNldExvY2FsRGVzY3JpcHRpb24oc2VsZi5fcnRjU2Vzc2lvbi5fbG9jYWxTZXNzaW9uRGVzY3JpcHRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGluaXRpYWxpemF0aW9uVGltZSA9IERhdGUubm93KCkgLSBzZWxmLl9ydGNTZXNzaW9uLl9jb25uZWN0VGltZVN0YW1wO1xuICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5pbml0aWFsaXphdGlvblRpbWVNaWxsaXMgPSBpbml0aWFsaXphdGlvblRpbWU7XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9vblNlc3Npb25Jbml0aWFsaXplZChzZWxmLl9ydGNTZXNzaW9uLCBpbml0aWFsaXphdGlvblRpbWUpO1xuICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zZXRMb2NhbERlc2NyaXB0aW9uRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBDb25uZWN0U2lnbmFsaW5nQW5kSWNlQ29sbGVjdGlvblN0YXRlKHNlbGYuX3J0Y1Nlc3Npb24pKTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignU2V0TG9jYWxEZXNjcmlwdGlvbiBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShzZWxmLl9ydGNTZXNzaW9uLCBSVENfRVJST1JTLlNFVF9MT0NBTF9ERVNDUklQVElPTl9GQUlMVVJFKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiU2V0TG9jYWxTZXNzaW9uRGVzY3JpcHRpb25TdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBDb25uZWN0U2lnbmFsaW5nQW5kSWNlQ29sbGVjdGlvblN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihydGNTZXNzaW9uKSB7XG4gICAgICAgIHN1cGVyKHJ0Y1Nlc3Npb24pO1xuICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVzID0gW107XG4gICAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZUZvdW5kYXRpb25zTWFwID0ge307XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VsZi5faXNDdXJyZW50U3RhdGUoKSAmJiAhc2VsZi5faWNlQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIud2FybignSUNFIGNvbGxlY3Rpb24gdGltZWQgb3V0Jyk7XG4gICAgICAgICAgICAgICAgc2VsZi5yZXBvcnRJY2VDb21wbGV0ZWQodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYuX3J0Y1Nlc3Npb24uX2ljZVRpbWVvdXRNaWxsaXMpO1xuICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9jcmVhdGVTaWduYWxpbmdDaGFubmVsKCkuY29ubmVjdCgpO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0Nvbm5lY3RlZCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2lnbmFsbGluZ0Nvbm5lY3RUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNpZ25hbGxpbmdDb25uZWN0VGltZU1pbGxpcyA9IHRoaXMuX3J0Y1Nlc3Npb24uX3NpZ25hbGxpbmdDb25uZWN0VGltZXN0YW1wIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9vblNpZ25hbGluZ0Nvbm5lY3RlZCh0aGlzLl9ydGNTZXNzaW9uKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2hlY2tBbmRUcmFuc2l0KCk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nRmFpbGVkKGUpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMgPSBEYXRlLm5vdygpIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRmFpbGVkIGNvbm5lY3RpbmcgdG8gc2lnbmFsaW5nIHNlcnZlcicsIGUpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSA9IHRydWU7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5TSUdOQUxMSU5HX0NPTk5FQ1RJT05fRkFJTFVSRSkpO1xuICAgIH1cbiAgICBfY3JlYXRlTG9jYWxDYW5kaWRhdGUoaW5pdERpY3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSVENJY2VDYW5kaWRhdGUoaW5pdERpY3QpO1xuICAgIH1cbiAgICBvbkljZUNhbmRpZGF0ZShldnQpIHtcbiAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGV2dC5jYW5kaWRhdGU7XG4gICAgICAgIHRoaXMubG9nZ2VyLmxvZygnb25pY2VjYW5kaWRhdGUnLCBjYW5kaWRhdGUpO1xuICAgICAgICBpZiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVzLnB1c2godGhpcy5fY3JlYXRlTG9jYWxDYW5kaWRhdGUoY2FuZGlkYXRlKSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2ljZUNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoZWNrQ2FuZGlkYXRlc1N1ZmZpY2llbnQoY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXBvcnRJY2VDb21wbGV0ZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9jaGVja0NhbmRpZGF0ZXNTdWZmaWNpZW50KGNhbmRpZGF0ZSkge1xuICAgICAgICAvL2NoZWNrIGlmIHdlIGNvbGxlY3RlZCBib3RoIGNhbmRpZGF0ZXMgZnJvbSBzaW5nbGUgbWVkaWEgc2VydmVyIGJ5IGNoZWNraW5nIHRoZSBzYW1lIGZvdW5kYXRpb24gY29sbGVjdGVkIHR3aWNlXG4gICAgICAgIC8vbWVhbmluZyBib3RoIFJUUCBhbmQgUlRDUCBjYW5kaWRhdGVzIGFyZSBjb2xsZWN0ZWQuXG4gICAgICAgIHZhciBjYW5kaWRhdGVBdHRyaWJ1dGVzU3RyaW5nID0gY2FuZGlkYXRlLmNhbmRpZGF0ZSB8fCBcIlwiO1xuICAgICAgICB2YXIgY2FuZGlkYXRlQXR0cmlidXRlcyA9IGNhbmRpZGF0ZUF0dHJpYnV0ZXNTdHJpbmcuc3BsaXQoXCIgXCIpO1xuICAgICAgICB2YXIgY2FuZGlkYXRlRm91bmRhdGlvbiA9IGNhbmRpZGF0ZUF0dHJpYnV0ZXNbMF07XG4gICAgICAgIHZhciB0cmFuc3BvcnRTUCA9IGNhbmRpZGF0ZUF0dHJpYnV0ZXNbMV07XG4gICAgICAgIGlmIChjYW5kaWRhdGVGb3VuZGF0aW9uICYmIHRyYW5zcG9ydFNQKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNwb3J0U1BzTGlzdCA9IHRoaXMuX2ljZUNhbmRpZGF0ZUZvdW5kYXRpb25zTWFwW2NhbmRpZGF0ZUZvdW5kYXRpb25dIHx8IFtdO1xuICAgICAgICAgICAgaWYgKHRyYW5zcG9ydFNQc0xpc3QubGVuZ3RoID4gMCAmJiAhdHJhbnNwb3J0U1BzTGlzdC5pbmNsdWRlcyh0cmFuc3BvcnRTUCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcG9ydEljZUNvbXBsZXRlZChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFuc3BvcnRTUHNMaXN0LnB1c2godHJhbnNwb3J0U1ApO1xuICAgICAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlRm91bmRhdGlvbnNNYXBbY2FuZGlkYXRlRm91bmRhdGlvbl0gPSB0cmFuc3BvcnRTUHNMaXN0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlcG9ydEljZUNvbXBsZXRlZChpc1RpbWVvdXQpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5pY2VDb2xsZWN0aW9uVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX2ljZUNvbXBsZXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX29uSWNlQ29sbGVjdGlvbkNvbXBsZXRlKHRoaXMuX3J0Y1Nlc3Npb24sIGlzVGltZW91dCwgdGhpcy5faWNlQ2FuZGlkYXRlcy5sZW5ndGgpO1xuICAgICAgICBpZiAodGhpcy5faWNlQ2FuZGlkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmljZUNvbGxlY3Rpb25GYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9jaGVja0FuZFRyYW5zaXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdObyBJQ0UgY2FuZGlkYXRlJyk7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmljZUNvbGxlY3Rpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5JQ0VfQ09MTEVDVElPTl9USU1FT1VUKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2NoZWNrQW5kVHJhbnNpdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ljZUNvbXBsZXRlZCAmJiB0aGlzLl9zaWduYWxpbmdDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgSW52aXRlQW5zd2VyU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgdGhpcy5faWNlQ2FuZGlkYXRlcykpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLl9pY2VDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygnUGVuZGluZyBJQ0UgY29sbGVjdGlvbicpO1xuICAgICAgICB9IGVsc2Ugey8vaW1wbGllcyBfc2lnbmFsaW5nQ29ubmVjdGVkID09IGZhbHNlXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ1BlbmRpbmcgc2lnbmFsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBJbnZpdGVBbnN3ZXJTdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgY29uc3RydWN0b3IocnRjU2Vzc2lvbiwgaWNlQ2FuZGlkYXRlcykge1xuICAgICAgICBzdXBlcihydGNTZXNzaW9uKTtcbiAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlcyA9IGljZUNhbmRpZGF0ZXM7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBydGNTZXNzaW9uID0gdGhpcy5fcnRjU2Vzc2lvbjtcbiAgICAgICAgcnRjU2Vzc2lvbi5fb25TaWduYWxpbmdTdGFydGVkKHJ0Y1Nlc3Npb24pO1xuICAgICAgICBydGNTZXNzaW9uLl9zaWduYWxpbmdDaGFubmVsLmludml0ZShydGNTZXNzaW9uLl9sb2NhbFNlc3Npb25EZXNjcmlwdGlvbi5zZHAsXG4gICAgICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVzKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdBbnN3ZXJlZChzZHAsIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC51c2VyQnVzeUZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5oYW5kc2hha2luZ0ZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBBY2NlcHRTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uLCBzZHAsIGNhbmRpZGF0ZXMpKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdGYWlsZWQoZSkge1xuICAgICAgICB2YXIgcmVhc29uO1xuICAgICAgICBpZiAoZS5uYW1lID09IEJ1c3lFeGNlcHRpb25OYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignVXNlciBCdXN5LCBwb3NzaWJseSBtdWx0aXBsZSBDQ1Agd2luZG93cyBvcGVuJywgZSk7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnVzZXJCdXN5RmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmhhbmRzaGFraW5nRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICByZWFzb24gPSBSVENfRVJST1JTLlVTRVJfQlVTWTtcbiAgICAgICAgfSBlbHNlIGlmIChlLm5hbWUgPT0gQ2FsbE5vdEZvdW5kRXhjZXB0aW9uTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0NhbGwgbm90IGZvdW5kLiBPbmUgb2YgdGhlIHBhcnRpY2lwYW50IHByb2JhYmx5IGh1bmd1cC4nLCBlKTtcbiAgICAgICAgICAgIHJlYXNvbiA9IFJUQ19FUlJPUlMuQ0FMTF9OT1RfRk9VTkQ7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmhhbmRzaGFraW5nRmFpbHVyZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRmFpbGVkIGhhbmRzaGFraW5nIHdpdGggc2lnbmFsaW5nIHNlcnZlcicsIGUpO1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC51c2VyQnVzeUZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaGFuZHNoYWtpbmdGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlYXNvbiA9IFJUQ19FUlJPUlMuU0lHTkFMTElOR19IQU5EU0hBS0VfRkFJTFVSRTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24sIHJlYXNvbikpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiSW52aXRlQW5zd2VyU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQWNjZXB0U3RhdGUgZXh0ZW5kcyBSVENTZXNzaW9uU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJ0Y1Nlc3Npb24sIHNkcCwgY2FuZGlkYXRlcykge1xuICAgICAgICBzdXBlcihydGNTZXNzaW9uKTtcbiAgICAgICAgdGhpcy5fc2RwID0gc2RwO1xuICAgICAgICB0aGlzLl9jYW5kaWRhdGVzID0gY2FuZGlkYXRlcztcbiAgICB9XG4gICAgX2NyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbihpbml0RGljdCkge1xuICAgICAgICByZXR1cm4gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihpbml0RGljdCk7XG4gICAgfVxuICAgIF9jcmVhdGVSZW1vdGVDYW5kaWRhdGUoaW5pdERpY3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSVENJY2VDYW5kaWRhdGUoaW5pdERpY3QpO1xuICAgIH1cbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBydGNTZXNzaW9uID0gc2VsZi5fcnRjU2Vzc2lvbjtcblxuICAgICAgICBpZiAoIXNlbGYuX3NkcCkge1xuICAgICAgICAgICAgc2VsZi5sb2dnZXIuZXJyb3IoJ0ludmFsaWQgcmVtb3RlIFNEUCcpO1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc3RvcFNlc3Npb24oKTtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaW52YWxpZFJlbW90ZVNEUEZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShydGNTZXNzaW9uLCBSVENfRVJST1JTLklOVkFMSURfUkVNT1RFX1NEUCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKCFzZWxmLl9jYW5kaWRhdGVzIHx8IHNlbGYuX2NhbmRpZGF0ZXMubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgc2VsZi5sb2dnZXIuZXJyb3IoJ05vIHJlbW90ZSBJQ0UgY2FuZGlkYXRlJyk7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zdG9wU2Vzc2lvbigpO1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShydGNTZXNzaW9uLCBSVENfRVJST1JTLk5PX1JFTU9URV9JQ0VfQ0FORElEQVRFKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmludmFsaWRSZW1vdGVTRFBGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgIHJ0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQubm9SZW1vdGVJY2VDYW5kaWRhdGVGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgIHZhciBzZXRSZW1vdGVEZXNjcmlwdGlvblByb21pc2UgPSBydGNTZXNzaW9uLl9wYy5zZXRSZW1vdGVEZXNjcmlwdGlvbihzZWxmLl9jcmVhdGVTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICAgICAgdHlwZTogJ2Fuc3dlcicsXG4gICAgICAgICAgICBzZHA6IHNlbGYuX3NkcFxuICAgICAgICB9KSk7XG4gICAgICAgIHNldFJlbW90ZURlc2NyaXB0aW9uUHJvbWlzZS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIHNlbGYubG9nZ2VyLmVycm9yKCdTZXRSZW1vdGVEZXNjcmlwdGlvbiBmYWlsZWQnLCBlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFJlbW90ZURlc2NyaXB0aW9uUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHZhciByZW1vdGVDYW5kaWRhdGVQcm9taXNlcyA9IFByb21pc2UuYWxsKHNlbGYuX2NhbmRpZGF0ZXMubWFwKGZ1bmN0aW9uIChjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVtb3RlQ2FuZGlkYXRlID0gc2VsZi5fY3JlYXRlUmVtb3RlQ2FuZGlkYXRlKGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIuaW5mbygnQWRkaW5nIHJlbW90ZSBjYW5kaWRhdGUnLCByZW1vdGVDYW5kaWRhdGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBydGNTZXNzaW9uLl9wYy5hZGRJY2VDYW5kaWRhdGUocmVtb3RlQ2FuZGlkYXRlKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHJlbW90ZUNhbmRpZGF0ZVByb21pc2VzLmNhdGNoKHJlYXNvbiA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIud2FybignRXJyb3IgYWRkaW5nIHJlbW90ZSBjYW5kaWRhdGUnLCByZWFzb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcmVtb3RlQ2FuZGlkYXRlUHJvbWlzZXM7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX3JlbW90ZURlc2NyaXB0aW9uU2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuX2NoZWNrQW5kVHJhbnNpdCgpO1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zdG9wU2Vzc2lvbigpO1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShydGNTZXNzaW9uLCBSVENfRVJST1JTLlNFVF9SRU1PVEVfREVTQ1JJUFRJT05fRkFJTFVSRSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdIYW5kc2hha2VkKCkge1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmhhbmRzaGFraW5nVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9ydGNTZXNzaW9uLl9zaWduYWxsaW5nQ29ubmVjdFRpbWVzdGFtcDtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nSGFuZHNoYWtlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2NoZWNrQW5kVHJhbnNpdCgpO1xuICAgIH1cbiAgICBfY2hlY2tBbmRUcmFuc2l0KCkge1xuICAgICAgICBpZiAodGhpcy5fc2lnbmFsaW5nSGFuZHNoYWtlZCAmJiB0aGlzLl9yZW1vdGVEZXNjcmlwdGlvblNldCkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBUYWxraW5nU3RhdGUodGhpcy5fcnRjU2Vzc2lvbikpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLl9zaWduYWxpbmdIYW5kc2hha2VkKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ1BlbmRpbmcgaGFuZHNoYWtpbmcnKTtcbiAgICAgICAgfSBlbHNlIHsvL2ltcGxpZXMgX3JlbW90ZURlc2NyaXB0aW9uU2V0ID09IGZhbHNlXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ1BlbmRpbmcgc2V0dGluZyByZW1vdGUgZGVzY3JpcHRpb24nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQWNjZXB0U3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgVGFsa2luZ1N0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnByZVRhbGtpbmdUaW1lTWlsbGlzID0gdGhpcy5fc3RhcnRUaW1lIC0gdGhpcy5fcnRjU2Vzc2lvbi5fY29ubmVjdFRpbWVTdGFtcDtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fb25TZXNzaW9uQ29ubmVjdGVkKHRoaXMuX3J0Y1Nlc3Npb24pO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ1JlY29ubmVjdGVkKCkge1xuICAgIH1cbiAgICBvblJlbW90ZUh1bmd1cCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2lnbmFsaW5nQ2hhbm5lbC5oYW5ndXAoKTtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBEaXNjb25uZWN0ZWRTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uKSk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2lnbmFsaW5nQ2hhbm5lbC5oYW5ndXAoKTtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBEaXNjb25uZWN0ZWRTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uKSk7XG4gICAgfVxuICAgIG9uRXhpdCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC50YWxraW5nVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX2RldGFjaE1lZGlhKCk7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2Vzc2lvbkVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9vblNlc3Npb25Db21wbGV0ZWQodGhpcy5fcnRjU2Vzc2lvbik7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJUYWxraW5nU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ2xlYW5VcFN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zdG9wU2Vzc2lvbigpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQ2xlYW5VcFN0YXRlXCI7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgLy9kbyBub3RoaW5nLCBhbHJlYWR5IGF0IHRoZSBlbmQgb2YgbGlmZWN5Y2xlXG4gICAgfVxuICAgIG9uRXhpdCgpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5jbGVhbnVwVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIERpc2Nvbm5lY3RlZFN0YXRlIGV4dGVuZHMgQ2xlYW5VcFN0YXRlIHtcbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiRGlzY29ubmVjdGVkU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRmFpbGVkU3RhdGUgZXh0ZW5kcyBDbGVhblVwU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHJ0Y1Nlc3Npb24sIGZhaWx1cmVSZWFzb24pIHtcbiAgICAgICAgc3VwZXIocnRjU2Vzc2lvbik7XG4gICAgICAgIHRoaXMuX2ZhaWx1cmVSZWFzb24gPSBmYWlsdXJlUmVhc29uO1xuICAgIH1cbiAgICBvbkVudGVyKCkge1xuICAgICAgICBzdXBlci5vbkVudGVyKCk7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2Vzc2lvbkVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9vblNlc3Npb25GYWlsZWQodGhpcy5fcnRjU2Vzc2lvbiwgdGhpcy5fZmFpbHVyZVJlYXNvbik7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJGYWlsZWRTdGF0ZVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnRjU2Vzc2lvbiB7XG4gICAgLyoqXG4gICAgICogQnVpbGQgYW4gQW1hem9uQ29ubmVjdCBSVEMgc2Vzc2lvbi5cbiAgICAgKiBAcGFyYW0geyp9IHNpZ25hbGluZ1VyaVxuICAgICAqIEBwYXJhbSB7Kn0gaWNlU2VydmVycyBBcnJheSBvZiBpY2Ugc2VydmVyc1xuICAgICAqIEBwYXJhbSB7Kn0gY29udGFjdFRva2VuXG4gICAgICogQHBhcmFtIHsqfSBsb2dnZXIgQW4gb2JqZWN0IHByb3ZpZGVzIGxvZ2dpbmcgZnVuY3Rpb25zLCBzdWNoIGFzIGNvbnNvbGVcbiAgICAgKiBAcGFyYW0geyp9IGNvbnRhY3RJZCBNdXN0IGJlIFVVSUQsIHVuaXF1ZWx5IGlkZW50aWZpZXMgdGhlIHNlc3Npb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nVXJpLCBpY2VTZXJ2ZXJzLCBjb250YWN0VG9rZW4sIGxvZ2dlciwgY29udGFjdElkKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2lnbmFsaW5nVXJpICE9PSAnc3RyaW5nJyB8fCBzaWduYWxpbmdVcmkudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxQYXJhbWV0ZXJzKCdzaWduYWxpbmdVcmkgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWljZVNlcnZlcnMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygnaWNlU2VydmVycyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY29udGFjdFRva2VuICE9PSAnc3RyaW5nJyB8fCBjb250YWN0VG9rZW4udHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxQYXJhbWV0ZXJzKCdjb250YWN0VG9rZW4gcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxvZ2dlciAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygnbG9nZ2VyIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb250YWN0SWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxJZCA9IHV1aWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxJZCA9IGNvbnRhY3RJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nlc3Npb25SZXBvcnQgPSBuZXcgU2Vzc2lvblJlcG9ydCgpO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdVcmkgPSBzaWduYWxpbmdVcmk7XG4gICAgICAgIHRoaXMuX2ljZVNlcnZlcnMgPSBpY2VTZXJ2ZXJzO1xuICAgICAgICB0aGlzLl9jb250YWN0VG9rZW4gPSBjb250YWN0VG9rZW47XG4gICAgICAgIHRoaXMuX29yaWdpbmFsTG9nZ2VyID0gbG9nZ2VyO1xuICAgICAgICB0aGlzLl9sb2dnZXIgPSB3cmFwTG9nZ2VyKHRoaXMuX29yaWdpbmFsTG9nZ2VyLCB0aGlzLl9jYWxsSWQsICdTRVNTSU9OJyk7XG4gICAgICAgIHRoaXMuX2ljZVRpbWVvdXRNaWxsaXMgPSBERUZBVUxUX0lDRV9USU1FT1VUX01TO1xuICAgICAgICB0aGlzLl9ndW1UaW1lb3V0TWlsbGlzID0gREVGQVVMVF9HVU1fVElNRU9VVF9NUztcblxuICAgICAgICB0aGlzLl9lbmFibGVBdWRpbyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2VuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2ZhY2luZ01vZGUgPSAndXNlcic7XG5cbiAgICAgICAgdGhpcy5fb25HdW1FcnJvciA9XG4gICAgICAgICAgICB0aGlzLl9vbkd1bVN1Y2Nlc3MgPVxuICAgICAgICAgICAgdGhpcy5fb25Mb2NhbFN0cmVhbUFkZGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uU2Vzc2lvbkZhaWxlZCA9XG4gICAgICAgICAgICB0aGlzLl9vblNlc3Npb25Jbml0aWFsaXplZCA9XG4gICAgICAgICAgICB0aGlzLl9vblNpZ25hbGluZ0Nvbm5lY3RlZCA9XG4gICAgICAgICAgICB0aGlzLl9vbkljZUNvbGxlY3Rpb25Db21wbGV0ZSA9XG4gICAgICAgICAgICB0aGlzLl9vblNpZ25hbGluZ1N0YXJ0ZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29ubmVjdGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uUmVtb3RlU3RyZWFtQWRkZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgfTtcbiAgICB9XG4gICAgZ2V0IHNlc3Npb25SZXBvcnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXNzaW9uUmVwb3J0O1xuICAgIH1cblxuICAgIGdldCBjYWxsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWxsSWQ7XG4gICAgfVxuICAgIGdldCBtZWRpYVN0cmVhbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VzZXJBdWRpb1N0cmVhbTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiBnVU0gc3VjY2VlZHMuXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uR3VtU3VjY2VzcyhoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uR3VtU3VjY2VzcyA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gZ1VNIGZhaWxzLlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqIFNlY29uZCBwYXJhbSBpcyB0aGUgZXJyb3IuXG4gICAgICovXG4gICAgc2V0IG9uR3VtRXJyb3IoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vbkd1bUVycm9yID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgaWYgZmFpbGVkIGluaXRpYWxpemluZyBsb2NhbCByZXNvdXJjZXNcbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TZXNzaW9uRmFpbGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TZXNzaW9uRmFpbGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgYWZ0ZXIgbG9jYWwgdXNlciBtZWRpYSBzdHJlYW0gaXMgYWRkZWQgdG8gdGhlIHNlc3Npb24uXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICogU2Vjb25kIHBhcmFtIGlzIG1lZGlhIHN0cmVhbVxuICAgICAqL1xuICAgIHNldCBvbkxvY2FsU3RyZWFtQWRkZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vbkxvY2FsU3RyZWFtQWRkZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIGFsbCBsb2NhbCByZXNvdXJjZXMgYXJlIHJlYWR5LiBFc3RhYmxpc2hpbmcgc2lnbmFsaW5nIGNoYW5lbCBhbmQgSUNFIGNvbGxlY3Rpb24gaGFwcGVucyBhdCB0aGUgc2FtZSB0aW1lIGFmdGVyIHRoaXMuXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uU2Vzc2lvbkluaXRpYWxpemVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TZXNzaW9uSW5pdGlhbGl6ZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIHNpZ25hbGluZyBjaGFubmVsIGlzIGVzdGFibGlzaGVkLlxuICAgICAqIFJUQyBzZXNzaW9uIHdpbGwgbW92ZSBmb3J3YXJkIG9ubHkgaWYgb25TaWduYWxpbmdDb25uZWN0ZWQgYW5kIG9uSWNlQ29sbGVjdGlvbkNvbXBsZXRlIGFyZSBib3RoIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvblNpZ25hbGluZ0Nvbm5lY3RlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uU2lnbmFsaW5nQ29ubmVjdGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiBJQ0UgY29sbGVjdGlvbiBjb21wbGV0ZXMgZWl0aGVyIGJlY2F1c2UgdGhlcmUgaXMgbm8gbW9yZSBjYW5kaWRhdGUgb3IgY29sbGVjdGlvbiB0aW1lZCBvdXQuXG4gICAgICogUlRDIHNlc3Npb24gd2lsbCBtb3ZlIGZvcndhcmQgb25seSBpZiBvblNpZ25hbGluZ0Nvbm5lY3RlZCBhbmQgb25JY2VDb2xsZWN0aW9uQ29tcGxldGUgYXJlIGJvdGggY2FsbGVkLlxuICAgICAqXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICogU2Vjb25kIHBhcmFtIGlzIGJvb2xlYW4sIFRSVUUgLSBJQ0UgY29sbGVjdGlvbiB0aW1lZCBvdXQuXG4gICAgICogVGhpcmQgcGFyYW0gaXMgbnVtYmVyIG9mIGNhbmRpZGF0ZXMgY29sbGVjdGVkLlxuICAgICAqL1xuICAgIHNldCBvbkljZUNvbGxlY3Rpb25Db21wbGV0ZShoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uSWNlQ29sbGVjdGlvbkNvbXBsZXRlID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiBzaWduYWxpbmcgY2hhbm5lbCBpcyBlc3RhYmxpc2hlZCBhbmQgSUNFIGNvbGxlY3Rpb24gY29tcGxldGVkIHdpdGggYXQgbGVhc3Qgb25lIGNhbmRpZGF0ZS5cbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TaWduYWxpbmdTdGFydGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TaWduYWxpbmdTdGFydGVkID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiB0aGUgY2FsbCBpcyBlc3RhYmxpc2hlZCAoaGFuZHNoYWtlZCBhbmQgbWVkaWEgc3RyZWFtIHNob3VsZCBiZSBmbG93aW5nKVxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvblNlc3Npb25Db25uZWN0ZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblNlc3Npb25Db25uZWN0ZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBhZnRlciByZW1vdGUgbWVkaWEgc3RyZWFtIGlzIGFkZGVkIHRvIHRoZSBzZXNzaW9uLlxuICAgICAqIFRoaXMgY291bGQgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHdpdGggdGhlIHNhbWUgc3RyZWFtIGlmIG11bHRpcGxlIHRyYWNrcyBhcmUgaW5jbHVkZWQgaW4gdGhlIHNhbWUgc3RyZWFtLlxuICAgICAqXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICogU2Vjb25kIHBhcmFtIGlzIG1lZGlhIHN0cmVhbSB0cmFjay5cbiAgICAgKi9cbiAgICBzZXQgb25SZW1vdGVTdHJlYW1BZGRlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uUmVtb3RlU3RyZWFtQWRkZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIHRoZSBoYW5ndXAgaXMgYWNrZWRcbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TZXNzaW9uQ29tcGxldGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29tcGxldGVkID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBzZXQgZW5hYmxlQXVkaW8oZmxhZykge1xuICAgICAgICB0aGlzLl9lbmFibGVBdWRpbyA9IGZsYWc7XG4gICAgfVxuICAgIHNldCBlY2hvQ2FuY2VsbGF0aW9uKGZsYWcpIHtcbiAgICAgICAgdGhpcy5fZWNob0NhbmNlbGxhdGlvbiA9IGZsYWc7XG4gICAgfVxuICAgIHNldCBlbmFibGVWaWRlbyhmbGFnKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZVZpZGVvID0gZmxhZztcbiAgICB9XG4gICAgc2V0IG1heFZpZGVvRnJhbWVSYXRlKGZyYW1lUmF0ZSkge1xuICAgICAgICB0aGlzLl9tYXhWaWRlb0ZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcbiAgICB9XG4gICAgc2V0IG1pblZpZGVvRnJhbWVSYXRlKGZyYW1lUmF0ZSkge1xuICAgICAgICB0aGlzLl9taW5WaWRlb0ZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcbiAgICB9XG4gICAgc2V0IHZpZGVvRnJhbWVSYXRlKGZyYW1lUmF0ZSkge1xuICAgICAgICB0aGlzLl92aWRlb0ZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcbiAgICB9XG4gICAgc2V0IG1heFZpZGVvV2lkdGgod2lkdGgpIHtcbiAgICAgICAgdGhpcy5fbWF4VmlkZW9XaWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBzZXQgbWluVmlkZW9XaWR0aCh3aWR0aCkge1xuICAgICAgICB0aGlzLl9taW5WaWRlb1dpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIHNldCBpZGVhbFZpZGVvV2lkdGgod2lkdGgpIHtcbiAgICAgICAgdGhpcy5faWRlYWxWaWRlb1dpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIHNldCBtYXhWaWRlb0hlaWdodChoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5fbWF4VmlkZW9IZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIHNldCBtaW5WaWRlb0hlaWdodChoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5fbWluVmlkZW9IZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIHNldCBpZGVhbFZpZGVvSGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLl9pZGVhbFZpZGVvSGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgICBzZXQgZmFjaW5nTW9kZShtb2RlKSB7XG4gICAgICAgIHRoaXMuX2ZhY2luZ01vZGUgPSBtb2RlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbC4gUnRjU2Vzc2lvbiB3aWxsIGdyYWIgaW5wdXQgZGV2aWNlIGlmIHRoaXMgaXMgbm90IHNwZWNpZmllZC5cbiAgICAgKi9cbiAgICBzZXQgbWVkaWFTdHJlYW0oaW5wdXQpIHtcbiAgICAgICAgdGhpcy5fdXNlckF1ZGlvU3RyZWFtID0gaW5wdXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE5lZWRlZCwgZXhwZWN0IGFuIGF1ZGlvIGVsZW1lbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBwbGF5IHJlbW90ZSBhdWRpbyBzdHJlYW0uXG4gICAgICovXG4gICAgc2V0IHJlbW90ZUF1ZGlvRWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3JlbW90ZUF1ZGlvRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIHNldCByZW1vdGVWaWRlb0VsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yZW1vdGVWaWRlb0VsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgZGVmYXVsdCBzaWduYWxpbmcgY29ubmVjdCB0aW1lIG91dC5cbiAgICAgKi9cbiAgICBzZXQgc2lnbmFsaW5nQ29ubmVjdFRpbWVvdXQobXMpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nQ29ubmVjdFRpbWVvdXQgPSBtcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgSUNFIGNvbGxlY3Rpb24gdGltZSBsaW1pdC5cbiAgICAgKi9cbiAgICBzZXQgaWNlVGltZW91dE1pbGxpcyh0aW1lb3V0TWlsbGlzKSB7XG4gICAgICAgIHRoaXMuX2ljZVRpbWVvdXRNaWxsaXMgPSB0aW1lb3V0TWlsbGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IEdVTSB0aW1lb3V0IHRpbWUgbGltaXQuXG4gICAgICovXG4gICAgc2V0IGd1bVRpbWVvdXRNaWxsaXModGltZW91dE1pbGxpcykge1xuICAgICAgICB0aGlzLl9ndW1UaW1lb3V0TWlsbGlzID0gdGltZW91dE1pbGxpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb25uZWN0LXJ0Yy1qcyBpbml0aWF0ZSB0aGUgaGFuZHNoYWtpbmcgd2l0aCBhbGwgYnJvd3NlciBzdXBwb3J0ZWQgY29kZWMgYnkgZGVmYXVsdCwgQW1hem9uIENvbm5lY3Qgc2VydmljZSB3aWxsIGNob29zZSB0aGUgY29kZWMgYWNjb3JkaW5nIHRvIGl0cyBwcmVmZXJlbmNlIHNldHRpbmcuXG4gICAgICogU2V0dGluZyB0aGlzIGF0dHJpYnV0ZSB3aWxsIGZvcmNlIGNvbm5lY3QtcnRjLWpzIHRvIG9ubHkgdXNlIHNwZWNpZmllZCBjb2RlYy5cbiAgICAgKiBXQVJOSU5HOiBTZXR0aW5nIHRoaXMgdG8gdW5zdXBwb3J0ZWQgY29kZWMgd2lsbCBjYXVzZSB0aGUgZmFpbHVyZSBvZiBoYW5kc2hha2luZy5cbiAgICAgKiBTdXBwb3J0ZWQgY29kZWNzOiBvcHVzLlxuICAgICAqL1xuICAgIHNldCBmb3JjZUF1ZGlvQ29kZWMoYXVkaW9Db2RlYykge1xuICAgICAgICB0aGlzLl9mb3JjZUF1ZGlvQ29kZWMgPSBhdWRpb0NvZGVjO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNvbm5lY3QtcnRjLWpzIGRpc2FibGVzIE9QVVMgRFRYIGJ5IGRlZmF1bHQgYmVjYXVzZSBpdCBoYXJtcyBhdWRpbyBxdWFsaXR5LlxuICAgICAqIEBwYXJhbSBmbGFnIGJvb2xlYW5cbiAgICAgKi9cbiAgICBzZXQgZW5hYmxlT3B1c0R0eChmbGFnKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZU9wdXNEdHggPSBmbGFnO1xuICAgIH1cblxuICAgIHRyYW5zaXQobmV4dFN0YXRlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIuaW5mbygodGhpcy5fc3RhdGUgPyB0aGlzLl9zdGF0ZS5uYW1lIDogJ251bGwnKSArICcgPT4gJyArIG5leHRTdGF0ZS5uYW1lKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSAmJiB0aGlzLl9zdGF0ZS5vbkV4aXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZS5vbkV4aXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlID0gbmV4dFN0YXRlO1xuICAgICAgICAgICAgaWYgKG5leHRTdGF0ZS5vbkVudGVyKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dFN0YXRlLm9uRW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvZ2dlci53YXJuKG5leHRTdGF0ZS5uYW1lICsgJyNvbkVudGVyIGZhaWxlZCcsIGUpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuc2FmZS1maW5hbGx5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZVNpZ25hbGluZ0NoYW5uZWwoKSB7XG4gICAgICAgIHZhciBzaWduYWxpbmdDaGFubmVsID0gbmV3IFJ0Y1NpZ25hbGluZyh0aGlzLl9jYWxsSWQsIHRoaXMuX3NpZ25hbGluZ1VyaSwgdGhpcy5fY29udGFjdFRva2VuLCB0aGlzLl9vcmlnaW5hbExvZ2dlciwgdGhpcy5fc2lnbmFsaW5nQ29ubmVjdFRpbWVvdXQpO1xuICAgICAgICBzaWduYWxpbmdDaGFubmVsLm9uQ29ubmVjdGVkID0gaGl0Y2godGhpcywgdGhpcy5fc2lnbmFsaW5nQ29ubmVjdGVkKTtcbiAgICAgICAgc2lnbmFsaW5nQ2hhbm5lbC5vbkFuc3dlcmVkID0gaGl0Y2godGhpcywgdGhpcy5fc2lnbmFsaW5nQW5zd2VyZWQpO1xuICAgICAgICBzaWduYWxpbmdDaGFubmVsLm9uSGFuZHNoYWtlZCA9IGhpdGNoKHRoaXMsIHRoaXMuX3NpZ25hbGluZ0hhbmRzaGFrZWQpO1xuICAgICAgICBzaWduYWxpbmdDaGFubmVsLm9uUmVtb3RlSHVuZ3VwID0gaGl0Y2godGhpcywgdGhpcy5fc2lnbmFsaW5nUmVtb3RlSHVuZ3VwKTtcbiAgICAgICAgc2lnbmFsaW5nQ2hhbm5lbC5vbkZhaWxlZCA9IGhpdGNoKHRoaXMsIHRoaXMuX3NpZ25hbGluZ0ZhaWxlZCk7XG4gICAgICAgIHNpZ25hbGluZ0NoYW5uZWwub25EaXNjb25uZWN0ZWQgPSBoaXRjaCh0aGlzLCB0aGlzLl9zaWduYWxpbmdEaXNjb25uZWN0ZWQpO1xuXG4gICAgICAgIHRoaXMuX3NpZ25hbGluZ0NoYW5uZWwgPSBzaWduYWxpbmdDaGFubmVsO1xuXG4gICAgICAgIHJldHVybiBzaWduYWxpbmdDaGFubmVsO1xuICAgIH1cblxuICAgIF9zaWduYWxpbmdDb25uZWN0ZWQoKSB7XG4gICAgICAgIHRoaXMuX3N0YXRlLm9uU2lnbmFsaW5nQ29ubmVjdGVkKCk7XG4gICAgfVxuICAgIF9zaWduYWxpbmdBbnN3ZXJlZChzZHAsIGNhbmRpZGF0ZXMpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25TaWduYWxpbmdBbnN3ZXJlZChzZHAsIGNhbmRpZGF0ZXMpO1xuICAgIH1cbiAgICBfc2lnbmFsaW5nSGFuZHNoYWtlZCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25TaWduYWxpbmdIYW5kc2hha2VkKCk7XG4gICAgfVxuICAgIF9zaWduYWxpbmdSZW1vdGVIdW5ndXAoKSB7XG4gICAgICAgIHRoaXMuX3N0YXRlLm9uUmVtb3RlSHVuZ3VwKCk7XG4gICAgfVxuICAgIF9zaWduYWxpbmdGYWlsZWQoZSkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vblNpZ25hbGluZ0ZhaWxlZChlKTtcbiAgICB9XG4gICAgX3NpZ25hbGluZ0Rpc2Nvbm5lY3RlZCgpIHtcbiAgICB9XG4gICAgX2NyZWF0ZVBlZXJDb25uZWN0aW9uKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSVENQZWVyQ29ubmVjdGlvbihjb25maWd1cmF0aW9uKTtcbiAgICB9XG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgc2VsZi5fc2Vzc2lvblJlcG9ydC5zZXNzaW9uU3RhcnRUaW1lID0gbm93O1xuICAgICAgICBzZWxmLl9jb25uZWN0VGltZVN0YW1wID0gbm93LmdldFRpbWUoKTtcblxuICAgICAgICBzZWxmLl9wYyA9IHNlbGYuX2NyZWF0ZVBlZXJDb25uZWN0aW9uKHtcbiAgICAgICAgICAgIGljZVNlcnZlcnM6IHNlbGYuX2ljZVNlcnZlcnMsXG4gICAgICAgICAgICBpY2VUcmFuc3BvcnRQb2xpY3k6ICdyZWxheScsXG4gICAgICAgICAgICBidW5kbGVQb2xpY3k6ICdiYWxhbmNlZCcgLy9tYXliZSAnbWF4LWNvbXBhdCcsIHRlc3Qgc3RlcmVvIHNvdW5kXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG9wdGlvbmFsOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBnb29nRHNjcDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5fcGMub250cmFjayA9IGhpdGNoKHNlbGYsIHNlbGYuX29udHJhY2spO1xuICAgICAgICBzZWxmLl9wYy5vbmljZWNhbmRpZGF0ZSA9IGhpdGNoKHNlbGYsIHNlbGYuX29uSWNlQ2FuZGlkYXRlKTtcblxuICAgICAgICBzZWxmLnRyYW5zaXQobmV3IEdyYWJMb2NhbE1lZGlhU3RhdGUoc2VsZikpO1xuICAgIH1cbiAgICBhY2NlcHQoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignYWNjZXB0IGRvZXMgbm90IGdvIHRocm91Z2ggc2lnbmFsaW5nIGNoYW5uZWwgYXQgdGhpcyBtb21lbnQnKTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5oYW5ndXAoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgcHJvbWlzZSBvZiBBdWRpb1J0cFN0YXRzIG9iamVjdCBmb3IgcmVtb3RlIGF1ZGlvIChmcm9tIEFtYXpvbiBDb25uZWN0IHRvIGNsaWVudCkuXG4gICAgICogQHJldHVybiBSZWplY3RlZCBwcm9taXNlIGlmIGZhaWxlZCB0byBnZXQgQXVkaW9SdHBTdGF0cy4gVGhlIHByb21pc2UgaXMgbmV2ZXIgcmVzb2x2ZWQgd2l0aCBudWxsIHZhbHVlLlxuICAgICAqL1xuICAgIGdldFJlbW90ZUF1ZGlvU3RhdHMoKSB7XG4gICAgICAgIHZhciB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBpZiAodGhpcy5fcGMgJiYgdGhpcy5fcGMuc2lnbmFsaW5nU3RhdGUgPT09ICdzdGFibGUnICYmIHRoaXMuX3JlbW90ZUF1ZGlvU3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgYXVkaW9UcmFja3MgPSB0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BjLmdldFN0YXRzKGF1ZGlvVHJhY2tzWzBdKS50aGVuKGZ1bmN0aW9uKHN0YXRzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydGNKc1N0YXRzID0gZXh0cmFjdEF1ZGlvU3RhdHNGcm9tU3RhdHModGltZXN0YW1wLCBzdGF0cywgJ2F1ZGlvX291dHB1dCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFydGNKc1N0YXRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZXh0cmFjdCBBdWRpb1J0cFN0YXRzIGZyb20gUlRDU3RhdHNSZXBvcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBydGNKc1N0YXRzO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgSWxsZWdhbFN0YXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBwcm9taXNlIG9mIEF1ZGlvUnRwU3RhdHMgb2JqZWN0IGZvciB1c2VyIGF1ZGlvIChmcm9tIGNsaWVudCB0byBBbWF6b24gQ29ubmVjdCkuXG4gICAgICogQHJldHVybiBSZWplY3RlZCBwcm9taXNlIGlmIGZhaWxlZCB0byBnZXQgQXVkaW9SdHBTdGF0cy4gVGhlIHByb21pc2UgaXMgbmV2ZXIgcmVzb2x2ZWQgd2l0aCBudWxsIHZhbHVlLlxuICAgICAqL1xuICAgIGdldFVzZXJBdWRpb1N0YXRzKCkge1xuICAgICAgICB2YXIgc3RyZWFtID0gdGhpcy5fdXNlckF1ZGlvU3RyZWFtIHx8IHRoaXMuX3N0cmVhbVRvQmVDbG9zZWQ7XG4gICAgICAgIHZhciB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBpZiAodGhpcy5fcGMgJiYgdGhpcy5fcGMuc2lnbmFsaW5nU3RhdGUgPT09ICdzdGFibGUnICYmIHN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIGF1ZGlvVHJhY2tzID0gc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGMuZ2V0U3RhdHMoYXVkaW9UcmFja3NbMF0pLnRoZW4oZnVuY3Rpb24oc3RhdHMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ0Y0pzU3RhdHMgPSBleHRyYWN0QXVkaW9TdGF0c0Zyb21TdGF0cyh0aW1lc3RhbXAsIHN0YXRzLCAnYXVkaW9faW5wdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcnRjSnNTdGF0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGV4dHJhY3QgQXVkaW9SdHBTdGF0cyBmcm9tIFJUQ1N0YXRzUmVwb3J0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnRjSnNTdGF0cztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IElsbGVnYWxTdGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbkljZUNhbmRpZGF0ZShldnQpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25JY2VDYW5kaWRhdGUoZXZ0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQXR0YWNoIHJlbW90ZSBtZWRpYSBzdHJlYW0gdG8gd2ViIGVsZW1lbnQuXG4gICAgICovXG4gICAgX29udHJhY2soZXZ0KSB7XG4gICAgICAgIGlmIChldnQuc3RyZWFtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIud2FybignRm91bmQgbW9yZSB0aGFuIDEgc3RyZWFtcyBmb3IgJyArIGV2dC50cmFjay5raW5kICsgJyB0cmFjayAnICsgZXZ0LnRyYWNrLmlkICsgJyA6ICcgK1xuICAgICAgICAgICAgICAgIGV2dC5zdHJlYW1zLm1hcChzdHJlYW0gPT4gc3RyZWFtLmlkKS5qb2luKCcsJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldnQudHJhY2sua2luZCA9PT0gJ3ZpZGVvJyAmJiB0aGlzLl9yZW1vdGVWaWRlb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZVZpZGVvRWxlbWVudC5zcmNPYmplY3QgPSBldnQuc3RyZWFtc1swXTtcbiAgICAgICAgfSBlbHNlIGlmIChldnQudHJhY2sua2luZCA9PT0gJ2F1ZGlvJyAmJiB0aGlzLl9yZW1vdGVBdWRpb0VsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUF1ZGlvRWxlbWVudC5zcmNPYmplY3QgPSBldnQuc3RyZWFtc1swXTtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUF1ZGlvU3RyZWFtID0gZXZ0LnN0cmVhbXNbMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb25SZW1vdGVTdHJlYW1BZGRlZCh0aGlzLCBldnQuc3RyZWFtc1swXSk7XG4gICAgfVxuICAgIF9kZXRhY2hNZWRpYSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlbW90ZVZpZGVvRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3RlVmlkZW9FbGVtZW50LnNyY09iamVjdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3JlbW90ZUF1ZGlvRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3RlQXVkaW9FbGVtZW50LnNyY09iamVjdCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX3N0b3BTZXNzaW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0cmVhbVRvQmVDbG9zZWQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZVN0cmVhbSh0aGlzLl9zdHJlYW1Ub0JlQ2xvc2VkKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdHJlYW1Ub0JlQ2xvc2VkID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BjKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BjLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGVhdCBleGNlcHRpb25cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGMgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2J1aWxkTWVkaWFDb25zdHJhaW50cygpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbWVkaWFDb25zdHJhaW50cyA9IHt9O1xuXG4gICAgICAgIGlmIChzZWxmLl9lbmFibGVBdWRpbykge1xuICAgICAgICAgICAgdmFyIGF1ZGlvQ29uc3RyYWludHMgPSB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fZWNob0NhbmNlbGxhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0NvbnN0cmFpbnRzLmVjaG9DYW5jZWxsYXRpb24gPSAhIXNlbGYuX2VjaG9DYW5jZWxsYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoYXVkaW9Db25zdHJhaW50cykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG1lZGlhQ29uc3RyYWludHMuYXVkaW8gPSBhdWRpb0NvbnN0cmFpbnRzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZWRpYUNvbnN0cmFpbnRzLmF1ZGlvID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lZGlhQ29uc3RyYWludHMuYXVkaW8gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLl9lbmFibGVWaWRlbykge1xuICAgICAgICAgICAgdmFyIHZpZGVvQ29uc3RyYWludHMgPSB7fTtcbiAgICAgICAgICAgIHZhciB3aWR0aENvbnN0cmFpbnRzID0ge307XG4gICAgICAgICAgICB2YXIgaGVpZ2h0Q29uc3RyYWludHMgPSB7fTtcbiAgICAgICAgICAgIHZhciBmcmFtZVJhdGVDb25zdHJhaW50cyA9IHt9O1xuXG4gICAgICAgICAgICAvL2J1aWxkIHZpZGVvIHdpZHRoIGNvbnN0cmFpbnRzXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX2lkZWFsVmlkZW9XaWR0aCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB3aWR0aENvbnN0cmFpbnRzLmlkZWFsID0gc2VsZi5faWRlYWxWaWRlb1dpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9tYXhWaWRlb1dpZHRoICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHdpZHRoQ29uc3RyYWludHMubWF4ID0gc2VsZi5fbWF4VmlkZW9XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWluVmlkZW9XaWR0aCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB3aWR0aENvbnN0cmFpbnRzLm1pbiA9IHNlbGYuX21pblZpZGVvV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBidWlsZCB2aWRlbyBoZWlnaHQgY29uc3RyYWludHNcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5faWRlYWxWaWRlb0hlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRDb25zdHJhaW50cy5pZGVhbCA9IHNlbGYuX2lkZWFsVmlkZW9IZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX21heFZpZGVvSGVpZ2h0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGhlaWdodENvbnN0cmFpbnRzLm1heCA9IHNlbGYuX21heFZpZGVvSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9taW5WaWRlb0hlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRDb25zdHJhaW50cy5taW4gPSBzZWxmLl9taW5WaWRlb0hlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKE9iamVjdC5rZXlzKHdpZHRoQ29uc3RyYWludHMpLmxlbmd0aCA+IDAgJiYgT2JqZWN0LmtleXMoaGVpZ2h0Q29uc3RyYWludHMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2aWRlb0NvbnN0cmFpbnRzLndpZHRoID0gd2lkdGhDb25zdHJhaW50cztcbiAgICAgICAgICAgICAgICB2aWRlb0NvbnN0cmFpbnRzLmhlaWdodCA9IGhlaWdodENvbnN0cmFpbnRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYnVpbGQgZnJhbWUgcmF0ZSBjb25zdHJhaW50c1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl92aWRlb0ZyYW1lUmF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBmcmFtZVJhdGVDb25zdHJhaW50cy5pZGVhbCA9IHNlbGYuX3ZpZGVvRnJhbWVSYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9taW5WaWRlb0ZyYW1lUmF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBmcmFtZVJhdGVDb25zdHJhaW50cy5taW4gPSBzZWxmLl9taW5WaWRlb0ZyYW1lUmF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWF4VmlkZW9GcmFtZVJhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZnJhbWVSYXRlQ29uc3RyYWludHMubWF4ID0gc2VsZi5fbWF4VmlkZW9GcmFtZVJhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihPYmplY3Qua2V5cyhmcmFtZVJhdGVDb25zdHJhaW50cykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZpZGVvQ29uc3RyYWludHMuZnJhbWVSYXRlID0gZnJhbWVSYXRlQ29uc3RyYWludHM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGJ1aWxkIGZhY2luZyBtb2RlIGNvbnN0cmFpbnRzXG4gICAgICAgICAgICBpZihzZWxmLl9mYWNpbmdNb2RlICE9PSAndXNlcicgJiYgc2VsZi5fZmFjaW5nTW9kZSAhPT0gXCJlbnZpcm9ubWVudFwiKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fZmFjaW5nTW9kZSA9ICd1c2VyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZpZGVvQ29uc3RyYWludHMuZmFjaW5nTW9kZSA9IHNlbGYuX2ZhY2luZ01vZGU7XG5cbiAgICAgICAgICAgIC8vIHNldCB2aWRlbyBjb25zdHJhaW50c1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHZpZGVvQ29uc3RyYWludHMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUNvbnN0cmFpbnRzLnZpZGVvID0gdmlkZW9Db25zdHJhaW50cztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVkaWFDb25zdHJhaW50cy52aWRlbyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWVkaWFDb25zdHJhaW50cztcbiAgICB9XG59XG4iLCIvKipcbiogRXh0cmFjdCBydHAgc3RhdHMgb2Ygc3BlY2lmaWVkIHN0cmVhbSBmcm9tIFJUQ1N0YXRzUmVwb3J0XG4qIENocm9tZSByZXBvcnRzIGFsbCBzdHJlYW0gc3RhdHMgaW4gc3RhdHNSZXBvcnRzIHdoZXJlYXMgZmlyZWZveCByZXBvcnRzIG9ubHkgc2luZ2xlIHN0cmVhbSBzdGF0cyBpbiByZXBvcnRcbiogU3RyZWFtVHlwZSBpcyBwYXNzZWQgb25seSB0byBwdWxsIHJpZ2h0IHN0cmVhbSBzdGF0cyBhdWRpb19pbnB1dCBvciBhdWRpb19vdXRwdXQuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RBdWRpb1N0YXRzRnJvbVN0YXRzKHRpbWVzdGFtcCwgc3RhdHMsIHN0cmVhbVR5cGUpIHtcbiAgICB2YXIgY2FsbFN0YXRzID0gbnVsbDtcbiAgICBpZiAoIXN0YXRzKSB7XG4gICAgICAgIHJldHVybiBjYWxsU3RhdHM7XG4gICAgfVxuICAgIHZhciBzdGF0c1JlcG9ydHMgPSBPYmplY3Qua2V5cyhzdGF0cyk7XG4gICAgaWYgKHN0YXRzUmVwb3J0cykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXRzUmVwb3J0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHN0YXRzUmVwb3J0ID0gc3RhdHNbc3RhdHNSZXBvcnRzW2ldXTtcbiAgICAgICAgICAgIGlmIChzdGF0c1JlcG9ydCkge1xuICAgICAgICAgICAgICAgIHZhciBwYWNrZXRzTG9zdCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIGF1ZGlvTGV2ZWwgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0c1JlcG9ydC50eXBlID09PSAnc3NyYycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jaHJvbWUsIG9wZXJhIGNhc2UuIGNocm9tZSByZXBvcnRzIHN0YXRzIGZvciBhbGwgc3RyZWFtcywgbm90IGp1c3QgdGhlIHN0cmVhbSBwYXNzZWQgaW4uXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c1NlbnQgIT09ICd1bmRlZmluZWQnICYmIHN0cmVhbVR5cGUgPT09ICdhdWRpb19pbnB1dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQuYXVkaW9JbnB1dExldmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvTGV2ZWwgPSBzdGF0c1JlcG9ydC5hdWRpb0lucHV0TGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0ICE9PSAndW5kZWZpbmVkJyAmJiBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWUgcmVwb3J0cyAtMSB3aGVuIHRoZXJlIGlzIG5vIHBhY2tldCBsb3NzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2V0c0xvc3QgPSBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydHRNcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0Lmdvb2dSdHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnR0TXMgPSBzdGF0c1JlcG9ydC5nb29nUnR0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFN0YXRzID0gbmV3IEF1ZGlvUnRwU3RhdHModGltZXN0YW1wLCBwYWNrZXRzTG9zdCwgc3RhdHNSZXBvcnQucGFja2V0c1NlbnQsIGF1ZGlvTGV2ZWwsIHJ0dE1zLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c1JlY2VpdmVkICE9PSAndW5kZWZpbmVkJyAmJiBzdHJlYW1UeXBlID09PSAnYXVkaW9fb3V0cHV0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5hdWRpb091dHB1dExldmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvTGV2ZWwgPSBzdGF0c1JlcG9ydC5hdWRpb091dHB1dExldmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCAhPT0gJ3VuZGVmaW5lZCcgJiYgc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIHJlcG9ydHMgLTEgd2hlbiB0aGVyZSBpcyBubyBwYWNrZXQgbG9zc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2tldHNMb3N0ID0gc3RhdHNSZXBvcnQucGFja2V0c0xvc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgamJNcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0Lmdvb2dKaXR0ZXJCdWZmZXJNcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqYk1zID0gc3RhdHNSZXBvcnQuZ29vZ0ppdHRlckJ1ZmZlck1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFN0YXRzID0gbmV3IEF1ZGlvUnRwU3RhdHModGltZXN0YW1wLCBwYWNrZXRzTG9zdCwgc3RhdHNSZXBvcnQucGFja2V0c1JlY2VpdmVkLCBhdWRpb0xldmVsLCBudWxsLCBqYk1zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHNSZXBvcnQudHlwZSA9PT0gJ2luYm91bmRydHAnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vRmlyZWZveCBjYXNlLiBGaXJlZm94IHJlcG9ydHMgcGFja2V0c0xvc3QgcGFyYW1ldGVyIG9ubHkgaW4gaW5ib3VuZHJ0cCB0eXBlLCBhbmQgZG9lc24ndCByZXBvcnQgaW4gb3V0Ym91bmRydHAgdHlwZS5cbiAgICAgICAgICAgICAgICAgICAgLy9TbyB3ZSBvbmx5IHB1bGwgZnJvbSBpbmJvdW5kcnRwLiBGaXJlZm94IHJlcG9ydHMgb25seSBzdGF0cyBmb3IgdGhlIHN0cmVhbSBwYXNzZWQgaW4uXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzdGF0c1JlcG9ydC5wYWNrZXRzUmVjZWl2ZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL25vIGF1ZGlvIGxldmVsIGluIGZpcmVmb3hcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQuYXVkaW9JbnB1dExldmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1ZGlvTGV2ZWwgPSBzdGF0c1JlcG9ydC5hdWRpb0lucHV0TGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2V0c0xvc3QgPSBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGpiIHNpemUgaW4gZmlyZWZveFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcnR0IGlzIGJyb2tlbiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMjQxMDY2XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdHMgPSBuZXcgQXVkaW9SdHBTdGF0cyh0aW1lc3RhbXAsIHBhY2tldHNMb3N0LCBzdGF0c1JlcG9ydC5wYWNrZXRzUmVjZWl2ZWQsIGF1ZGlvTGV2ZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjYWxsU3RhdHM7XG59XG5cbi8qKlxuKiBCYXNpYyBSVFAgc3RhdGlzdGljcyBvYmplY3QsIHJlcHJlc2VudHMgc3RhdGlzdGljcyBvZiBhbiBhdWRpbyBvciB2aWRlbyBzdHJlYW0uXG4qL1xuY2xhc3MgQXVkaW9SdHBTdGF0cyB7XG4gICAgY29uc3RydWN0b3IodGltZXN0YW1wLCBwYWNrZXRzTG9zdCwgcGFja2V0c0NvdW50LCBhdWRpb0xldmVsLCBydHRNaWxsaXNlY29uZHMsIGpiTWlsbGlzZWNvbmRzKSB7XG4gICAgICAgIHRoaXMuX3RpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgdGhpcy5fcGFja2V0c0xvc3QgPSBwYWNrZXRzTG9zdDtcbiAgICAgICAgdGhpcy5fcGFja2V0c0NvdW50ID0gcGFja2V0c0NvdW50O1xuICAgICAgICB0aGlzLl9hdWRpb0xldmVsID0gYXVkaW9MZXZlbDtcbiAgICAgICAgdGhpcy5fcnR0TWlsbGlzZWNvbmRzID0gcnR0TWlsbGlzZWNvbmRzO1xuICAgICAgICB0aGlzLl9qYk1pbGxpc2Vjb25kcyA9IGpiTWlsbGlzZWNvbmRzO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHBhY2tldHMgc2VudCB0byB0aGUgY2hhbm5lbCAqL1xuICAgIGdldCBwYWNrZXRzQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWNrZXRzQ291bnQ7XG4gICAgfVxuICAgIC8qKiB7bnVtYmVyfSBudW1iZXIgb2YgcGFja2V0cyBsb3N0IGFmdGVyIHRyYXZlbGxpbmcgdGhyb3VnaCB0aGUgY2hhbm5lbCAqL1xuICAgIGdldCBwYWNrZXRzTG9zdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhY2tldHNMb3N0O1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHBhY2tldHMgbG9zdCBhZnRlciB0cmF2ZWxsaW5nIHRocm91Z2ggdGhlIGNoYW5uZWwgKi9cbiAgICBnZXQgcGFja2V0TG9zc1BlcmNlbnRhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWNrZXRzQ291bnQgPiAwID8gdGhpcy5fcGFja2V0c0xvc3QgLyB0aGlzLl9wYWNrZXRzQ291bnQgOiAwO1xuICAgIH1cbiAgICAvKiogQXVkaW8gdm9sdW1lIGxldmVsXG4gICAgKiBDdXJyZW50bHkgZmlyZWZveCBkb2Vzbid0IHByb3ZpZGUgYXVkaW8gbGV2ZWwgaW4gcnRwIHN0YXRzLlxuICAgICovXG4gICAgZ2V0IGF1ZGlvTGV2ZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hdWRpb0xldmVsO1xuICAgIH1cbiAgICAvKiogVGltZXN0YW1wIHdoZW4gc3RhdHMgYXJlIGNvbGxlY3RlZC4gKi9cbiAgICBnZXQgdGltZXN0YW1wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZXN0YW1wO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gUm91bmQgdHJpcCB0aW1lIGNhbGN1bGF0ZWQgd2l0aCBSVENQIHJlcG9ydHMgKi9cbiAgICBnZXQgcnR0TWlsbGlzZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnR0TWlsbGlzZWNvbmRzO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gQnJvd3Nlci9jbGllbnQgc2lkZSBqaXR0ZXIgYnVmZmVyIGxlbmd0aCAqL1xuICAgIGdldCBqYk1pbGxpc2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2piTWlsbGlzZWNvbmRzO1xuICAgIH1cbn0iLCIvKipcbiAqIENvcHlyaWdodCAyMDE3IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFtYXpvbiBTb2Z0d2FyZSBMaWNlbnNlICh0aGUgXCJMaWNlbnNlXCIpLiBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICBodHRwOi8vYXdzLmFtYXpvbi5jb20vYXNsL1xuICpcbiAqIG9yIGluIHRoZSBcIkxJQ0VOU0VcIiBmaWxlIGFjY29tcGFueWluZyB0aGlzIGZpbGUuIFRoaXMgZmlsZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuZXhwb3J0IGNsYXNzIFNlc3Npb25SZXBvcnQge1xuICAgIC8qKlxuICAgICAqIEBjbGFzcyBQcm90b3R5cGUgZm9yIHRyYWNraW5nIHZhcmlvdXMgUlRDIHNlc3Npb24gcmVwb3J0XG4gICAgICogQGNvbnN0cnVjdHNcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fc2Vzc2lvblN0YXJ0VGltZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc2Vzc2lvbkVuZFRpbWUgPSBudWxsO1xuICAgICAgICB0aGlzLl9ndW1UaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6YXRpb25UaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faWNlQ29sbGVjdGlvblRpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9oYW5kc2hha2luZ1RpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmVUYWxraW5nVGltZU1pbGxpcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RhbGtpbmdUaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY2xlYW51cFRpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9pY2VDb2xsZWN0aW9uRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFraW5nRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2d1bU90aGVyRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2d1bVRpbWVvdXRGYWlsdXJlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY3JlYXRlT2ZmZXJGYWlsdXJlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl91c2VyQnVzeUZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9pbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX25vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3N0cmVhbVN0YXRzID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqVGltZXN0YW1wIHdoZW4gUlRDU2Vzc2lvbiBzdGFydGVkLlxuICAgICAqL1xuICAgIGdldCBzZXNzaW9uU3RhcnRUaW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvblN0YXJ0VGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZXN0YW1wIHdoZW4gUlRDU2Vzc2lvbiBlbmRlZC5cbiAgICAgKi9cbiAgICBnZXQgc2Vzc2lvbkVuZFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXNzaW9uRW5kVGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZSB0YWtlbiBmb3IgZ3JhYmJpbmcgdXNlciBtaWNyb3Bob25lIGF0IHRoZSB0aW1lIG9mIGNvbm5lY3RpbmcgUlRDU2Vzc2lvbi5cbiAgICAgKi9cbiAgICBnZXQgZ3VtVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2d1bVRpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWUgdGFrZW4gZm9yIHNlc3Npb24gaW5pdGlhbGl6YXRpb24gaW4gbWlsbGlzLiBJbmNsdWRlcyB0aW1lIHNwZW50IGluIEdyYWJMb2NhbE1lZGlhLCBTZXRMb2NhbFNEUCBzdGF0ZXMuXG4gICAgICovXG4gICAgZ2V0IGluaXRpYWxpemF0aW9uVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxpemF0aW9uVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZSBzcGVudCBvbiBJQ0VDb2xsZWN0aW9uIGluIG1pbGxpc1xuICAgICAqL1xuICAgIGdldCBpY2VDb2xsZWN0aW9uVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ljZUNvbGxlY3Rpb25UaW1lTWlsbGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaW1lIHRha2VuIGZvciBjb25uZWN0aW5nIHRoZSBzaWduYWxsaW5nIGluIG1pbGxpcy5cbiAgICAgKi9cbiAgICBnZXQgc2lnbmFsbGluZ0Nvbm5lY3RUaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsbGluZ0Nvbm5lY3RUaW1lTWlsbGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaW1lcyBzcGVudCBmcm9tIFJUQ1Nlc3Npb24gY29ubmVjdGlvbiB1bnRpbCBlbnRlcmluZyBUYWxraW5nIHN0YXRlIGluIG1pbGxpcy5cbiAgICAgKi9cbiAgICBnZXQgcHJlVGFsa2luZ1RpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVUYWxraW5nVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogIFRpbWVzIHNwZW50IGluIGNvbXBsZXRpbmcgaGFuZHNoYWtpbmcgcHJvY2VzcyBvZiB0aGUgUlRDU2Vzc2lvbiBpbiBtaWxsaXMuXG4gICAgICovXG4gICAgZ2V0IGhhbmRzaGFraW5nVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRzaGFraW5nVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogIFRpbWVzIHNwZW50IGluIFRhbGtpbmcgc3RhdGUgaW4gbWlsbGlzXG4gICAgICovXG4gICAgZ2V0IHRhbGtpbmdUaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGFsa2luZ1RpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWVzIHNwZW50IGluIENsZWFudXAgc3RhdGUgaW4gbWlsbGlzXG4gICAgICovXG4gICAgZ2V0IGNsZWFudXBUaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2xlYW51cFRpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRlbGxzIGlmIHRoZSBSVENTZXNzaW9uIGZhaWxzIGluIElDRUNvbGxlY3Rpb24uXG4gICAgICovXG4gICAgZ2V0IGljZUNvbGxlY3Rpb25GYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWNlQ29sbGVjdGlvbkZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRlbGxzIGlmIHRoZSBSVENTZXNzaW9uIGZhaWxlZCBpbiBzaWduYWxsaW5nIGNvbm5lY3Qgc3RhZ2UuXG4gICAgICovXG4gICAgZ2V0IHNpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZHNoYWtpbmcgZmFpbHVyZSBvZiB0aGUgUlRDU2Vzc2lvblxuICAgICAqL1xuICAgIGdldCBoYW5kc2hha2luZ0ZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYW5kc2hha2luZ0ZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEd1bSBmYWlsZWQgZHVlIHRvIHRpbWVvdXQgYXQgdGhlIHRpbWUgb2YgbmV3IFJUQ1Nlc3Npb24gY29ubmVjdGlvblxuICAgICAqL1xuICAgIGdldCBndW1UaW1lb3V0RmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2d1bVRpbWVvdXRGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHdW0gZmFpbGVkIGR1ZSB0byBvdGhlciByZWFzb25zIChvdGhlciB0aGFuIFRpbWVvdXQpXG4gICAgICovXG4gICAgZ2V0IGd1bU90aGVyRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2d1bU90aGVyRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUlRDIFNlc3Npb24gZmFpbGVkIGluIGNyZWF0ZSBPZmZlciBzdGF0ZS5cbiAgICAgKi9cbiAgICBnZXQgY3JlYXRlT2ZmZXJGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlT2ZmZXJGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWxscyBpZiBzZXRMb2NhbERlc2NyaXB0aW9uIGZhaWxlZCBmb3IgdGhlIFJUQyBTZXNzaW9uLlxuICAgICAqL1xuICAgIGdldCBzZXRMb2NhbERlc2NyaXB0aW9uRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWxscyBpZiBoYW5kc2hha2luZyBmYWlsZWQgZHVlIHRvIHVzZXIgYnVzeSBjYXNlLFxuICAgICAqIGhhcHBlbnMgd2hlbiBtdWx0aXBsZSBzb2Z0cGhvbmUgY2FsbHMgYXJlIGluaXRpYXRlZCBhdCBzYW1lIHRpbWUuXG4gICAgICovXG4gICAgZ2V0IHVzZXJCdXN5RmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VzZXJCdXN5RmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGVsbHMgaXQgcmVtb3RlIFNEUCBpcyBpbnZhbGlkLlxuICAgICAqL1xuICAgIGdldCBpbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludmFsaWRSZW1vdGVTRFBGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWxscyBpZiB0aGUgc2V0UmVtb3RlRGVzY3JpcHRpb24gZmFpbGVkIGZvciB0aGUgUlRDIFNlc3Npb24uXG4gICAgICovXG4gICAgZ2V0IHNldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBmYWlsdXJlIGNhc2Ugd2hlbiB0aGVyZSBpcyBubyBSZW1vdGVJY2VDYW5kaWRhdGUuXG4gICAgICovXG4gICAgZ2V0IG5vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhdGlzdGljcyBmb3IgZWFjaCBzdHJlYW0oYXVkaW8taW4sIGF1ZGlvLW91dCwgdmlkZW8taW4sIHZpZGVvLW91dCkgb2YgdGhlIFJUQ1Nlc3Npb24uXG4gICAgICovXG4gICAgZ2V0IHN0cmVhbVN0YXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RyZWFtU3RhdHM7XG4gICAgfVxuXG4gICAgc2V0IHNlc3Npb25TdGFydFRpbWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2Vzc2lvblN0YXJ0VGltZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgc2Vzc2lvbkVuZFRpbWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2Vzc2lvbkVuZFRpbWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGd1bVRpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZ3VtVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgaW5pdGlhbGl6YXRpb25UaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemF0aW9uVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgaWNlQ29sbGVjdGlvblRpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5faWNlQ29sbGVjdGlvblRpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHNpZ25hbGxpbmdDb25uZWN0VGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHByZVRhbGtpbmdUaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3ByZVRhbGtpbmdUaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBoYW5kc2hha2luZ1RpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtpbmdUaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCB0YWxraW5nVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl90YWxraW5nVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgY2xlYW51cFRpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY2xlYW51cFRpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGljZUNvbGxlY3Rpb25GYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2ljZUNvbGxlY3Rpb25GYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBzaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsbGluZ0Nvbm5lY3Rpb25GYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBoYW5kc2hha2luZ0ZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtpbmdGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBndW1UaW1lb3V0RmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9ndW1UaW1lb3V0RmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgZ3VtT3RoZXJGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2d1bU90aGVyRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgY3JlYXRlT2ZmZXJGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZU9mZmVyRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHVzZXJCdXN5RmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl91c2VyQnVzeUZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGludmFsaWRSZW1vdGVTRFBGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2ludmFsaWRSZW1vdGVTRFBGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fbm9SZW1vdGVJY2VDYW5kaWRhdGVGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBzZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2V0UmVtb3RlRGVzY3JpcHRpb25GYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBzdHJlYW1TdGF0cyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zdHJlYW1TdGF0cyA9IHZhbHVlO1xuICAgIH1cbn0iLCIvKipcbiAqIENvcHlyaWdodCAyMDE3IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFtYXpvbiBTb2Z0d2FyZSBMaWNlbnNlICh0aGUgXCJMaWNlbnNlXCIpLiBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICBodHRwOi8vYXdzLmFtYXpvbi5jb20vYXNsL1xuICpcbiAqIG9yIGluIHRoZSBcIkxJQ0VOU0VcIiBmaWxlIGFjY29tcGFueWluZyB0aGlzIGZpbGUuIFRoaXMgZmlsZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHsgaGl0Y2gsIHdyYXBMb2dnZXIgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IE1BWF9JTlZJVEVfREVMQVlfTVMsIE1BWF9BQ0NFUFRfQllFX0RFTEFZX01TLCBERUZBVUxUX0NPTk5FQ1RfVElNRU9VVF9NUyB9IGZyb20gJy4vcnRjX2NvbnN0JztcbmltcG9ydCB7IFVuc3VwcG9ydGVkT3BlcmF0aW9uLCBUaW1lb3V0LCBCdXN5RXhjZXB0aW9uLCBDYWxsTm90Rm91bmRFeGNlcHRpb24sIFVua25vd25TaWduYWxpbmdFcnJvciB9IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5cbnZhciByZXFJZFNlcSA9IDE7XG5cbi8qKlxuICogQWJzdHJhY3Qgc2lnbmFsaW5nIHN0YXRlIGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgU2lnbmFsaW5nU3RhdGUge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7QW16blJ0Y1NpZ25hbGluZ30gc2lnbmFsaW5nIFNpZ25hbGluZyBvYmplY3QuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZyA9IHNpZ25hbGluZztcbiAgICB9XG4gICAgc2V0U3RhdGVUaW1lb3V0KHRpbWVvdXRNcykge1xuICAgICAgICBzZXRUaW1lb3V0KGhpdGNoKHRoaXMsIHRoaXMuX29uVGltZW91dENoZWNrZWQpLCB0aW1lb3V0TXMpO1xuICAgIH1cbiAgICBnZXQgaXNDdXJyZW50U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzID09PSB0aGlzLl9zaWduYWxpbmcuc3RhdGU7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgfVxuICAgIF9vblRpbWVvdXRDaGVja2VkKCkge1xuICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnRTdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblRpbWVvdXQoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbigpO1xuICAgIH1cbiAgICB0cmFuc2l0KG5ld1N0YXRlKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZy50cmFuc2l0KG5ld1N0YXRlKTtcbiAgICB9XG4gICAgb25FeGl0KCkge1xuICAgIH1cbiAgICBvbk9wZW4oKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25PcGVuIG5vdCBzdXBwb3J0ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIG9uRXJyb3IoKSB7XG4gICAgICAgIHRoaXMuY2hhbm5lbERvd24oKTtcbiAgICB9XG4gICAgb25DbG9zZSgpIHtcbiAgICAgICAgdGhpcy5jaGFubmVsRG93bigpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdjaGFubmVsRG93biBub3Qgc3VwcG9ydGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBvblJwY01zZyhycGNNc2cpIHsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25ScGNNc2cgbm90IHN1cHBvcnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgaW52aXRlKHNkcCwgaWNlQ2FuZGlkYXRlcykgey8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdpbnZpdGUgbm90IHN1cHBvcnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ2FjY2VwdCBub3Qgc3VwcG9ydGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBoYW5ndXAoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignaGFuZ3VwIG5vdCBzdXBwb3J0ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJTaWduYWxpbmdTdGF0ZVwiO1xuICAgIH1cbiAgICBnZXQgbG9nZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsaW5nLl9sb2dnZXI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWxPblRpbWVvdXRTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIHRpbWVvdXRNcykge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcpO1xuICAgICAgICB0aGlzLl9zdGF0ZVRpbWVvdXRNcyA9IHRpbWVvdXRNcztcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZVRpbWVvdXQodGhpcy5fc3RhdGVUaW1lb3V0TXMpO1xuICAgIH1cbiAgICBvblRpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nLCBuZXcgVGltZW91dCgpKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJGYWlsT25UaW1lb3V0U3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ0Nvbm5lY3RTdGF0ZSBleHRlbmRzIEZhaWxPblRpbWVvdXRTdGF0ZSB7XG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nLCB0aW1lb3V0TXMpIHtcbiAgICAgICAgc3VwZXIoc2lnbmFsaW5nLCB0aW1lb3V0TXMpO1xuICAgIH1cbiAgICBvbk9wZW4oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgUGVuZGluZ0ludml0ZVN0YXRlKHRoaXMuX3NpZ25hbGluZykpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcsIG5ldyBFcnJvcignY2hhbm5lbERvd24nKSkpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUGVuZGluZ0Nvbm5lY3RTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nSW52aXRlU3RhdGUgZXh0ZW5kcyBTaWduYWxpbmdTdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlDb25uZWN0ZWQocmVzb2x2ZSkge1xuICAgICAgICAgICAgc2VsZi5fc2lnbmFsaW5nLl9jb25uZWN0ZWRIYW5kbGVyKCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnZpdGUoc2RwLCBpY2VDYW5kaWRhdGVzKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGludml0ZUlkID0gcmVxSWRTZXErKztcblxuICAgICAgICB2YXIgaW52aXRlUGFyYW1zID0ge1xuICAgICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgICBjYW5kaWRhdGVzOiBpY2VDYW5kaWRhdGVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYubG9nZ2VyLmxvZygnU2VuZGluZyBTRFAnLCBzZHApO1xuICAgICAgICBzZWxmLl9zaWduYWxpbmcuX3dzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICAgICAgbWV0aG9kOiAnaW52aXRlJyxcbiAgICAgICAgICAgIHBhcmFtczogaW52aXRlUGFyYW1zLFxuICAgICAgICAgICAgaWQ6IGludml0ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBQZW5kaW5nQW5zd2VyU3RhdGUoc2VsZi5fc2lnbmFsaW5nLCBpbnZpdGVJZCkpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdJbnZpdGVTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nQW5zd2VyU3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgaW52aXRlSWQpIHtcbiAgICAgICAgc3VwZXIoc2lnbmFsaW5nLCBNQVhfSU5WSVRFX0RFTEFZX01TKTtcbiAgICAgICAgdGhpcy5faW52aXRlSWQgPSBpbnZpdGVJZDtcbiAgICB9XG4gICAgb25ScGNNc2cobXNnKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKG1zZy5pZCA9PT0gdGhpcy5faW52aXRlSWQpIHtcbiAgICAgICAgICAgIGlmIChtc2cuZXJyb3IgfHwgIW1zZy5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZywgc2VsZi50cmFuc2xhdGVJbnZpdGVFcnJvcihtc2cpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIG5vdGlmeUFuc3dlcmVkKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIubG9nKCdSZWNlaXZlZCBTRFAnLCBtc2cucmVzdWx0LnNkcCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5fYW5zd2VyZWRIYW5kbGVyKG1zZy5yZXN1bHQuc2RwLCBtc2cucmVzdWx0LmNhbmRpZGF0ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nQWNjZXB0U3RhdGUodGhpcy5fc2lnbmFsaW5nLCB0aGlzLl9zaWduYWxpbmcuX2F1dG9BbnN3ZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0cmFuc2xhdGVJbnZpdGVFcnJvcihtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5lcnJvciAmJiBtc2cuZXJyb3IuY29kZSA9PSA0ODYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnVzeUV4Y2VwdGlvbihtc2cuZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLmVycm9yICYmIG1zZy5lcnJvci5jb2RlID09IDQwNCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDYWxsTm90Rm91bmRFeGNlcHRpb24obXNnLmVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVbmtub3duU2lnbmFsaW5nRXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nQW5zd2VyU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ0FjY2VwdFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgYXV0b0Fuc3dlcikge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcpO1xuICAgICAgICB0aGlzLl9hdXRvQW5zd2VyID0gYXV0b0Fuc3dlcjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9BbnN3ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWNjZXB0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB2YXIgYWNjZXB0SWQgPSByZXFJZFNlcSsrO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcuX3dzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICAgICAgbWV0aG9kOiAnYWNjZXB0JyxcbiAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICBpZDogYWNjZXB0SWRcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdBY2NlcHRBY2tTdGF0ZSh0aGlzLl9zaWduYWxpbmcsIGFjY2VwdElkKSk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZykpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUGVuZGluZ0FjY2VwdFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFBlbmRpbmdBY2NlcHRBY2tTdGF0ZSBleHRlbmRzIEZhaWxPblRpbWVvdXRTdGF0ZSB7XG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nLCBhY2NlcHRJZCkge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIE1BWF9BQ0NFUFRfQllFX0RFTEFZX01TKTtcbiAgICAgICAgdGhpcy5fYWNjZXB0SWQgPSBhY2NlcHRJZDtcbiAgICB9XG4gICAgb25ScGNNc2cobXNnKSB7XG4gICAgICAgIGlmIChtc2cuaWQgPT09IHRoaXMuX2FjY2VwdElkKSB7XG4gICAgICAgICAgICBpZiAobXNnLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl9jbGllbnRUb2tlbiA9IG1zZy5yZXN1bHQuY2xpZW50VG9rZW47XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBUYWxraW5nU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdBY2NlcHRBY2tTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBUYWxraW5nU3RhdGUgZXh0ZW5kcyBTaWduYWxpbmdTdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlIYW5kc2hha2VkKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5faGFuZHNoYWtlZEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdmFyIGJ5ZUlkID0gcmVxSWRTZXErKztcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl93c3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgICAgICAgIG1ldGhvZDogJ2J5ZScsXG4gICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgaWQ6IGJ5ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nUmVtb3RlSGFuZ3VwU3RhdGUodGhpcy5fc2lnbmFsaW5nLCBieWVJZCkpO1xuICAgIH1cbiAgICBvblJwY01zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5tZXRob2QgPT09ICdieWUnKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdMb2NhbEhhbmd1cFN0YXRlKHRoaXMuX3NpZ25hbGluZywgbXNnLmlkKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1ldGhvZCA9PT0gJ3JlbmV3Q2xpZW50VG9rZW4nKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduYWxpbmcuX2NsaWVudFRva2VuID0gbXNnLnBhcmFtcy5jbGllbnRUb2tlbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl9yZWNvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLnRyYW5zaXQobmV3IFBlbmRpbmdSZWNvbm5lY3RTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlRhbGtpbmdTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nUmVjb25uZWN0U3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZykge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIERFRkFVTFRfQ09OTkVDVF9USU1FT1VUX01TKTtcbiAgICB9XG4gICAgb25PcGVuKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFRhbGtpbmdTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nUmVjb25uZWN0U3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ1JlbW90ZUhhbmd1cFN0YXRlIGV4dGVuZHMgRmFpbE9uVGltZW91dFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIGJ5ZUlkKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZywgTUFYX0FDQ0VQVF9CWUVfREVMQVlfTVMpO1xuICAgICAgICB0aGlzLl9ieWVJZCA9IGJ5ZUlkO1xuICAgIH1cbiAgICBvblJwY01zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5pZCA9PT0gdGhpcy5fYnllSWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdSZW1vdGVIYW5ndXBTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nTG9jYWxIYW5ndXBTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIGJ5ZUlkKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX2J5ZUlkID0gYnllSWQ7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgbmV3IFByb21pc2UoZnVuY3Rpb24gbm90aWZ5UmVtb3RlSHVuZ3VwKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5fcmVtb3RlSHVuZ3VwSGFuZGxlcigpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3NpZ25hbGluZy5fd3NzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAganNvbnJwYzogJzIuMCcsXG4gICAgICAgICAgICByZXN1bHQ6IHt9LFxuICAgICAgICAgICAgaWQ6IHNlbGYuX2J5ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBEaXNjb25uZWN0ZWRTdGF0ZShzZWxmLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nTG9jYWxIYW5ndXBTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBEaXNjb25uZWN0ZWRTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIG5vdGlmeURpc2Nvbm5lY3RlZChyZXNvbHZlKSB7XG4gICAgICAgICAgICBzZWxmLl9zaWduYWxpbmcuX2Rpc2Nvbm5lY3RlZEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZy5fd3NzLmNsb3NlKCk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICAvL0RvIG5vdGhpbmdcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkRpc2Nvbm5lY3RlZFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWxlZFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgZXhjZXB0aW9uKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX2V4Y2VwdGlvbiA9IGV4Y2VwdGlvbjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlGYWlsZWQocmVzb2x2ZSkge1xuICAgICAgICAgICAgc2VsZi5fc2lnbmFsaW5nLl9mYWlsZWRIYW5kbGVyKHNlbGYuX2V4Y2VwdGlvbik7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcuX3dzcy5jbG9zZSgpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgLy9EbyBub3RoaW5nXG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJGYWlsZWRTdGF0ZVwiO1xuICAgIH1cbiAgICBnZXQgZXhjZXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhjZXB0aW9uO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW16blJ0Y1NpZ25hbGluZyB7XG4gICAgY29uc3RydWN0b3IoY2FsbElkLCBzaWduYWxpbmdVcmksIGNvbnRhY3RUb2tlbiwgbG9nZ2VyLCBjb25uZWN0VGltZW91dE1zKSB7XG4gICAgICAgIHRoaXMuX2NhbGxJZCA9IGNhbGxJZDtcbiAgICAgICAgdGhpcy5fY29ubmVjdFRpbWVvdXRNcyA9IGNvbm5lY3RUaW1lb3V0TXMgfHwgREVGQVVMVF9DT05ORUNUX1RJTUVPVVRfTVM7XG4gICAgICAgIHRoaXMuX2F1dG9BbnN3ZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdVcmkgPSBzaWduYWxpbmdVcmk7XG4gICAgICAgIHRoaXMuX2NvbnRhY3RUb2tlbiA9IGNvbnRhY3RUb2tlbjtcbiAgICAgICAgdGhpcy5fbG9nZ2VyID0gd3JhcExvZ2dlcihsb2dnZXIsIGNhbGxJZCwgJ1NJR05BTElORycpO1xuXG4gICAgICAgIC8vZW1wdHkgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkSGFuZGxlciA9XG4gICAgICAgICAgICB0aGlzLl9hbnN3ZXJlZEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5faGFuZHNoYWtlZEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0ZWRIYW5kbGVyID1cbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUh1bmd1cEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdGVkSGFuZGxlciA9XG4gICAgICAgICAgICB0aGlzLl9mYWlsZWRIYW5kbGVyID0gZnVuY3Rpb24gbm9PcCgpIHtcbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGdldCBjYWxsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWxsSWQ7XG4gICAgfVxuICAgIHNldCBvbkNvbm5lY3RlZChjb25uZWN0ZWRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZEhhbmRsZXIgPSBjb25uZWN0ZWRIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25BbnN3ZXJlZChhbnN3ZXJlZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fYW5zd2VyZWRIYW5kbGVyID0gYW5zd2VyZWRIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25IYW5kc2hha2VkKGhhbmRzaGFrZWRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZWRIYW5kbGVyID0gaGFuZHNoYWtlZEhhbmRsZXI7XG4gICAgfVxuICAgIHNldCBvblJlY29ubmVjdGVkKHJlY29ubmVjdGVkSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3RlZEhhbmRsZXIgPSByZWNvbm5lY3RlZEhhbmRsZXI7XG4gICAgfVxuICAgIHNldCBvblJlbW90ZUh1bmd1cChyZW1vdGVIdW5ndXBIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX3JlbW90ZUh1bmd1cEhhbmRsZXIgPSByZW1vdGVIdW5ndXBIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25EaXNjb25uZWN0ZWQoZGlzY29ubmVjdGVkSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9kaXNjb25uZWN0ZWRIYW5kbGVyID0gZGlzY29ubmVjdGVkSGFuZGxlcjtcbiAgICB9XG4gICAgc2V0IG9uRmFpbGVkKGZhaWxlZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fZmFpbGVkSGFuZGxlciA9IGZhaWxlZEhhbmRsZXI7XG4gICAgfVxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH1cbiAgICBjb25uZWN0KCkge1xuICAgICAgICB0aGlzLl93c3MgPSB0aGlzLl9jb25uZWN0V2ViU29ja2V0KHRoaXMuX2J1aWxkSW52aXRlVXJpKCkpO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdDb25uZWN0U3RhdGUodGhpcywgdGhpcy5fY29ubmVjdFRpbWVvdXRNcykpO1xuICAgIH1cbiAgICB0cmFuc2l0KG5leHRTdGF0ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmluZm8oKHRoaXMuX3N0YXRlID8gdGhpcy5fc3RhdGUubmFtZSA6ICdudWxsJykgKyAnID0+ICcgKyBuZXh0U3RhdGUubmFtZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm9uRXhpdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub25FeGl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IG5leHRTdGF0ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZS5vbkVudGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUub25FbnRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jb25uZWN0V2ViU29ja2V0KHVyaSkge1xuICAgICAgICB2YXIgd3NDb25uZWN0aW9uID0gbmV3IFdlYlNvY2tldCh1cmkpO1xuICAgICAgICB3c0Nvbm5lY3Rpb24ub25vcGVuID0gaGl0Y2godGhpcywgdGhpcy5fb25PcGVuKTtcbiAgICAgICAgd3NDb25uZWN0aW9uLm9ubWVzc2FnZSA9IGhpdGNoKHRoaXMsIHRoaXMuX29uTWVzc2FnZSk7XG4gICAgICAgIHdzQ29ubmVjdGlvbi5vbmVycm9yID0gaGl0Y2godGhpcywgdGhpcy5fb25FcnJvcik7XG4gICAgICAgIHdzQ29ubmVjdGlvbi5vbmNsb3NlID0gaGl0Y2godGhpcywgdGhpcy5fb25DbG9zZSk7XG4gICAgICAgIHJldHVybiB3c0Nvbm5lY3Rpb247XG4gICAgfVxuICAgIF9idWlsZEludml0ZVVyaSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkVXJpQmFzZSgpICsgJyZjb250YWN0Q3R4PScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5fY29udGFjdFRva2VuKTtcbiAgICB9XG4gICAgX2J1aWxkUmVjb25uZWN0VXJpKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnVpbGRVcmlCYXNlKCkgKyAnJmNsaWVudFRva2VuPScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5fY2xpZW50VG9rZW4pO1xuICAgIH1cbiAgICBfYnVpbGRVcmlCYXNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsaW5nVXJpICsgJz9jYWxsSWQ9JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLl9jYWxsSWQpO1xuICAgIH1cbiAgICBfb25NZXNzYWdlKGV2dCkge1xuICAgICAgICB0aGlzLnN0YXRlLm9uUnBjTXNnKEpTT04ucGFyc2UoZXZ0LmRhdGEpKTtcbiAgICB9XG4gICAgX29uT3BlbihldnQpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5vbk9wZW4oZXZ0KTtcbiAgICB9XG4gICAgX29uRXJyb3IoZXZ0KSB7XG4gICAgICAgIHRoaXMuc3RhdGUub25FcnJvcihldnQpO1xuICAgIH1cbiAgICBfb25DbG9zZShldnQpIHtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmxvZygnV2ViU29ja2V0IG9uY2xvc2UgY29kZT0nICsgZXZ0LmNvZGUgKyAnLCByZWFzb249JyArIGV2dC5yZWFzb24pO1xuICAgICAgICB0aGlzLnN0YXRlLm9uQ2xvc2UoZXZ0KTtcbiAgICB9XG4gICAgX3JlY29ubmVjdCgpIHtcbiAgICAgICAgdGhpcy5fd3NzID0gdGhpcy5fY29ubmVjdFdlYlNvY2tldCh0aGlzLl9idWlsZFJlY29ubmVjdFVyaSgpKTtcbiAgICB9XG4gICAgaW52aXRlKHNkcCwgaWNlQ2FuZGlkYXRlcykge1xuICAgICAgICB0aGlzLnN0YXRlLmludml0ZShzZHAsIGljZUNhbmRpZGF0ZXMpO1xuICAgIH1cbiAgICBhY2NlcHQoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuYWNjZXB0KCk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5oYW5ndXAoKTtcbiAgICB9XG59IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbWF6b24uY29tLCBJbmMuIG9yIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBbWF6b24gU29mdHdhcmUgTGljZW5zZSAodGhlIFwiTGljZW5zZVwiKS4gWW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBBIGNvcHkgb2YgdGhlIExpY2Vuc2UgaXMgbG9jYXRlZCBhdFxuICpcbiAqICAgaHR0cDovL2F3cy5hbWF6b24uY29tL2FzbC9cbiAqXG4gKiBvciBpbiB0aGUgXCJMSUNFTlNFXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IElsbGVnYWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7IHNwbGl0U2VjdGlvbnMsIHNwbGl0TGluZXMsIHBhcnNlUnRwTWFwLCBnZXRLaW5kLCBwYXJzZVJ0cFBhcmFtZXRlcnMsIHdyaXRlRm10cCB9IGZyb20gJ3NkcCc7XG5cbi8qKlxuICogQWxsIGxvZ2dpbmcgbWV0aG9kcyB1c2VkIGJ5IGNvbm5lY3QtcnRjLlxuICovXG52YXIgbG9nTWV0aG9kcyA9IFsnbG9nJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddO1xuXG4vKipcbiogQmluZHMgdGhlIGdpdmVuIGluc3RhbmNlIG9iamVjdCBhcyB0aGUgY29udGV4dCBmb3JcbiogdGhlIG1ldGhvZCBwcm92aWRlZC5cbipcbiogQHBhcmFtIHNjb3BlIFRoZSBpbnN0YW5jZSBvYmplY3QgdG8gYmUgc2V0IGFzIHRoZSBzY29wZVxuKiAgICBvZiB0aGUgZnVuY3Rpb24uXG4qIEBwYXJhbSBtZXRob2QgVGhlIG1ldGhvZCB0byBiZSBlbmNhcHN1bGF0ZWQuXG4qXG4qIEFsbCBvdGhlciBhcmd1bWVudHMsIGlmIGFueSwgYXJlIGJvdW5kIHRvIHRoZSBtZXRob2RcbiogaW52b2NhdGlvbiBpbnNpZGUgdGhlIGNsb3N1cmUuXG4qXG4qIEByZXR1cm4gQSBjbG9zdXJlIGVuY2Fwc3VsYXRpbmcgdGhlIGludm9jYXRpb24gb2YgdGhlXG4qICAgIG1ldGhvZCBwcm92aWRlZCBpbiBjb250ZXh0IG9mIHRoZSBnaXZlbiBpbnN0YW5jZS5cbiovXG5leHBvcnQgZnVuY3Rpb24gaGl0Y2goKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHZhciBzY29wZSA9IGFyZ3Muc2hpZnQoKTtcbiAgICB2YXIgbWV0aG9kID0gYXJncy5zaGlmdCgpO1xuXG4gICAgaWYgKCFzY29wZSkge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFBhcmFtZXRlcnMoJ3V0aWxzLmhpdGNoKCk6IHNjb3BlIGlzIHJlcXVpcmVkIScpO1xuICAgIH1cblxuICAgIGlmICghbWV0aG9kKSB7XG4gICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygndXRpbHMuaGl0Y2goKTogbWV0aG9kIGlzIHJlcXVpcmVkIScpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygndXRpbHMuaGl0Y2goKTogbWV0aG9kIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBfaGl0Y2hlZEZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2xvc3VyZUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHNjb3BlLCBhcmdzLmNvbmNhdChjbG9zdXJlQXJncykpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwTG9nZ2VyKGxvZ2dlciwgY2FsbElkLCBsb2dDYXRlZ29yeSkge1xuICAgIHZhciBfbG9nZ2VyID0ge307XG4gICAgbG9nTWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uIChsb2dNZXRob2QpIHtcbiAgICAgICAgaWYgKCFsb2dnZXJbbG9nTWV0aG9kXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMb2dnaW5nIG1ldGhvZCAnICsgbG9nTWV0aG9kICsgJyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIF9sb2dnZXJbbG9nTWV0aG9kXSA9IGhpdGNoKGxvZ2dlciwgbG9nZ2VyW2xvZ01ldGhvZF0sIGNhbGxJZCwgbG9nQ2F0ZWdvcnkpO1xuICAgIH0pO1xuICAgIHJldHVybiBfbG9nZ2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VTdHJlYW0oc3RyZWFtKSB7XG4gICAgaWYgKHN0cmVhbSkge1xuICAgICAgICB2YXIgdHJhY2tzID0gc3RyZWFtLmdldFRyYWNrcygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyYWNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHRyYWNrID0gdHJhY2tzW2ldO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gZWF0IGV4Y2VwdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgcGFyYW1ldGVyIG9mIHRyYW5zZm9ybVNkcC5cbiAqIFRoaXMgZGVmaW5lcyBhbGwgdGhlIFNEUCBvcHRpb25zIGNvbm5lY3QtcnRjLWpzIHN1cHBvcnRzLlxuICovXG5leHBvcnQgY2xhc3MgU2RwT3B0aW9ucyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2ZvcmNlQ29kZWMgPSB7fTtcbiAgICB9XG5cbiAgICBnZXQgZW5hYmxlT3B1c0R0eCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZU9wdXNEdHg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnkgZGVmYXVsdCB0cmFuc2Zvcm1TZHAgZGlzYWJsZXMgZHR4IGZvciBPUFVTIGNvZGVjLlxuICAgICAqIFNldHRpbmcgdGhpcyB0byB0cnVlIHdvdWxkIGZvcmNlIGl0IHRvIHR1cm4gb24gRFRYLlxuICAgICAqL1xuICAgIHNldCBlbmFibGVPcHVzRHR4KGZsYWcpIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlT3B1c0R0eCA9IGZsYWc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtYXAgZnJvbSBtZWRpYSB0eXBlIChhdWRpby92aWRlbykgdG8gY29kZWMgKGNhc2UgaW5zZW5zaXRpdmUpLlxuICAgICAqIEFkZCBlbnRyeSBmb3IgZm9yY2UgY29ubmVjdC1ydGMtanMgdG8gdXNlIHNwZWNpZmllZCBjb2RlYyBmb3IgY2VydGFpbiBtZWRpYSB0eXBlLlxuICAgICAqIEZvciBleGFtcGxlOiBzZHBPcHRpb25zLmZvcmNlQ29kZWNbJ2F1ZGlvJ10gPSAnb3B1cyc7XG4gICAgICovXG4gICAgZ2V0IGZvcmNlQ29kZWMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JjZUNvZGVjO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRlc3QgaWYgZ2l2ZW4gY29kZWMgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBTRFAuXG4gICAgICogQHBhcmFtIG1lZGlhVHlwZSBhdWRpb3x2aWRlb1xuICAgICAqIEBwYXJhbSBjb2RlY05hbWUgY2FzZSBpbnNlbnNpdGl2ZVxuICAgICAqIEByZXR1cm4gVFJVRSAtIHNob3VsZCByZW1vdmVcbiAgICAgKi9cbiAgICBfc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjb2RlY05hbWUpIHtcbiAgICAgICAgdmFyIHVwcGVyQ2FzZUNvZGVjTmFtZSA9IGNvZGVjTmFtZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VDb2RlY1ttZWRpYVR5cGVdICYmIHVwcGVyQ2FzZUNvZGVjTmFtZSAhPT0gdGhpcy5fZm9yY2VDb2RlY1ttZWRpYVR5cGVdLnRvVXBwZXJDYXNlKCkgJiYgdXBwZXJDYXNlQ29kZWNOYW1lICE9PSAnVEVMRVBIT05FLUVWRU5UJztcbiAgICB9XG59XG5cbi8qKlxuICogTW9kaWZpZXMgaW5wdXQgU0RQIGFjY29yZGluZyB0byBzZHBPcHRpb25zLlxuICogU2VlIFNkcE9wdGlvbnMgZm9yIGF2YWlsYWJsZSBvcHRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtU2RwKHNkcCwgc2RwT3B0aW9ucykge1xuICAgIHZhciBzZWN0aW9ucyA9IHNwbGl0U2VjdGlvbnMoc2RwKTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHNlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBtZWRpYVR5cGUgPSBnZXRLaW5kKHNlY3Rpb25zW2ldKTtcbiAgICAgICAgdmFyIHJ0cFBhcmFtcyA9IHBhcnNlUnRwUGFyYW1ldGVycyhzZWN0aW9uc1tpXSk7XG4gICAgICAgIC8vIGEgbWFwIGZyb20gcGF5bG9hZCB0eXBlIChzdHJpbmcpIHRvIGNvZGVjIG9iamVjdFxuICAgICAgICB2YXIgY29kZWNNYXAgPSBydHBQYXJhbXMuY29kZWNzLnJlZHVjZSgobWFwLCBjb2RlYykgPT4ge1xuICAgICAgICAgICAgbWFwWycnICsgY29kZWMucGF5bG9hZFR5cGVdID0gY29kZWM7XG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCB7fSk7XG4gICAgICAgIHNlY3Rpb25zW2ldID0gc3BsaXRMaW5lcyhzZWN0aW9uc1tpXSkubWFwKGxpbmUgPT4ge1xuICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnbT0nKSkge1xuICAgICAgICAgICAgICAgIC8vIG1vZGlmeSBtPSBsaW5lIGlmIFNkcE9wdGlvbnMjZm9yY2VDb2RlYyBzcGVjaWZpZXMgY29kZWMgZm9yIGN1cnJlbnQgbWVkaWEgdHlwZVxuICAgICAgICAgICAgICAgIGlmIChzZHBPcHRpb25zLmZvcmNlQ29kZWNbbWVkaWFUeXBlXSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0Q29kZWNQdHMgPSBPYmplY3Qua2V5cyhjb2RlY01hcCkuZmlsdGVyKHB0ID0+ICFzZHBPcHRpb25zLl9zaG91bGREZWxldGVDb2RlYyhtZWRpYVR5cGUsIGNvZGVjTWFwW3B0XS5uYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lLnN1YnN0cmluZygwLCBsaW5lLmluZGV4T2YoJ1VEUC9UTFMvUlRQL1NBVlBGICcpICsgJ1VEUC9UTFMvUlRQL1NBVlBGICcubGVuZ3RoKSArIHRhcmdldENvZGVjUHRzLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnYT1ydHBtYXA6JykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcnRwTWFwID0gcGFyc2VSdHBNYXAobGluZSk7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2RlYyA9IGNvZGVjTWFwW3J0cE1hcC5wYXlsb2FkVHlwZV07XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhpcyBjb2RlYyBpZiBTZHBPcHRpb25zI2ZvcmNlQ29kZWMgc3BlY2lmaWVzIGEgZGlmZmVyZW50IGNvZGVjIGZvciBjdXJyZW50IG1lZGlhIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAoc2RwT3B0aW9ucy5fc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjdXJyZW50Q29kZWMubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGFwcGVuZCBhPWZtdHAgbGluZSBpbW1lZGlhdGVseSBpZiBjdXJyZW50IGNvZGVjIGlzIE9QVVMgKHRvIGV4cGxpY2l0bHkgc3BlY2lmeSBPUFVTIHBhcmFtZXRlcnMpXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdPUFVTJykgeyBcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudENvZGVjLnBhcmFtZXRlcnMudXNlZHR4ID0gc2RwT3B0aW9ucy5lbmFibGVPcHVzRHR4ID8gMSA6IDA7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdlbmVyYXRlIGZtdHAgbGluZSBpbW1lZGlhdGVseSBhZnRlciBydHBtYXAgbGluZSwgYW5kIHJlbW92ZSBvcmlnaW5hbCBmbXRwIGxpbmUgb25jZSB3ZSBzZWUgaXRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChsaW5lICsgXCJcXHJcXG5cIiArIHdyaXRlRm10cChjdXJyZW50Q29kZWMpKS50cmltKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ2E9Zm10cDonKSkge1xuICAgICAgICAgICAgICAgIHZhciBwdCA9IGxpbmUuc3Vic3RyaW5nKCdhPWZtdHA6Jy5sZW5ndGgsIGxpbmUuaW5kZXhPZignICcpKTtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudENvZGVjID0gY29kZWNNYXBbcHRdOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVkZWNsYXJlXG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhpcyBjb2RlYyBpZiBTZHBPcHRpb25zI2ZvcmNlQ29kZWMgc3BlY2lmaWVzIGEgZGlmZmVyZW50IGNvZGVjIGZvciBjdXJyZW50IG1lZGlhIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAoc2RwT3B0aW9ucy5fc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjdXJyZW50Q29kZWMubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdPUFVTJykge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgbGluZSBmb3IgT1BVUywgcmVtb3ZlIGl0IGJlY2F1c2UgRk1UUCBsaW5lIGlzIGFscmVhZHkgZ2VuZXJhdGVkIHdoZW4gcnRwbWFwIGxpbmUgaXMgcHJvY2Vzc2VkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdhPXJ0Y3AtZmI6JykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHQgPSBsaW5lLnN1YnN0cmluZyhsaW5lLmluZGV4T2YoJzonKSArIDEsIGxpbmUuaW5kZXhPZignICcpKTsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlZGVjbGFyZVxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29kZWMgPSBjb2RlY01hcFtwdF07Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZWRlY2xhcmVcblxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGlzIGNvZGVjIGlmIFNkcE9wdGlvbnMjZm9yY2VDb2RlYyBzcGVjaWZpZXMgYSBkaWZmZXJlbnQgY29kZWMgZm9yIGN1cnJlbnQgbWVkaWEgdHlwZVxuICAgICAgICAgICAgICAgIGlmIChzZHBPcHRpb25zLl9zaG91bGREZWxldGVDb2RlYyhtZWRpYVR5cGUsIGN1cnJlbnRDb2RlYy5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5maWx0ZXIobGluZSA9PiBsaW5lICE9PSBudWxsKS5qb2luKCdcXHJcXG4nKTtcblxuICAgIH1cbiAgICByZXR1cm4gc2VjdGlvbnMubWFwKHNlY3Rpb24gPT4gc2VjdGlvbi50cmltKCkpLmpvaW4oJ1xcclxcbicpICsgJ1xcclxcbic7XG59Il19
