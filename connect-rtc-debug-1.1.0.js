(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    component: parts[1],
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

// parses either a=msid: or a=ssrc:... msid lines and returns
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
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;

},{}],3:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],4:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
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

var _sdp = require('sdp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RTCSessionState = exports.RTCSessionState = function () {
    /**
     *
     * @param {RtcSession} rtcSession
     */
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
        key: 'onIceStateChange',
        value: function onIceStateChange(evt) {// eslint-disable-line no-unused-vars
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
                    self._rtcSession._localStream = stream;
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
            var stream = self._rtcSession._localStream;
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
            // Set audio codec.
            if (self._rtcSession._forceAudioCodec) {
                sdpOptions.forceCodec['audio'] = self._rtcSession._forceAudioCodec;
            }
            // Set video codec.
            if (self._rtcSession._forceVideoCodec) {
                sdpOptions.forceCodec['video'] = self._rtcSession._forceVideoCodec;
            }
            sdpOptions.enableOpusDtx = self._rtcSession._enableOpusDtx;

            var transformedSdp = (0, _utils.transformSdp)(localDescription.sdp, sdpOptions);
            localDescription.sdp = transformedSdp.sdp;

            self.logger.info('LocalSD', self._rtcSession._localSessionDescription);
            self._rtcSession._pc.setLocalDescription(self._rtcSession._localSessionDescription).then(function () {
                var initializationTime = Date.now() - self._rtcSession._connectTimeStamp;
                self._rtcSession._sessionReport.initializationTimeMillis = initializationTime;
                self._rtcSession._onSessionInitialized(self._rtcSession, initializationTime);
                self._rtcSession._sessionReport.setLocalDescriptionFailure = false;
                self.transit(new ConnectSignalingAndIceCollectionState(self._rtcSession, transformedSdp.mLines));
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

/**
 * Kick off signaling connection. Wait until signaling connects and ICE collection (which already started in previous state) completes.
 * ICE collection times out after user specified amount of time (default to DEFAULT_ICE_TIMEOUT_MS) in case user has complex network environment that blackholes STUN/TURN requests. In this case at least one candidate is required to move forward.
 * ICE collection could also wrap up before timeout if it's determined that RTP candidates from same TURN server have been collected for all m lines.
 */


var ConnectSignalingAndIceCollectionState = exports.ConnectSignalingAndIceCollectionState = function (_RTCSessionState4) {
    _inherits(ConnectSignalingAndIceCollectionState, _RTCSessionState4);

    /**
     * Create ConnectSignalingAndIceCollectionState object.
     * @param {RtcSession} rtcSession
     * @param {number} mLines Number of m lines in SDP
     */
    function ConnectSignalingAndIceCollectionState(rtcSession, mLines) {
        _classCallCheck(this, ConnectSignalingAndIceCollectionState);

        var _this4 = _possibleConstructorReturn(this, (ConnectSignalingAndIceCollectionState.__proto__ || Object.getPrototypeOf(ConnectSignalingAndIceCollectionState)).call(this, rtcSession));

        _this4._iceCandidates = [];
        _this4._iceCandidateFoundationsMap = {};
        _this4._mLines = mLines;
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
                    self._reportIceCompleted(true);
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
            this.logger.log('onicecandidate ' + JSON.stringify(candidate));
            if (candidate) {
                this._iceCandidates.push(this._createLocalCandidate(candidate));

                if (!this._iceCompleted) {
                    this._checkCandidatesSufficient(candidate);
                }
            } else {
                this._reportIceCompleted(false);
            }
        }
    }, {
        key: '_checkCandidatesSufficient',
        value: function _checkCandidatesSufficient(candidate) {
            //check if we collected sufficient candidates from single media server to start the call
            var candidateObj = (0, _sdp.parseCandidate)(candidate.candidate);
            if (candidateObj.component != 1) {
                return;
            }
            var candidateFoundation = candidateObj.foundation;
            var candidateMLineIndex = candidate.sdpMLineIndex;
            if (candidateFoundation && candidateMLineIndex >= 0 && candidateMLineIndex < this._mLines) {
                var mIndexList = this._iceCandidateFoundationsMap[candidateFoundation] || [];
                if (!mIndexList.includes(candidateMLineIndex)) {
                    mIndexList.push(candidateMLineIndex);
                }
                this._iceCandidateFoundationsMap[candidateFoundation] = mIndexList;

                if (this._mLines == mIndexList.length) {
                    this._reportIceCompleted(false);
                }
            }
        }
    }, {
        key: '_reportIceCompleted',
        value: function _reportIceCompleted(isTimeout) {
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
        key: 'onIceStateChange',
        value: function onIceStateChange(evt) {
            if (evt.currentTarget.iceConnectionState == 'disconnected') {
                this.logger.info('Lost ICE connection');
                this._rtcSession._sessionReport.iceConnectionsLost += 1;
            }
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
            this._rtcSession._sessionReport.cleanupTimeMillis = Date.now() - this._startTime;
            this._rtcSession._onSessionDestroyed(this._rtcSession, this._rtcSession._sessionReport);
        }
    }, {
        key: 'hangup',
        value: function hangup() {
            //do nothing, already at the end of lifecycle
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
            this._rtcSession._sessionReport.sessionEndTime = new Date();
            this._rtcSession._onSessionFailed(this._rtcSession, this._failureReason);
            _get(FailedState.prototype.__proto__ || Object.getPrototypeOf(FailedState.prototype), 'onEnter', this).call(this);
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
     * @param {*} contactToken A string representing the contact token (optional)
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

        /**
         * user may provide the stream to the RtcSession directly to connect to the other end.
         * user may also acquire the stream from the local device.
         * This flag is used to track where the stream is acquired.
         * If it's acquired from local devices, then we must close the stream when the session ends.
         * If it's provided by user (rather than local camera/microphone), then we should leave it open when the
         * session ends.
         */
        this._userProvidedStream = false;

        this._onGumError = this._onGumSuccess = this._onLocalStreamAdded = this._onSessionFailed = this._onSessionInitialized = this._onSignalingConnected = this._onIceCollectionComplete = this._onSignalingStarted = this._onSessionConnected = this._onRemoteStreamAdded = this._onSessionCompleted = this._onSessionDestroyed = function () {};
    }

    _createClass(RtcSession, [{
        key: 'pauseLocalVideo',
        value: function pauseLocalVideo() {
            if (this._localStream) {
                var videoTrack = this._localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeLocalVideo',
        value: function resumeLocalVideo() {
            if (this._localStream) {
                var videoTrack = this._localStream.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseRemoteVideo',
        value: function pauseRemoteVideo() {
            if (this._remoteVideoStream) {
                var videoTrack = this._remoteVideoStream.getTracks()[1];
                if (videoTrack) {
                    videoTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeRemoteVideo',
        value: function resumeRemoteVideo() {
            if (this._remoteVideoStream) {
                var videoTrack = this._remoteVideoStream.getTracks()[1];
                if (videoTrack) {
                    videoTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseLocalAudio',
        value: function pauseLocalAudio() {
            if (this._localStream) {
                var audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeLocalAudio',
        value: function resumeLocalAudio() {
            if (this._localStream) {
                var audioTrack = this._localStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
    }, {
        key: 'pauseRemoteAudio',
        value: function pauseRemoteAudio() {
            if (this._remoteAudioStream) {
                var audioTrack = this._remoteAudioStream.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = false;
                }
            }
        }
    }, {
        key: 'resumeRemoteAudio',
        value: function resumeRemoteAudio() {
            if (this._remoteAudioStream) {
                var audioTrack = this._remoteAudioStream.getTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = true;
                }
            }
        }
        /**
         * Callback when gUM succeeds.
         * First param is RtcSession object.
         */

    }, {
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
                rtcpMuxPolicy: 'require',
                bundlePolicy: 'balanced'
            }, {
                optional: [{
                    googDscp: true
                }]
            });

            self._pc.ontrack = (0, _utils.hitch)(self, self._ontrack);
            self._pc.onicecandidate = (0, _utils.hitch)(self, self._onIceCandidate);
            self._pc.oniceconnectionstatechange = (0, _utils.hitch)(self, self._onIceStateChange);

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
         * Get a promise of MediaRtpStats object for remote audio (from Amazon Connect to client).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getRemoteAudioStats',
        value: function getRemoteAudioStats() {
            var timestamp = new Date();
            if (this._pc && this._pc.signalingState === 'stable' && this._remoteAudioStream) {
                var audioTracks = this._remoteAudioStream.getAudioTracks();
                return this._pc.getStats(audioTracks[0]).then(function (stats) {
                    var rtcJsStats = (0, _rtpStats.extractMediaStatsFromStats)(timestamp, stats, 'audio_output');
                    if (!rtcJsStats) {
                        throw new Error('Failed to extract MediaRtpStats from RTCStatsReport');
                    }
                    return rtcJsStats;
                });
            } else {
                return Promise.reject(new _exceptions.IllegalState());
            }
        }

        /**
         * Get a promise of MediaRtpStats object for user audio (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getUserAudioStats',
        value: function getUserAudioStats() {
            var timestamp = new Date();
            if (this._pc && this._pc.signalingState === 'stable' && this._localStream) {
                var audioTracks = this._localStream.getAudioTracks();
                return this._pc.getStats(audioTracks[0]).then(function (stats) {
                    var rtcJsStats = (0, _rtpStats.extractMediaStatsFromStats)(timestamp, stats, 'audio_input');
                    if (!rtcJsStats) {
                        throw new Error('Failed to extract MediaRtpStats from RTCStatsReport');
                    }
                    return rtcJsStats;
                });
            } else {
                return Promise.reject(new _exceptions.IllegalState());
            }
        }

        /**
         * Get a promise of MediaRtpStats object for user video (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getRemoteVideoStats',
        value: function getRemoteVideoStats() {
            var timestamp = new Date();
            if (this._pc && this._pc.signalingState === 'stable' && this._remoteVideoStream) {
                var videoTracks = this._remoteVideoStream.getVideoTracks();
                return this._pc.getStats(videoTracks[0]).then(function (stats) {
                    var rtcJsStats = (0, _rtpStats.extractMediaStatsFromStats)(timestamp, stats, 'video_output');
                    if (!rtcJsStats) {
                        throw new Error('Failed to extract MediaRtpStats from RTCStatsReport');
                    }
                    return rtcJsStats;
                });
            } else {
                return Promise.reject(new _exceptions.IllegalState());
            }
        }

        /**
         * Get a promise of MediaRtpStats object for user video (from client to Amazon Connect).
         * @return Rejected promise if failed to get MediaRtpStats. The promise is never resolved with null value.
         */

    }, {
        key: 'getUserVideoStats',
        value: function getUserVideoStats() {
            var timestamp = new Date();
            if (this._pc && this._pc.signalingState === 'stable' && this._localStream) {
                var audioTracks = this._localStream.getVideoTracks();
                return this._pc.getStats(audioTracks[0]).then(function (stats) {
                    var rtcJsStats = (0, _rtpStats.extractMediaStatsFromStats)(timestamp, stats, 'video_input');
                    if (!rtcJsStats) {
                        throw new Error('Failed to extract MediaRtpStats from RTCStatsReport');
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
    }, {
        key: '_onIceStateChange',
        value: function _onIceStateChange(evt) {
            this._state.onIceStateChange(evt);
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
                this._remoteVideoStream = evt.streams[0];
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
                if (this._localStream && !this._userProvidedStream) {
                    (0, _utils.closeStream)(this._localStream);
                    this._localStream = null;
                    this._userProvidedStream = false;
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
        /**
         * getMediaStream returns the local stream, which may be acquired from local device or from user provided stream.
         * Rather than getting a stream by calling getUserMedia (which gets a stream from local device such as camera),
         * user could also provide the stream to the RtcSession directly to connect to the other end.
         */

    }, {
        key: 'mediaStream',
        get: function get() {
            return this._localStream;
        },

        /**
         * Optional. RtcSession will grab input device if this is not specified.
         * Please note: this RtcSession class only support single audio track and/or single video track.
         */
        set: function set(input) {
            this._localStream = input;
            this._userProvidedStream = true;
        }
        /**
         * Needed, expect an audio element that can be used to play remote audio stream.
         */

    }, {
        key: 'remoteVideoStream',
        get: function get() {
            return this._remoteVideoStream;
        }
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
         * Callback when the hangup is initiated (implies the call was successfully established).
         * First param is RtcSession object.
         */

    }, {
        key: 'onSessionCompleted',
        set: function set(handler) {
            this._onSessionCompleted = handler;
        }
        /**
         * Callback after session is cleaned up, no matter if the call was successfully established or not.
         * First param is RtcSession object.
         * Second param is SessionReport object.
         */

    }, {
        key: 'onSessionDestroyed',
        set: function set(handler) {
            this._onSessionDestroyed = handler;
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
         * Supported audio codecs: opus.
         */

    }, {
        key: 'forceAudioCodec',
        set: function set(audioCodec) {
            this._forceAudioCodec = audioCodec;
        }

        /**
         * connect-rtc-js initiate the handshaking with all browser supported codec by default, Amazon Connect service will choose the codec according to its preference setting.
         * Setting this attribute will force connect-rtc-js to only use specified codec.
         * WARNING: Setting this to unsupported codec will cause the failure of handshaking.
         * Supported video codecs: VP8, VP9, H264.
         */

    }, {
        key: 'forceVideoCodec',
        set: function set(videoCodec) {
            this._forceVideoCodec = videoCodec;
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

},{"./exceptions":15,"./rtc_const":16,"./rtp-stats":18,"./session_report":19,"./signaling":20,"./utils":21,"sdp":1,"uuid/v4":4}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.extractMediaStatsFromStats = extractMediaStatsFromStats;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Extract rtp stats of specified stream from RTCStatsReport
* Chrome reports all stream stats in statsReports whereas firefox reports only single stream stats in report
* StreamType is passed only to pull right stream stats audio_input or audio_output.
*/
function extractMediaStatsFromStats(timestamp, stats, streamType) {
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
                var rttMs = null;
                var jbMs = null;
                if (statsReport.type === 'ssrc') {
                    //chrome, opera case. chrome reports stats for all streams, not just the stream passed in.
                    if (typeof statsReport.packetsSent !== 'undefined' && statsReport.mediaType == 'audio' && streamType === 'audio_input') {
                        if (typeof statsReport.audioInputLevel !== 'undefined') {
                            audioLevel = statsReport.audioInputLevel;
                        }
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        if (typeof statsReport.googRtt !== 'undefined') {
                            rttMs = statsReport.googRtt;
                        }
                        callStats = new MediaRtpStats(timestamp, packetsLost, statsReport.packetsSent, audioLevel, rttMs, null, statsReport.bytesSent);
                        break;
                    } else if (typeof statsReport.packetsReceived !== 'undefined' && statsReport.mediaType == 'audio' && streamType === 'audio_output') {
                        if (typeof statsReport.audioOutputLevel !== 'undefined') {
                            audioLevel = statsReport.audioOutputLevel;
                        }
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        if (typeof statsReport.googJitterBufferMs !== 'undefined') {
                            jbMs = statsReport.googJitterBufferMs;
                        }
                        callStats = new MediaRtpStats(timestamp, packetsLost, statsReport.packetsReceived, audioLevel, null, jbMs, null, statsReport.bytesReceived);
                        break;
                    } else if (typeof statsReport.packetsSent !== 'undefined' && statsReport.mediaType == 'video' && streamType === 'video_input') {
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        if (typeof statsReport.googRtt !== 'undefined') {
                            rttMs = statsReport.googRtt;
                        }
                        var frameRateSend = null;
                        if (typeof statsReport.googFrameRateSent !== 'undefined') {
                            frameRateSend = statsReport.googFrameRateSent;
                        }
                        callStats = new MediaRtpStats(timestamp, packetsLost, statsReport.packetsSent, null, rttMs, null, statsReport.bytesSent, null, statsReport.framesEncoded, null, frameRateSend, null);
                        break;
                    } else if (typeof statsReport.packetsReceived !== 'undefined' && statsReport.mediaType == 'video' && streamType === 'video_output') {
                        if (typeof statsReport.packetsLost !== 'undefined' && statsReport.packetsLost > 0) {
                            // Chrome reports -1 when there is no packet loss
                            packetsLost = statsReport.packetsLost;
                        }
                        if (typeof statsReport.googJitterBufferMs !== 'undefined') {
                            jbMs = statsReport.googJitterBufferMs;
                        }
                        var frameRateReceived = null;
                        if (typeof statsReport.googFrameRateReceived !== 'undefined') {
                            frameRateReceived = statsReport.googFrameRateReceived;
                        }
                        callStats = new MediaRtpStats(timestamp, packetsLost, statsReport.packetsReceived, null, null, jbMs, null, statsReport.bytesReceived, null, statsReport.framesDecoded, null, frameRateReceived);
                        break;
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
                        callStats = new MediaRtpStats(timestamp, packetsLost, statsReport.packetsReceived, audioLevel);
                        break;
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

var MediaRtpStats = function () {
    function MediaRtpStats(timestamp, packetsLost, packetsCount, audioLevel, rttMilliseconds, jbMilliseconds, bytesSent, bytesReceived, framesEncoded, framesDecoded, frameRateSent, frameRateReceived) {
        _classCallCheck(this, MediaRtpStats);

        this._timestamp = timestamp;
        this._packetsLost = packetsLost;
        this._packetsCount = packetsCount;
        this._audioLevel = audioLevel;
        this._rttMilliseconds = rttMilliseconds;
        this._jbMilliseconds = jbMilliseconds;
        this._bytesSent = bytesSent;
        this._bytesReceived = bytesReceived;
        this._framesEncoded = framesEncoded;
        this._framesDecoded = framesDecoded;
        this._frameRateSent = frameRateSent;
        this._frameRateReceived = frameRateReceived;
    }
    /** {number} number of packets sent to the channel */


    _createClass(MediaRtpStats, [{
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
        /** {number} number of bytes sent to the channel*/

    }, {
        key: 'bytesSent',
        get: function get() {
            return this._bytesSent;
        }
        /** {number} number of bytes received from the channel*/

    }, {
        key: 'bytesReceived',
        get: function get() {
            return this._bytesReceived;
        }
        /** {number} number of video frames encoded*/

    }, {
        key: 'framesEncoded',
        get: function get() {
            return this._framesEncoded;
        }
        /** {number} number of video frames decoded*/

    }, {
        key: 'framesDecoded',
        get: function get() {
            return this._framesDecoded;
        }
        /** {number} frames per second sent to the channel*/

    }, {
        key: 'frameRateSent',
        get: function get() {
            return this._frameRateSent;
        }
        /** {number} frames per second received from the channel*/

    }, {
        key: 'frameRateReceived',
        get: function get() {
            return this._frameRateReceived;
        }
    }]);

    return MediaRtpStats;
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
        this._sessionEndTime = null;
        this._gumTimeMillis = null;
        this._initializationTimeMillis = null;
        this._iceCollectionTimeMillis = null;
        this._signallingConnectTimeMillis = null;
        this._handshakingTimeMillis = null;
        this._preTalkingTimeMillis = null;
        this._talkingTimeMillis = null;
        this._iceConnectionsLost = 0;
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
         * Time spent on ICECollection in millis.
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
         *  Times spent in Talking state in millis.
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
         * How many times the RTCSession has lost ICE connection in talking state.
         */
        ,
        set: function set(value) {
            this._talkingTimeMillis = value;
        }
    }, {
        key: "iceConnectionsLost",
        get: function get() {
            return this._iceConnectionsLost;
        }
        /**
         * Times spent in Cleanup state in millis
         */
        ,
        set: function set(value) {
            this._iceConnectionsLost = value;
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

var CONNECT_MAX_RETRIES = 3;

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
        this._createTime = new Date().getTime();
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

        _this._timeoutMs = timeoutMs;
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

    function PendingConnectState(signaling, timeoutMs, initialStartTimeIn, retriesIn) {
        _classCallCheck(this, PendingConnectState);

        var _this2 = _possibleConstructorReturn(this, (PendingConnectState.__proto__ || Object.getPrototypeOf(PendingConnectState)).call(this, signaling, timeoutMs));

        _this2._initialStartTime = initialStartTimeIn || new Date().getTime();
        _this2._retries = retriesIn || 0;
        return _this2;
    }

    _createClass(PendingConnectState, [{
        key: 'onOpen',
        value: function onOpen() {
            this.transit(new PendingInviteState(this._signaling));
        }
    }, {
        key: 'channelDown',
        value: function channelDown() {
            var now = new Date().getTime();
            var untilTimeoutMs = this._initialStartTime + this._timeoutMs - now;
            if (untilTimeoutMs > 0 && ++this._retries < CONNECT_MAX_RETRIES) {
                this._signaling._connect();
                this.transit(new PendingConnectState(this._signaling, untilTimeoutMs, this._initialStartTime, this._retries));
            } else {
                this.transit(new FailedState(this._signaling, new Error('channelDown')));
            }
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
            this._connect();
            this.transit(new PendingConnectState(this, this._connectTimeoutMs));
        }
    }, {
        key: '_connect',
        value: function _connect() {
            this._wss = this._connectWebSocket(this._buildInviteUri());
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
            if (this._contactToken) {
                return this._buildUriBase() + '&contactCtx=' + encodeURIComponent(this._contactToken);
            } else {
                return this._buildUriBase();
            }
        }
    }, {
        key: '_buildReconnectUri',
        value: function _buildReconnectUri() {
            return this._buildUriBase() + '&clientToken=' + encodeURIComponent(this._clientToken);
        }
    }, {
        key: '_buildUriBase',
        value: function _buildUriBase() {
            var separator = '?';
            if (this._signalingUri.indexOf(separator) > -1) {
                separator = '&';
            }
            return this._signalingUri + separator + 'callId=' + encodeURIComponent(this._callId);
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
 * @param sdp original SDP
 * @param sdpOptions defines changes to be applied to SDP
 * @returns a map with 'sdp' containing the transformed SDP and 'mLines' containing the number of m lines in SDP
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
    return {
        sdp: sections.map(function (section) {
            return section.trim();
        }).join('\r\n') + '\r\n',
        mLines: sections.length - 1 // first section is session description, the rest are media descriptions
    };
}

},{"./exceptions":15,"sdp":1}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc2RwL3NkcC5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2xpYi9ieXRlc1RvVXVpZC5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2xpYi9ybmctYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL3Y0LmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9hZGFwdGVyX2NvcmUuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2Nocm9tZS9jaHJvbWVfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvY2hyb21lL2dldHVzZXJtZWRpYS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZWRnZS9lZGdlX3NoaW0uanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL2VkZ2UvZ2V0dXNlcm1lZGlhLmpzIiwibm9kZV9tb2R1bGVzL3dlYnJ0Yy1hZGFwdGVyL3NyYy9qcy9maXJlZm94L2ZpcmVmb3hfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvZmlyZWZveC9nZXR1c2VybWVkaWEuanMiLCJub2RlX21vZHVsZXMvd2VicnRjLWFkYXB0ZXIvc3JjL2pzL3NhZmFyaS9zYWZhcmlfc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy93ZWJydGMtYWRhcHRlci9zcmMvanMvdXRpbHMuanMiLCJzcmMvanMvY29ubmVjdC1ydGMuanMiLCJzcmMvanMvZXhjZXB0aW9ucy5qcyIsInNyYy9qcy9ydGNfY29uc3QuanMiLCJzcmMvanMvcnRjX3Nlc3Npb24uanMiLCJzcmMvanMvcnRwLXN0YXRzLmpzIiwic3JjL2pzL3Nlc3Npb25fcmVwb3J0LmpzIiwic3JjL2pzL3NpZ25hbGluZy5qcyIsInNyYy9qcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuR0E7O0FBZUE7Ozs7QUFDQTs7OztBQWZBOzs7Ozs7Ozs7Ozs7OztBQWlCQSxPQUFPLE9BQVAsR0FBaUIsT0FBTyxPQUFQLElBQWtCLEVBQW5DLEMsQ0FsREE7Ozs7Ozs7Ozs7QUFVQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7Ozs7OztBQXlCQSxPQUFPLE9BQVAsQ0FBZSxVQUFmLEdBQTRCLHFCQUE1QjtBQUNBLE9BQU8sT0FBUCxDQUFlLFNBQWYsR0FBMkIscUJBQTNCOztBQUVBLE9BQU8sSUFBUCxHQUFjLE9BQU8sSUFBUCxJQUFlLEVBQTdCO0FBQ0EsT0FBTyxJQUFQLENBQVksVUFBWixHQUF5QixxQkFBekI7QUFDQSxPQUFPLElBQVAsQ0FBWSxTQUFaLEdBQXdCLHFCQUF4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4REE7Ozs7Ozs7OztBQVNPLElBQU0sc0RBQXVCLFNBQTdCOztJQUNNLE8sV0FBQSxPOzs7QUFDVCxxQkFBWSxHQUFaLEVBQWlCO0FBQUE7O0FBQUEsc0hBQ1AsR0FETzs7QUFFYixjQUFLLElBQUwsR0FBWSxvQkFBWjtBQUZhO0FBR2hCOzs7RUFKd0IsSzs7QUFPdEIsSUFBTSw0REFBMEIsWUFBaEM7O0lBQ00sVSxXQUFBLFU7OztBQUNULHdCQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFBQSw2SEFDUCxHQURPOztBQUViLGVBQUssSUFBTCxHQUFZLHVCQUFaO0FBRmE7QUFHaEI7OztFQUoyQixPOztBQU96QixJQUFNLDBFQUFpQyxtQkFBdkM7O0lBQ00saUIsV0FBQSxpQjs7O0FBQ1QsK0JBQVksR0FBWixFQUFpQjtBQUFBOztBQUFBLDJJQUNQLEdBRE87O0FBRWIsZUFBSyxJQUFMLEdBQVksOEJBQVo7QUFGYTtBQUdoQjs7O0VBSmtDLEs7O0FBT2hDLElBQU0sZ0VBQTRCLGNBQWxDOztJQUNNLFksV0FBQSxZOzs7QUFDVCwwQkFBWSxHQUFaLEVBQWlCO0FBQUE7O0FBQUEsaUlBQ1AsR0FETzs7QUFFYixlQUFLLElBQUwsR0FBWSx5QkFBWjtBQUZhO0FBR2hCOzs7RUFKNkIsSzs7QUFPM0IsSUFBTSxnRkFBb0Msc0JBQTFDOztJQUNNLG9CLFdBQUEsb0I7OztBQUNULGtDQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFBQSxpSkFDUCxHQURPOztBQUViLGVBQUssSUFBTCxHQUFZLGlDQUFaO0FBRmE7QUFHaEI7OztFQUpxQyxLOztBQU9uQyxJQUFNLGdEQUFvQixlQUExQjs7SUFDTSxhLFdBQUEsYTs7O0FBQ1QsMkJBQVksR0FBWixFQUFpQjtBQUFBOztBQUFBLG1JQUNQLEdBRE87O0FBRWIsZUFBSyxJQUFMLEdBQVksaUJBQVo7QUFGYTtBQUdoQjs7O0VBSjhCLEs7O0FBTzVCLElBQU0sZ0VBQTRCLHVCQUFsQzs7SUFDTSxxQixXQUFBLHFCOzs7QUFDVCxtQ0FBWSxHQUFaLEVBQWlCO0FBQUE7O0FBQUEsbUpBQ1AsR0FETzs7QUFFYixlQUFLLElBQUwsR0FBWSx5QkFBWjtBQUZhO0FBR2hCOzs7RUFKc0MsSzs7QUFPcEMsSUFBTSxnRUFBNEIsdUJBQWxDOztJQUNNLHFCLFdBQUEscUI7OztBQUNULHFDQUFjO0FBQUE7O0FBQUE7O0FBRVYsZUFBSyxJQUFMLEdBQVkseUJBQVo7QUFGVTtBQUdiOzs7RUFKc0MsSzs7Ozs7Ozs7QUNsRTNDOzs7Ozs7Ozs7O0FBVUE7OztBQUdPLElBQU0sNERBQTBCLElBQWhDO0FBQ1A7OztBQUdPLElBQU0sb0RBQXNCLElBQTVCO0FBQ1A7OztBQUdPLElBQU0sa0VBQTZCLEtBQW5DO0FBQ1A7OztBQUdPLElBQU0sMERBQXlCLElBQS9CO0FBQ1A7OztBQUdPLElBQU0sMERBQXlCLEtBQS9COztBQUVQOzs7QUFHTyxJQUFNLGtDQUFhO0FBQ3JCLDBCQUF5Qix3QkFESjtBQUVyQixhQUFZLFdBRlM7QUFHckIsaUNBQWdDLCtCQUhYO0FBSXJCLGdDQUErQiw4QkFKVjtBQUtyQixrQ0FBaUMsZ0NBTFo7QUFNckIsd0JBQXVCLHNCQU5GO0FBT3JCLGlDQUFnQywrQkFQWDtBQVFyQixzQkFBcUIsb0JBUkE7QUFTckIsMkJBQTBCLHlCQVRMO0FBVXJCLHVCQUFzQixxQkFWRDtBQVdyQixxQkFBb0IsbUJBWEM7QUFZckIsa0JBQWdCO0FBWkssQ0FBbkI7Ozs7Ozs7Ozs7Ozs7O3FqQkNsQ1A7Ozs7Ozs7Ozs7O0FBU0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7Ozs7O0lBRWEsZSxXQUFBLGU7QUFDVDs7OztBQUlBLDZCQUFZLFVBQVosRUFBd0I7QUFBQTs7QUFDcEIsYUFBSyxXQUFMLEdBQW1CLFVBQW5CO0FBQ0g7Ozs7a0NBQ1MsQ0FDVDs7O2lDQUNRLENBQ1I7OzswQ0FDaUI7QUFDZCxtQkFBTyxLQUFLLFdBQUwsQ0FBaUIsTUFBakIsS0FBNEIsSUFBbkM7QUFDSDs7O2dDQUNPLFMsRUFBVztBQUNmLGdCQUFJLEtBQUssZUFBTCxFQUFKLEVBQTRCO0FBQ3hCLHFCQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsU0FBekI7QUFDSDtBQUNKOzs7aUNBSVE7QUFDTCxpQkFBSyxPQUFMLENBQWEsSUFBSSxXQUFKLENBQWdCLEtBQUssV0FBckIsQ0FBYjtBQUNIOzs7dUNBQ2MsRyxFQUFLLENBQUM7QUFDakI7QUFDQTtBQUNIOzs7eUNBQ2dCO0FBQ2Isa0JBQU0sSUFBSSxnQ0FBSixDQUF5Qix1Q0FBdUMsS0FBSyxJQUFyRSxDQUFOO0FBQ0g7OzsrQ0FJc0I7QUFDbkIsa0JBQU0sSUFBSSxnQ0FBSixDQUF5Qiw2Q0FBNkMsS0FBSyxJQUEzRSxDQUFOO0FBQ0g7OztnREFDdUI7QUFDcEIsa0JBQU0sSUFBSSxnQ0FBSixDQUF5Qiw4Q0FBOEMsS0FBSyxJQUE1RSxDQUFOO0FBQ0g7OzswQ0FDaUIsQyxFQUFHO0FBQUM7QUFDbEIsa0JBQU0sSUFBSSxnQ0FBSixDQUF5QiwwQ0FBMEMsS0FBSyxJQUF4RSxDQUFOO0FBQ0g7Ozt5Q0FDZ0IsRyxFQUFLLENBQUM7QUFDdEI7Ozs0QkExQlk7QUFDVCxtQkFBTyxLQUFLLFdBQUwsQ0FBaUIsT0FBeEI7QUFDSDs7OzRCQVdVO0FBQ1AsbUJBQU8saUJBQVA7QUFDSDs7Ozs7O0lBYVEsbUIsV0FBQSxtQjs7Ozs7Ozs7Ozs7a0NBQ0M7QUFDTixnQkFBSSxPQUFPLElBQVg7QUFDQSxnQkFBSSxZQUFZLEtBQUssR0FBTCxFQUFoQjtBQUNBLGdCQUFJLEtBQUssV0FBTCxDQUFpQixnQkFBckIsRUFBdUM7QUFDbkMscUJBQUssT0FBTCxDQUFhLElBQUksZ0JBQUosQ0FBcUIsS0FBSyxXQUExQixDQUFiO0FBQ0gsYUFGRCxNQUVPO0FBQ0gsb0JBQUksb0JBQW9CLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDckQsK0JBQVcsWUFBTTtBQUNiLCtCQUFPLElBQUksc0JBQUosQ0FBZSwyQ0FBZixDQUFQO0FBQ0gscUJBRkQsRUFFRyxLQUFLLFdBQUwsQ0FBaUIsaUJBRnBCO0FBR0gsaUJBSnVCLENBQXhCO0FBS0Esb0JBQUksb0JBQW9CLEtBQUssSUFBTCxDQUFVLEtBQUssV0FBTCxDQUFpQixzQkFBakIsRUFBVixDQUF4Qjs7QUFFQSx3QkFBUSxJQUFSLENBQWEsQ0FBQyxpQkFBRCxFQUFvQixpQkFBcEIsQ0FBYixFQUNLLElBREwsQ0FDVSxrQkFBVTtBQUNaLHlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsYUFBaEMsR0FBZ0QsS0FBSyxHQUFMLEtBQWEsU0FBN0Q7QUFDQSx5QkFBSyxXQUFMLENBQWlCLGFBQWpCLENBQStCLEtBQUssV0FBcEM7QUFDQSx5QkFBSyxXQUFMLENBQWlCLFlBQWpCLEdBQWdDLE1BQWhDO0FBQ0EseUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxlQUFoQyxHQUFrRCxLQUFsRDtBQUNBLHlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsaUJBQWhDLEdBQW9ELEtBQXBEO0FBQ0EseUJBQUssT0FBTCxDQUFhLElBQUksZ0JBQUosQ0FBcUIsS0FBSyxXQUExQixDQUFiO0FBQ0gsaUJBUkwsRUFRTyxLQVJQLENBUWEsYUFBSztBQUNWLHlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsYUFBaEMsR0FBZ0QsS0FBSyxHQUFMLEtBQWEsU0FBN0Q7QUFDQSx3QkFBSSxXQUFKO0FBQ0Esd0JBQUksYUFBYSxzQkFBakIsRUFBNkI7QUFDekIsc0NBQWMsc0JBQVcsbUJBQXpCO0FBQ0EsNkJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxpQkFBaEMsR0FBb0QsSUFBcEQ7QUFDQSw2QkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGVBQWhDLEdBQWtELEtBQWxEO0FBQ0gscUJBSkQsTUFJTztBQUNILHNDQUFjLHNCQUFXLGlCQUF6QjtBQUNBLDZCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsZUFBaEMsR0FBa0QsSUFBbEQ7QUFDQSw2QkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGlCQUFoQyxHQUFvRCxLQUFwRDtBQUNIO0FBQ0QseUJBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsbUNBQWxCLEVBQXVELENBQXZEO0FBQ0EseUJBQUssV0FBTCxDQUFpQixXQUFqQixDQUE2QixLQUFLLFdBQWxDO0FBQ0EseUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixLQUFLLFdBQXJCLEVBQWtDLFdBQWxDLENBQWI7QUFDSCxpQkF2Qkw7QUF3Qkg7QUFDSjs7OzZCQUlJLFcsRUFBYTtBQUNkLG1CQUFPLFVBQVUsWUFBVixDQUF1QixZQUF2QixDQUFvQyxXQUFwQyxDQUFQO0FBQ0g7Ozs0QkFMVTtBQUNQLG1CQUFPLHFCQUFQO0FBQ0g7Ozs7RUExQ29DLGU7O0lBK0M1QixnQixXQUFBLGdCOzs7Ozs7Ozs7OztrQ0FDQztBQUNOLGdCQUFJLE9BQU8sSUFBWDtBQUNBLGdCQUFJLFNBQVMsS0FBSyxXQUFMLENBQWlCLFlBQTlCO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixHQUFqQixDQUFxQixTQUFyQixDQUErQixNQUEvQjtBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsbUJBQWpCLENBQXFDLEtBQUssV0FBMUMsRUFBdUQsTUFBdkQ7QUFDQSxpQkFBSyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLFdBQXJCLEdBQW1DLElBQW5DLENBQXdDLGlDQUF5QjtBQUM3RCxxQkFBSyxXQUFMLENBQWlCLHdCQUFqQixHQUE0QyxxQkFBNUM7QUFDQSxxQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGtCQUFoQyxHQUFxRCxLQUFyRDtBQUNBLHFCQUFLLE9BQUwsQ0FBYSxJQUFJLCtCQUFKLENBQW9DLEtBQUssV0FBekMsQ0FBYjtBQUNILGFBSkQsRUFJRyxLQUpILENBSVMsYUFBSztBQUNWLHFCQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLG9CQUFsQixFQUF3QyxDQUF4QztBQUNBLHFCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0Msa0JBQWhDLEdBQXFELElBQXJEO0FBQ0EscUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixLQUFLLFdBQXJCLEVBQWtDLHNCQUFXLG9CQUE3QyxDQUFiO0FBQ0gsYUFSRDtBQVNIOzs7NEJBQ1U7QUFDUCxtQkFBTyxrQkFBUDtBQUNIOzs7O0VBbEJpQyxlOztJQW9CekIsK0IsV0FBQSwrQjs7Ozs7Ozs7Ozs7a0NBQ0M7QUFDTixnQkFBSSxPQUFPLElBQVg7O0FBRUE7QUFDQSxnQkFBSSxtQkFBbUIsS0FBSyxXQUFMLENBQWlCLHdCQUF4QztBQUNBLGdCQUFJLGFBQWEsSUFBSSxpQkFBSixFQUFqQjtBQUNBO0FBQ0EsZ0JBQUksS0FBSyxXQUFMLENBQWlCLGdCQUFyQixFQUF1QztBQUNuQywyQkFBVyxVQUFYLENBQXNCLE9BQXRCLElBQWlDLEtBQUssV0FBTCxDQUFpQixnQkFBbEQ7QUFDSDtBQUNEO0FBQ0EsZ0JBQUksS0FBSyxXQUFMLENBQWlCLGdCQUFyQixFQUF1QztBQUNuQywyQkFBVyxVQUFYLENBQXNCLE9BQXRCLElBQWlDLEtBQUssV0FBTCxDQUFpQixnQkFBbEQ7QUFDSDtBQUNELHVCQUFXLGFBQVgsR0FBMkIsS0FBSyxXQUFMLENBQWlCLGNBQTVDOztBQUVBLGdCQUFJLGlCQUFpQix5QkFBYSxpQkFBaUIsR0FBOUIsRUFBbUMsVUFBbkMsQ0FBckI7QUFDQSw2QkFBaUIsR0FBakIsR0FBdUIsZUFBZSxHQUF0Qzs7QUFFQSxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixTQUFqQixFQUE0QixLQUFLLFdBQUwsQ0FBaUIsd0JBQTdDO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixHQUFqQixDQUFxQixtQkFBckIsQ0FBeUMsS0FBSyxXQUFMLENBQWlCLHdCQUExRCxFQUFvRixJQUFwRixDQUF5RixZQUFNO0FBQzNGLG9CQUFJLHFCQUFxQixLQUFLLEdBQUwsS0FBYSxLQUFLLFdBQUwsQ0FBaUIsaUJBQXZEO0FBQ0EscUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyx3QkFBaEMsR0FBMkQsa0JBQTNEO0FBQ0EscUJBQUssV0FBTCxDQUFpQixxQkFBakIsQ0FBdUMsS0FBSyxXQUE1QyxFQUF5RCxrQkFBekQ7QUFDQSxxQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLDBCQUFoQyxHQUE2RCxLQUE3RDtBQUNBLHFCQUFLLE9BQUwsQ0FBYSxJQUFJLHFDQUFKLENBQTBDLEtBQUssV0FBL0MsRUFBNEQsZUFBZSxNQUEzRSxDQUFiO0FBQ0gsYUFORCxFQU1HLEtBTkgsQ0FNUyxhQUFLO0FBQ1YscUJBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsNEJBQWxCLEVBQWdELENBQWhEO0FBQ0EscUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQywwQkFBaEMsR0FBNkQsSUFBN0Q7QUFDQSxxQkFBSyxPQUFMLENBQWEsSUFBSSxXQUFKLENBQWdCLEtBQUssV0FBckIsRUFBa0Msc0JBQVcsNkJBQTdDLENBQWI7QUFDSCxhQVZEO0FBV0g7Ozs0QkFDVTtBQUNQLG1CQUFPLGlDQUFQO0FBQ0g7Ozs7RUFuQ2dELGU7O0FBc0NyRDs7Ozs7OztJQUthLHFDLFdBQUEscUM7OztBQUNUOzs7OztBQUtBLG1EQUFZLFVBQVosRUFBd0IsTUFBeEIsRUFBZ0M7QUFBQTs7QUFBQSxtTEFDdEIsVUFEc0I7O0FBRTVCLGVBQUssY0FBTCxHQUFzQixFQUF0QjtBQUNBLGVBQUssMkJBQUwsR0FBbUMsRUFBbkM7QUFDQSxlQUFLLE9BQUwsR0FBZSxNQUFmO0FBSjRCO0FBSy9COzs7O2tDQUNTO0FBQ04sZ0JBQUksT0FBTyxJQUFYO0FBQ0EsaUJBQUssVUFBTCxHQUFrQixLQUFLLEdBQUwsRUFBbEI7QUFDQSx1QkFBVyxZQUFNO0FBQ2Isb0JBQUksS0FBSyxlQUFMLE1BQTBCLENBQUMsS0FBSyxhQUFwQyxFQUFtRDtBQUMvQyx5QkFBSyxNQUFMLENBQVksSUFBWixDQUFpQiwwQkFBakI7QUFDQSx5QkFBSyxtQkFBTCxDQUF5QixJQUF6QjtBQUNIO0FBQ0osYUFMRCxFQUtHLEtBQUssV0FBTCxDQUFpQixpQkFMcEI7QUFNQSxpQkFBSyxXQUFMLENBQWlCLHVCQUFqQixHQUEyQyxPQUEzQztBQUNIOzs7K0NBQ3NCO0FBQ25CLGlCQUFLLFdBQUwsQ0FBaUIsMkJBQWpCLEdBQStDLEtBQUssR0FBTCxFQUEvQztBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsMkJBQWhDLEdBQThELEtBQUssV0FBTCxDQUFpQiwyQkFBakIsR0FBK0MsS0FBSyxVQUFsSDtBQUNBLGlCQUFLLG1CQUFMLEdBQTJCLElBQTNCO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixxQkFBakIsQ0FBdUMsS0FBSyxXQUE1QztBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsMkJBQWhDLEdBQThELEtBQTlEO0FBQ0EsaUJBQUssZ0JBQUw7QUFDSDs7OzBDQUNpQixDLEVBQUc7QUFDakIsaUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQywyQkFBaEMsR0FBOEQsS0FBSyxHQUFMLEtBQWEsS0FBSyxVQUFoRjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLHVDQUFsQixFQUEyRCxDQUEzRDtBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsMkJBQWhDLEdBQThELElBQTlEO0FBQ0EsaUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixLQUFLLFdBQXJCLEVBQWtDLHNCQUFXLDZCQUE3QyxDQUFiO0FBQ0g7Ozs4Q0FDcUIsUSxFQUFVO0FBQzVCLG1CQUFPLElBQUksZUFBSixDQUFvQixRQUFwQixDQUFQO0FBQ0g7Ozt1Q0FDYyxHLEVBQUs7QUFDaEIsZ0JBQUksWUFBWSxJQUFJLFNBQXBCO0FBQ0EsaUJBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0Isb0JBQW9CLEtBQUssU0FBTCxDQUFlLFNBQWYsQ0FBcEM7QUFDQSxnQkFBSSxTQUFKLEVBQWU7QUFDWCxxQkFBSyxjQUFMLENBQW9CLElBQXBCLENBQXlCLEtBQUsscUJBQUwsQ0FBMkIsU0FBM0IsQ0FBekI7O0FBRUEsb0JBQUksQ0FBQyxLQUFLLGFBQVYsRUFBeUI7QUFDckIseUJBQUssMEJBQUwsQ0FBZ0MsU0FBaEM7QUFDSDtBQUVKLGFBUEQsTUFPTztBQUNILHFCQUFLLG1CQUFMLENBQXlCLEtBQXpCO0FBQ0g7QUFDSjs7O21EQUMwQixTLEVBQVc7QUFDbEM7QUFDQSxnQkFBSSxlQUFlLHlCQUFlLFVBQVUsU0FBekIsQ0FBbkI7QUFDQSxnQkFBSSxhQUFhLFNBQWIsSUFBMEIsQ0FBOUIsRUFBaUM7QUFDN0I7QUFDSDtBQUNELGdCQUFJLHNCQUFzQixhQUFhLFVBQXZDO0FBQ0EsZ0JBQUksc0JBQXNCLFVBQVUsYUFBcEM7QUFDQSxnQkFBSSx1QkFBdUIsdUJBQXVCLENBQTlDLElBQW1ELHNCQUFzQixLQUFLLE9BQWxGLEVBQTJGO0FBQ3ZGLG9CQUFJLGFBQWEsS0FBSywyQkFBTCxDQUFpQyxtQkFBakMsS0FBeUQsRUFBMUU7QUFDQSxvQkFBSSxDQUFDLFdBQVcsUUFBWCxDQUFvQixtQkFBcEIsQ0FBTCxFQUErQztBQUMzQywrQkFBVyxJQUFYLENBQWdCLG1CQUFoQjtBQUNIO0FBQ0QscUJBQUssMkJBQUwsQ0FBaUMsbUJBQWpDLElBQXdELFVBQXhEOztBQUVBLG9CQUFJLEtBQUssT0FBTCxJQUFnQixXQUFXLE1BQS9CLEVBQXVDO0FBQ25DLHlCQUFLLG1CQUFMLENBQXlCLEtBQXpCO0FBQ0g7QUFDSjtBQUNKOzs7NENBQ21CLFMsRUFBVztBQUMzQixpQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLHVCQUFoQyxHQUEwRCxLQUFLLEdBQUwsS0FBYSxLQUFLLFVBQTVFO0FBQ0EsaUJBQUssYUFBTCxHQUFxQixJQUFyQjtBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsd0JBQWpCLENBQTBDLEtBQUssV0FBL0MsRUFBNEQsU0FBNUQsRUFBdUUsS0FBSyxjQUFMLENBQW9CLE1BQTNGO0FBQ0EsZ0JBQUksS0FBSyxjQUFMLENBQW9CLE1BQXBCLEdBQTZCLENBQWpDLEVBQW9DO0FBQ2hDLHFCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0Msb0JBQWhDLEdBQXVELEtBQXZEO0FBQ0EscUJBQUssZ0JBQUw7QUFDSCxhQUhELE1BR087QUFDSCxxQkFBSyxNQUFMLENBQVksS0FBWixDQUFrQixrQkFBbEI7QUFDQSxxQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLG9CQUFoQyxHQUF1RCxJQUF2RDtBQUNBLHFCQUFLLE9BQUwsQ0FBYSxJQUFJLFdBQUosQ0FBZ0IsS0FBSyxXQUFyQixFQUFrQyxzQkFBVyxzQkFBN0MsQ0FBYjtBQUNIO0FBQ0o7OzsyQ0FDa0I7QUFDZixnQkFBSSxLQUFLLGFBQUwsSUFBc0IsS0FBSyxtQkFBL0IsRUFBb0Q7QUFDaEQscUJBQUssT0FBTCxDQUFhLElBQUksaUJBQUosQ0FBc0IsS0FBSyxXQUEzQixFQUF3QyxLQUFLLGNBQTdDLENBQWI7QUFDSCxhQUZELE1BRU8sSUFBSSxDQUFDLEtBQUssYUFBVixFQUF5QjtBQUM1QixxQkFBSyxNQUFMLENBQVksR0FBWixDQUFnQix3QkFBaEI7QUFDSCxhQUZNLE1BRUE7QUFBQztBQUNKLHFCQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLDhCQUFoQjtBQUNIO0FBQ0o7Ozs0QkFDVTtBQUNQLG1CQUFPLHVDQUFQO0FBQ0g7Ozs7RUFsR3NELGU7O0lBcUc5QyxpQixXQUFBLGlCOzs7QUFDVCwrQkFBWSxVQUFaLEVBQXdCLGFBQXhCLEVBQXVDO0FBQUE7O0FBQUEsMklBQzdCLFVBRDZCOztBQUVuQyxlQUFLLGNBQUwsR0FBc0IsYUFBdEI7QUFGbUM7QUFHdEM7Ozs7a0NBQ1M7QUFDTixnQkFBSSxhQUFhLEtBQUssV0FBdEI7QUFDQSx1QkFBVyxtQkFBWCxDQUErQixVQUEvQjtBQUNBLHVCQUFXLGlCQUFYLENBQTZCLE1BQTdCLENBQW9DLFdBQVcsd0JBQVgsQ0FBb0MsR0FBeEUsRUFDSSxLQUFLLGNBRFQ7QUFFSDs7OzRDQUNtQixHLEVBQUssVSxFQUFZO0FBQ2pDLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsZUFBaEMsR0FBa0QsS0FBbEQ7QUFDQSxpQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGtCQUFoQyxHQUFxRCxLQUFyRDtBQUNBLGlCQUFLLE9BQUwsQ0FBYSxJQUFJLFdBQUosQ0FBZ0IsS0FBSyxXQUFyQixFQUFrQyxHQUFsQyxFQUF1QyxVQUF2QyxDQUFiO0FBQ0g7OzswQ0FDaUIsQyxFQUFHO0FBQ2pCLGdCQUFJLE1BQUo7QUFDQSxnQkFBSSxFQUFFLElBQUYsSUFBVSw2QkFBZCxFQUFpQztBQUM3QixxQkFBSyxNQUFMLENBQVksS0FBWixDQUFrQiwrQ0FBbEIsRUFBbUUsQ0FBbkU7QUFDQSxxQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGVBQWhDLEdBQWtELElBQWxEO0FBQ0EscUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxrQkFBaEMsR0FBcUQsSUFBckQ7QUFDQSx5QkFBUyxzQkFBVyxTQUFwQjtBQUNILGFBTEQsTUFLTyxJQUFJLEVBQUUsSUFBRixJQUFVLHFDQUFkLEVBQXlDO0FBQzVDLHFCQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLHlEQUFsQixFQUE2RSxDQUE3RTtBQUNBLHlCQUFTLHNCQUFXLGNBQXBCO0FBQ0EscUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxrQkFBaEMsR0FBcUQsSUFBckQ7QUFDSCxhQUpNLE1BSUE7QUFDSCxxQkFBSyxNQUFMLENBQVksS0FBWixDQUFrQiwwQ0FBbEIsRUFBOEQsQ0FBOUQ7QUFDQSxxQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGVBQWhDLEdBQWtELEtBQWxEO0FBQ0EscUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxrQkFBaEMsR0FBcUQsSUFBckQ7QUFDQSx5QkFBUyxzQkFBVyw0QkFBcEI7QUFDSDtBQUNELGlCQUFLLE9BQUwsQ0FBYSxJQUFJLFdBQUosQ0FBZ0IsS0FBSyxXQUFyQixFQUFrQyxNQUFsQyxDQUFiO0FBQ0g7Ozs0QkFDVTtBQUNQLG1CQUFPLG1CQUFQO0FBQ0g7Ozs7RUFyQ2tDLGU7O0lBdUMxQixXLFdBQUEsVzs7O0FBQ1QseUJBQVksVUFBWixFQUF3QixHQUF4QixFQUE2QixVQUE3QixFQUF5QztBQUFBOztBQUFBLCtIQUMvQixVQUQrQjs7QUFFckMsZUFBSyxJQUFMLEdBQVksR0FBWjtBQUNBLGVBQUssV0FBTCxHQUFtQixVQUFuQjtBQUhxQztBQUl4Qzs7OztrREFDeUIsUSxFQUFVO0FBQ2hDLG1CQUFPLElBQUkscUJBQUosQ0FBMEIsUUFBMUIsQ0FBUDtBQUNIOzs7K0NBQ3NCLFEsRUFBVTtBQUM3QixtQkFBTyxJQUFJLGVBQUosQ0FBb0IsUUFBcEIsQ0FBUDtBQUNIOzs7a0NBQ1M7QUFDTixnQkFBSSxPQUFPLElBQVg7QUFDQSxnQkFBSSxhQUFhLEtBQUssV0FBdEI7O0FBRUEsZ0JBQUksQ0FBQyxLQUFLLElBQVYsRUFBZ0I7QUFDWixxQkFBSyxNQUFMLENBQVksS0FBWixDQUFrQixvQkFBbEI7QUFDQSwyQkFBVyxZQUFYO0FBQ0EsMkJBQVcsY0FBWCxDQUEwQix1QkFBMUIsR0FBb0QsSUFBcEQ7QUFDQSxxQkFBSyxPQUFMLENBQWEsSUFBSSxXQUFKLENBQWdCLFVBQWhCLEVBQTRCLHNCQUFXLGtCQUF2QyxDQUFiO0FBQ0E7QUFDSCxhQU5ELE1BTU8sSUFBSSxDQUFDLEtBQUssV0FBTixJQUFxQixLQUFLLFdBQUwsQ0FBaUIsTUFBakIsR0FBMEIsQ0FBbkQsRUFBc0Q7QUFDekQscUJBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IseUJBQWxCO0FBQ0EsMkJBQVcsWUFBWDtBQUNBLDJCQUFXLGNBQVgsQ0FBMEIsMkJBQTFCLEdBQXdELElBQXhEO0FBQ0EscUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixVQUFoQixFQUE0QixzQkFBVyx1QkFBdkMsQ0FBYjtBQUNBO0FBQ0g7O0FBRUQsdUJBQVcsY0FBWCxDQUEwQix1QkFBMUIsR0FBb0QsS0FBcEQ7QUFDQSx1QkFBVyxjQUFYLENBQTBCLDJCQUExQixHQUF3RCxLQUF4RDtBQUNBLGdCQUFJLDhCQUE4QixXQUFXLEdBQVgsQ0FBZSxvQkFBZixDQUFvQyxLQUFLLHlCQUFMLENBQStCO0FBQ2pHLHNCQUFNLFFBRDJGO0FBRWpHLHFCQUFLLEtBQUs7QUFGdUYsYUFBL0IsQ0FBcEMsQ0FBbEM7QUFJQSx3Q0FBNEIsS0FBNUIsQ0FBa0MsYUFBSztBQUNuQyxxQkFBSyxNQUFMLENBQVksS0FBWixDQUFrQiw2QkFBbEIsRUFBaUQsQ0FBakQ7QUFDSCxhQUZEO0FBR0Esd0NBQTRCLElBQTVCLENBQWlDLFlBQU07QUFDbkMsb0JBQUksMEJBQTBCLFFBQVEsR0FBUixDQUFZLEtBQUssV0FBTCxDQUFpQixHQUFqQixDQUFxQixVQUFVLFNBQVYsRUFBcUI7QUFDaEYsd0JBQUksa0JBQWtCLEtBQUssc0JBQUwsQ0FBNEIsU0FBNUIsQ0FBdEI7QUFDQSx5QkFBSyxNQUFMLENBQVksSUFBWixDQUFpQix5QkFBakIsRUFBNEMsZUFBNUM7QUFDQSwyQkFBTyxXQUFXLEdBQVgsQ0FBZSxlQUFmLENBQStCLGVBQS9CLENBQVA7QUFDSCxpQkFKeUMsQ0FBWixDQUE5QjtBQUtBLHdDQUF3QixLQUF4QixDQUE4QixrQkFBVTtBQUNwQyx5QkFBSyxNQUFMLENBQVksSUFBWixDQUFpQiwrQkFBakIsRUFBa0QsTUFBbEQ7QUFDSCxpQkFGRDtBQUdBLHVCQUFPLHVCQUFQO0FBQ0gsYUFWRCxFQVVHLElBVkgsQ0FVUSxZQUFNO0FBQ1YsMkJBQVcsY0FBWCxDQUEwQiwyQkFBMUIsR0FBd0QsS0FBeEQ7QUFDQSxxQkFBSyxxQkFBTCxHQUE2QixJQUE3QjtBQUNBLHFCQUFLLGdCQUFMO0FBQ0gsYUFkRCxFQWNHLEtBZEgsQ0FjUyxZQUFNO0FBQ1gsMkJBQVcsWUFBWDtBQUNBLDJCQUFXLGNBQVgsQ0FBMEIsMkJBQTFCLEdBQXdELElBQXhEO0FBQ0EscUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixVQUFoQixFQUE0QixzQkFBVyw4QkFBdkMsQ0FBYjtBQUNILGFBbEJEO0FBbUJIOzs7Z0RBQ3VCO0FBQ3BCLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MscUJBQWhDLEdBQXdELEtBQUssR0FBTCxLQUFhLEtBQUssV0FBTCxDQUFpQiwyQkFBdEY7QUFDQSxpQkFBSyxvQkFBTCxHQUE0QixJQUE1QjtBQUNBLGlCQUFLLGdCQUFMO0FBQ0g7OzsyQ0FDa0I7QUFDZixnQkFBSSxLQUFLLG9CQUFMLElBQTZCLEtBQUsscUJBQXRDLEVBQTZEO0FBQ3pELHFCQUFLLE9BQUwsQ0FBYSxJQUFJLFlBQUosQ0FBaUIsS0FBSyxXQUF0QixDQUFiO0FBQ0gsYUFGRCxNQUVPLElBQUksQ0FBQyxLQUFLLG9CQUFWLEVBQWdDO0FBQ25DLHFCQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLHFCQUFoQjtBQUNILGFBRk0sTUFFQTtBQUFDO0FBQ0oscUJBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0Isb0NBQWhCO0FBQ0g7QUFDSjs7OzRCQUNVO0FBQ1AsbUJBQU8sYUFBUDtBQUNIOzs7O0VBM0U0QixlOztJQTZFcEIsWSxXQUFBLFk7Ozs7Ozs7Ozs7O2tDQUNDO0FBQ04saUJBQUssVUFBTCxHQUFrQixLQUFLLEdBQUwsRUFBbEI7QUFDQSxpQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLG9CQUFoQyxHQUF1RCxLQUFLLFVBQUwsR0FBa0IsS0FBSyxXQUFMLENBQWlCLGlCQUExRjtBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsbUJBQWpCLENBQXFDLEtBQUssV0FBMUM7QUFDSDs7O2lEQUN3QixDQUN4Qjs7O3lDQUNnQjtBQUNiLGlCQUFLLFdBQUwsQ0FBaUIsaUJBQWpCLENBQW1DLE1BQW5DO0FBQ0EsaUJBQUssT0FBTCxDQUFhLElBQUksaUJBQUosQ0FBc0IsS0FBSyxXQUEzQixDQUFiO0FBQ0g7OztpQ0FDUTtBQUNMLGlCQUFLLFdBQUwsQ0FBaUIsaUJBQWpCLENBQW1DLE1BQW5DO0FBQ0EsaUJBQUssT0FBTCxDQUFhLElBQUksaUJBQUosQ0FBc0IsS0FBSyxXQUEzQixDQUFiO0FBQ0g7Ozt5Q0FDZ0IsRyxFQUFLO0FBQ2xCLGdCQUFJLElBQUksYUFBSixDQUFrQixrQkFBbEIsSUFBd0MsY0FBNUMsRUFBNEQ7QUFDeEQscUJBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIscUJBQWpCO0FBQ0EscUJBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxrQkFBaEMsSUFBc0QsQ0FBdEQ7QUFDSDtBQUNKOzs7aUNBQ1E7QUFDTCxpQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGlCQUFoQyxHQUFvRCxLQUFLLEdBQUwsS0FBYSxLQUFLLFVBQXRFO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixZQUFqQjtBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsY0FBaEMsR0FBaUQsSUFBSSxJQUFKLEVBQWpEO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixtQkFBakIsQ0FBcUMsS0FBSyxXQUExQztBQUNIOzs7NEJBQ1U7QUFDUCxtQkFBTyxjQUFQO0FBQ0g7Ozs7RUE5QjZCLGU7O0lBZ0NyQixZLFdBQUEsWTs7Ozs7Ozs7Ozs7a0NBQ0M7QUFDTixpQkFBSyxVQUFMLEdBQWtCLEtBQUssR0FBTCxFQUFsQjtBQUNBLGlCQUFLLFdBQUwsQ0FBaUIsWUFBakI7QUFDQSxpQkFBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLGlCQUFoQyxHQUFvRCxLQUFLLEdBQUwsS0FBYSxLQUFLLFVBQXRFO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixtQkFBakIsQ0FBcUMsS0FBSyxXQUExQyxFQUF1RCxLQUFLLFdBQUwsQ0FBaUIsY0FBeEU7QUFDSDs7O2lDQUlRO0FBQ0w7QUFDSDs7OzRCQUxVO0FBQ1AsbUJBQU8sY0FBUDtBQUNIOzs7O0VBVDZCLGU7O0lBY3JCLGlCLFdBQUEsaUI7Ozs7Ozs7Ozs7OzRCQUNFO0FBQ1AsbUJBQU8sbUJBQVA7QUFDSDs7OztFQUhrQyxZOztJQUsxQixXLFdBQUEsVzs7O0FBQ1QseUJBQVksVUFBWixFQUF3QixhQUF4QixFQUF1QztBQUFBOztBQUFBLGdJQUM3QixVQUQ2Qjs7QUFFbkMsZ0JBQUssY0FBTCxHQUFzQixhQUF0QjtBQUZtQztBQUd0Qzs7OztrQ0FDUztBQUNOLGlCQUFLLFdBQUwsQ0FBaUIsY0FBakIsQ0FBZ0MsY0FBaEMsR0FBaUQsSUFBSSxJQUFKLEVBQWpEO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixnQkFBakIsQ0FBa0MsS0FBSyxXQUF2QyxFQUFvRCxLQUFLLGNBQXpEO0FBQ0E7QUFDSDs7OzRCQUNVO0FBQ1AsbUJBQU8sYUFBUDtBQUNIOzs7O0VBWjRCLFk7O0lBZVosVTtBQUNqQjs7Ozs7Ozs7QUFRQSx3QkFBWSxZQUFaLEVBQTBCLFVBQTFCLEVBQXNDLFlBQXRDLEVBQW9ELE1BQXBELEVBQTRELFNBQTVELEVBQXVFO0FBQUE7O0FBQ25FLFlBQUksT0FBTyxZQUFQLEtBQXdCLFFBQXhCLElBQW9DLGFBQWEsSUFBYixHQUFvQixNQUFwQixLQUErQixDQUF2RSxFQUEwRTtBQUN0RSxrQkFBTSxJQUFJLDZCQUFKLENBQXNCLHVCQUF0QixDQUFOO0FBQ0g7QUFDRCxZQUFJLENBQUMsVUFBTCxFQUFpQjtBQUNiLGtCQUFNLElBQUksNkJBQUosQ0FBc0IscUJBQXRCLENBQU47QUFDSDtBQUNELFlBQUksUUFBTyxNQUFQLHlDQUFPLE1BQVAsT0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUIsa0JBQU0sSUFBSSw2QkFBSixDQUFzQixpQkFBdEIsQ0FBTjtBQUNIO0FBQ0QsWUFBSSxDQUFDLFNBQUwsRUFBZ0I7QUFDWixpQkFBSyxPQUFMLEdBQWUsa0JBQWY7QUFDSCxTQUZELE1BRU87QUFDSCxpQkFBSyxPQUFMLEdBQWUsU0FBZjtBQUNIOztBQUVELGFBQUssY0FBTCxHQUFzQixJQUFJLDZCQUFKLEVBQXRCO0FBQ0EsYUFBSyxhQUFMLEdBQXFCLFlBQXJCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLFVBQW5CO0FBQ0EsYUFBSyxhQUFMLEdBQXFCLFlBQXJCO0FBQ0EsYUFBSyxlQUFMLEdBQXVCLE1BQXZCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsdUJBQVcsS0FBSyxlQUFoQixFQUFpQyxLQUFLLE9BQXRDLEVBQStDLFNBQS9DLENBQWY7QUFDQSxhQUFLLGlCQUFMLEdBQXlCLGlDQUF6QjtBQUNBLGFBQUssaUJBQUwsR0FBeUIsaUNBQXpCOztBQUVBLGFBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNBLGFBQUssWUFBTCxHQUFvQixLQUFwQjtBQUNBLGFBQUssV0FBTCxHQUFtQixNQUFuQjs7QUFFQTs7Ozs7Ozs7QUFRQSxhQUFLLG1CQUFMLEdBQTJCLEtBQTNCOztBQUVBLGFBQUssV0FBTCxHQUNJLEtBQUssYUFBTCxHQUNBLEtBQUssbUJBQUwsR0FDQSxLQUFLLGdCQUFMLEdBQ0EsS0FBSyxxQkFBTCxHQUNBLEtBQUsscUJBQUwsR0FDQSxLQUFLLHdCQUFMLEdBQ0EsS0FBSyxtQkFBTCxHQUNBLEtBQUssbUJBQUwsR0FDQSxLQUFLLG9CQUFMLEdBQ0EsS0FBSyxtQkFBTCxHQUNBLEtBQUssbUJBQUwsR0FBMkIsWUFBTSxDQUNoQyxDQVpMO0FBYUg7Ozs7MENBa0JpQjtBQUNkLGdCQUFHLEtBQUssWUFBUixFQUFzQjtBQUNsQixvQkFBSSxhQUFhLEtBQUssWUFBTCxDQUFrQixjQUFsQixHQUFtQyxDQUFuQyxDQUFqQjtBQUNBLG9CQUFHLFVBQUgsRUFBZTtBQUNYLCtCQUFXLE9BQVgsR0FBcUIsS0FBckI7QUFDSDtBQUNKO0FBQ0o7OzsyQ0FDa0I7QUFDZixnQkFBRyxLQUFLLFlBQVIsRUFBc0I7QUFDbEIsb0JBQUksYUFBYSxLQUFLLFlBQUwsQ0FBa0IsY0FBbEIsR0FBbUMsQ0FBbkMsQ0FBakI7QUFDQSxvQkFBRyxVQUFILEVBQWU7QUFDWCwrQkFBVyxPQUFYLEdBQXFCLElBQXJCO0FBQ0g7QUFDSjtBQUNKOzs7MkNBQ2tCO0FBQ2YsZ0JBQUksS0FBSyxrQkFBVCxFQUE2QjtBQUN6QixvQkFBSSxhQUFhLEtBQUssa0JBQUwsQ0FBd0IsU0FBeEIsR0FBb0MsQ0FBcEMsQ0FBakI7QUFDQSxvQkFBRyxVQUFILEVBQWU7QUFDWCwrQkFBVyxPQUFYLEdBQXFCLEtBQXJCO0FBQ0g7QUFDSjtBQUNKOzs7NENBQ21CO0FBQ2hCLGdCQUFJLEtBQUssa0JBQVQsRUFBNkI7QUFDekIsb0JBQUksYUFBYSxLQUFLLGtCQUFMLENBQXdCLFNBQXhCLEdBQW9DLENBQXBDLENBQWpCO0FBQ0Esb0JBQUcsVUFBSCxFQUFlO0FBQ1gsK0JBQVcsT0FBWCxHQUFxQixJQUFyQjtBQUNIO0FBQ0o7QUFDSjs7OzBDQUNpQjtBQUNkLGdCQUFJLEtBQUssWUFBVCxFQUF1QjtBQUNuQixvQkFBSSxhQUFhLEtBQUssWUFBTCxDQUFrQixjQUFsQixHQUFtQyxDQUFuQyxDQUFqQjtBQUNBLG9CQUFHLFVBQUgsRUFBZTtBQUNYLCtCQUFXLE9BQVgsR0FBcUIsS0FBckI7QUFDSDtBQUNKO0FBQ0o7OzsyQ0FDa0I7QUFDZixnQkFBSSxLQUFLLFlBQVQsRUFBdUI7QUFDbkIsb0JBQUksYUFBYSxLQUFLLFlBQUwsQ0FBa0IsY0FBbEIsR0FBbUMsQ0FBbkMsQ0FBakI7QUFDQSxvQkFBRyxVQUFILEVBQWU7QUFDWCwrQkFBVyxPQUFYLEdBQXFCLElBQXJCO0FBQ0g7QUFDSjtBQUNKOzs7MkNBQ2tCO0FBQ2YsZ0JBQUksS0FBSyxrQkFBVCxFQUE2QjtBQUN6QixvQkFBSSxhQUFhLEtBQUssa0JBQUwsQ0FBd0IsU0FBeEIsR0FBb0MsQ0FBcEMsQ0FBakI7QUFDQSxvQkFBRyxVQUFILEVBQWU7QUFDWCwrQkFBVyxPQUFYLEdBQXFCLEtBQXJCO0FBQ0g7QUFDSjtBQUNKOzs7NENBQ21CO0FBQ2hCLGdCQUFJLEtBQUssa0JBQVQsRUFBNkI7QUFDekIsb0JBQUksYUFBYSxLQUFLLGtCQUFMLENBQXdCLFNBQXhCLEdBQW9DLENBQXBDLENBQWpCO0FBQ0Esb0JBQUcsVUFBSCxFQUFlO0FBQ1gsK0JBQVcsT0FBWCxHQUFxQixJQUFyQjtBQUNIO0FBQ0o7QUFDSjtBQUNEOzs7Ozs7O2dDQXlNUSxTLEVBQVc7QUFDZixnQkFBSTtBQUNBLHFCQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLENBQUMsS0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBQVksSUFBMUIsR0FBaUMsTUFBbEMsSUFBNEMsTUFBNUMsR0FBcUQsVUFBVSxJQUFqRjtBQUNBLG9CQUFJLEtBQUssTUFBTCxJQUFlLEtBQUssTUFBTCxDQUFZLE1BQS9CLEVBQXVDO0FBQ25DLHlCQUFLLE1BQUwsQ0FBWSxNQUFaO0FBQ0g7QUFDSixhQUxELFNBS1U7QUFDTixxQkFBSyxNQUFMLEdBQWMsU0FBZDtBQUNBLG9CQUFJLFVBQVUsT0FBZCxFQUF1QjtBQUNuQix3QkFBSTtBQUNBLGtDQUFVLE9BQVY7QUFDSCxxQkFGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVO0FBQ1IsNkJBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsVUFBVSxJQUFWLEdBQWlCLGlCQUFuQyxFQUFzRCxDQUF0RDtBQUNBLDhCQUFNLENBQU4sQ0FGUSxDQUVDO0FBQ1o7QUFDSjtBQUNKO0FBQ0o7OztrREFFeUI7QUFDdEIsZ0JBQUksbUJBQW1CLElBQUksbUJBQUosQ0FBaUIsS0FBSyxPQUF0QixFQUErQixLQUFLLGFBQXBDLEVBQW1ELEtBQUssYUFBeEQsRUFBdUUsS0FBSyxlQUE1RSxFQUE2RixLQUFLLHdCQUFsRyxDQUF2QjtBQUNBLDZCQUFpQixXQUFqQixHQUErQixrQkFBTSxJQUFOLEVBQVksS0FBSyxtQkFBakIsQ0FBL0I7QUFDQSw2QkFBaUIsVUFBakIsR0FBOEIsa0JBQU0sSUFBTixFQUFZLEtBQUssa0JBQWpCLENBQTlCO0FBQ0EsNkJBQWlCLFlBQWpCLEdBQWdDLGtCQUFNLElBQU4sRUFBWSxLQUFLLG9CQUFqQixDQUFoQztBQUNBLDZCQUFpQixjQUFqQixHQUFrQyxrQkFBTSxJQUFOLEVBQVksS0FBSyxzQkFBakIsQ0FBbEM7QUFDQSw2QkFBaUIsUUFBakIsR0FBNEIsa0JBQU0sSUFBTixFQUFZLEtBQUssZ0JBQWpCLENBQTVCO0FBQ0EsNkJBQWlCLGNBQWpCLEdBQWtDLGtCQUFNLElBQU4sRUFBWSxLQUFLLHNCQUFqQixDQUFsQzs7QUFFQSxpQkFBSyxpQkFBTCxHQUF5QixnQkFBekI7O0FBRUEsbUJBQU8sZ0JBQVA7QUFDSDs7OzhDQUVxQjtBQUNsQixpQkFBSyxNQUFMLENBQVksb0JBQVo7QUFDSDs7OzJDQUNrQixHLEVBQUssVSxFQUFZO0FBQ2hDLGlCQUFLLE1BQUwsQ0FBWSxtQkFBWixDQUFnQyxHQUFoQyxFQUFxQyxVQUFyQztBQUNIOzs7K0NBQ3NCO0FBQ25CLGlCQUFLLE1BQUwsQ0FBWSxxQkFBWjtBQUNIOzs7aURBQ3dCO0FBQ3JCLGlCQUFLLE1BQUwsQ0FBWSxjQUFaO0FBQ0g7Ozt5Q0FDZ0IsQyxFQUFHO0FBQ2hCLGlCQUFLLE1BQUwsQ0FBWSxpQkFBWixDQUE4QixDQUE5QjtBQUNIOzs7aURBQ3dCLENBQ3hCOzs7OENBQ3FCLGEsRUFBZTtBQUNqQyxtQkFBTyxJQUFJLGlCQUFKLENBQXNCLGFBQXRCLENBQVA7QUFDSDs7O2tDQUNTO0FBQ04sZ0JBQUksT0FBTyxJQUFYO0FBQ0EsZ0JBQUksTUFBTSxJQUFJLElBQUosRUFBVjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsZ0JBQXBCLEdBQXVDLEdBQXZDO0FBQ0EsaUJBQUssaUJBQUwsR0FBeUIsSUFBSSxPQUFKLEVBQXpCOztBQUVBLGlCQUFLLEdBQUwsR0FBVyxLQUFLLHFCQUFMLENBQTJCO0FBQ2xDLDRCQUFZLEtBQUssV0FEaUI7QUFFbEMsb0NBQW9CLE9BRmM7QUFHbEMsK0JBQWUsU0FIbUI7QUFJbEMsOEJBQWM7QUFKb0IsYUFBM0IsRUFLUjtBQUNDLDBCQUFVLENBQ047QUFDSSw4QkFBVTtBQURkLGlCQURNO0FBRFgsYUFMUSxDQUFYOztBQWFBLGlCQUFLLEdBQUwsQ0FBUyxPQUFULEdBQW1CLGtCQUFNLElBQU4sRUFBWSxLQUFLLFFBQWpCLENBQW5CO0FBQ0EsaUJBQUssR0FBTCxDQUFTLGNBQVQsR0FBMEIsa0JBQU0sSUFBTixFQUFZLEtBQUssZUFBakIsQ0FBMUI7QUFDQSxpQkFBSyxHQUFMLENBQVMsMEJBQVQsR0FBc0Msa0JBQU0sSUFBTixFQUFZLEtBQUssaUJBQWpCLENBQXRDOztBQUVBLGlCQUFLLE9BQUwsQ0FBYSxJQUFJLG1CQUFKLENBQXdCLElBQXhCLENBQWI7QUFDSDs7O2lDQUNRO0FBQ0wsa0JBQU0sSUFBSSxnQ0FBSixDQUF5Qiw2REFBekIsQ0FBTjtBQUNIOzs7aUNBQ1E7QUFDTCxpQkFBSyxNQUFMLENBQVksTUFBWjtBQUNIO0FBQ0Q7Ozs7Ozs7OENBSXNCO0FBQ2xCLGdCQUFJLFlBQVksSUFBSSxJQUFKLEVBQWhCO0FBQ0EsZ0JBQUksS0FBSyxHQUFMLElBQVksS0FBSyxHQUFMLENBQVMsY0FBVCxLQUE0QixRQUF4QyxJQUFvRCxLQUFLLGtCQUE3RCxFQUFpRjtBQUM3RSxvQkFBSSxjQUFjLEtBQUssa0JBQUwsQ0FBd0IsY0FBeEIsRUFBbEI7QUFDQSx1QkFBTyxLQUFLLEdBQUwsQ0FBUyxRQUFULENBQWtCLFlBQVksQ0FBWixDQUFsQixFQUFrQyxJQUFsQyxDQUF1QyxVQUFTLEtBQVQsRUFBZTtBQUNqRCx3QkFBSSxhQUFhLDBDQUEyQixTQUEzQixFQUFzQyxLQUF0QyxFQUE2QyxjQUE3QyxDQUFqQjtBQUNBLHdCQUFJLENBQUMsVUFBTCxFQUFpQjtBQUNiLDhCQUFNLElBQUksS0FBSixDQUFVLHFEQUFWLENBQU47QUFDSDtBQUNELDJCQUFPLFVBQVA7QUFDSCxpQkFORixDQUFQO0FBT0gsYUFURCxNQVNPO0FBQ0gsdUJBQU8sUUFBUSxNQUFSLENBQWUsSUFBSSx3QkFBSixFQUFmLENBQVA7QUFDSDtBQUNKOztBQUlEOzs7Ozs7OzRDQUlvQjtBQUNoQixnQkFBSSxZQUFZLElBQUksSUFBSixFQUFoQjtBQUNBLGdCQUFJLEtBQUssR0FBTCxJQUFZLEtBQUssR0FBTCxDQUFTLGNBQVQsS0FBNEIsUUFBeEMsSUFBb0QsS0FBSyxZQUE3RCxFQUEyRTtBQUN2RSxvQkFBSSxjQUFjLEtBQUssWUFBTCxDQUFrQixjQUFsQixFQUFsQjtBQUNBLHVCQUFPLEtBQUssR0FBTCxDQUFTLFFBQVQsQ0FBa0IsWUFBWSxDQUFaLENBQWxCLEVBQWtDLElBQWxDLENBQXVDLFVBQVMsS0FBVCxFQUFlO0FBQ2pELHdCQUFJLGFBQWEsMENBQTJCLFNBQTNCLEVBQXNDLEtBQXRDLEVBQTZDLGFBQTdDLENBQWpCO0FBQ0Esd0JBQUksQ0FBQyxVQUFMLEVBQWlCO0FBQ2IsOEJBQU0sSUFBSSxLQUFKLENBQVUscURBQVYsQ0FBTjtBQUNIO0FBQ0QsMkJBQU8sVUFBUDtBQUNILGlCQU5GLENBQVA7QUFPSCxhQVRELE1BU087QUFDSCx1QkFBTyxRQUFRLE1BQVIsQ0FBZSxJQUFJLHdCQUFKLEVBQWYsQ0FBUDtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7OENBSXNCO0FBQ2xCLGdCQUFJLFlBQVksSUFBSSxJQUFKLEVBQWhCO0FBQ0EsZ0JBQUksS0FBSyxHQUFMLElBQVksS0FBSyxHQUFMLENBQVMsY0FBVCxLQUE0QixRQUF4QyxJQUFvRCxLQUFLLGtCQUE3RCxFQUFpRjtBQUM3RSxvQkFBSSxjQUFjLEtBQUssa0JBQUwsQ0FBd0IsY0FBeEIsRUFBbEI7QUFDQSx1QkFBTyxLQUFLLEdBQUwsQ0FBUyxRQUFULENBQWtCLFlBQVksQ0FBWixDQUFsQixFQUFrQyxJQUFsQyxDQUF1QyxVQUFTLEtBQVQsRUFBZ0I7QUFDbEQsd0JBQUksYUFBYSwwQ0FBMkIsU0FBM0IsRUFBc0MsS0FBdEMsRUFBNkMsY0FBN0MsQ0FBakI7QUFDQSx3QkFBSSxDQUFDLFVBQUwsRUFBaUI7QUFDYiw4QkFBTSxJQUFJLEtBQUosQ0FBVSxxREFBVixDQUFOO0FBQ0g7QUFDRCwyQkFBTyxVQUFQO0FBQ1gsaUJBTk0sQ0FBUDtBQU9ILGFBVEQsTUFTTztBQUNILHVCQUFPLFFBQVEsTUFBUixDQUFlLElBQUksd0JBQUosRUFBZixDQUFQO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7Ozs0Q0FJb0I7QUFDaEIsZ0JBQUksWUFBWSxJQUFJLElBQUosRUFBaEI7QUFDQSxnQkFBSSxLQUFLLEdBQUwsSUFBWSxLQUFLLEdBQUwsQ0FBUyxjQUFULEtBQTRCLFFBQXhDLElBQW9ELEtBQUssWUFBN0QsRUFBMkU7QUFDdkUsb0JBQUksY0FBYyxLQUFLLFlBQUwsQ0FBa0IsY0FBbEIsRUFBbEI7QUFDQSx1QkFBTyxLQUFLLEdBQUwsQ0FBUyxRQUFULENBQWtCLFlBQVksQ0FBWixDQUFsQixFQUFrQyxJQUFsQyxDQUF1QyxVQUFTLEtBQVQsRUFBZTtBQUNqRCx3QkFBSSxhQUFhLDBDQUEyQixTQUEzQixFQUFzQyxLQUF0QyxFQUE2QyxhQUE3QyxDQUFqQjtBQUNBLHdCQUFJLENBQUMsVUFBTCxFQUFpQjtBQUNiLDhCQUFNLElBQUksS0FBSixDQUFVLHFEQUFWLENBQU47QUFDSDtBQUNELDJCQUFPLFVBQVA7QUFDSCxpQkFORixDQUFQO0FBT0gsYUFURCxNQVNPO0FBQ0gsdUJBQU8sUUFBUSxNQUFSLENBQWUsSUFBSSx3QkFBSixFQUFmLENBQVA7QUFDSDtBQUNKOzs7d0NBRWUsRyxFQUFLO0FBQ2pCLGlCQUFLLE1BQUwsQ0FBWSxjQUFaLENBQTJCLEdBQTNCO0FBQ0g7OzswQ0FFaUIsRyxFQUFLO0FBQ25CLGlCQUFLLE1BQUwsQ0FBWSxnQkFBWixDQUE2QixHQUE3QjtBQUNIOztBQUVEOzs7Ozs7aUNBR1MsRyxFQUFLO0FBQ1YsZ0JBQUksSUFBSSxPQUFKLENBQVksTUFBWixHQUFxQixDQUF6QixFQUE0QjtBQUN4QixxQkFBSyxPQUFMLENBQWEsSUFBYixDQUFrQixtQ0FBbUMsSUFBSSxLQUFKLENBQVUsSUFBN0MsR0FBb0QsU0FBcEQsR0FBZ0UsSUFBSSxLQUFKLENBQVUsRUFBMUUsR0FBK0UsS0FBL0UsR0FDZCxJQUFJLE9BQUosQ0FBWSxHQUFaLENBQWdCO0FBQUEsMkJBQVUsT0FBTyxFQUFqQjtBQUFBLGlCQUFoQixFQUFxQyxJQUFyQyxDQUEwQyxHQUExQyxDQURKO0FBRUg7QUFDRCxnQkFBSSxJQUFJLEtBQUosQ0FBVSxJQUFWLEtBQW1CLE9BQW5CLElBQThCLEtBQUssbUJBQXZDLEVBQTREO0FBQ3hELHFCQUFLLG1CQUFMLENBQXlCLFNBQXpCLEdBQXFDLElBQUksT0FBSixDQUFZLENBQVosQ0FBckM7QUFDQSxxQkFBSyxrQkFBTCxHQUEwQixJQUFJLE9BQUosQ0FBWSxDQUFaLENBQTFCO0FBQ0gsYUFIRCxNQUdPLElBQUksSUFBSSxLQUFKLENBQVUsSUFBVixLQUFtQixPQUFuQixJQUE4QixLQUFLLG1CQUF2QyxFQUE0RDtBQUMvRCxxQkFBSyxtQkFBTCxDQUF5QixTQUF6QixHQUFxQyxJQUFJLE9BQUosQ0FBWSxDQUFaLENBQXJDO0FBQ0EscUJBQUssa0JBQUwsR0FBMEIsSUFBSSxPQUFKLENBQVksQ0FBWixDQUExQjtBQUNIO0FBQ0QsaUJBQUssb0JBQUwsQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBSSxPQUFKLENBQVksQ0FBWixDQUFoQztBQUNIOzs7dUNBQ2M7QUFDWCxnQkFBSSxLQUFLLG1CQUFULEVBQThCO0FBQzFCLHFCQUFLLG1CQUFMLENBQXlCLFNBQXpCLEdBQXFDLElBQXJDO0FBQ0g7QUFDRCxnQkFBSSxLQUFLLG1CQUFULEVBQThCO0FBQzFCLHFCQUFLLG1CQUFMLENBQXlCLFNBQXpCLEdBQXFDLElBQXJDO0FBQ0EscUJBQUssa0JBQUwsR0FBMEIsSUFBMUI7QUFDSDtBQUNKOzs7dUNBQ2M7QUFDWCxnQkFBSTtBQUNBLG9CQUFJLEtBQUssWUFBTCxJQUFxQixDQUFDLEtBQUssbUJBQS9CLEVBQW9EO0FBQ2hELDRDQUFZLEtBQUssWUFBakI7QUFDQSx5QkFBSyxZQUFMLEdBQW9CLElBQXBCO0FBQ0EseUJBQUssbUJBQUwsR0FBMkIsS0FBM0I7QUFDSDtBQUNKLGFBTkQsU0FNVTtBQUNOLG9CQUFJO0FBQ0Esd0JBQUksS0FBSyxHQUFULEVBQWM7QUFDViw2QkFBSyxHQUFMLENBQVMsS0FBVDtBQUNIO0FBQ0osaUJBSkQsQ0FJRSxPQUFPLENBQVAsRUFBVTtBQUNSO0FBQ0gsaUJBTkQsU0FNVTtBQUNOLHlCQUFLLEdBQUwsR0FBVyxJQUFYO0FBQ0g7QUFDSjtBQUNKOzs7aURBRXdCO0FBQ3JCLGdCQUFJLE9BQU8sSUFBWDtBQUNBLGdCQUFJLG1CQUFtQixFQUF2Qjs7QUFFQSxnQkFBSSxLQUFLLFlBQVQsRUFBdUI7QUFDbkIsb0JBQUksbUJBQW1CLEVBQXZCO0FBQ0Esb0JBQUksT0FBTyxLQUFLLGlCQUFaLEtBQWtDLFdBQXRDLEVBQW1EO0FBQy9DLHFDQUFpQixnQkFBakIsR0FBb0MsQ0FBQyxDQUFDLEtBQUssaUJBQTNDO0FBQ0g7QUFDRCxvQkFBSSxPQUFPLElBQVAsQ0FBWSxnQkFBWixFQUE4QixNQUE5QixHQUF1QyxDQUEzQyxFQUE4QztBQUMxQyxxQ0FBaUIsS0FBakIsR0FBeUIsZ0JBQXpCO0FBQ0gsaUJBRkQsTUFFTztBQUNILHFDQUFpQixLQUFqQixHQUF5QixJQUF6QjtBQUNIO0FBQ0osYUFWRCxNQVVPO0FBQ0gsaUNBQWlCLEtBQWpCLEdBQXlCLEtBQXpCO0FBQ0g7O0FBRUQsZ0JBQUksS0FBSyxZQUFULEVBQXVCO0FBQ25CLG9CQUFJLG1CQUFtQixFQUF2QjtBQUNBLG9CQUFJLG1CQUFtQixFQUF2QjtBQUNBLG9CQUFJLG9CQUFvQixFQUF4QjtBQUNBLG9CQUFJLHVCQUF1QixFQUEzQjs7QUFFQTtBQUNBLG9CQUFJLE9BQU8sS0FBSyxnQkFBWixLQUFpQyxXQUFyQyxFQUFrRDtBQUM5QyxxQ0FBaUIsS0FBakIsR0FBeUIsS0FBSyxnQkFBOUI7QUFDSDtBQUNELG9CQUFJLE9BQU8sS0FBSyxjQUFaLEtBQStCLFdBQW5DLEVBQWdEO0FBQzVDLHFDQUFpQixHQUFqQixHQUF1QixLQUFLLGNBQTVCO0FBQ0g7QUFDRCxvQkFBSSxPQUFPLEtBQUssY0FBWixLQUErQixXQUFuQyxFQUFnRDtBQUM1QyxxQ0FBaUIsR0FBakIsR0FBdUIsS0FBSyxjQUE1QjtBQUNIO0FBQ0Q7QUFDQSxvQkFBSSxPQUFPLEtBQUssaUJBQVosS0FBa0MsV0FBdEMsRUFBbUQ7QUFDL0Msc0NBQWtCLEtBQWxCLEdBQTBCLEtBQUssaUJBQS9CO0FBQ0g7QUFDRCxvQkFBSSxPQUFPLEtBQUssZUFBWixLQUFnQyxXQUFwQyxFQUFpRDtBQUM3QyxzQ0FBa0IsR0FBbEIsR0FBd0IsS0FBSyxlQUE3QjtBQUNIO0FBQ0Qsb0JBQUksT0FBTyxLQUFLLGVBQVosS0FBZ0MsV0FBcEMsRUFBaUQ7QUFDN0Msc0NBQWtCLEdBQWxCLEdBQXdCLEtBQUssZUFBN0I7QUFDSDtBQUNELG9CQUFHLE9BQU8sSUFBUCxDQUFZLGdCQUFaLEVBQThCLE1BQTlCLEdBQXVDLENBQXZDLElBQTRDLE9BQU8sSUFBUCxDQUFZLGlCQUFaLEVBQStCLE1BQS9CLEdBQXdDLENBQXZGLEVBQTBGO0FBQ3RGLHFDQUFpQixLQUFqQixHQUF5QixnQkFBekI7QUFDQSxxQ0FBaUIsTUFBakIsR0FBMEIsaUJBQTFCO0FBQ0g7QUFDRDtBQUNBLG9CQUFJLE9BQU8sS0FBSyxlQUFaLEtBQWdDLFdBQXBDLEVBQWlEO0FBQzdDLHlDQUFxQixLQUFyQixHQUE2QixLQUFLLGVBQWxDO0FBQ0g7QUFDRCxvQkFBSSxPQUFPLEtBQUssa0JBQVosS0FBbUMsV0FBdkMsRUFBb0Q7QUFDaEQseUNBQXFCLEdBQXJCLEdBQTJCLEtBQUssa0JBQWhDO0FBQ0g7QUFDRCxvQkFBSSxPQUFPLEtBQUssa0JBQVosS0FBbUMsV0FBdkMsRUFBb0Q7QUFDaEQseUNBQXFCLEdBQXJCLEdBQTJCLEtBQUssa0JBQWhDO0FBQ0g7QUFDRCxvQkFBRyxPQUFPLElBQVAsQ0FBWSxvQkFBWixFQUFrQyxNQUFsQyxHQUEyQyxDQUE5QyxFQUFpRDtBQUM3QyxxQ0FBaUIsU0FBakIsR0FBNkIsb0JBQTdCO0FBQ0g7O0FBRUQ7QUFDQSxvQkFBRyxLQUFLLFdBQUwsS0FBcUIsTUFBckIsSUFBK0IsS0FBSyxXQUFMLEtBQXFCLGFBQXZELEVBQXNFO0FBQ2xFLHlCQUFLLFdBQUwsR0FBbUIsTUFBbkI7QUFDSDtBQUNELGlDQUFpQixVQUFqQixHQUE4QixLQUFLLFdBQW5DOztBQUVBO0FBQ0Esb0JBQUksT0FBTyxJQUFQLENBQVksZ0JBQVosRUFBOEIsTUFBOUIsR0FBdUMsQ0FBM0MsRUFBOEM7QUFDMUMscUNBQWlCLEtBQWpCLEdBQXlCLGdCQUF6QjtBQUNILGlCQUZELE1BRU87QUFDSCxxQ0FBaUIsS0FBakIsR0FBeUIsSUFBekI7QUFDSDtBQUNKOztBQUVELG1CQUFPLGdCQUFQO0FBQ0g7Ozs0QkFua0JtQjtBQUNoQixtQkFBTyxLQUFLLGNBQVo7QUFDSDs7OzRCQUNZO0FBQ1QsbUJBQU8sS0FBSyxPQUFaO0FBQ0g7QUFDRDs7Ozs7Ozs7NEJBS2tCO0FBQ2QsbUJBQU8sS0FBSyxZQUFaO0FBQ0gsUzs7QUE0TUQ7Ozs7MEJBSWdCLEssRUFBTztBQUNuQixpQkFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsaUJBQUssbUJBQUwsR0FBMkIsSUFBM0I7QUFDSDtBQUNEOzs7Ozs7NEJBbk53QjtBQUNwQixtQkFBTyxLQUFLLGtCQUFaO0FBQ0g7OzswQkFxRWdCLE8sRUFBUztBQUN0QixpQkFBSyxhQUFMLEdBQXFCLE9BQXJCO0FBQ0g7QUFDRDs7Ozs7Ozs7MEJBS2UsTyxFQUFTO0FBQ3BCLGlCQUFLLFdBQUwsR0FBbUIsT0FBbkI7QUFDSDtBQUNEOzs7Ozs7OzBCQUlvQixPLEVBQVM7QUFDekIsaUJBQUssZ0JBQUwsR0FBd0IsT0FBeEI7QUFDSDtBQUNEOzs7Ozs7OzswQkFLdUIsTyxFQUFTO0FBQzVCLGlCQUFLLG1CQUFMLEdBQTJCLE9BQTNCO0FBQ0g7QUFDRDs7Ozs7OzswQkFJeUIsTyxFQUFTO0FBQzlCLGlCQUFLLHFCQUFMLEdBQTZCLE9BQTdCO0FBQ0g7QUFDRDs7Ozs7Ozs7OzBCQU15QixPLEVBQVM7QUFDOUIsaUJBQUsscUJBQUwsR0FBNkIsT0FBN0I7QUFDSDtBQUNEOzs7Ozs7Ozs7OzswQkFRNEIsTyxFQUFTO0FBQ2pDLGlCQUFLLHdCQUFMLEdBQWdDLE9BQWhDO0FBQ0g7QUFDRDs7Ozs7OzswQkFJdUIsTyxFQUFTO0FBQzVCLGlCQUFLLG1CQUFMLEdBQTJCLE9BQTNCO0FBQ0g7QUFDRDs7Ozs7OzswQkFJdUIsTyxFQUFTO0FBQzVCLGlCQUFLLG1CQUFMLEdBQTJCLE9BQTNCO0FBQ0g7QUFDRDs7Ozs7Ozs7OzswQkFPd0IsTyxFQUFTO0FBQzdCLGlCQUFLLG9CQUFMLEdBQTRCLE9BQTVCO0FBQ0g7QUFDRDs7Ozs7OzswQkFJdUIsTyxFQUFTO0FBQzVCLGlCQUFLLG1CQUFMLEdBQTJCLE9BQTNCO0FBQ0g7QUFDRDs7Ozs7Ozs7MEJBS3VCLE8sRUFBUztBQUM1QixpQkFBSyxtQkFBTCxHQUEyQixPQUEzQjtBQUNIOzs7MEJBRWUsSSxFQUFNO0FBQ2xCLGlCQUFLLFlBQUwsR0FBb0IsSUFBcEI7QUFDSDs7OzBCQUNvQixJLEVBQU07QUFDdkIsaUJBQUssaUJBQUwsR0FBeUIsSUFBekI7QUFDSDs7OzBCQUNlLEksRUFBTTtBQUNsQixpQkFBSyxZQUFMLEdBQW9CLElBQXBCO0FBQ0g7OzswQkFDcUIsUyxFQUFXO0FBQzdCLGlCQUFLLGtCQUFMLEdBQTBCLFNBQTFCO0FBQ0g7OzswQkFDcUIsUyxFQUFXO0FBQzdCLGlCQUFLLGtCQUFMLEdBQTBCLFNBQTFCO0FBQ0g7OzswQkFDa0IsUyxFQUFXO0FBQzFCLGlCQUFLLGVBQUwsR0FBdUIsU0FBdkI7QUFDSDs7OzBCQUNpQixLLEVBQU87QUFDckIsaUJBQUssY0FBTCxHQUFzQixLQUF0QjtBQUNIOzs7MEJBQ2lCLEssRUFBTztBQUNyQixpQkFBSyxjQUFMLEdBQXNCLEtBQXRCO0FBQ0g7OzswQkFDbUIsSyxFQUFPO0FBQ3ZCLGlCQUFLLGdCQUFMLEdBQXdCLEtBQXhCO0FBQ0g7OzswQkFDa0IsTSxFQUFRO0FBQ3ZCLGlCQUFLLGVBQUwsR0FBdUIsTUFBdkI7QUFDSDs7OzBCQUNrQixNLEVBQVE7QUFDdkIsaUJBQUssZUFBTCxHQUF1QixNQUF2QjtBQUNIOzs7MEJBQ29CLE0sRUFBUTtBQUN6QixpQkFBSyxpQkFBTCxHQUF5QixNQUF6QjtBQUNIOzs7MEJBQ2MsSSxFQUFNO0FBQ2pCLGlCQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDSDs7OzBCQVlzQixPLEVBQVM7QUFDNUIsaUJBQUssbUJBQUwsR0FBMkIsT0FBM0I7QUFDSDs7OzBCQUNzQixPLEVBQVM7QUFDNUIsaUJBQUssbUJBQUwsR0FBMkIsT0FBM0I7QUFDSDtBQUNEOzs7Ozs7MEJBRzRCLEUsRUFBSTtBQUM1QixpQkFBSyx3QkFBTCxHQUFnQyxFQUFoQztBQUNIO0FBQ0Q7Ozs7OzswQkFHcUIsYSxFQUFlO0FBQ2hDLGlCQUFLLGlCQUFMLEdBQXlCLGFBQXpCO0FBQ0g7O0FBRUQ7Ozs7OzswQkFHcUIsYSxFQUFlO0FBQ2hDLGlCQUFLLGlCQUFMLEdBQXlCLGFBQXpCO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzswQkFNb0IsVSxFQUFZO0FBQzVCLGlCQUFLLGdCQUFMLEdBQXdCLFVBQXhCO0FBQ0g7O0FBRUQ7Ozs7Ozs7OzswQkFNb0IsVSxFQUFZO0FBQzVCLGlCQUFLLGdCQUFMLEdBQXdCLFVBQXhCO0FBQ0g7O0FBRUQ7Ozs7Ozs7MEJBSWtCLEksRUFBTTtBQUNwQixpQkFBSyxjQUFMLEdBQXNCLElBQXRCO0FBQ0g7Ozs7OztrQkF0VmdCLFU7Ozs7Ozs7Ozs7O1FDdGNMLDBCLEdBQUEsMEI7Ozs7QUFMaEI7Ozs7O0FBS08sU0FBUywwQkFBVCxDQUFvQyxTQUFwQyxFQUErQyxLQUEvQyxFQUFzRCxVQUF0RCxFQUFrRTtBQUNyRSxRQUFJLFlBQVksSUFBaEI7QUFDQSxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsZUFBTyxTQUFQO0FBQ0g7QUFDRCxRQUFJLGVBQWUsT0FBTyxJQUFQLENBQVksS0FBWixDQUFuQjtBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxhQUFhLE1BQWpDLEVBQXlDLEdBQXpDLEVBQThDO0FBQzFDLGdCQUFJLGNBQWMsTUFBTSxhQUFhLENBQWIsQ0FBTixDQUFsQjtBQUNBLGdCQUFJLFdBQUosRUFBaUI7QUFDYixvQkFBSSxjQUFjLENBQWxCO0FBQ0Esb0JBQUksYUFBYSxJQUFqQjtBQUNBLG9CQUFJLFFBQVEsSUFBWjtBQUNBLG9CQUFJLE9BQU8sSUFBWDtBQUNBLG9CQUFJLFlBQVksSUFBWixLQUFxQixNQUF6QixFQUFpQztBQUM3QjtBQUNBLHdCQUFJLE9BQU8sWUFBWSxXQUFuQixLQUFtQyxXQUFuQyxJQUFrRCxZQUFZLFNBQVosSUFBeUIsT0FBM0UsSUFBc0YsZUFBZSxhQUF6RyxFQUF3SDtBQUNwSCw0QkFBSSxPQUFPLFlBQVksZUFBbkIsS0FBdUMsV0FBM0MsRUFBd0Q7QUFDcEQseUNBQWEsWUFBWSxlQUF6QjtBQUNIO0FBQ0QsNEJBQUksT0FBTyxZQUFZLFdBQW5CLEtBQW1DLFdBQW5DLElBQWtELFlBQVksV0FBWixHQUEwQixDQUFoRixFQUFtRjtBQUMvRTtBQUNBLDBDQUFjLFlBQVksV0FBMUI7QUFDSDtBQUNELDRCQUFJLE9BQU8sWUFBWSxPQUFuQixLQUErQixXQUFuQyxFQUFnRDtBQUM1QyxvQ0FBUSxZQUFZLE9BQXBCO0FBQ0g7QUFDRCxvQ0FBWSxJQUFJLGFBQUosQ0FBa0IsU0FBbEIsRUFBNkIsV0FBN0IsRUFBMEMsWUFBWSxXQUF0RCxFQUFtRSxVQUFuRSxFQUErRSxLQUEvRSxFQUFzRixJQUF0RixFQUE0RixZQUFZLFNBQXhHLENBQVo7QUFDQTtBQUNILHFCQWJELE1BYU8sSUFBSSxPQUFPLFlBQVksZUFBbkIsS0FBdUMsV0FBdkMsSUFBc0QsWUFBWSxTQUFaLElBQXlCLE9BQS9FLElBQTBGLGVBQWUsY0FBN0csRUFBNkg7QUFDaEksNEJBQUksT0FBTyxZQUFZLGdCQUFuQixLQUF3QyxXQUE1QyxFQUF5RDtBQUNyRCx5Q0FBYSxZQUFZLGdCQUF6QjtBQUNIO0FBQ0QsNEJBQUksT0FBTyxZQUFZLFdBQW5CLEtBQW1DLFdBQW5DLElBQWtELFlBQVksV0FBWixHQUEwQixDQUFoRixFQUFtRjtBQUMvRTtBQUNBLDBDQUFjLFlBQVksV0FBMUI7QUFDSDtBQUNELDRCQUFJLE9BQU8sWUFBWSxrQkFBbkIsS0FBMEMsV0FBOUMsRUFBMkQ7QUFDdkQsbUNBQU8sWUFBWSxrQkFBbkI7QUFDSDtBQUNELG9DQUFZLElBQUksYUFBSixDQUFrQixTQUFsQixFQUE2QixXQUE3QixFQUEwQyxZQUFZLGVBQXRELEVBQXVFLFVBQXZFLEVBQW1GLElBQW5GLEVBQXlGLElBQXpGLEVBQStGLElBQS9GLEVBQXFHLFlBQVksYUFBakgsQ0FBWjtBQUNBO0FBQ0gscUJBYk0sTUFhQSxJQUFJLE9BQU8sWUFBWSxXQUFuQixLQUFtQyxXQUFuQyxJQUFrRCxZQUFZLFNBQVosSUFBeUIsT0FBM0UsSUFBc0YsZUFBZSxhQUF6RyxFQUF3SDtBQUMzSCw0QkFBSSxPQUFPLFlBQVksV0FBbkIsS0FBbUMsV0FBbkMsSUFBa0QsWUFBWSxXQUFaLEdBQTBCLENBQWhGLEVBQW1GO0FBQy9FO0FBQ0EsMENBQWMsWUFBWSxXQUExQjtBQUNIO0FBQ0QsNEJBQUksT0FBTyxZQUFZLE9BQW5CLEtBQStCLFdBQW5DLEVBQWdEO0FBQzVDLG9DQUFRLFlBQVksT0FBcEI7QUFDSDtBQUNELDRCQUFJLGdCQUFnQixJQUFwQjtBQUNBLDRCQUFJLE9BQU8sWUFBWSxpQkFBbkIsS0FBeUMsV0FBN0MsRUFBMEQ7QUFDdEQsNENBQWdCLFlBQVksaUJBQTVCO0FBQ0g7QUFDRCxvQ0FBWSxJQUFJLGFBQUosQ0FBa0IsU0FBbEIsRUFBNkIsV0FBN0IsRUFBMEMsWUFBWSxXQUF0RCxFQUFtRSxJQUFuRSxFQUF5RSxLQUF6RSxFQUFnRixJQUFoRixFQUFzRixZQUFZLFNBQWxHLEVBQTZHLElBQTdHLEVBQW1ILFlBQVksYUFBL0gsRUFBOEksSUFBOUksRUFBb0osYUFBcEosRUFBbUssSUFBbkssQ0FBWjtBQUNBO0FBQ0gscUJBZE0sTUFjQSxJQUFJLE9BQU8sWUFBWSxlQUFuQixLQUF1QyxXQUF2QyxJQUFzRCxZQUFZLFNBQVosSUFBeUIsT0FBL0UsSUFBMEYsZUFBZSxjQUE3RyxFQUE2SDtBQUNoSSw0QkFBSSxPQUFPLFlBQVksV0FBbkIsS0FBbUMsV0FBbkMsSUFBa0QsWUFBWSxXQUFaLEdBQTBCLENBQWhGLEVBQW1GO0FBQy9FO0FBQ0EsMENBQWMsWUFBWSxXQUExQjtBQUNIO0FBQ0QsNEJBQUksT0FBTyxZQUFZLGtCQUFuQixLQUEwQyxXQUE5QyxFQUEyRDtBQUN2RCxtQ0FBTyxZQUFZLGtCQUFuQjtBQUNIO0FBQ0QsNEJBQUksb0JBQW9CLElBQXhCO0FBQ0EsNEJBQUksT0FBTyxZQUFZLHFCQUFuQixLQUE2QyxXQUFqRCxFQUE4RDtBQUMxRCxnREFBb0IsWUFBWSxxQkFBaEM7QUFDSDtBQUNELG9DQUFZLElBQUksYUFBSixDQUFrQixTQUFsQixFQUE2QixXQUE3QixFQUEwQyxZQUFZLGVBQXRELEVBQXVFLElBQXZFLEVBQTZFLElBQTdFLEVBQW1GLElBQW5GLEVBQXlGLElBQXpGLEVBQStGLFlBQVksYUFBM0csRUFBMEgsSUFBMUgsRUFBZ0ksWUFBWSxhQUE1SSxFQUEySixJQUEzSixFQUFpSyxpQkFBakssQ0FBWjtBQUNBO0FBQ0g7QUFDSixpQkF6REQsTUF5RE8sSUFBSSxZQUFZLElBQVosS0FBcUIsWUFBekIsRUFBdUM7QUFDMUM7QUFDQTtBQUNBLHdCQUFJLE9BQU8sWUFBWSxXQUFuQixLQUFtQyxXQUFuQyxJQUFrRCxPQUFPLFlBQVksZUFBbkIsS0FBdUMsV0FBN0YsRUFBMEc7QUFDdEc7QUFDQSw0QkFBSSxPQUFPLFlBQVksZUFBbkIsS0FBdUMsV0FBM0MsRUFBd0Q7QUFDcEQseUNBQWEsWUFBWSxlQUF6QjtBQUNIO0FBQ0QsNEJBQUksWUFBWSxXQUFaLEdBQTBCLENBQTlCLEVBQWlDO0FBQzdCLDBDQUFjLFlBQVksV0FBMUI7QUFDSDtBQUNEO0FBQ0E7QUFDQSxvQ0FBWSxJQUFJLGFBQUosQ0FBa0IsU0FBbEIsRUFBNkIsV0FBN0IsRUFBMEMsWUFBWSxlQUF0RCxFQUF1RSxVQUF2RSxDQUFaO0FBQ0E7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQUNKO0FBQ0QsV0FBTyxTQUFQO0FBQ0g7O0FBRUQ7Ozs7SUFHTSxhO0FBQ0YsMkJBQVksU0FBWixFQUF1QixXQUF2QixFQUFvQyxZQUFwQyxFQUFrRCxVQUFsRCxFQUE4RCxlQUE5RCxFQUErRSxjQUEvRSxFQUErRixTQUEvRixFQUEwRyxhQUExRyxFQUF5SCxhQUF6SCxFQUF3SSxhQUF4SSxFQUF1SixhQUF2SixFQUFzSyxpQkFBdEssRUFBeUw7QUFBQTs7QUFDckwsYUFBSyxVQUFMLEdBQWtCLFNBQWxCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLFdBQXBCO0FBQ0EsYUFBSyxhQUFMLEdBQXFCLFlBQXJCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLFVBQW5CO0FBQ0EsYUFBSyxnQkFBTCxHQUF3QixlQUF4QjtBQUNBLGFBQUssZUFBTCxHQUF1QixjQUF2QjtBQUNBLGFBQUssVUFBTCxHQUFrQixTQUFsQjtBQUNBLGFBQUssY0FBTCxHQUFzQixhQUF0QjtBQUNBLGFBQUssY0FBTCxHQUFzQixhQUF0QjtBQUNBLGFBQUssY0FBTCxHQUFzQixhQUF0QjtBQUNBLGFBQUssY0FBTCxHQUFzQixhQUF0QjtBQUNBLGFBQUssa0JBQUwsR0FBMEIsaUJBQTFCO0FBQ0g7QUFDRDs7Ozs7NEJBQ21CO0FBQ2YsbUJBQU8sS0FBSyxhQUFaO0FBQ0g7QUFDRDs7Ozs0QkFDa0I7QUFDZCxtQkFBTyxLQUFLLFlBQVo7QUFDSDtBQUNEOzs7OzRCQUMyQjtBQUN2QixtQkFBTyxLQUFLLGFBQUwsR0FBcUIsQ0FBckIsR0FBeUIsS0FBSyxZQUFMLEdBQW9CLEtBQUssYUFBbEQsR0FBa0UsQ0FBekU7QUFDSDtBQUNEOzs7Ozs7NEJBR2lCO0FBQ2IsbUJBQU8sS0FBSyxXQUFaO0FBQ0g7QUFDRDs7Ozs0QkFDZ0I7QUFDWixtQkFBTyxLQUFLLFVBQVo7QUFDSDtBQUNEOzs7OzRCQUNzQjtBQUNsQixtQkFBTyxLQUFLLGdCQUFaO0FBQ0g7QUFDRDs7Ozs0QkFDcUI7QUFDakIsbUJBQU8sS0FBSyxlQUFaO0FBQ0g7QUFDRDs7Ozs0QkFDZ0I7QUFDWixtQkFBTyxLQUFLLFVBQVo7QUFDSDtBQUNEOzs7OzRCQUNvQjtBQUNoQixtQkFBTyxLQUFLLGNBQVo7QUFDSDtBQUNEOzs7OzRCQUNvQjtBQUNoQixtQkFBTyxLQUFLLGNBQVo7QUFDSDtBQUNEOzs7OzRCQUNvQjtBQUNoQixtQkFBTyxLQUFLLGNBQVo7QUFDSDtBQUNEOzs7OzRCQUNvQjtBQUNoQixtQkFBTyxLQUFLLGNBQVo7QUFDSDtBQUNEOzs7OzRCQUN3QjtBQUNwQixtQkFBTyxLQUFLLGtCQUFaO0FBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUtMOzs7Ozs7Ozs7O0lBVWEsYSxXQUFBLGE7QUFDVDs7OztBQUlBLDZCQUFjO0FBQUE7O0FBQ1YsYUFBSyxpQkFBTCxHQUF5QixJQUF6QjtBQUNBLGFBQUssZUFBTCxHQUF1QixJQUF2QjtBQUNBLGFBQUssY0FBTCxHQUFzQixJQUF0QjtBQUNBLGFBQUsseUJBQUwsR0FBaUMsSUFBakM7QUFDQSxhQUFLLHdCQUFMLEdBQWdDLElBQWhDO0FBQ0EsYUFBSyw0QkFBTCxHQUFvQyxJQUFwQztBQUNBLGFBQUssc0JBQUwsR0FBOEIsSUFBOUI7QUFDQSxhQUFLLHFCQUFMLEdBQTZCLElBQTdCO0FBQ0EsYUFBSyxrQkFBTCxHQUEwQixJQUExQjtBQUNBLGFBQUssbUJBQUwsR0FBMkIsQ0FBM0I7QUFDQSxhQUFLLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsYUFBSyxxQkFBTCxHQUE2QixJQUE3QjtBQUNBLGFBQUssNEJBQUwsR0FBb0MsSUFBcEM7QUFDQSxhQUFLLG1CQUFMLEdBQTJCLElBQTNCO0FBQ0EsYUFBSyxnQkFBTCxHQUF3QixJQUF4QjtBQUNBLGFBQUssa0JBQUwsR0FBMEIsSUFBMUI7QUFDQSxhQUFLLG1CQUFMLEdBQTJCLElBQTNCO0FBQ0EsYUFBSywyQkFBTCxHQUFtQyxJQUFuQztBQUNBLGFBQUssZ0JBQUwsR0FBd0IsSUFBeEI7QUFDQSxhQUFLLHdCQUFMLEdBQWdDLElBQWhDO0FBQ0EsYUFBSyw0QkFBTCxHQUFvQyxJQUFwQztBQUNBLGFBQUssNEJBQUwsR0FBb0MsSUFBcEM7QUFDQSxhQUFLLFlBQUwsR0FBb0IsRUFBcEI7QUFDSDtBQUNEOzs7Ozs7OzRCQUd1QjtBQUNuQixtQkFBTyxLQUFLLGlCQUFaO0FBQ0g7QUFDRDs7OzswQkFzSXFCLEssRUFBTztBQUN4QixpQkFBSyxpQkFBTCxHQUF5QixLQUF6QjtBQUNIOzs7NEJBcklvQjtBQUNqQixtQkFBTyxLQUFLLGVBQVo7QUFDSDtBQUNEOzs7OzBCQW1JbUIsSyxFQUFPO0FBQ3RCLGlCQUFLLGVBQUwsR0FBdUIsS0FBdkI7QUFDSDs7OzRCQWxJbUI7QUFDaEIsbUJBQU8sS0FBSyxjQUFaO0FBQ0g7QUFDRDs7OzswQkFnSWtCLEssRUFBTztBQUNyQixpQkFBSyxjQUFMLEdBQXNCLEtBQXRCO0FBQ0g7Ozs0QkEvSDhCO0FBQzNCLG1CQUFPLEtBQUsseUJBQVo7QUFDSDtBQUNEOzs7OzBCQTZINkIsSyxFQUFPO0FBQ2hDLGlCQUFLLHlCQUFMLEdBQWlDLEtBQWpDO0FBQ0g7Ozs0QkE1SDZCO0FBQzFCLG1CQUFPLEtBQUssd0JBQVo7QUFDSDtBQUNEOzs7OzBCQTBINEIsSyxFQUFPO0FBQy9CLGlCQUFLLHdCQUFMLEdBQWdDLEtBQWhDO0FBQ0g7Ozs0QkF6SGlDO0FBQzlCLG1CQUFPLEtBQUssNEJBQVo7QUFDSDtBQUNEOzs7OzBCQXVIZ0MsSyxFQUFPO0FBQ25DLGlCQUFLLDRCQUFMLEdBQW9DLEtBQXBDO0FBQ0g7Ozs0QkF0SDBCO0FBQ3ZCLG1CQUFPLEtBQUsscUJBQVo7QUFDSDtBQUNEOzs7OzBCQW9IeUIsSyxFQUFPO0FBQzVCLGlCQUFLLHFCQUFMLEdBQTZCLEtBQTdCO0FBQ0g7Ozs0QkFuSDJCO0FBQ3hCLG1CQUFPLEtBQUssc0JBQVo7QUFDSDtBQUNEOzs7OzBCQWlIMEIsSyxFQUFPO0FBQzdCLGlCQUFLLHNCQUFMLEdBQThCLEtBQTlCO0FBQ0g7Ozs0QkFoSHVCO0FBQ3BCLG1CQUFPLEtBQUssa0JBQVo7QUFDSDtBQUNEOzs7OzBCQThHc0IsSyxFQUFPO0FBQ3pCLGlCQUFLLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0g7Ozs0QkE3R3dCO0FBQ3JCLG1CQUFPLEtBQUssbUJBQVo7QUFDSDtBQUNEOzs7OzBCQTJHdUIsSyxFQUFPO0FBQzFCLGlCQUFLLG1CQUFMLEdBQTJCLEtBQTNCO0FBQ0g7Ozs0QkExR3VCO0FBQ3BCLG1CQUFPLEtBQUssa0JBQVo7QUFDSDtBQUNEOzs7OzBCQXdHc0IsSyxFQUFPO0FBQ3pCLGlCQUFLLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0g7Ozs0QkF2RzBCO0FBQ3ZCLG1CQUFPLEtBQUsscUJBQVo7QUFDSDtBQUNEOzs7OzBCQXFHeUIsSyxFQUFPO0FBQzVCLGlCQUFLLHFCQUFMLEdBQTZCLEtBQTdCO0FBQ0g7Ozs0QkFwR2lDO0FBQzlCLG1CQUFPLEtBQUssNEJBQVo7QUFDSDtBQUNEOzs7OzBCQWtHZ0MsSyxFQUFPO0FBQ25DLGlCQUFLLDRCQUFMLEdBQW9DLEtBQXBDO0FBQ0g7Ozs0QkFqR3dCO0FBQ3JCLG1CQUFPLEtBQUssbUJBQVo7QUFDSDtBQUNEOzs7OzBCQStGdUIsSyxFQUFPO0FBQzFCLGlCQUFLLG1CQUFMLEdBQTJCLEtBQTNCO0FBQ0g7Ozs0QkE5RnVCO0FBQ3BCLG1CQUFPLEtBQUssa0JBQVo7QUFDSDtBQUNEOzs7OzBCQTRGc0IsSyxFQUFPO0FBQ3pCLGlCQUFLLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0g7Ozs0QkEzRnFCO0FBQ2xCLG1CQUFPLEtBQUssZ0JBQVo7QUFDSDtBQUNEOzs7OzBCQXlGb0IsSyxFQUFPO0FBQ3ZCLGlCQUFLLGdCQUFMLEdBQXdCLEtBQXhCO0FBQ0g7Ozs0QkF4RndCO0FBQ3JCLG1CQUFPLEtBQUssbUJBQVo7QUFDSDtBQUNEOzs7OzBCQXNGdUIsSyxFQUFPO0FBQzFCLGlCQUFLLG1CQUFMLEdBQTJCLEtBQTNCO0FBQ0g7Ozs0QkFyRmdDO0FBQzdCLG1CQUFPLEtBQUssMkJBQVo7QUFDSDtBQUNEOzs7OzswQkFtRitCLEssRUFBTztBQUNsQyxpQkFBSywyQkFBTCxHQUFtQyxLQUFuQztBQUNIOzs7NEJBakZxQjtBQUNsQixtQkFBTyxLQUFLLGdCQUFaO0FBQ0g7QUFDRDs7OzswQkErRW9CLEssRUFBTztBQUN2QixpQkFBSyxnQkFBTCxHQUF3QixLQUF4QjtBQUNIOzs7NEJBOUU2QjtBQUMxQixtQkFBTyxLQUFLLHdCQUFaO0FBQ0g7QUFDRDs7OzswQkE0RTRCLEssRUFBTztBQUMvQixpQkFBSyx3QkFBTCxHQUFnQyxLQUFoQztBQUNIOzs7NEJBM0VpQztBQUM5QixtQkFBTyxLQUFLLDRCQUFaO0FBQ0g7QUFDRDs7OzswQkE0RWdDLEssRUFBTztBQUNuQyxpQkFBSyw0QkFBTCxHQUFvQyxLQUFwQztBQUNIOzs7NEJBM0VpQztBQUM5QixtQkFBTyxLQUFLLDRCQUFaO0FBQ0g7QUFDRDs7OzswQkFtRWdDLEssRUFBTztBQUNuQyxpQkFBSyw0QkFBTCxHQUFvQyxLQUFwQztBQUNIOzs7NEJBbEVpQjtBQUNkLG1CQUFPLEtBQUssWUFBWjtBQUNILFM7MEJBb0VlLEssRUFBTztBQUNuQixpQkFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0g7Ozs7Ozs7Ozs7Ozs7O3FqQkN4UEw7Ozs7Ozs7Ozs7QUFVQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFJLFdBQVcsQ0FBZjs7QUFFQSxJQUFJLHNCQUFzQixDQUExQjs7QUFFQTs7OztJQUdhLGMsV0FBQSxjO0FBQ1Q7OztBQUdBLDRCQUFZLFNBQVosRUFBdUI7QUFBQTs7QUFDbkIsYUFBSyxVQUFMLEdBQWtCLFNBQWxCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLElBQUksSUFBSixHQUFXLE9BQVgsRUFBbkI7QUFDSDs7Ozt3Q0FDZSxTLEVBQVc7QUFDdkIsdUJBQVcsa0JBQU0sSUFBTixFQUFZLEtBQUssaUJBQWpCLENBQVgsRUFBZ0QsU0FBaEQ7QUFDSDs7O2tDQUlTLENBQ1Q7Ozs0Q0FDbUI7QUFDaEIsZ0JBQUksS0FBSyxjQUFULEVBQXlCO0FBQ3JCLHFCQUFLLFNBQUw7QUFDSDtBQUNKOzs7b0NBQ1c7QUFDUixrQkFBTSxJQUFJLGdDQUFKLEVBQU47QUFDSDs7O2dDQUNPLFEsRUFBVTtBQUNkLGlCQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsUUFBeEI7QUFDSDs7O2lDQUNRLENBQ1I7OztpQ0FDUTtBQUNMLGtCQUFNLElBQUksZ0NBQUosQ0FBeUIsNkJBQTZCLEtBQUssSUFBM0QsQ0FBTjtBQUNIOzs7a0NBQ1M7QUFDTixpQkFBSyxXQUFMO0FBQ0g7OztrQ0FDUztBQUNOLGlCQUFLLFdBQUw7QUFDSDs7O3NDQUNhO0FBQ1Ysa0JBQU0sSUFBSSxnQ0FBSixDQUF5QixrQ0FBa0MsS0FBSyxJQUFoRSxDQUFOO0FBQ0g7OztpQ0FDUSxNLEVBQVE7QUFBQztBQUNkLGtCQUFNLElBQUksZ0NBQUosQ0FBeUIsK0JBQStCLEtBQUssSUFBN0QsQ0FBTjtBQUNIOzs7K0JBQ00sRyxFQUFLLGEsRUFBZTtBQUFDO0FBQ3hCLGtCQUFNLElBQUksZ0NBQUosQ0FBeUIsNkJBQTZCLEtBQUssSUFBM0QsQ0FBTjtBQUNIOzs7aUNBQ1E7QUFDTCxrQkFBTSxJQUFJLGdDQUFKLENBQXlCLDZCQUE2QixLQUFLLElBQTNELENBQU47QUFDSDs7O2lDQUNRO0FBQ0wsa0JBQU0sSUFBSSxnQ0FBSixDQUF5Qiw2QkFBNkIsS0FBSyxJQUEzRCxDQUFOO0FBQ0g7Ozs0QkF6Q29CO0FBQ2pCLG1CQUFPLFNBQVMsS0FBSyxVQUFMLENBQWdCLEtBQWhDO0FBQ0g7Ozs0QkF3Q1U7QUFDUCxtQkFBTyxnQkFBUDtBQUNIOzs7NEJBQ1k7QUFDVCxtQkFBTyxLQUFLLFVBQUwsQ0FBZ0IsT0FBdkI7QUFDSDs7Ozs7O0lBRVEsa0IsV0FBQSxrQjs7O0FBQ1QsZ0NBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQztBQUFBOztBQUFBLDRJQUN4QixTQUR3Qjs7QUFFOUIsY0FBSyxVQUFMLEdBQWtCLFNBQWxCO0FBRjhCO0FBR2pDOzs7O2tDQUNTO0FBQ04saUJBQUssZUFBTCxDQUFxQixLQUFLLGVBQTFCO0FBQ0g7OztvQ0FDVztBQUNSLGlCQUFLLE9BQUwsQ0FBYSxJQUFJLFdBQUosQ0FBZ0IsS0FBSyxVQUFyQixFQUFpQyxJQUFJLG1CQUFKLEVBQWpDLENBQWI7QUFDSDs7OzRCQUNVO0FBQ1AsbUJBQU8sb0JBQVA7QUFDSDs7OztFQWJtQyxjOztJQWUzQixtQixXQUFBLG1COzs7QUFDVCxpQ0FBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLGtCQUFsQyxFQUFzRCxTQUF0RCxFQUFpRTtBQUFBOztBQUFBLCtJQUN2RCxTQUR1RCxFQUM1QyxTQUQ0Qzs7QUFFN0QsZUFBSyxpQkFBTCxHQUF5QixzQkFBc0IsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUEvQztBQUNBLGVBQUssUUFBTCxHQUFnQixhQUFhLENBQTdCO0FBSDZEO0FBSWhFOzs7O2lDQUNRO0FBQ0wsaUJBQUssT0FBTCxDQUFhLElBQUksa0JBQUosQ0FBdUIsS0FBSyxVQUE1QixDQUFiO0FBQ0g7OztzQ0FDYTtBQUNWLGdCQUFJLE1BQU0sSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFWO0FBQ0EsZ0JBQUksaUJBQWtCLEtBQUssaUJBQUwsR0FBeUIsS0FBSyxVQUEvQixHQUE2QyxHQUFsRTtBQUNBLGdCQUFJLGlCQUFpQixDQUFqQixJQUFzQixFQUFFLEtBQUssUUFBUCxHQUFrQixtQkFBNUMsRUFBaUU7QUFDN0QscUJBQUssVUFBTCxDQUFnQixRQUFoQjtBQUNBLHFCQUFLLE9BQUwsQ0FBYSxJQUFJLG1CQUFKLENBQXdCLEtBQUssVUFBN0IsRUFBeUMsY0FBekMsRUFBeUQsS0FBSyxpQkFBOUQsRUFBaUYsS0FBSyxRQUF0RixDQUFiO0FBQ0gsYUFIRCxNQUdPO0FBQ0gscUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixLQUFLLFVBQXJCLEVBQWlDLElBQUksS0FBSixDQUFVLGFBQVYsQ0FBakMsQ0FBYjtBQUNIO0FBQ0o7Ozs0QkFDVTtBQUNQLG1CQUFPLHFCQUFQO0FBQ0g7Ozs7RUFyQm9DLGtCOztJQXVCNUIsa0IsV0FBQSxrQjs7Ozs7Ozs7Ozs7a0NBQ0M7QUFDTixnQkFBSSxPQUFPLElBQVg7QUFDQSxnQkFBSSxPQUFKLENBQVksU0FBUyxlQUFULENBQXlCLE9BQXpCLEVBQWtDO0FBQzFDLHFCQUFLLFVBQUwsQ0FBZ0IsaUJBQWhCO0FBQ0E7QUFDSCxhQUhEO0FBSUg7OzsrQkFDTSxHLEVBQUssYSxFQUFlO0FBQ3ZCLGdCQUFJLE9BQU8sSUFBWDtBQUNBLGdCQUFJLFdBQVcsVUFBZjs7QUFFQSxnQkFBSSxlQUFlO0FBQ2YscUJBQUssR0FEVTtBQUVmLDRCQUFZO0FBRkcsYUFBbkI7QUFJQSxpQkFBSyxNQUFMLENBQVksR0FBWixDQUFnQixhQUFoQixFQUErQixHQUEvQjtBQUNBLGlCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBMEIsS0FBSyxTQUFMLENBQWU7QUFDckMseUJBQVMsS0FENEI7QUFFckMsd0JBQVEsUUFGNkI7QUFHckMsd0JBQVEsWUFINkI7QUFJckMsb0JBQUk7QUFKaUMsYUFBZixDQUExQjtBQU1BLGlCQUFLLE9BQUwsQ0FBYSxJQUFJLGtCQUFKLENBQXVCLEtBQUssVUFBNUIsRUFBd0MsUUFBeEMsQ0FBYjtBQUNIOzs7c0NBQ2E7QUFDVixpQkFBSyxPQUFMLENBQWEsSUFBSSxXQUFKLENBQWdCLEtBQUssVUFBckIsQ0FBYjtBQUNIOzs7NEJBQ1U7QUFDUCxtQkFBTyxvQkFBUDtBQUNIOzs7O0VBOUJtQyxjOztJQWdDM0Isa0IsV0FBQSxrQjs7O0FBQ1QsZ0NBQVksU0FBWixFQUF1QixRQUF2QixFQUFpQztBQUFBOztBQUFBLDZJQUN2QixTQUR1QixFQUNaLDhCQURZOztBQUU3QixlQUFLLFNBQUwsR0FBaUIsUUFBakI7QUFGNkI7QUFHaEM7Ozs7aUNBQ1EsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxJQUFYO0FBQ0EsZ0JBQUksSUFBSSxFQUFKLEtBQVcsS0FBSyxTQUFwQixFQUErQjtBQUMzQixvQkFBSSxJQUFJLEtBQUosSUFBYSxDQUFDLElBQUksTUFBdEIsRUFBOEI7QUFDMUIseUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixLQUFLLFVBQXJCLEVBQWlDLEtBQUssb0JBQUwsQ0FBMEIsR0FBMUIsQ0FBakMsQ0FBYjtBQUNILGlCQUZELE1BRU87QUFDSCx3QkFBSSxPQUFKLENBQVksU0FBUyxjQUFULENBQXdCLE9BQXhCLEVBQWlDO0FBQ3pDLDZCQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLGNBQWhCLEVBQWdDLElBQUksTUFBSixDQUFXLEdBQTNDO0FBQ0EsNkJBQUssVUFBTCxDQUFnQixnQkFBaEIsQ0FBaUMsSUFBSSxNQUFKLENBQVcsR0FBNUMsRUFBaUQsSUFBSSxNQUFKLENBQVcsVUFBNUQ7QUFDQTtBQUNILHFCQUpEO0FBS0EseUJBQUssT0FBTCxDQUFhLElBQUksa0JBQUosQ0FBdUIsS0FBSyxVQUE1QixFQUF3QyxLQUFLLFVBQUwsQ0FBZ0IsV0FBeEQsQ0FBYjtBQUNIO0FBQ0o7QUFDSjs7OzZDQUNvQixHLEVBQUs7QUFDdEIsZ0JBQUksSUFBSSxLQUFKLElBQWEsSUFBSSxLQUFKLENBQVUsSUFBVixJQUFrQixHQUFuQyxFQUF3QztBQUNwQyx1QkFBTyxJQUFJLHlCQUFKLENBQWtCLElBQUksS0FBSixDQUFVLE9BQTVCLENBQVA7QUFDSCxhQUZELE1BRU8sSUFBSSxJQUFJLEtBQUosSUFBYSxJQUFJLEtBQUosQ0FBVSxJQUFWLElBQWtCLEdBQW5DLEVBQXdDO0FBQzNDLHVCQUFPLElBQUksaUNBQUosQ0FBMEIsSUFBSSxLQUFKLENBQVUsT0FBcEMsQ0FBUDtBQUNILGFBRk0sTUFFQTtBQUNILHVCQUFPLElBQUksaUNBQUosRUFBUDtBQUNIO0FBQ0o7Ozs0QkFFVTtBQUNQLG1CQUFPLG9CQUFQO0FBQ0g7Ozs7RUFoQ21DLGtCOztJQWtDM0Isa0IsV0FBQSxrQjs7O0FBQ1QsZ0NBQVksU0FBWixFQUF1QixVQUF2QixFQUFtQztBQUFBOztBQUFBLDZJQUN6QixTQUR5Qjs7QUFFL0IsZUFBSyxXQUFMLEdBQW1CLFVBQW5CO0FBRitCO0FBR2xDOzs7O2tDQUNTO0FBQ04sZ0JBQUksS0FBSyxXQUFULEVBQXNCO0FBQ2xCLHFCQUFLLE1BQUw7QUFDSDtBQUNKOzs7aUNBQ1E7QUFDTCxnQkFBSSxXQUFXLFVBQWY7QUFDQSxpQkFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLElBQXJCLENBQTBCLEtBQUssU0FBTCxDQUFlO0FBQ3JDLHlCQUFTLEtBRDRCO0FBRXJDLHdCQUFRLFFBRjZCO0FBR3JDLHdCQUFRLEVBSDZCO0FBSXJDLG9CQUFJO0FBSmlDLGFBQWYsQ0FBMUI7QUFNQSxpQkFBSyxPQUFMLENBQWEsSUFBSSxxQkFBSixDQUEwQixLQUFLLFVBQS9CLEVBQTJDLFFBQTNDLENBQWI7QUFDSDs7O3NDQUNhO0FBQ1YsaUJBQUssT0FBTCxDQUFhLElBQUksV0FBSixDQUFnQixLQUFLLFVBQXJCLENBQWI7QUFDSDs7OzRCQUNVO0FBQ1AsbUJBQU8sb0JBQVA7QUFDSDs7OztFQXpCbUMsYzs7SUEyQjNCLHFCLFdBQUEscUI7OztBQUNULG1DQUFZLFNBQVosRUFBdUIsUUFBdkIsRUFBaUM7QUFBQTs7QUFBQSxtSkFDdkIsU0FEdUIsRUFDWixrQ0FEWTs7QUFFN0IsZUFBSyxTQUFMLEdBQWlCLFFBQWpCO0FBRjZCO0FBR2hDOzs7O2lDQUNRLEcsRUFBSztBQUNWLGdCQUFJLElBQUksRUFBSixLQUFXLEtBQUssU0FBcEIsRUFBK0I7QUFDM0Isb0JBQUksSUFBSSxLQUFSLEVBQWU7QUFDWCx5QkFBSyxPQUFMLENBQWEsSUFBSSxXQUFKLENBQWdCLEtBQUssVUFBckIsQ0FBYjtBQUNILGlCQUZELE1BRU87QUFDSCx5QkFBSyxVQUFMLENBQWdCLFlBQWhCLEdBQStCLElBQUksTUFBSixDQUFXLFdBQTFDO0FBQ0EseUJBQUssT0FBTCxDQUFhLElBQUksWUFBSixDQUFpQixLQUFLLFVBQXRCLENBQWI7QUFDSDtBQUNKO0FBQ0o7Ozs0QkFDVTtBQUNQLG1CQUFPLHVCQUFQO0FBQ0g7Ozs7RUFqQnNDLGtCOztJQW1COUIsWSxXQUFBLFk7Ozs7Ozs7Ozs7O2tDQUNDO0FBQ04sZ0JBQUksT0FBTyxJQUFYO0FBQ0EsZ0JBQUksT0FBSixDQUFZLFNBQVMsZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBbUM7QUFDM0MscUJBQUssVUFBTCxDQUFnQixrQkFBaEI7QUFDQTtBQUNILGFBSEQ7QUFJSDs7O2lDQUNRO0FBQ0wsZ0JBQUksUUFBUSxVQUFaO0FBQ0EsaUJBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixJQUFyQixDQUEwQixLQUFLLFNBQUwsQ0FBZTtBQUNyQyx5QkFBUyxLQUQ0QjtBQUVyQyx3QkFBUSxLQUY2QjtBQUdyQyx3QkFBUSxFQUg2QjtBQUlyQyxvQkFBSTtBQUppQyxhQUFmLENBQTFCO0FBTUEsaUJBQUssT0FBTCxDQUFhLElBQUksd0JBQUosQ0FBNkIsS0FBSyxVQUFsQyxFQUE4QyxLQUE5QyxDQUFiO0FBQ0g7OztpQ0FDUSxHLEVBQUs7QUFDVixnQkFBSSxJQUFJLE1BQUosS0FBZSxLQUFuQixFQUEwQjtBQUN0QixxQkFBSyxPQUFMLENBQWEsSUFBSSx1QkFBSixDQUE0QixLQUFLLFVBQWpDLEVBQTZDLElBQUksRUFBakQsQ0FBYjtBQUNILGFBRkQsTUFFTyxJQUFJLElBQUksTUFBSixLQUFlLGtCQUFuQixFQUF1QztBQUMxQyxxQkFBSyxVQUFMLENBQWdCLFlBQWhCLEdBQStCLElBQUksTUFBSixDQUFXLFdBQTFDO0FBQ0g7QUFDSjs7O3NDQUNhO0FBQ1YsaUJBQUssVUFBTCxDQUFnQixVQUFoQjtBQUNBLGlCQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsSUFBSSxxQkFBSixDQUEwQixLQUFLLFVBQS9CLENBQXhCO0FBQ0g7Ozs0QkFDVTtBQUNQLG1CQUFPLGNBQVA7QUFDSDs7OztFQS9CNkIsYzs7SUFpQ3JCLHFCLFdBQUEscUI7OztBQUNULG1DQUFZLFNBQVosRUFBdUI7QUFBQTs7QUFBQSw2SUFDYixTQURhLEVBQ0YscUNBREU7QUFFdEI7Ozs7aUNBQ1E7QUFDTCxpQkFBSyxPQUFMLENBQWEsSUFBSSxZQUFKLENBQWlCLEtBQUssVUFBdEIsQ0FBYjtBQUNIOzs7c0NBQ2E7QUFDVixpQkFBSyxPQUFMLENBQWEsSUFBSSxXQUFKLENBQWdCLEtBQUssVUFBckIsQ0FBYjtBQUNIOzs7NEJBQ1U7QUFDUCxtQkFBTyx1QkFBUDtBQUNIOzs7O0VBWnNDLGtCOztJQWM5Qix3QixXQUFBLHdCOzs7QUFDVCxzQ0FBWSxTQUFaLEVBQXVCLEtBQXZCLEVBQThCO0FBQUE7O0FBQUEseUpBQ3BCLFNBRG9CLEVBQ1Qsa0NBRFM7O0FBRTFCLGVBQUssTUFBTCxHQUFjLEtBQWQ7QUFGMEI7QUFHN0I7Ozs7aUNBQ1EsRyxFQUFLO0FBQ1YsZ0JBQUksSUFBSSxFQUFKLEtBQVcsS0FBSyxNQUFwQixFQUE0QjtBQUN4QixxQkFBSyxPQUFMLENBQWEsSUFBSSxpQkFBSixDQUFzQixLQUFLLFVBQTNCLENBQWI7QUFDSDtBQUNKOzs7NEJBQ1U7QUFDUCxtQkFBTywwQkFBUDtBQUNIOzs7O0VBWnlDLGtCOztJQWNqQyx1QixXQUFBLHVCOzs7QUFDVCxxQ0FBWSxTQUFaLEVBQXVCLEtBQXZCLEVBQThCO0FBQUE7O0FBQUEsd0pBQ3BCLFNBRG9COztBQUUxQixnQkFBSyxNQUFMLEdBQWMsS0FBZDtBQUYwQjtBQUc3Qjs7OztrQ0FDUztBQUNOLGdCQUFJLE9BQU8sSUFBWDtBQUNBLGdCQUFJLE9BQUosQ0FBWSxTQUFTLGtCQUFULENBQTRCLE9BQTVCLEVBQXFDO0FBQzdDLHFCQUFLLFVBQUwsQ0FBZ0Isb0JBQWhCO0FBQ0E7QUFDSCxhQUhEO0FBSUg7OztpQ0FDUTtBQUNMLGdCQUFJLE9BQU8sSUFBWDtBQUNBLGlCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBMEIsS0FBSyxTQUFMLENBQWU7QUFDckMseUJBQVMsS0FENEI7QUFFckMsd0JBQVEsRUFGNkI7QUFHckMsb0JBQUksS0FBSztBQUg0QixhQUFmLENBQTFCO0FBS0EsaUJBQUssT0FBTCxDQUFhLElBQUksaUJBQUosQ0FBc0IsS0FBSyxVQUEzQixDQUFiO0FBQ0g7OztzQ0FDYTtBQUNWLGlCQUFLLE9BQUwsQ0FBYSxJQUFJLGlCQUFKLENBQXNCLEtBQUssVUFBM0IsQ0FBYjtBQUNIOzs7NEJBQ1U7QUFDUCxtQkFBTyx5QkFBUDtBQUNIOzs7O0VBMUJ3QyxjOztJQTRCaEMsaUIsV0FBQSxpQjs7Ozs7Ozs7Ozs7a0NBQ0M7QUFDTixnQkFBSSxPQUFPLElBQVg7QUFDQSxnQkFBSSxPQUFKLENBQVksU0FBUyxrQkFBVCxDQUE0QixPQUE1QixFQUFxQztBQUM3QyxxQkFBSyxVQUFMLENBQWdCLG9CQUFoQjtBQUNBO0FBQ0gsYUFIRDtBQUlBLGlCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckI7QUFDSDs7O3NDQUNhO0FBQ1Y7QUFDSDs7OzRCQUNVO0FBQ1AsbUJBQU8sbUJBQVA7QUFDSDs7OztFQWRrQyxjOztJQWdCMUIsVyxXQUFBLFc7OztBQUNULHlCQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0M7QUFBQTs7QUFBQSxnSUFDeEIsU0FEd0I7O0FBRTlCLGdCQUFLLFVBQUwsR0FBa0IsU0FBbEI7QUFGOEI7QUFHakM7Ozs7a0NBQ1M7QUFDTixnQkFBSSxPQUFPLElBQVg7QUFDQSxnQkFBSSxPQUFKLENBQVksU0FBUyxZQUFULENBQXNCLE9BQXRCLEVBQStCO0FBQ3ZDLHFCQUFLLFVBQUwsQ0FBZ0IsY0FBaEIsQ0FBK0IsS0FBSyxVQUFwQztBQUNBO0FBQ0gsYUFIRDtBQUlBLGlCQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckI7QUFDSDs7O3NDQUNhO0FBQ1Y7QUFDSDs7OzRCQUNVO0FBQ1AsbUJBQU8sYUFBUDtBQUNIOzs7NEJBQ2U7QUFDWixtQkFBTyxLQUFLLFVBQVo7QUFDSDs7OztFQXJCNEIsYzs7SUF3QlosZ0I7QUFDakIsOEJBQVksTUFBWixFQUFvQixZQUFwQixFQUFrQyxZQUFsQyxFQUFnRCxNQUFoRCxFQUF3RCxnQkFBeEQsRUFBMEU7QUFBQTs7QUFDdEUsYUFBSyxPQUFMLEdBQWUsTUFBZjtBQUNBLGFBQUssaUJBQUwsR0FBeUIsb0JBQW9CLHFDQUE3QztBQUNBLGFBQUssV0FBTCxHQUFtQixJQUFuQjtBQUNBLGFBQUssYUFBTCxHQUFxQixZQUFyQjtBQUNBLGFBQUssYUFBTCxHQUFxQixZQUFyQjtBQUNBLGFBQUssT0FBTCxHQUFlLHVCQUFXLE1BQVgsRUFBbUIsTUFBbkIsRUFBMkIsV0FBM0IsQ0FBZjs7QUFFQTtBQUNBLGFBQUssaUJBQUwsR0FDSSxLQUFLLGdCQUFMLEdBQ0EsS0FBSyxrQkFBTCxHQUNBLEtBQUssbUJBQUwsR0FDQSxLQUFLLG9CQUFMLEdBQ0EsS0FBSyxvQkFBTCxHQUNBLEtBQUssY0FBTCxHQUFzQixTQUFTLElBQVQsR0FBZ0IsQ0FDckMsQ0FQTDtBQVFIOzs7O2tDQTRCUztBQUNOLGlCQUFLLFFBQUw7QUFDQSxpQkFBSyxPQUFMLENBQWEsSUFBSSxtQkFBSixDQUF3QixJQUF4QixFQUE4QixLQUFLLGlCQUFuQyxDQUFiO0FBQ0g7OzttQ0FDVTtBQUNQLGlCQUFLLElBQUwsR0FBWSxLQUFLLGlCQUFMLENBQXVCLEtBQUssZUFBTCxFQUF2QixDQUFaO0FBQ0g7OztnQ0FDTyxTLEVBQVc7QUFDZixnQkFBSTtBQUNBLHFCQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLENBQUMsS0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBQVksSUFBMUIsR0FBaUMsTUFBbEMsSUFBNEMsTUFBNUMsR0FBcUQsVUFBVSxJQUFqRjtBQUNBLG9CQUFJLEtBQUssS0FBTCxJQUFjLEtBQUssS0FBTCxDQUFXLE1BQTdCLEVBQXFDO0FBQ2pDLHlCQUFLLEtBQUwsQ0FBVyxNQUFYO0FBQ0g7QUFDSixhQUxELFNBS1U7QUFDTixxQkFBSyxNQUFMLEdBQWMsU0FBZDtBQUNBLG9CQUFJLEtBQUssTUFBTCxDQUFZLE9BQWhCLEVBQXlCO0FBQ3JCLHlCQUFLLE1BQUwsQ0FBWSxPQUFaO0FBQ0g7QUFDSjtBQUNKOzs7MENBQ2lCLEcsRUFBSztBQUNuQixnQkFBSSxlQUFlLElBQUksU0FBSixDQUFjLEdBQWQsQ0FBbkI7QUFDQSx5QkFBYSxNQUFiLEdBQXNCLGtCQUFNLElBQU4sRUFBWSxLQUFLLE9BQWpCLENBQXRCO0FBQ0EseUJBQWEsU0FBYixHQUF5QixrQkFBTSxJQUFOLEVBQVksS0FBSyxVQUFqQixDQUF6QjtBQUNBLHlCQUFhLE9BQWIsR0FBdUIsa0JBQU0sSUFBTixFQUFZLEtBQUssUUFBakIsQ0FBdkI7QUFDQSx5QkFBYSxPQUFiLEdBQXVCLGtCQUFNLElBQU4sRUFBWSxLQUFLLFFBQWpCLENBQXZCO0FBQ0EsbUJBQU8sWUFBUDtBQUNIOzs7MENBQ2lCO0FBQ2QsZ0JBQUksS0FBSyxhQUFULEVBQXdCO0FBQ3BCLHVCQUFPLEtBQUssYUFBTCxLQUF1QixjQUF2QixHQUF3QyxtQkFBbUIsS0FBSyxhQUF4QixDQUEvQztBQUNILGFBRkQsTUFFTztBQUNILHVCQUFPLEtBQUssYUFBTCxFQUFQO0FBQ0g7QUFDSjs7OzZDQUNvQjtBQUNqQixtQkFBTyxLQUFLLGFBQUwsS0FBdUIsZUFBdkIsR0FBeUMsbUJBQW1CLEtBQUssWUFBeEIsQ0FBaEQ7QUFDSDs7O3dDQUNlO0FBQ1osZ0JBQUksWUFBWSxHQUFoQjtBQUNBLGdCQUFJLEtBQUssYUFBTCxDQUFtQixPQUFuQixDQUEyQixTQUEzQixJQUF3QyxDQUFDLENBQTdDLEVBQWdEO0FBQzVDLDRCQUFZLEdBQVo7QUFDSDtBQUNELG1CQUFPLEtBQUssYUFBTCxHQUFxQixTQUFyQixHQUFpQyxTQUFqQyxHQUE2QyxtQkFBbUIsS0FBSyxPQUF4QixDQUFwRDtBQUNIOzs7bUNBQ1UsRyxFQUFLO0FBQ1osaUJBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsS0FBSyxLQUFMLENBQVcsSUFBSSxJQUFmLENBQXBCO0FBQ0g7OztnQ0FDTyxHLEVBQUs7QUFDVCxpQkFBSyxLQUFMLENBQVcsTUFBWCxDQUFrQixHQUFsQjtBQUNIOzs7aUNBQ1EsRyxFQUFLO0FBQ1YsaUJBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsR0FBbkI7QUFDSDs7O2lDQUNRLEcsRUFBSztBQUNWLGlCQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLDRCQUE0QixJQUFJLElBQWhDLEdBQXVDLFdBQXZDLEdBQXFELElBQUksTUFBMUU7QUFDQSxpQkFBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixHQUFuQjtBQUNIOzs7cUNBQ1k7QUFDVCxpQkFBSyxJQUFMLEdBQVksS0FBSyxpQkFBTCxDQUF1QixLQUFLLGtCQUFMLEVBQXZCLENBQVo7QUFDSDs7OytCQUNNLEcsRUFBSyxhLEVBQWU7QUFDdkIsaUJBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsR0FBbEIsRUFBdUIsYUFBdkI7QUFDSDs7O2lDQUNRO0FBQ0wsaUJBQUssS0FBTCxDQUFXLE1BQVg7QUFDSDs7O2lDQUNRO0FBQ0wsaUJBQUssS0FBTCxDQUFXLE1BQVg7QUFDSDs7OzRCQWhHWTtBQUNULG1CQUFPLEtBQUssT0FBWjtBQUNIOzs7MEJBQ2UsZ0IsRUFBa0I7QUFDOUIsaUJBQUssaUJBQUwsR0FBeUIsZ0JBQXpCO0FBQ0g7OzswQkFDYyxlLEVBQWlCO0FBQzVCLGlCQUFLLGdCQUFMLEdBQXdCLGVBQXhCO0FBQ0g7OzswQkFDZ0IsaUIsRUFBbUI7QUFDaEMsaUJBQUssa0JBQUwsR0FBMEIsaUJBQTFCO0FBQ0g7OzswQkFDaUIsa0IsRUFBb0I7QUFDbEMsaUJBQUssbUJBQUwsR0FBMkIsa0JBQTNCO0FBQ0g7OzswQkFDa0IsbUIsRUFBcUI7QUFDcEMsaUJBQUssb0JBQUwsR0FBNEIsbUJBQTVCO0FBQ0g7OzswQkFDa0IsbUIsRUFBcUI7QUFDcEMsaUJBQUssb0JBQUwsR0FBNEIsbUJBQTVCO0FBQ0g7OzswQkFDWSxhLEVBQWU7QUFDeEIsaUJBQUssY0FBTCxHQUFzQixhQUF0QjtBQUNIOzs7NEJBQ1c7QUFDUixtQkFBTyxLQUFLLE1BQVo7QUFDSDs7Ozs7O2tCQTdDZ0IsZ0I7Ozs7Ozs7Ozs7cWpCQ3hXckI7Ozs7Ozs7Ozs7UUFnQ2dCLEssR0FBQSxLO1FBdUJBLFUsR0FBQSxVO1FBV0EsVyxHQUFBLFc7UUErREEsWSxHQUFBLFk7O0FBdkhoQjs7QUFDQTs7OztBQUVBOzs7QUFHQSxJQUFJLGFBQWEsQ0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixNQUFoQixFQUF3QixPQUF4QixDQUFqQjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7QUFjTyxTQUFTLEtBQVQsR0FBaUI7QUFDcEIsUUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUEyQixTQUEzQixDQUFYO0FBQ0EsUUFBSSxRQUFRLEtBQUssS0FBTCxFQUFaO0FBQ0EsUUFBSSxTQUFTLEtBQUssS0FBTCxFQUFiOztBQUVBLFFBQUksQ0FBQyxLQUFMLEVBQVk7QUFDUixjQUFNLElBQUksNkJBQUosQ0FBc0IsbUNBQXRCLENBQU47QUFDSDs7QUFFRCxRQUFJLENBQUMsTUFBTCxFQUFhO0FBQ1QsY0FBTSxJQUFJLDZCQUFKLENBQXNCLG9DQUF0QixDQUFOO0FBQ0g7O0FBRUQsUUFBSSxPQUFPLE1BQVAsS0FBa0IsVUFBdEIsRUFBa0M7QUFDOUIsY0FBTSxJQUFJLDZCQUFKLENBQXNCLDBDQUF0QixDQUFOO0FBQ0g7O0FBRUQsV0FBTyxTQUFTLGdCQUFULEdBQTRCO0FBQy9CLFlBQUksY0FBYyxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsU0FBM0IsQ0FBbEI7QUFDQSxlQUFPLE9BQU8sS0FBUCxDQUFhLEtBQWIsRUFBb0IsS0FBSyxNQUFMLENBQVksV0FBWixDQUFwQixDQUFQO0FBQ0gsS0FIRDtBQUlIOztBQUVNLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixNQUE1QixFQUFvQyxXQUFwQyxFQUFpRDtBQUNwRCxRQUFJLFVBQVUsRUFBZDtBQUNBLGVBQVcsT0FBWCxDQUFtQixVQUFVLFNBQVYsRUFBcUI7QUFDcEMsWUFBSSxDQUFDLE9BQU8sU0FBUCxDQUFMLEVBQXdCO0FBQ3BCLGtCQUFNLElBQUksS0FBSixDQUFVLG9CQUFvQixTQUFwQixHQUFnQyxXQUExQyxDQUFOO0FBQ0g7QUFDRCxnQkFBUSxTQUFSLElBQXFCLE1BQU0sTUFBTixFQUFjLE9BQU8sU0FBUCxDQUFkLEVBQWlDLE1BQWpDLEVBQXlDLFdBQXpDLENBQXJCO0FBQ0gsS0FMRDtBQU1BLFdBQU8sT0FBUDtBQUNIOztBQUVNLFNBQVMsV0FBVCxDQUFxQixNQUFyQixFQUE2QjtBQUNoQyxRQUFJLE1BQUosRUFBWTtBQUNSLFlBQUksU0FBUyxPQUFPLFNBQVAsRUFBYjtBQUNBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxPQUFPLE1BQTNCLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3BDLGdCQUFJLFFBQVEsT0FBTyxDQUFQLENBQVo7QUFDQSxnQkFBSTtBQUNBLHNCQUFNLElBQU47QUFDSCxhQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDUjtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVEOzs7OztJQUlhLFUsV0FBQSxVO0FBQ1QsMEJBQWM7QUFBQTs7QUFDVixhQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDSDs7Ozs7O0FBdUJEOzs7Ozs7MkNBTW1CLFMsRUFBVyxTLEVBQVc7QUFDckMsZ0JBQUkscUJBQXFCLFVBQVUsV0FBVixFQUF6QjtBQUNBLG1CQUFPLEtBQUssV0FBTCxDQUFpQixTQUFqQixLQUErQix1QkFBdUIsS0FBSyxXQUFMLENBQWlCLFNBQWpCLEVBQTRCLFdBQTVCLEVBQXRELElBQW1HLHVCQUF1QixpQkFBakk7QUFDSDs7OzRCQTlCbUI7QUFDaEIsbUJBQU8sS0FBSyxjQUFaO0FBQ0g7O0FBRUQ7Ozs7OzBCQUlrQixJLEVBQU07QUFDcEIsaUJBQUssY0FBTCxHQUFzQixJQUF0QjtBQUNIOztBQUVEOzs7Ozs7Ozs0QkFLaUI7QUFDYixtQkFBTyxLQUFLLFdBQVo7QUFDSDs7Ozs7O0FBY0w7Ozs7Ozs7OztBQU9PLFNBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEyQixVQUEzQixFQUF1QztBQUMxQyxRQUFJLFdBQVcsd0JBQWMsR0FBZCxDQUFmO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFNBQVMsTUFBN0IsRUFBcUMsR0FBckMsRUFBMEM7QUFDdEMsWUFBSSxZQUFZLGtCQUFRLFNBQVMsQ0FBVCxDQUFSLENBQWhCO0FBQ0EsWUFBSSxZQUFZLDZCQUFtQixTQUFTLENBQVQsQ0FBbkIsQ0FBaEI7QUFDQTtBQUNBLFlBQUksV0FBVyxVQUFVLE1BQVYsQ0FBaUIsTUFBakIsQ0FBd0IsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUNuRCxnQkFBSSxLQUFLLE1BQU0sV0FBZixJQUE4QixLQUE5QjtBQUNBLG1CQUFPLEdBQVA7QUFDSCxTQUhjLEVBR1osRUFIWSxDQUFmO0FBSUEsaUJBQVMsQ0FBVCxJQUFjLHFCQUFXLFNBQVMsQ0FBVCxDQUFYLEVBQXdCLEdBQXhCLENBQTRCLGdCQUFRO0FBQzlDLGdCQUFJLEtBQUssVUFBTCxDQUFnQixJQUFoQixDQUFKLEVBQTJCO0FBQ3ZCO0FBQ0Esb0JBQUksV0FBVyxVQUFYLENBQXNCLFNBQXRCLENBQUosRUFBc0M7QUFDbEMsd0JBQUksaUJBQWlCLE9BQU8sSUFBUCxDQUFZLFFBQVosRUFBc0IsTUFBdEIsQ0FBNkI7QUFBQSwrQkFBTSxDQUFDLFdBQVcsa0JBQVgsQ0FBOEIsU0FBOUIsRUFBeUMsU0FBUyxFQUFULEVBQWEsSUFBdEQsQ0FBUDtBQUFBLHFCQUE3QixDQUFyQjtBQUNBLDJCQUFPLEtBQUssU0FBTCxDQUFlLENBQWYsRUFBa0IsS0FBSyxPQUFMLENBQWEsb0JBQWIsSUFBcUMscUJBQXFCLE1BQTVFLElBQXNGLGVBQWUsSUFBZixDQUFvQixHQUFwQixDQUE3RjtBQUNILGlCQUhELE1BR087QUFDSCwyQkFBTyxJQUFQO0FBQ0g7QUFDSixhQVJELE1BUU8sSUFBSSxLQUFLLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBSixFQUFrQztBQUNyQyxvQkFBSSxTQUFTLHNCQUFZLElBQVosQ0FBYjtBQUNBLG9CQUFJLGVBQWUsU0FBUyxPQUFPLFdBQWhCLENBQW5COztBQUVBO0FBQ0Esb0JBQUksV0FBVyxrQkFBWCxDQUE4QixTQUE5QixFQUF5QyxhQUFhLElBQXRELENBQUosRUFBaUU7QUFDN0QsMkJBQU8sSUFBUDtBQUNIOztBQUVEO0FBQ0Esb0JBQUksYUFBYSxJQUFiLENBQWtCLFdBQWxCLE9BQW9DLE1BQXhDLEVBQWdEO0FBQzVDLGlDQUFhLFVBQWIsQ0FBd0IsTUFBeEIsR0FBaUMsV0FBVyxhQUFYLEdBQTJCLENBQTNCLEdBQStCLENBQWhFO0FBQ0E7QUFDQSwyQkFBTyxDQUFDLE9BQU8sTUFBUCxHQUFnQixvQkFBVSxZQUFWLENBQWpCLEVBQTBDLElBQTFDLEVBQVA7QUFDSCxpQkFKRCxNQUlPO0FBQ0gsMkJBQU8sSUFBUDtBQUNIO0FBQ0osYUFqQk0sTUFpQkEsSUFBSSxLQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBSixFQUFnQztBQUNuQyxvQkFBSSxLQUFLLEtBQUssU0FBTCxDQUFlLFVBQVUsTUFBekIsRUFBaUMsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFqQyxDQUFUO0FBQ0Esb0JBQUksZUFBZSxTQUFTLEVBQVQsQ0FBbkIsQ0FGbUMsQ0FFSDs7QUFFaEM7QUFDQSxvQkFBSSxXQUFXLGtCQUFYLENBQThCLFNBQTlCLEVBQXlDLGFBQWEsSUFBdEQsQ0FBSixFQUFpRTtBQUM3RCwyQkFBTyxJQUFQO0FBQ0g7O0FBRUQsb0JBQUksYUFBYSxJQUFiLENBQWtCLFdBQWxCLE9BQW9DLE1BQXhDLEVBQWdEO0FBQzVDO0FBQ0EsMkJBQU8sSUFBUDtBQUNILGlCQUhELE1BR087QUFDSCwyQkFBTyxJQUFQO0FBQ0g7QUFDSixhQWZNLE1BZUEsSUFBSSxLQUFLLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBSixFQUFtQztBQUN0QyxvQkFBSSxLQUFLLEtBQUssU0FBTCxDQUFlLEtBQUssT0FBTCxDQUFhLEdBQWIsSUFBb0IsQ0FBbkMsRUFBc0MsS0FBSyxPQUFMLENBQWEsR0FBYixDQUF0QyxDQUFULENBRHNDLENBQzRCO0FBQ2xFLG9CQUFJLGVBQWUsU0FBUyxFQUFULENBQW5CLENBRnNDLENBRU47O0FBRWhDO0FBQ0Esb0JBQUksV0FBVyxrQkFBWCxDQUE4QixTQUE5QixFQUF5QyxhQUFhLElBQXRELENBQUosRUFBaUU7QUFDN0QsMkJBQU8sSUFBUDtBQUNILGlCQUZELE1BRU87QUFDSCwyQkFBTyxJQUFQO0FBQ0g7QUFDSixhQVZNLE1BVUE7QUFDSCx1QkFBTyxJQUFQO0FBQ0g7QUFDSixTQXREYSxFQXNEWCxNQXREVyxDQXNESjtBQUFBLG1CQUFRLFNBQVMsSUFBakI7QUFBQSxTQXRESSxFQXNEbUIsSUF0RG5CLENBc0R3QixNQXREeEIsQ0FBZDtBQXdESDtBQUNELFdBQU87QUFDSCxhQUFLLFNBQVMsR0FBVCxDQUFhO0FBQUEsbUJBQVcsUUFBUSxJQUFSLEVBQVg7QUFBQSxTQUFiLEVBQXdDLElBQXhDLENBQTZDLE1BQTdDLElBQXVELE1BRHpEO0FBRUgsZ0JBQVEsU0FBUyxNQUFULEdBQWtCLENBRnZCLENBRXlCO0FBRnpCLEtBQVA7QUFJSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gU0RQIGhlbHBlcnMuXG52YXIgU0RQVXRpbHMgPSB7fTtcblxuLy8gR2VuZXJhdGUgYW4gYWxwaGFudW1lcmljIGlkZW50aWZpZXIgZm9yIGNuYW1lIG9yIG1pZHMuXG4vLyBUT0RPOiB1c2UgVVVJRHMgaW5zdGVhZD8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgMTApO1xufTtcblxuLy8gVGhlIFJUQ1AgQ05BTUUgdXNlZCBieSBhbGwgcGVlcmNvbm5lY3Rpb25zIGZyb20gdGhlIHNhbWUgSlMuXG5TRFBVdGlscy5sb2NhbENOYW1lID0gU0RQVXRpbHMuZ2VuZXJhdGVJZGVudGlmaWVyKCk7XG5cbi8vIFNwbGl0cyBTRFAgaW50byBsaW5lcywgZGVhbGluZyB3aXRoIGJvdGggQ1JMRiBhbmQgTEYuXG5TRFBVdGlscy5zcGxpdExpbmVzID0gZnVuY3Rpb24oYmxvYikge1xuICByZXR1cm4gYmxvYi50cmltKCkuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUudHJpbSgpO1xuICB9KTtcbn07XG4vLyBTcGxpdHMgU0RQIGludG8gc2Vzc2lvbnBhcnQgYW5kIG1lZGlhc2VjdGlvbnMuIEVuc3VyZXMgQ1JMRi5cblNEUFV0aWxzLnNwbGl0U2VjdGlvbnMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHZhciBwYXJ0cyA9IGJsb2Iuc3BsaXQoJ1xcbm09Jyk7XG4gIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24ocGFydCwgaW5kZXgpIHtcbiAgICByZXR1cm4gKGluZGV4ID4gMCA/ICdtPScgKyBwYXJ0IDogcGFydCkudHJpbSgpICsgJ1xcclxcbic7XG4gIH0pO1xufTtcblxuLy8gUmV0dXJucyBsaW5lcyB0aGF0IHN0YXJ0IHdpdGggYSBjZXJ0YWluIHByZWZpeC5cblNEUFV0aWxzLm1hdGNoUHJlZml4ID0gZnVuY3Rpb24oYmxvYiwgcHJlZml4KSB7XG4gIHJldHVybiBTRFBVdGlscy5zcGxpdExpbmVzKGJsb2IpLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUuaW5kZXhPZihwcmVmaXgpID09PSAwO1xuICB9KTtcbn07XG5cbi8vIFBhcnNlcyBhbiBJQ0UgY2FuZGlkYXRlIGxpbmUuIFNhbXBsZSBpbnB1dDpcbi8vIGNhbmRpZGF0ZTo3MDI3ODYzNTAgMiB1ZHAgNDE4MTk5MDIgOC44LjguOCA2MDc2OSB0eXAgcmVsYXkgcmFkZHIgOC44LjguOFxuLy8gcnBvcnQgNTU5OTZcIlxuU0RQVXRpbHMucGFyc2VDYW5kaWRhdGUgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cztcbiAgLy8gUGFyc2UgYm90aCB2YXJpYW50cy5cbiAgaWYgKGxpbmUuaW5kZXhPZignYT1jYW5kaWRhdGU6JykgPT09IDApIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEyKS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzID0gbGluZS5zdWJzdHJpbmcoMTApLnNwbGl0KCcgJyk7XG4gIH1cblxuICB2YXIgY2FuZGlkYXRlID0ge1xuICAgIGZvdW5kYXRpb246IHBhcnRzWzBdLFxuICAgIGNvbXBvbmVudDogcGFydHNbMV0sXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLnRvTG93ZXJDYXNlKCksXG4gICAgcHJpb3JpdHk6IHBhcnNlSW50KHBhcnRzWzNdLCAxMCksXG4gICAgaXA6IHBhcnRzWzRdLFxuICAgIHBvcnQ6IHBhcnNlSW50KHBhcnRzWzVdLCAxMCksXG4gICAgLy8gc2tpcCBwYXJ0c1s2XSA9PSAndHlwJ1xuICAgIHR5cGU6IHBhcnRzWzddXG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHN3aXRjaCAocGFydHNbaV0pIHtcbiAgICAgIGNhc2UgJ3JhZGRyJzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jwb3J0JzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0ID0gcGFyc2VJbnQocGFydHNbaSArIDFdLCAxMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGNwdHlwZSc6XG4gICAgICAgIGNhbmRpZGF0ZS50Y3BUeXBlID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIGV4dGVuc2lvbiBoYW5kbGluZywgaW4gcGFydGljdWxhciB1ZnJhZ1xuICAgICAgICBjYW5kaWRhdGVbcGFydHNbaV1dID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZTtcbn07XG5cbi8vIFRyYW5zbGF0ZXMgYSBjYW5kaWRhdGUgb2JqZWN0IGludG8gU0RQIGNhbmRpZGF0ZSBhdHRyaWJ1dGUuXG5TRFBVdGlscy53cml0ZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICB2YXIgc2RwID0gW107XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5mb3VuZGF0aW9uKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmNvbXBvbmVudCk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcm90b2NvbC50b1VwcGVyQ2FzZSgpKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByaW9yaXR5KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmlwKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnBvcnQpO1xuXG4gIHZhciB0eXBlID0gY2FuZGlkYXRlLnR5cGU7XG4gIHNkcC5wdXNoKCd0eXAnKTtcbiAgc2RwLnB1c2godHlwZSk7XG4gIGlmICh0eXBlICE9PSAnaG9zdCcgJiYgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzICYmXG4gICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQpIHtcbiAgICBzZHAucHVzaCgncmFkZHInKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MpOyAvLyB3YXM6IHJlbEFkZHJcbiAgICBzZHAucHVzaCgncnBvcnQnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZFBvcnQpOyAvLyB3YXM6IHJlbFBvcnRcbiAgfVxuICBpZiAoY2FuZGlkYXRlLnRjcFR5cGUgJiYgY2FuZGlkYXRlLnByb3RvY29sLnRvTG93ZXJDYXNlKCkgPT09ICd0Y3AnKSB7XG4gICAgc2RwLnB1c2goJ3RjcHR5cGUnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUudGNwVHlwZSk7XG4gIH1cbiAgcmV0dXJuICdjYW5kaWRhdGU6JyArIHNkcC5qb2luKCcgJyk7XG59O1xuXG4vLyBQYXJzZXMgYW4gaWNlLW9wdGlvbnMgbGluZSwgcmV0dXJucyBhbiBhcnJheSBvZiBvcHRpb24gdGFncy5cbi8vIGE9aWNlLW9wdGlvbnM6Zm9vIGJhclxuU0RQVXRpbHMucGFyc2VJY2VPcHRpb25zID0gZnVuY3Rpb24obGluZSkge1xuICByZXR1cm4gbGluZS5zdWJzdHIoMTQpLnNwbGl0KCcgJyk7XG59XG5cbi8vIFBhcnNlcyBhbiBydHBtYXAgbGluZSwgcmV0dXJucyBSVENSdHBDb2RkZWNQYXJhbWV0ZXJzLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0cG1hcDoxMTEgb3B1cy80ODAwMC8yXG5TRFBVdGlscy5wYXJzZVJ0cE1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgdmFyIHBhcnNlZCA9IHtcbiAgICBwYXlsb2FkVHlwZTogcGFyc2VJbnQocGFydHMuc2hpZnQoKSwgMTApIC8vIHdhczogaWRcbiAgfTtcblxuICBwYXJ0cyA9IHBhcnRzWzBdLnNwbGl0KCcvJyk7XG5cbiAgcGFyc2VkLm5hbWUgPSBwYXJ0c1swXTtcbiAgcGFyc2VkLmNsb2NrUmF0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7IC8vIHdhczogY2xvY2tyYXRlXG4gIC8vIHdhczogY2hhbm5lbHNcbiAgcGFyc2VkLm51bUNoYW5uZWxzID0gcGFydHMubGVuZ3RoID09PSAzID8gcGFyc2VJbnQocGFydHNbMl0sIDEwKSA6IDE7XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZSBhbiBhPXJ0cG1hcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yXG4vLyBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cE1hcCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgcmV0dXJuICdhPXJ0cG1hcDonICsgcHQgKyAnICcgKyBjb2RlYy5uYW1lICsgJy8nICsgY29kZWMuY2xvY2tSYXRlICtcbiAgICAgIChjb2RlYy5udW1DaGFubmVscyAhPT0gMSA/ICcvJyArIGNvZGVjLm51bUNoYW5uZWxzIDogJycpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gYT1leHRtYXAgbGluZSAoaGVhZGVyZXh0ZW5zaW9uIGZyb20gUkZDIDUyODUpLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWV4dG1hcDoyIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcbi8vIGE9ZXh0bWFwOjIvc2VuZG9ubHkgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuU0RQVXRpbHMucGFyc2VFeHRtYXAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgaWQ6IHBhcnNlSW50KHBhcnRzWzBdLCAxMCksXG4gICAgZGlyZWN0aW9uOiBwYXJ0c1swXS5pbmRleE9mKCcvJykgPiAwID8gcGFydHNbMF0uc3BsaXQoJy8nKVsxXSA6ICdzZW5kcmVjdicsXG4gICAgdXJpOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gR2VuZXJhdGVzIGE9ZXh0bWFwIGxpbmUgZnJvbSBSVENSdHBIZWFkZXJFeHRlbnNpb25QYXJhbWV0ZXJzIG9yXG4vLyBSVENSdHBIZWFkZXJFeHRlbnNpb24uXG5TRFBVdGlscy53cml0ZUV4dG1hcCA9IGZ1bmN0aW9uKGhlYWRlckV4dGVuc2lvbikge1xuICByZXR1cm4gJ2E9ZXh0bWFwOicgKyAoaGVhZGVyRXh0ZW5zaW9uLmlkIHx8IGhlYWRlckV4dGVuc2lvbi5wcmVmZXJyZWRJZCkgK1xuICAgICAgKGhlYWRlckV4dGVuc2lvbi5kaXJlY3Rpb24gJiYgaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvbiAhPT0gJ3NlbmRyZWN2J1xuICAgICAgICAgID8gJy8nICsgaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvblxuICAgICAgICAgIDogJycpICtcbiAgICAgICcgJyArIGhlYWRlckV4dGVuc2lvbi51cmkgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBmdG1wIGxpbmUsIHJldHVybnMgZGljdGlvbmFyeS4gU2FtcGxlIGlucHV0OlxuLy8gYT1mbXRwOjk2IHZicj1vbjtjbmc9b25cbi8vIEFsc28gZGVhbHMgd2l0aCB2YnI9b247IGNuZz1vblxuU0RQVXRpbHMucGFyc2VGbXRwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrdjtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnOycpO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAga3YgPSBwYXJ0c1tqXS50cmltKCkuc3BsaXQoJz0nKTtcbiAgICBwYXJzZWRba3ZbMF0udHJpbSgpXSA9IGt2WzFdO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZXMgYW4gYT1mdG1wIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVGbXRwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmUgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucGFyYW1ldGVycyAmJiBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5sZW5ndGgpIHtcbiAgICB2YXIgcGFyYW1zID0gW107XG4gICAgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbihwYXJhbSkge1xuICAgICAgcGFyYW1zLnB1c2gocGFyYW0gKyAnPScgKyBjb2RlYy5wYXJhbWV0ZXJzW3BhcmFtXSk7XG4gICAgfSk7XG4gICAgbGluZSArPSAnYT1mbXRwOicgKyBwdCArICcgJyArIHBhcmFtcy5qb2luKCc7JykgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gbGluZTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydGNwLWZiIGxpbmUsIHJldHVybnMgUlRDUFJ0Y3BGZWVkYmFjayBvYmplY3QuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRjcC1mYjo5OCBuYWNrIHJwc2lcblNEUFV0aWxzLnBhcnNlUnRjcEZiID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcGFydHMuc2hpZnQoKSxcbiAgICBwYXJhbWV0ZXI6IHBhcnRzLmpvaW4oJyAnKVxuICB9O1xufTtcbi8vIEdlbmVyYXRlIGE9cnRjcC1mYiBsaW5lcyBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0Y3BGYiA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lcyA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5ydGNwRmVlZGJhY2sgJiYgY29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aCkge1xuICAgIC8vIEZJWE1FOiBzcGVjaWFsIGhhbmRsaW5nIGZvciB0cnItaW50P1xuICAgIGNvZGVjLnJ0Y3BGZWVkYmFjay5mb3JFYWNoKGZ1bmN0aW9uKGZiKSB7XG4gICAgICBsaW5lcyArPSAnYT1ydGNwLWZiOicgKyBwdCArICcgJyArIGZiLnR5cGUgK1xuICAgICAgKGZiLnBhcmFtZXRlciAmJiBmYi5wYXJhbWV0ZXIubGVuZ3RoID8gJyAnICsgZmIucGFyYW1ldGVyIDogJycpICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbGluZXM7XG59O1xuXG4vLyBQYXJzZXMgYW4gUkZDIDU1NzYgc3NyYyBtZWRpYSBhdHRyaWJ1dGUuIFNhbXBsZSBpbnB1dDpcbi8vIGE9c3NyYzozNzM1OTI4NTU5IGNuYW1lOnNvbWV0aGluZ1xuU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBzcCA9IGxpbmUuaW5kZXhPZignICcpO1xuICB2YXIgcGFydHMgPSB7XG4gICAgc3NyYzogcGFyc2VJbnQobGluZS5zdWJzdHIoNywgc3AgLSA3KSwgMTApXG4gIH07XG4gIHZhciBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicsIHNwKTtcbiAgaWYgKGNvbG9uID4gLTEpIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEsIGNvbG9uIC0gc3AgLSAxKTtcbiAgICBwYXJ0cy52YWx1ZSA9IGxpbmUuc3Vic3RyKGNvbG9uICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxKTtcbiAgfVxuICByZXR1cm4gcGFydHM7XG59O1xuXG4vLyBFeHRyYWN0cyB0aGUgTUlEIChSRkMgNTg4OCkgZnJvbSBhIG1lZGlhIHNlY3Rpb24uXG4vLyByZXR1cm5zIHRoZSBNSUQgb3IgdW5kZWZpbmVkIGlmIG5vIG1pZCBsaW5lIHdhcyBmb3VuZC5cblNEUFV0aWxzLmdldE1pZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgbWlkID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1taWQ6JylbMF07XG4gIGlmIChtaWQpIHtcbiAgICByZXR1cm4gbWlkLnN1YnN0cig2KTtcbiAgfVxufVxuXG5TRFBVdGlscy5wYXJzZUZpbmdlcnByaW50ID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cigxNCkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICBhbGdvcml0aG06IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCksIC8vIGFsZ29yaXRobSBpcyBjYXNlLXNlbnNpdGl2ZSBpbiBFZGdlLlxuICAgIHZhbHVlOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gRXh0cmFjdHMgRFRMUyBwYXJhbWV0ZXJzIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBmaW5nZXJwcmludCBsaW5lIGFzIGlucHV0LiBTZWUgYWxzbyBnZXRJY2VQYXJhbWV0ZXJzLlxuU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiArIHNlc3Npb25wYXJ0LFxuICAgICAgJ2E9ZmluZ2VycHJpbnQ6Jyk7XG4gIC8vIE5vdGU6IGE9c2V0dXAgbGluZSBpcyBpZ25vcmVkIHNpbmNlIHdlIHVzZSB0aGUgJ2F1dG8nIHJvbGUuXG4gIC8vIE5vdGUyOiAnYWxnb3JpdGhtJyBpcyBub3QgY2FzZSBzZW5zaXRpdmUgZXhjZXB0IGluIEVkZ2UuXG4gIHJldHVybiB7XG4gICAgcm9sZTogJ2F1dG8nLFxuICAgIGZpbmdlcnByaW50czogbGluZXMubWFwKFNEUFV0aWxzLnBhcnNlRmluZ2VycHJpbnQpXG4gIH07XG59O1xuXG4vLyBTZXJpYWxpemVzIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR1cFR5cGUpIHtcbiAgdmFyIHNkcCA9ICdhPXNldHVwOicgKyBzZXR1cFR5cGUgKyAnXFxyXFxuJztcbiAgcGFyYW1zLmZpbmdlcnByaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGZwKSB7XG4gICAgc2RwICs9ICdhPWZpbmdlcnByaW50OicgKyBmcC5hbGdvcml0aG0gKyAnICcgKyBmcC52YWx1ZSArICdcXHJcXG4nO1xuICB9KTtcbiAgcmV0dXJuIHNkcDtcbn07XG4vLyBQYXJzZXMgSUNFIGluZm9ybWF0aW9uIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBpY2UtdWZyYWcgYW5kIGljZS1wd2QgbGluZXMgYXMgaW5wdXQuXG5TRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgaWNlUGFyYW1ldGVycyA9IHtcbiAgICB1c2VybmFtZUZyYWdtZW50OiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtdWZyYWc6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEyKSxcbiAgICBwYXNzd29yZDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXB3ZDonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTApXG4gIH07XG4gIHJldHVybiBpY2VQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBJQ0UgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgcmV0dXJuICdhPWljZS11ZnJhZzonICsgcGFyYW1zLnVzZXJuYW1lRnJhZ21lbnQgKyAnXFxyXFxuJyArXG4gICAgICAnYT1pY2UtcHdkOicgKyBwYXJhbXMucGFzc3dvcmQgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgUlRDUnRwUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZGVzY3JpcHRpb24gPSB7XG4gICAgY29kZWNzOiBbXSxcbiAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICBmZWNNZWNoYW5pc21zOiBbXSxcbiAgICBydGNwOiBbXVxuICB9O1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbWxpbmUubGVuZ3RoOyBpKyspIHsgLy8gZmluZCBhbGwgY29kZWNzIGZyb20gbWxpbmVbMy4uXVxuICAgIHZhciBwdCA9IG1saW5lW2ldO1xuICAgIHZhciBydHBtYXBsaW5lID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRwbWFwOicgKyBwdCArICcgJylbMF07XG4gICAgaWYgKHJ0cG1hcGxpbmUpIHtcbiAgICAgIHZhciBjb2RlYyA9IFNEUFV0aWxzLnBhcnNlUnRwTWFwKHJ0cG1hcGxpbmUpO1xuICAgICAgdmFyIGZtdHBzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1mbXRwOicgKyBwdCArICcgJyk7XG4gICAgICAvLyBPbmx5IHRoZSBmaXJzdCBhPWZtdHA6PHB0PiBpcyBjb25zaWRlcmVkLlxuICAgICAgY29kZWMucGFyYW1ldGVycyA9IGZtdHBzLmxlbmd0aCA/IFNEUFV0aWxzLnBhcnNlRm10cChmbXRwc1swXSkgOiB7fTtcbiAgICAgIGNvZGVjLnJ0Y3BGZWVkYmFjayA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1mYjonICsgcHQgKyAnICcpXG4gICAgICAgIC5tYXAoU0RQVXRpbHMucGFyc2VSdGNwRmIpO1xuICAgICAgZGVzY3JpcHRpb24uY29kZWNzLnB1c2goY29kZWMpO1xuICAgICAgLy8gcGFyc2UgRkVDIG1lY2hhbmlzbXMgZnJvbSBydHBtYXAgbGluZXMuXG4gICAgICBzd2l0Y2ggKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdSRUQnOlxuICAgICAgICBjYXNlICdVTFBGRUMnOlxuICAgICAgICAgIGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMucHVzaChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBvbmx5IFJFRCBhbmQgVUxQRkVDIGFyZSByZWNvZ25pemVkIGFzIEZFQyBtZWNoYW5pc21zLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWV4dG1hcDonKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBkZXNjcmlwdGlvbi5oZWFkZXJFeHRlbnNpb25zLnB1c2goU0RQVXRpbHMucGFyc2VFeHRtYXAobGluZSkpO1xuICB9KTtcbiAgLy8gRklYTUU6IHBhcnNlIHJ0Y3AuXG4gIHJldHVybiBkZXNjcmlwdGlvbjtcbn07XG5cbi8vIEdlbmVyYXRlcyBwYXJ0cyBvZiB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gZGVzY3JpYmluZyB0aGUgY2FwYWJpbGl0aWVzIC9cbi8vIHBhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uID0gZnVuY3Rpb24oa2luZCwgY2Fwcykge1xuICB2YXIgc2RwID0gJyc7XG5cbiAgLy8gQnVpbGQgdGhlIG1saW5lLlxuICBzZHAgKz0gJ209JyArIGtpbmQgKyAnICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5sZW5ndGggPiAwID8gJzknIDogJzAnOyAvLyByZWplY3QgaWYgbm8gY29kZWNzLlxuICBzZHAgKz0gJyBVRFAvVExTL1JUUC9TQVZQRiAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubWFwKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVjLnBheWxvYWRUeXBlO1xuICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcblxuICBzZHAgKz0gJ2M9SU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuICBzZHAgKz0gJ2E9cnRjcDo5IElOIElQNCAwLjAuMC4wXFxyXFxuJztcblxuICAvLyBBZGQgYT1ydHBtYXAgbGluZXMgZm9yIGVhY2ggY29kZWMuIEFsc28gZm10cCBhbmQgcnRjcC1mYi5cbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0cE1hcChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRm10cChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRjcEZiKGNvZGVjKTtcbiAgfSk7XG4gIHZhciBtYXhwdGltZSA9IDA7XG4gIGNhcHMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubWF4cHRpbWUgPiBtYXhwdGltZSkge1xuICAgICAgbWF4cHRpbWUgPSBjb2RlYy5tYXhwdGltZTtcbiAgICB9XG4gIH0pO1xuICBpZiAobWF4cHRpbWUgPiAwKSB7XG4gICAgc2RwICs9ICdhPW1heHB0aW1lOicgKyBtYXhwdGltZSArICdcXHJcXG4nO1xuICB9XG4gIHNkcCArPSAnYT1ydGNwLW11eFxcclxcbic7XG5cbiAgY2Fwcy5oZWFkZXJFeHRlbnNpb25zLmZvckVhY2goZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRXh0bWFwKGV4dGVuc2lvbik7XG4gIH0pO1xuICAvLyBGSVhNRTogd3JpdGUgZmVjTWVjaGFuaXNtcy5cbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgYW4gYXJyYXkgb2Zcbi8vIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBlbmNvZGluZ1BhcmFtZXRlcnMgPSBbXTtcbiAgdmFyIGRlc2NyaXB0aW9uID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBoYXNSZWQgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1JFRCcpICE9PSAtMTtcbiAgdmFyIGhhc1VscGZlYyA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignVUxQRkVDJykgIT09IC0xO1xuXG4gIC8vIGZpbHRlciBhPXNzcmM6Li4uIGNuYW1lOiwgaWdub3JlIFBsYW5CLW1zaWRcbiAgdmFyIHNzcmNzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgfSlcbiAgLmZpbHRlcihmdW5jdGlvbihwYXJ0cykge1xuICAgIHJldHVybiBwYXJ0cy5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gIH0pO1xuICB2YXIgcHJpbWFyeVNzcmMgPSBzc3Jjcy5sZW5ndGggPiAwICYmIHNzcmNzWzBdLnNzcmM7XG4gIHZhciBzZWNvbmRhcnlTc3JjO1xuXG4gIHZhciBmbG93cyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYy1ncm91cDpGSUQnKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgcGFydHMuc2hpZnQoKTtcbiAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwYXJ0LCAxMCk7XG4gICAgfSk7XG4gIH0pO1xuICBpZiAoZmxvd3MubGVuZ3RoID4gMCAmJiBmbG93c1swXS5sZW5ndGggPiAxICYmIGZsb3dzWzBdWzBdID09PSBwcmltYXJ5U3NyYykge1xuICAgIHNlY29uZGFyeVNzcmMgPSBmbG93c1swXVsxXTtcbiAgfVxuXG4gIGRlc2NyaXB0aW9uLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1JUWCcgJiYgY29kZWMucGFyYW1ldGVycy5hcHQpIHtcbiAgICAgIHZhciBlbmNQYXJhbSA9IHtcbiAgICAgICAgc3NyYzogcHJpbWFyeVNzcmMsXG4gICAgICAgIGNvZGVjUGF5bG9hZFR5cGU6IHBhcnNlSW50KGNvZGVjLnBhcmFtZXRlcnMuYXB0LCAxMCksXG4gICAgICAgIHJ0eDoge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmNcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcbiAgICAgIGlmIChoYXNSZWQpIHtcbiAgICAgICAgZW5jUGFyYW0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVuY1BhcmFtKSk7XG4gICAgICAgIGVuY1BhcmFtLmZlYyA9IHtcbiAgICAgICAgICBzc3JjOiBzZWNvbmRhcnlTc3JjLFxuICAgICAgICAgIG1lY2hhbmlzbTogaGFzVWxwZmVjID8gJ3JlZCt1bHBmZWMnIDogJ3JlZCdcbiAgICAgICAgfTtcbiAgICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChlbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoID09PSAwICYmIHByaW1hcnlTc3JjKSB7XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgc3NyYzogcHJpbWFyeVNzcmNcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHdlIHN1cHBvcnQgYm90aCBiPUFTIGFuZCBiPVRJQVMgYnV0IGludGVycHJldCBBUyBhcyBUSUFTLlxuICB2YXIgYmFuZHdpZHRoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYj0nKTtcbiAgaWYgKGJhbmR3aWR0aC5sZW5ndGgpIHtcbiAgICBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9VElBUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig3KSwgMTApO1xuICAgIH0gZWxzZSBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9QVM6JykgPT09IDApIHtcbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNSksIDEwKTtcbiAgICB9XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICBwYXJhbXMubWF4Qml0cmF0ZSA9IGJhbmR3aWR0aDtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZW5jb2RpbmdQYXJhbWV0ZXJzO1xufTtcblxuLy8gcGFyc2VzIGh0dHA6Ly9kcmFmdC5vcnRjLm9yZy8jcnRjcnRjcHBhcmFtZXRlcnMqXG5TRFBVdGlscy5wYXJzZVJ0Y3BQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBydGNwUGFyYW1ldGVycyA9IHt9O1xuXG4gIHZhciBjbmFtZTtcbiAgLy8gR2V0cyB0aGUgZmlyc3QgU1NSQy4gTm90ZSB0aGF0IHdpdGggUlRYIHRoZXJlIG1pZ2h0IGJlIG11bHRpcGxlXG4gIC8vIFNTUkNzLlxuICB2YXIgcmVtb3RlU3NyYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAgICAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqLmF0dHJpYnV0ZSA9PT0gJ2NuYW1lJztcbiAgICAgIH0pWzBdO1xuICBpZiAocmVtb3RlU3NyYykge1xuICAgIHJ0Y3BQYXJhbWV0ZXJzLmNuYW1lID0gcmVtb3RlU3NyYy52YWx1ZTtcbiAgICBydGNwUGFyYW1ldGVycy5zc3JjID0gcmVtb3RlU3NyYy5zc3JjO1xuICB9XG5cbiAgLy8gRWRnZSB1c2VzIHRoZSBjb21wb3VuZCBhdHRyaWJ1dGUgaW5zdGVhZCBvZiByZWR1Y2VkU2l6ZVxuICAvLyBjb21wb3VuZCBpcyAhcmVkdWNlZFNpemVcbiAgdmFyIHJzaXplID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1ydGNwLXJzaXplJyk7XG4gIHJ0Y3BQYXJhbWV0ZXJzLnJlZHVjZWRTaXplID0gcnNpemUubGVuZ3RoID4gMDtcbiAgcnRjcFBhcmFtZXRlcnMuY29tcG91bmQgPSByc2l6ZS5sZW5ndGggPT09IDA7XG5cbiAgLy8gcGFyc2VzIHRoZSBydGNwLW11eCBhdHRy0ZZidXRlLlxuICAvLyBOb3RlIHRoYXQgRWRnZSBkb2VzIG5vdCBzdXBwb3J0IHVubXV4ZWQgUlRDUC5cbiAgdmFyIG11eCA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1tdXgnKTtcbiAgcnRjcFBhcmFtZXRlcnMubXV4ID0gbXV4Lmxlbmd0aCA+IDA7XG5cbiAgcmV0dXJuIHJ0Y3BQYXJhbWV0ZXJzO1xufTtcblxuLy8gcGFyc2VzIGVpdGhlciBhPW1zaWQ6IG9yIGE9c3NyYzouLi4gbXNpZCBsaW5lcyBhbmQgcmV0dXJuc1xuLy8gdGhlIGlkIG9mIHRoZSBNZWRpYVN0cmVhbSBhbmQgTWVkaWFTdHJlYW1UcmFjay5cblNEUFV0aWxzLnBhcnNlTXNpZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgcGFydHM7XG4gIHZhciBzcGVjID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1tc2lkOicpO1xuICBpZiAoc3BlYy5sZW5ndGggPT09IDEpIHtcbiAgICBwYXJ0cyA9IHNwZWNbMF0uc3Vic3RyKDcpLnNwbGl0KCcgJyk7XG4gICAgcmV0dXJuIHtzdHJlYW06IHBhcnRzWzBdLCB0cmFjazogcGFydHNbMV19O1xuICB9XG4gIHZhciBwbGFuQiA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gIH0pXG4gIC5maWx0ZXIoZnVuY3Rpb24ocGFydHMpIHtcbiAgICByZXR1cm4gcGFydHMuYXR0cmlidXRlID09PSAnbXNpZCc7XG4gIH0pO1xuICBpZiAocGxhbkIubGVuZ3RoID4gMCkge1xuICAgIHBhcnRzID0gcGxhbkJbMF0udmFsdWUuc3BsaXQoJyAnKTtcbiAgICByZXR1cm4ge3N0cmVhbTogcGFydHNbMF0sIHRyYWNrOiBwYXJ0c1sxXX07XG4gIH1cbn07XG5cblNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIEZJWE1FOiBzZXNzLWlkIHNob3VsZCBiZSBhbiBOVFAgdGltZXN0YW1wLlxuICByZXR1cm4gJ3Y9MFxcclxcbicgK1xuICAgICAgJ289dGhpc2lzYWRhcHRlcm9ydGMgODE2OTYzOTkxNTY0Njk0MzEzNyAyIElOIElQNCAxMjcuMC4wLjFcXHJcXG4nICtcbiAgICAgICdzPS1cXHJcXG4nICtcbiAgICAgICd0PTAgMFxcclxcbic7XG59O1xuXG5TRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbiA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLCBjYXBzLCB0eXBlLCBzdHJlYW0pIHtcbiAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlUnRwRGVzY3JpcHRpb24odHJhbnNjZWl2ZXIua2luZCwgY2Fwcyk7XG5cbiAgLy8gTWFwIElDRSBwYXJhbWV0ZXJzICh1ZnJhZywgcHdkKSB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5nZXRMb2NhbFBhcmFtZXRlcnMoKSk7XG5cbiAgLy8gTWFwIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG4gIHNkcCArPSBTRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5nZXRMb2NhbFBhcmFtZXRlcnMoKSxcbiAgICAgIHR5cGUgPT09ICdvZmZlcicgPyAnYWN0cGFzcycgOiAnYWN0aXZlJyk7XG5cbiAgc2RwICs9ICdhPW1pZDonICsgdHJhbnNjZWl2ZXIubWlkICsgJ1xcclxcbic7XG5cbiAgaWYgKHRyYW5zY2VpdmVyLmRpcmVjdGlvbikge1xuICAgIHNkcCArPSAnYT0nICsgdHJhbnNjZWl2ZXIuZGlyZWN0aW9uICsgJ1xcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgc2RwICs9ICdhPXNlbmRyZWN2XFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZG9ubHlcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgc2RwICs9ICdhPXJlY3Zvbmx5XFxyXFxuJztcbiAgfSBlbHNlIHtcbiAgICBzZHAgKz0gJ2E9aW5hY3RpdmVcXHJcXG4nO1xuICB9XG5cbiAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIC8vIHNwZWMuXG4gICAgdmFyIG1zaWQgPSAnbXNpZDonICsgc3RyZWFtLmlkICsgJyAnICtcbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnRyYWNrLmlkICsgJ1xcclxcbic7XG4gICAgc2RwICs9ICdhPScgKyBtc2lkO1xuXG4gICAgLy8gZm9yIENocm9tZS5cbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcbiAgICAgICAgJyAnICsgbXNpZDtcbiAgICBpZiAodHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcbiAgICAgICAgICAnICcgKyBtc2lkO1xuICAgICAgc2RwICs9ICdhPXNzcmMtZ3JvdXA6RklEICcgK1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArICcgJyArXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXG4gICAgICAgICAgJ1xcclxcbic7XG4gICAgfVxuICB9XG4gIC8vIEZJWE1FOiB0aGlzIHNob3VsZCBiZSB3cml0dGVuIGJ5IHdyaXRlUnRwRGVzY3JpcHRpb24uXG4gIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgJyBjbmFtZTonICsgU0RQVXRpbHMubG9jYWxDTmFtZSArICdcXHJcXG4nO1xuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyICYmIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4KSB7XG4gICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xuICAgICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIH1cbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIEdldHMgdGhlIGRpcmVjdGlvbiBmcm9tIHRoZSBtZWRpYVNlY3Rpb24gb3IgdGhlIHNlc3Npb25wYXJ0LlxuU0RQVXRpbHMuZ2V0RGlyZWN0aW9uID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICAvLyBMb29rIGZvciBzZW5kcmVjdiwgc2VuZG9ubHksIHJlY3Zvbmx5LCBpbmFjdGl2ZSwgZGVmYXVsdCB0byBzZW5kcmVjdi5cbiAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgc3dpdGNoIChsaW5lc1tpXSkge1xuICAgICAgY2FzZSAnYT1zZW5kcmVjdic6XG4gICAgICBjYXNlICdhPXNlbmRvbmx5JzpcbiAgICAgIGNhc2UgJ2E9cmVjdm9ubHknOlxuICAgICAgY2FzZSAnYT1pbmFjdGl2ZSc6XG4gICAgICAgIHJldHVybiBsaW5lc1tpXS5zdWJzdHIoMik7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBGSVhNRTogV2hhdCBzaG91bGQgaGFwcGVuIGhlcmU/XG4gICAgfVxuICB9XG4gIGlmIChzZXNzaW9ucGFydCkge1xuICAgIHJldHVybiBTRFBVdGlscy5nZXREaXJlY3Rpb24oc2Vzc2lvbnBhcnQpO1xuICB9XG4gIHJldHVybiAnc2VuZHJlY3YnO1xufTtcblxuU0RQVXRpbHMuZ2V0S2luZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIHJldHVybiBtbGluZVswXS5zdWJzdHIoMik7XG59O1xuXG5TRFBVdGlscy5pc1JlamVjdGVkID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHJldHVybiBtZWRpYVNlY3Rpb24uc3BsaXQoJyAnLCAyKVsxXSA9PT0gJzAnO1xufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBTRFBVdGlscztcbiIsIi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xudmFyIGJ5dGVUb0hleCA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4O1xuICAvLyBqb2luIHVzZWQgdG8gZml4IG1lbW9yeSBpc3N1ZSBjYXVzZWQgYnkgY29uY2F0ZW5hdGlvbjogaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzE3NSNjNFxuICByZXR1cm4gKFtidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCBcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLCAnLScsXG5cdGJ0aFtidWZbaSsrXV0sIGJ0aFtidWZbaSsrXV0sICctJyxcblx0YnRoW2J1ZltpKytdXSwgYnRoW2J1ZltpKytdXSwgJy0nLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dLFxuXHRidGhbYnVmW2krK11dLCBidGhbYnVmW2krK11dXSkuam9pbignJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnl0ZXNUb1V1aWQ7XG4iLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiAgSW4gdGhlXG4vLyBicm93c2VyIHRoaXMgaXMgYSBsaXR0bGUgY29tcGxpY2F0ZWQgZHVlIHRvIHVua25vd24gcXVhbGl0eSBvZiBNYXRoLnJhbmRvbSgpXG4vLyBhbmQgaW5jb25zaXN0ZW50IHN1cHBvcnQgZm9yIHRoZSBgY3J5cHRvYCBBUEkuICBXZSBkbyB0aGUgYmVzdCB3ZSBjYW4gdmlhXG4vLyBmZWF0dXJlLWRldGVjdGlvblxuXG4vLyBnZXRSYW5kb21WYWx1ZXMgbmVlZHMgdG8gYmUgaW52b2tlZCBpbiBhIGNvbnRleHQgd2hlcmUgXCJ0aGlzXCIgaXMgYSBDcnlwdG9cbi8vIGltcGxlbWVudGF0aW9uLiBBbHNvLCBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gb24gSUUxMS5cbnZhciBnZXRSYW5kb21WYWx1ZXMgPSAodHlwZW9mKGNyeXB0bykgIT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAodHlwZW9mKG1zQ3J5cHRvKSAhPSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93Lm1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyA9PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKSk7XG5cbmlmIChnZXRSYW5kb21WYWx1ZXMpIHtcbiAgLy8gV0hBVFdHIGNyeXB0byBSTkcgLSBodHRwOi8vd2lraS53aGF0d2cub3JnL3dpa2kvQ3J5cHRvXG4gIHZhciBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd2hhdHdnUk5HKCkge1xuICAgIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG4gICAgcmV0dXJuIHJuZHM4O1xuICB9O1xufSBlbHNlIHtcbiAgLy8gTWF0aC5yYW5kb20oKS1iYXNlZCAoUk5HKVxuICAvL1xuICAvLyBJZiBhbGwgZWxzZSBmYWlscywgdXNlIE1hdGgucmFuZG9tKCkuICBJdCdzIGZhc3QsIGJ1dCBpcyBvZiB1bnNwZWNpZmllZFxuICAvLyBxdWFsaXR5LlxuICB2YXIgcm5kcyA9IG5ldyBBcnJheSgxNik7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYXRoUk5HKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCByOyBpIDwgMTY7IGkrKykge1xuICAgICAgaWYgKChpICYgMHgwMykgPT09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICBybmRzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgIH1cblxuICAgIHJldHVybiBybmRzO1xuICB9O1xufVxuIiwidmFyIHJuZyA9IHJlcXVpcmUoJy4vbGliL3JuZycpO1xudmFyIGJ5dGVzVG9VdWlkID0gcmVxdWlyZSgnLi9saWIvYnl0ZXNUb1V1aWQnKTtcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgIGJ1ZiA9IG9wdGlvbnMgPT09ICdiaW5hcnknID8gbmV3IEFycmF5KDE2KSA6IG51bGw7XG4gICAgb3B0aW9ucyA9IG51bGw7XG4gIH1cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdmFyIHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpO1xuXG4gIC8vIFBlciA0LjQsIHNldCBiaXRzIGZvciB2ZXJzaW9uIGFuZCBgY2xvY2tfc2VxX2hpX2FuZF9yZXNlcnZlZGBcbiAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICBybmRzWzhdID0gKHJuZHNbOF0gJiAweDNmKSB8IDB4ODA7XG5cbiAgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG4gIGlmIChidWYpIHtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgMTY7ICsraWkpIHtcbiAgICAgIGJ1ZltpICsgaWldID0gcm5kc1tpaV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZiB8fCBieXRlc1RvVXVpZChybmRzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2NDtcbiIsIi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNoaW1taW5nIHN0YXJ0cyBoZXJlLlxuKGZ1bmN0aW9uKCkge1xuICAvLyBVdGlscy5cbiAgdmFyIGxvZ2dpbmcgPSByZXF1aXJlKCcuL3V0aWxzJykubG9nO1xuICB2YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuL3V0aWxzJykuYnJvd3NlckRldGFpbHM7XG4gIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gIG1vZHVsZS5leHBvcnRzLmJyb3dzZXJEZXRhaWxzID0gYnJvd3NlckRldGFpbHM7XG4gIG1vZHVsZS5leHBvcnRzLmV4dHJhY3RWZXJzaW9uID0gcmVxdWlyZSgnLi91dGlscycpLmV4dHJhY3RWZXJzaW9uO1xuICBtb2R1bGUuZXhwb3J0cy5kaXNhYmxlTG9nID0gcmVxdWlyZSgnLi91dGlscycpLmRpc2FibGVMb2c7XG5cbiAgLy8gVW5jb21tZW50IHRoZSBsaW5lIGJlbG93IGlmIHlvdSB3YW50IGxvZ2dpbmcgdG8gb2NjdXIsIGluY2x1ZGluZyBsb2dnaW5nXG4gIC8vIGZvciB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvdy4gQ2FuIGFsc28gYmUgdHVybmVkIG9uIGluIHRoZSBicm93c2VyIHZpYVxuICAvLyBhZGFwdGVyLmRpc2FibGVMb2coZmFsc2UpLCBidXQgdGhlbiBsb2dnaW5nIGZyb20gdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3dcbiAgLy8gd2lsbCBub3QgYXBwZWFyLlxuICAvLyByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZyhmYWxzZSk7XG5cbiAgLy8gQnJvd3NlciBzaGltcy5cbiAgdmFyIGNocm9tZVNoaW0gPSByZXF1aXJlKCcuL2Nocm9tZS9jaHJvbWVfc2hpbScpIHx8IG51bGw7XG4gIHZhciBlZGdlU2hpbSA9IHJlcXVpcmUoJy4vZWRnZS9lZGdlX3NoaW0nKSB8fCBudWxsO1xuICB2YXIgZmlyZWZveFNoaW0gPSByZXF1aXJlKCcuL2ZpcmVmb3gvZmlyZWZveF9zaGltJykgfHwgbnVsbDtcbiAgdmFyIHNhZmFyaVNoaW0gPSByZXF1aXJlKCcuL3NhZmFyaS9zYWZhcmlfc2hpbScpIHx8IG51bGw7XG5cbiAgLy8gU2hpbSBicm93c2VyIGlmIGZvdW5kLlxuICBzd2l0Y2ggKGJyb3dzZXJEZXRhaWxzLmJyb3dzZXIpIHtcbiAgICBjYXNlICdvcGVyYSc6IC8vIGZhbGx0aHJvdWdoIGFzIGl0IHVzZXMgY2hyb21lIHNoaW1zXG4gICAgY2FzZSAnY2hyb21lJzpcbiAgICAgIGlmICghY2hyb21lU2hpbSB8fCAhY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgbG9nZ2luZygnQ2hyb21lIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGNocm9tZS4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGNocm9tZVNoaW07XG5cbiAgICAgIGNocm9tZVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltTWVkaWFTdHJlYW0oKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbVNvdXJjZU9iamVjdCgpO1xuICAgICAgY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGNocm9tZVNoaW0uc2hpbU9uVHJhY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZpcmVmb3gnOlxuICAgICAgaWYgKCFmaXJlZm94U2hpbSB8fCAhZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKSB7XG4gICAgICAgIGxvZ2dpbmcoJ0ZpcmVmb3ggc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZmlyZWZveC4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBtb2R1bGUuZXhwb3J0cy5icm93c2VyU2hpbSA9IGZpcmVmb3hTaGltO1xuXG4gICAgICBmaXJlZm94U2hpbS5zaGltR2V0VXNlck1lZGlhKCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltU291cmNlT2JqZWN0KCk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24oKTtcbiAgICAgIGZpcmVmb3hTaGltLnNoaW1PblRyYWNrKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlZGdlJzpcbiAgICAgIGlmICghZWRnZVNoaW0gfHwgIWVkZ2VTaGltLnNoaW1QZWVyQ29ubmVjdGlvbikge1xuICAgICAgICBsb2dnaW5nKCdNUyBlZGdlIHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsb2dnaW5nKCdhZGFwdGVyLmpzIHNoaW1taW5nIGVkZ2UuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBlZGdlU2hpbTtcblxuICAgICAgZWRnZVNoaW0uc2hpbUdldFVzZXJNZWRpYSgpO1xuICAgICAgZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzYWZhcmknOlxuICAgICAgaWYgKCFzYWZhcmlTaGltKSB7XG4gICAgICAgIGxvZ2dpbmcoJ1NhZmFyaSBzaGltIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGFkYXB0ZXIgcmVsZWFzZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBzYWZhcmkuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgbW9kdWxlLmV4cG9ydHMuYnJvd3NlclNoaW0gPSBzYWZhcmlTaGltO1xuXG4gICAgICBzYWZhcmlTaGltLnNoaW1HZXRVc2VyTWVkaWEoKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dnaW5nKCdVbnN1cHBvcnRlZCBicm93c2VyIScpO1xuICB9XG59KSgpO1xuIiwiXG4vKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpLmJyb3dzZXJEZXRhaWxzO1xuXG52YXIgY2hyb21lU2hpbSA9IHtcbiAgc2hpbU1lZGlhU3RyZWFtOiBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuTWVkaWFTdHJlYW0gPSB3aW5kb3cuTWVkaWFTdHJlYW0gfHwgd2luZG93LndlYmtpdE1lZGlhU3RyZWFtO1xuICB9LFxuXG4gIHNoaW1PblRyYWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmICEoJ29udHJhY2snIGluXG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ29udHJhY2snLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX29udHJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIG9uYWRkc3RyZWFtIGRvZXMgbm90IGZpcmUgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIHRvIGFuIGV4aXN0aW5nXG4gICAgICAgICAgICAvLyBzdHJlYW0uIEJ1dCBzdHJlYW0ub25hZGR0cmFjayBpcyBpbXBsZW1lbnRlZCBzbyB3ZSB1c2UgdGhhdC5cbiAgICAgICAgICAgIGUuc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24odGUpIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRlLnRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdGUudHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZS5zdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3RyYWNrJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgIGV2ZW50LnJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbXMgPSBbZS5zdHJlYW1dO1xuICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAod2luZG93LkhUTUxNZWRpYUVsZW1lbnQgJiZcbiAgICAgICAgISgnc3JjT2JqZWN0JyBpbiB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUpKSB7XG4gICAgICAgIC8vIFNoaW0gdGhlIHNyY09iamVjdCBwcm9wZXJ0eSwgb25jZSwgd2hlbiBIVE1MTWVkaWFFbGVtZW50IGlzIGZvdW5kLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjT2JqZWN0Jywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIC8vIFVzZSBfc3JjT2JqZWN0IGFzIGEgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgdGhpcyBzaGltXG4gICAgICAgICAgICB0aGlzLl9zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgICBpZiAodGhpcy5zcmMpIHtcbiAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnNyYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghc3RyZWFtKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3JjID0gJyc7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgYmxvYiB1cmwgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIG9yXG4gICAgICAgICAgICAvLyByZW1vdmVkLiBEb2luZyBpdCBtYW51YWxseSBzaW5jZSB3ZSB3YW50IHRvIGF2b2lkIGEgcmVjdXJzaW9uLlxuICAgICAgICAgICAgc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChzZWxmLnNyYykge1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoc2VsZi5zcmMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcigncmVtb3ZldHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgIC8vIFRyYW5zbGF0ZSBpY2VUcmFuc3BvcnRQb2xpY3kgdG8gaWNlVHJhbnNwb3J0cyxcbiAgICAgIC8vIHNlZSBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTQ4NjlcbiAgICAgIGxvZ2dpbmcoJ1BlZXJDb25uZWN0aW9uJyk7XG4gICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgIHBjQ29uZmlnLmljZVRyYW5zcG9ydHMgPSBwY0NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3k7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYyA9IG5ldyB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cyk7XG4gICAgICB2YXIgb3JpZ0dldFN0YXRzID0gcGMuZ2V0U3RhdHMuYmluZChwYyk7XG4gICAgICBwYy5nZXRTdGF0cyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAvLyBJZiBzZWxlY3RvciBpcyBhIGZ1bmN0aW9uIHRoZW4gd2UgYXJlIGluIHRoZSBvbGQgc3R5bGUgc3RhdHMgc28ganVzdFxuICAgICAgICAvLyBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIGdldFN0YXRzIGZvcm1hdCB0byBhdm9pZCBicmVha2luZyBvbGQgdXNlcnMuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzKHNlbGVjdG9yLCBzdWNjZXNzQ2FsbGJhY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpeENocm9tZVN0YXRzXyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgdmFyIHN0YW5kYXJkUmVwb3J0ID0ge307XG4gICAgICAgICAgdmFyIHJlcG9ydHMgPSByZXNwb25zZS5yZXN1bHQoKTtcbiAgICAgICAgICByZXBvcnRzLmZvckVhY2goZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgICAgICB2YXIgc3RhbmRhcmRTdGF0cyA9IHtcbiAgICAgICAgICAgICAgaWQ6IHJlcG9ydC5pZCxcbiAgICAgICAgICAgICAgdGltZXN0YW1wOiByZXBvcnQudGltZXN0YW1wLFxuICAgICAgICAgICAgICB0eXBlOiByZXBvcnQudHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcG9ydC5uYW1lcygpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICBzdGFuZGFyZFN0YXRzW25hbWVdID0gcmVwb3J0LnN0YXQobmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0YW5kYXJkUmVwb3J0W3N0YW5kYXJkU3RhdHMuaWRdID0gc3RhbmRhcmRTdGF0cztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzdGFuZGFyZFJlcG9ydDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBzaGltIGdldFN0YXRzIHdpdGggbWFwbGlrZSBzdXBwb3J0XG4gICAgICAgIHZhciBtYWtlTWFwU3RhdHMgPSBmdW5jdGlvbihzdGF0cywgbGVnYWN5U3RhdHMpIHtcbiAgICAgICAgICB2YXIgbWFwID0gbmV3IE1hcChPYmplY3Qua2V5cyhzdGF0cykubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuW2tleSwgc3RhdHNba2V5XV07XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGxlZ2FjeVN0YXRzID0gbGVnYWN5U3RhdHMgfHwgc3RhdHM7XG4gICAgICAgICAgT2JqZWN0LmtleXMobGVnYWN5U3RhdHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBtYXBba2V5XSA9IGxlZ2FjeVN0YXRzW2tleV07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgdmFyIHN1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGFyZ3NbMV0obWFrZU1hcFN0YXRzKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIG9yaWdHZXRTdGF0cy5hcHBseSh0aGlzLCBbc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8sXG4gICAgICAgICAgICAgIGFyZ3VtZW50c1swXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcHJvbWlzZS1zdXBwb3J0XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgb3JpZ0dldFN0YXRzLmFwcGx5KHNlbGYsIFtcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG1ha2VNYXBTdGF0cyhmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpKSk7XG4gICAgICAgICAgICAgIH0sIHJlamVjdF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBQcmVzZXJ2ZSBsZWdhY3kgY2hyb21lIHN0YXRzIG9ubHkgb24gbGVnYWN5IGFjY2VzcyBvZiBzdGF0cyBvYmpcbiAgICAgICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShzZWxmLCBbXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShtYWtlTWFwU3RhdHMoZml4Q2hyb21lU3RhdHNfKHJlc3BvbnNlKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UucmVzdWx0KCkpKTtcbiAgICAgICAgICAgICAgfSwgcmVqZWN0XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcGM7XG4gICAgfTtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICBpZiAod2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHZhciBuYXRpdmVNZXRob2QgPSB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxIHx8IChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgICB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgbmF0aXZlTWV0aG9kLmFwcGx5KHNlbGYsIFtyZXNvbHZlLCByZWplY3QsIG9wdHNdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIHByb21pc2Ugc3VwcG9ydCAtLSBuYXRpdmVseSBhdmFpbGFibGUgaW4gQ2hyb21lIDUxXG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA1MSkge1xuICAgICAgWydzZXRMb2NhbERlc2NyaXB0aW9uJywgJ3NldFJlbW90ZURlc2NyaXB0aW9uJywgJ2FkZEljZUNhbmRpZGF0ZSddXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgICB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIG5hdGl2ZU1ldGhvZC5hcHBseShzZWxmLCBbYXJnc1swXSwgcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwsIFtdKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgICAgICAgIGFyZ3NbMl0uYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHNoaW0gaW1wbGljaXQgY3JlYXRpb24gb2YgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uL1JUQ0ljZUNhbmRpZGF0ZVxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgd2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpID9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBhZGRJY2VDYW5kaWRhdGUobnVsbClcbiAgICB2YXIgbmF0aXZlQWRkSWNlQ2FuZGlkYXRlID1cbiAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYXJndW1lbnRzWzBdID09PSBudWxsKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHNbMV0pIHtcbiAgICAgICAgICBhcmd1bWVudHNbMV0uYXBwbHkobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZUFkZEljZUNhbmRpZGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cbn07XG5cblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1NZWRpYVN0cmVhbTogY2hyb21lU2hpbS5zaGltTWVkaWFTdHJlYW0sXG4gIHNoaW1PblRyYWNrOiBjaHJvbWVTaGltLnNoaW1PblRyYWNrLFxuICBzaGltU291cmNlT2JqZWN0OiBjaHJvbWVTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogY2hyb21lU2hpbS5zaGltUGVlckNvbm5lY3Rpb24sXG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJylcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKS5sb2c7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb25zdHJhaW50c1RvQ2hyb21lXyA9IGZ1bmN0aW9uKGMpIHtcbiAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnIHx8IGMubWFuZGF0b3J5IHx8IGMub3B0aW9uYWwpIHtcbiAgICAgIHJldHVybiBjO1xuICAgIH1cbiAgICB2YXIgY2MgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmUnIHx8IGtleSA9PT0gJ2FkdmFuY2VkJyB8fCBrZXkgPT09ICdtZWRpYVNvdXJjZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHIgPSAodHlwZW9mIGNba2V5XSA9PT0gJ29iamVjdCcpID8gY1trZXldIDoge2lkZWFsOiBjW2tleV19O1xuICAgICAgaWYgKHIuZXhhY3QgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygci5leGFjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgci5taW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICB9XG4gICAgICB2YXIgb2xkbmFtZV8gPSBmdW5jdGlvbihwcmVmaXgsIG5hbWUpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5hbWUgPT09ICdkZXZpY2VJZCcpID8gJ3NvdXJjZUlkJyA6IG5hbWU7XG4gICAgICB9O1xuICAgICAgaWYgKHIuaWRlYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjYy5vcHRpb25hbCA9IGNjLm9wdGlvbmFsIHx8IFtdO1xuICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgaWYgKHR5cGVvZiByLmlkZWFsID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCdtaW4nLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgICAgb2MgPSB7fTtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWF4Jywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9jW29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuaWRlYWw7XG4gICAgICAgICAgY2Mub3B0aW9uYWwucHVzaChvYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgIT09ICdudW1iZXInKSB7XG4gICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKCcnLCBrZXkpXSA9IHIuZXhhY3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBbJ21pbicsICdtYXgnXS5mb3JFYWNoKGZ1bmN0aW9uKG1peCkge1xuICAgICAgICAgIGlmIChyW21peF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5ID0gY2MubWFuZGF0b3J5IHx8IHt9O1xuICAgICAgICAgICAgY2MubWFuZGF0b3J5W29sZG5hbWVfKG1peCwga2V5KV0gPSByW21peF07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYy5hZHZhbmNlZCkge1xuICAgICAgY2Mub3B0aW9uYWwgPSAoY2Mub3B0aW9uYWwgfHwgW10pLmNvbmNhdChjLmFkdmFuY2VkKTtcbiAgICB9XG4gICAgcmV0dXJuIGNjO1xuICB9O1xuXG4gIHZhciBzaGltQ29uc3RyYWludHNfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIGZ1bmMpIHtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoY29uc3RyYWludHMgJiYgY29uc3RyYWludHMuYXVkaW8pIHtcbiAgICAgIGNvbnN0cmFpbnRzLmF1ZGlvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMuYXVkaW8pO1xuICAgIH1cbiAgICBpZiAoY29uc3RyYWludHMgJiYgdHlwZW9mIGNvbnN0cmFpbnRzLnZpZGVvID09PSAnb2JqZWN0Jykge1xuICAgICAgLy8gU2hpbSBmYWNpbmdNb2RlIGZvciBtb2JpbGUsIHdoZXJlIGl0IGRlZmF1bHRzIHRvIFwidXNlclwiLlxuICAgICAgdmFyIGZhY2UgPSBjb25zdHJhaW50cy52aWRlby5mYWNpbmdNb2RlO1xuICAgICAgZmFjZSA9IGZhY2UgJiYgKCh0eXBlb2YgZmFjZSA9PT0gJ29iamVjdCcpID8gZmFjZSA6IHtpZGVhbDogZmFjZX0pO1xuXG4gICAgICBpZiAoKGZhY2UgJiYgKGZhY2UuZXhhY3QgPT09ICd1c2VyJyB8fCBmYWNlLmV4YWN0ID09PSAnZW52aXJvbm1lbnQnIHx8XG4gICAgICAgICAgICAgICAgICAgIGZhY2UuaWRlYWwgPT09ICd1c2VyJyB8fCBmYWNlLmlkZWFsID09PSAnZW52aXJvbm1lbnQnKSkgJiZcbiAgICAgICAgICAhKG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMgJiZcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMoKS5mYWNpbmdNb2RlKSkge1xuICAgICAgICBkZWxldGUgY29uc3RyYWludHMudmlkZW8uZmFjaW5nTW9kZTtcbiAgICAgICAgaWYgKGZhY2UuZXhhY3QgPT09ICdlbnZpcm9ubWVudCcgfHwgZmFjZS5pZGVhbCA9PT0gJ2Vudmlyb25tZW50Jykge1xuICAgICAgICAgIC8vIExvb2sgZm9yIFwiYmFja1wiIGluIGxhYmVsLCBvciB1c2UgbGFzdCBjYW0gKHR5cGljYWxseSBiYWNrIGNhbSkuXG4gICAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcygpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGV2aWNlcykge1xuICAgICAgICAgICAgZGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGQua2luZCA9PT0gJ3ZpZGVvaW5wdXQnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYmFjayA9IGRldmljZXMuZmluZChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkLmxhYmVsLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignYmFjaycpICE9PSAtMTtcbiAgICAgICAgICAgIH0pIHx8IChkZXZpY2VzLmxlbmd0aCAmJiBkZXZpY2VzW2RldmljZXMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgaWYgKGJhY2spIHtcbiAgICAgICAgICAgICAgY29uc3RyYWludHMudmlkZW8uZGV2aWNlSWQgPSBmYWNlLmV4YWN0ID8ge2V4YWN0OiBiYWNrLmRldmljZUlkfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpZGVhbDogYmFjay5kZXZpY2VJZH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICAgICAgICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICAgICAgICByZXR1cm4gZnVuYyhjb25zdHJhaW50cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMudmlkZW8pO1xuICAgIH1cbiAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIHJldHVybiBmdW5jKGNvbnN0cmFpbnRzKTtcbiAgfTtcblxuICB2YXIgc2hpbUVycm9yXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZToge1xuICAgICAgICBQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxuICAgICAgICBDb25zdHJhaW50Tm90U2F0aXNmaWVkRXJyb3I6ICdPdmVyY29uc3RyYWluZWRFcnJvcidcbiAgICAgIH1bZS5uYW1lXSB8fCBlLm5hbWUsXG4gICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnROYW1lLFxuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgKHRoaXMubWVzc2FnZSAmJiAnOiAnKSArIHRoaXMubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIHZhciBnZXRVc2VyTWVkaWFfID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIHNoaW1Db25zdHJhaW50c18oY29uc3RyYWludHMsIGZ1bmN0aW9uKGMpIHtcbiAgICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEoYywgb25TdWNjZXNzLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIG9uRXJyb3Ioc2hpbUVycm9yXyhlKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZ2V0VXNlck1lZGlhXztcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9O1xuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7XG4gICAgICBnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgZW51bWVyYXRlRGV2aWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGtpbmRzID0ge2F1ZGlvOiAnYXVkaW9pbnB1dCcsIHZpZGVvOiAndmlkZW9pbnB1dCd9O1xuICAgICAgICAgIHJldHVybiBNZWRpYVN0cmVhbVRyYWNrLmdldFNvdXJjZXMoZnVuY3Rpb24oZGV2aWNlcykge1xuICAgICAgICAgICAgcmVzb2x2ZShkZXZpY2VzLm1hcChmdW5jdGlvbihkZXZpY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtsYWJlbDogZGV2aWNlLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IGtpbmRzW2RldmljZS5raW5kXSxcbiAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VJZDogZGV2aWNlLmlkLFxuICAgICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ6ICcnfTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIEEgc2hpbSBmb3IgZ2V0VXNlck1lZGlhIG1ldGhvZCBvbiB0aGUgbWVkaWFEZXZpY2VzIG9iamVjdC5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAoIW5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjb25zdHJhaW50cykge1xuICAgICAgcmV0dXJuIGdldFVzZXJNZWRpYVByb21pc2VfKGNvbnN0cmFpbnRzKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIEV2ZW4gdGhvdWdoIENocm9tZSA0NSBoYXMgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcyBhbmQgYSBnZXRVc2VyTWVkaWFcbiAgICAvLyBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgUHJvbWlzZSwgaXQgZG9lcyBub3QgYWNjZXB0IHNwZWMtc3R5bGVcbiAgICAvLyBjb25zdHJhaW50cy5cbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgICBiaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY3MpIHtcbiAgICAgIHJldHVybiBzaGltQ29uc3RyYWludHNfKGNzLCBmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpLnRoZW4oZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgaWYgKGMuYXVkaW8gJiYgIXN0cmVhbS5nZXRBdWRpb1RyYWNrcygpLmxlbmd0aCB8fFxuICAgICAgICAgICAgICBjLnZpZGVvICYmICFzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHRyYWNrLnN0b3AoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignJywgJ05vdEZvdW5kRXJyb3InKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgLy8gRHVtbXkgZGV2aWNlY2hhbmdlIGV2ZW50IG1ldGhvZHMuXG4gIC8vIFRPRE8oS2FwdGVuSmFuc3NvbikgcmVtb3ZlIG9uY2UgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIHN0YWJsZS5cbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb2dnaW5nKCdEdW1teSBtZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciBjYWxsZWQuJyk7XG4gICAgfTtcbiAgfVxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTRFBVdGlscyA9IHJlcXVpcmUoJ3NkcCcpO1xudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGVkZ2VTaGltID0ge1xuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cuUlRDSWNlR2F0aGVyZXIpIHtcbiAgICAgIC8vIE9SVEMgZGVmaW5lcyBhbiBSVENJY2VDYW5kaWRhdGUgb2JqZWN0IGJ1dCBubyBjb25zdHJ1Y3Rvci5cbiAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBpbiBFZGdlLlxuICAgICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlKSB7XG4gICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBPUlRDIGRvZXMgbm90IGhhdmUgYSBzZXNzaW9uIGRlc2NyaXB0aW9uIG9iamVjdCBidXRcbiAgICAgIC8vIG90aGVyIGJyb3dzZXJzIChpLmUuIENocm9tZSkgdGhhdCB3aWxsIHN1cHBvcnQgYm90aCBQQyBhbmQgT1JUQ1xuICAgICAgLy8gaW4gdGhlIGZ1dHVyZSBtaWdodCBoYXZlIHRoaXMgZGVmaW5lZCBhbHJlYWR5LlxuICAgICAgaWYgKCF3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKSB7XG4gICAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyB0aGlzIGFkZHMgYW4gYWRkaXRpb25hbCBldmVudCBsaXN0ZW5lciB0byBNZWRpYVN0cmFja1RyYWNrIHRoYXQgc2lnbmFsc1xuICAgICAgLy8gd2hlbiBhIHRyYWNrcyBlbmFibGVkIHByb3BlcnR5IHdhcyBjaGFuZ2VkLlxuICAgICAgdmFyIG9yaWdNU1RFbmFibGVkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcbiAgICAgICAgICBNZWRpYVN0cmVhbVRyYWNrLnByb3RvdHlwZSwgJ2VuYWJsZWQnKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNZWRpYVN0cmVhbVRyYWNrLnByb3RvdHlwZSwgJ2VuYWJsZWQnLCB7XG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBvcmlnTVNURW5hYmxlZC5zZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgdmFyIGV2ID0gbmV3IEV2ZW50KCdlbmFibGVkJyk7XG4gICAgICAgICAgZXYuZW5hYmxlZCA9IHZhbHVlO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgX2V2ZW50VGFyZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgWydhZGRFdmVudExpc3RlbmVyJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAnZGlzcGF0Y2hFdmVudCddXG4gICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICBzZWxmW21ldGhvZF0gPSBfZXZlbnRUYXJnZXRbbWV0aG9kXS5iaW5kKF9ldmVudFRhcmdldCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgIHRoaXMub25pY2VjYW5kaWRhdGUgPSBudWxsO1xuICAgICAgdGhpcy5vbmFkZHN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9udHJhY2sgPSBudWxsO1xuICAgICAgdGhpcy5vbnJlbW92ZXN0cmVhbSA9IG51bGw7XG4gICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQgPSBudWxsO1xuICAgICAgdGhpcy5vbmRhdGFjaGFubmVsID0gbnVsbDtcblxuICAgICAgdGhpcy5sb2NhbFN0cmVhbXMgPSBbXTtcbiAgICAgIHRoaXMucmVtb3RlU3RyZWFtcyA9IFtdO1xuICAgICAgdGhpcy5nZXRMb2NhbFN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYubG9jYWxTdHJlYW1zO1xuICAgICAgfTtcbiAgICAgIHRoaXMuZ2V0UmVtb3RlU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5yZW1vdGVTdHJlYW1zO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICcnLFxuICAgICAgICBzZHA6ICcnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVtb3RlRGVzY3JpcHRpb24gPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHNkcDogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zaWduYWxpbmdTdGF0ZSA9ICdzdGFibGUnO1xuICAgICAgdGhpcy5pY2VDb25uZWN0aW9uU3RhdGUgPSAnbmV3JztcbiAgICAgIHRoaXMuaWNlR2F0aGVyaW5nU3RhdGUgPSAnbmV3JztcblxuICAgICAgdGhpcy5pY2VPcHRpb25zID0ge1xuICAgICAgICBnYXRoZXJQb2xpY3k6ICdhbGwnLFxuICAgICAgICBpY2VTZXJ2ZXJzOiBbXVxuICAgICAgfTtcbiAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgICBzd2l0Y2ggKGNvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3kpIHtcbiAgICAgICAgICBjYXNlICdhbGwnOlxuICAgICAgICAgIGNhc2UgJ3JlbGF5JzpcbiAgICAgICAgICAgIHRoaXMuaWNlT3B0aW9ucy5nYXRoZXJQb2xpY3kgPSBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAvLyBGSVhNRTogcmVtb3ZlIG9uY2UgaW1wbGVtZW50YXRpb24gYW5kIHNwZWMgaGF2ZSBhZGRlZCB0aGlzLlxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaWNlVHJhbnNwb3J0UG9saWN5IFwibm9uZVwiIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gZG9uJ3Qgc2V0IGljZVRyYW5zcG9ydFBvbGljeS5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnVzaW5nQnVuZGxlID0gY29uZmlnICYmIGNvbmZpZy5idW5kbGVQb2xpY3kgPT09ICdtYXgtYnVuZGxlJztcblxuICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAvLyBFZGdlIGRvZXMgbm90IGxpa2VcbiAgICAgICAgLy8gMSkgc3R1bjpcbiAgICAgICAgLy8gMikgdHVybjogdGhhdCBkb2VzIG5vdCBoYXZlIGFsbCBvZiB0dXJuOmhvc3Q6cG9ydD90cmFuc3BvcnQ9dWRwXG4gICAgICAgIC8vIDMpIHR1cm46IHdpdGggaXB2NiBhZGRyZXNzZXNcbiAgICAgICAgdmFyIGljZVNlcnZlcnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbmZpZy5pY2VTZXJ2ZXJzKSk7XG4gICAgICAgIHRoaXMuaWNlT3B0aW9ucy5pY2VTZXJ2ZXJzID0gaWNlU2VydmVycy5maWx0ZXIoZnVuY3Rpb24oc2VydmVyKSB7XG4gICAgICAgICAgaWYgKHNlcnZlciAmJiBzZXJ2ZXIudXJscykge1xuICAgICAgICAgICAgdmFyIHVybHMgPSBzZXJ2ZXIudXJscztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdXJscyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgdXJscyA9IFt1cmxzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVybHMgPSB1cmxzLmZpbHRlcihmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICh1cmwuaW5kZXhPZigndHVybjonKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgdXJsLmluZGV4T2YoJ3RyYW5zcG9ydD11ZHAnKSAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgIHVybC5pbmRleE9mKCd0dXJuOlsnKSA9PT0gLTEpIHx8XG4gICAgICAgICAgICAgICAgICAodXJsLmluZGV4T2YoJ3N0dW46JykgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgYnJvd3NlckRldGFpbHMudmVyc2lvbiA+PSAxNDM5Myk7XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIHJldHVybiAhIXVybHM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG5cbiAgICAgIC8vIHBlci10cmFjayBpY2VHYXRoZXJzLCBpY2VUcmFuc3BvcnRzLCBkdGxzVHJhbnNwb3J0cywgcnRwU2VuZGVycywgLi4uXG4gICAgICAvLyBldmVyeXRoaW5nIHRoYXQgaXMgbmVlZGVkIHRvIGRlc2NyaWJlIGEgU0RQIG0tbGluZS5cbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzID0gW107XG5cbiAgICAgIC8vIHNpbmNlIHRoZSBpY2VHYXRoZXJlciBpcyBjdXJyZW50bHkgY3JlYXRlZCBpbiBjcmVhdGVPZmZlciBidXQgd2VcbiAgICAgIC8vIG11c3Qgbm90IGVtaXQgY2FuZGlkYXRlcyB1bnRpbCBhZnRlciBzZXRMb2NhbERlc2NyaXB0aW9uIHdlIGJ1ZmZlclxuICAgICAgLy8gdGhlbSBpbiB0aGlzIGFycmF5LlxuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAvLyBGSVhNRTogbmVlZCB0byBhcHBseSBpY2UgY2FuZGlkYXRlcyBpbiBhIHdheSB3aGljaCBpcyBhc3luYyBidXRcbiAgICAgIC8vIGluLW9yZGVyXG4gICAgICB0aGlzLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgZW5kID0gIWV2ZW50LmNhbmRpZGF0ZSB8fCBPYmplY3Qua2V5cyhldmVudC5jYW5kaWRhdGUpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgc2VjdGlvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChzZWN0aW9uc1tqXS5pbmRleE9mKCdcXHJcXG5hPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgIHNlY3Rpb25zW2pdICs9ICdhPWVuZC1vZi1jYW5kaWRhdGVzXFxyXFxuJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZS5pbmRleE9mKCd0eXAgZW5kT2ZDYW5kaWRhdGVzJylcbiAgICAgICAgICAgID09PSAtMSkge1xuICAgICAgICAgIHNlY3Rpb25zW2V2ZW50LmNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICsgMV0gKz1cbiAgICAgICAgICAgICAgJ2E9JyArIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgKyAnXFxyXFxuJztcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwID0gc2VjdGlvbnMuam9pbignJyk7XG4gICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgc2VsZi5vbmljZWNhbmRpZGF0ZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFldmVudC5jYW5kaWRhdGUgJiYgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgIHZhciBjb21wbGV0ZSA9IHNlbGYudHJhbnNjZWl2ZXJzLmV2ZXJ5KGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fbG9jYWxJY2VDYW5kaWRhdGVzQnVmZmVyID0gW107XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIC8vIENsb25lIGlzIG5lY2Vzc2FyeSBmb3IgbG9jYWwgZGVtb3MgbW9zdGx5LCBhdHRhY2hpbmcgZGlyZWN0bHlcbiAgICAgIC8vIHRvIHR3byBkaWZmZXJlbnQgc2VuZGVycyBkb2VzIG5vdCB3b3JrIChidWlsZCAxMDU0NykuXG4gICAgICB2YXIgY2xvbmVkU3RyZWFtID0gc3RyZWFtLmNsb25lKCk7XG4gICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaywgaWR4KSB7XG4gICAgICAgIHZhciBjbG9uZWRUcmFjayA9IGNsb25lZFN0cmVhbS5nZXRUcmFja3MoKVtpZHhdO1xuICAgICAgICB0cmFjay5hZGRFdmVudExpc3RlbmVyKCdlbmFibGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjbG9uZWRUcmFjay5lbmFibGVkID0gZXZlbnQuZW5hYmxlZDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnB1c2goY2xvbmVkU3RyZWFtKTtcbiAgICAgIHRoaXMuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkKCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICB2YXIgaWR4ID0gdGhpcy5sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pO1xuICAgICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFNlbmRlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zY2VpdmVycy5maWx0ZXIoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdHJhbnNjZWl2ZXIucnRwU2VuZGVyO1xuICAgICAgfSlcbiAgICAgIC5tYXAoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlY2VpdmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNjZWl2ZXJzLmZpbHRlcihmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICByZXR1cm4gISF0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgIH0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmVzIHRoZSBpbnRlcnNlY3Rpb24gb2YgbG9jYWwgYW5kIHJlbW90ZSBjYXBhYmlsaXRpZXMuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgZnVuY3Rpb24obG9jYWxDYXBhYmlsaXRpZXMsIHJlbW90ZUNhcGFiaWxpdGllcykge1xuICAgICAgICAgIHZhciBjb21tb25DYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgICAgICBjb2RlY3M6IFtdLFxuICAgICAgICAgICAgaGVhZGVyRXh0ZW5zaW9uczogW10sXG4gICAgICAgICAgICBmZWNNZWNoYW5pc21zOiBbXVxuICAgICAgICAgIH07XG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24obENvZGVjKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHJDb2RlYyA9IHJlbW90ZUNhcGFiaWxpdGllcy5jb2RlY3NbaV07XG4gICAgICAgICAgICAgIGlmIChsQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpICYmXG4gICAgICAgICAgICAgICAgICBsQ29kZWMuY2xvY2tSYXRlID09PSByQ29kZWMuY2xvY2tSYXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gbnVtYmVyIG9mIGNoYW5uZWxzIGlzIHRoZSBoaWdoZXN0IGNvbW1vbiBudW1iZXIgb2YgY2hhbm5lbHNcbiAgICAgICAgICAgICAgICByQ29kZWMubnVtQ2hhbm5lbHMgPSBNYXRoLm1pbihsQ29kZWMubnVtQ2hhbm5lbHMsXG4gICAgICAgICAgICAgICAgICAgIHJDb2RlYy5udW1DaGFubmVscyk7XG4gICAgICAgICAgICAgICAgLy8gcHVzaCByQ29kZWMgc28gd2UgcmVwbHkgd2l0aCBvZmZlcmVyIHBheWxvYWQgdHlwZVxuICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5jb2RlY3MucHVzaChyQ29kZWMpO1xuXG4gICAgICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIGNvbW1vbiBmZWVkYmFjayBtZWNoYW5pc21zXG4gICAgICAgICAgICAgICAgckNvZGVjLnJ0Y3BGZWVkYmFjayA9IHJDb2RlYy5ydGNwRmVlZGJhY2suZmlsdGVyKGZ1bmN0aW9uKGZiKSB7XG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxDb2RlYy5ydGNwRmVlZGJhY2subGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxDb2RlYy5ydGNwRmVlZGJhY2tbal0udHlwZSA9PT0gZmIudHlwZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbENvZGVjLnJ0Y3BGZWVkYmFja1tqXS5wYXJhbWV0ZXIgPT09IGZiLnBhcmFtZXRlcikge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IGFsc28gbmVlZCB0byBkZXRlcm1pbmUgLnBhcmFtZXRlcnNcbiAgICAgICAgICAgICAgICAvLyAgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVucGVlci9vcnRjL2lzc3Vlcy81NjlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihsSGVhZGVyRXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICBpKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBySGVhZGVyRXh0ZW5zaW9uID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICAgICAgICBpZiAobEhlYWRlckV4dGVuc2lvbi51cmkgPT09IHJIZWFkZXJFeHRlbnNpb24udXJpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLnB1c2gockhlYWRlckV4dGVuc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBGSVhNRTogZmVjTWVjaGFuaXNtc1xuICAgICAgICAgIHJldHVybiBjb21tb25DYXBhYmlsaXRpZXM7XG4gICAgICAgIH07XG5cbiAgICAvLyBDcmVhdGUgSUNFIGdhdGhlcmVyLCBJQ0UgdHJhbnNwb3J0IGFuZCBEVExTIHRyYW5zcG9ydC5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyA9XG4gICAgICAgIGZ1bmN0aW9uKG1pZCwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSBuZXcgUlRDSWNlR2F0aGVyZXIoc2VsZi5pY2VPcHRpb25zKTtcbiAgICAgICAgICB2YXIgaWNlVHJhbnNwb3J0ID0gbmV3IFJUQ0ljZVRyYW5zcG9ydChpY2VHYXRoZXJlcik7XG4gICAgICAgICAgaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKTtcbiAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZSA9IHtzZHBNaWQ6IG1pZCwgc2RwTUxpbmVJbmRleDogc2RwTUxpbmVJbmRleH07XG5cbiAgICAgICAgICAgIHZhciBjYW5kID0gZXZ0LmNhbmRpZGF0ZTtcbiAgICAgICAgICAgIHZhciBlbmQgPSAhY2FuZCB8fCBPYmplY3Qua2V5cyhjYW5kKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICAvLyBFZGdlIGVtaXRzIGFuIGVtcHR5IG9iamVjdCBmb3IgUlRDSWNlQ2FuZGlkYXRlQ29tcGxldGXigKVcbiAgICAgICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICAgICAgLy8gcG9seWZpbGwgc2luY2UgUlRDSWNlR2F0aGVyZXIuc3RhdGUgaXMgbm90IGltcGxlbWVudGVkIGluXG4gICAgICAgICAgICAgIC8vIEVkZ2UgMTA1NDcgeWV0LlxuICAgICAgICAgICAgICBpZiAoaWNlR2F0aGVyZXIuc3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyLnN0YXRlID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBFbWl0IGEgY2FuZGlkYXRlIHdpdGggdHlwZSBlbmRPZkNhbmRpZGF0ZXMgdG8gbWFrZSB0aGUgc2FtcGxlc1xuICAgICAgICAgICAgICAvLyB3b3JrLiBFZGdlIHJlcXVpcmVzIGFkZEljZUNhbmRpZGF0ZSB3aXRoIHRoaXMgZW1wdHkgY2FuZGlkYXRlXG4gICAgICAgICAgICAgIC8vIHRvIHN0YXJ0IGNoZWNraW5nLiBUaGUgcmVhbCBzb2x1dGlvbiBpcyB0byBzaWduYWxcbiAgICAgICAgICAgICAgLy8gZW5kLW9mLWNhbmRpZGF0ZXMgdG8gdGhlIG90aGVyIHNpZGUgd2hlbiBnZXR0aW5nIHRoZSBudWxsXG4gICAgICAgICAgICAgIC8vIGNhbmRpZGF0ZSBidXQgc29tZSBhcHBzIChsaWtlIHRoZSBzYW1wbGVzKSBkb24ndCBkbyB0aGF0LlxuICAgICAgICAgICAgICBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlID1cbiAgICAgICAgICAgICAgICAgICdjYW5kaWRhdGU6MSAxIHVkcCAxIDAuMC4wLjAgOSB0eXAgZW5kT2ZDYW5kaWRhdGVzJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFJUQ0ljZUNhbmRpZGF0ZSBkb2Vzbid0IGhhdmUgYSBjb21wb25lbnQsIG5lZWRzIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgIGNhbmQuY29tcG9uZW50ID0gaWNlVHJhbnNwb3J0LmNvbXBvbmVudCA9PT0gJ1JUQ1AnID8gMiA6IDE7XG4gICAgICAgICAgICAgIGV2ZW50LmNhbmRpZGF0ZS5jYW5kaWRhdGUgPSBTRFBVdGlscy53cml0ZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdXBkYXRlIGxvY2FsIGRlc2NyaXB0aW9uLlxuICAgICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhzZWxmLmxvY2FsRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgIGlmIChldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlLmluZGV4T2YoJ3R5cCBlbmRPZkNhbmRpZGF0ZXMnKVxuICAgICAgICAgICAgICAgID09PSAtMSkge1xuICAgICAgICAgICAgICBzZWN0aW9uc1tldmVudC5jYW5kaWRhdGUuc2RwTUxpbmVJbmRleCArIDFdICs9XG4gICAgICAgICAgICAgICAgICAnYT0nICsgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSArICdcXHJcXG4nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXggKyAxXSArPVxuICAgICAgICAgICAgICAgICAgJ2E9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5sb2NhbERlc2NyaXB0aW9uLnNkcCA9IHNlY3Rpb25zLmpvaW4oJycpO1xuXG4gICAgICAgICAgICB2YXIgY29tcGxldGUgPSBzZWxmLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBFbWl0IGNhbmRpZGF0ZSBpZiBsb2NhbERlc2NyaXB0aW9uIGlzIHNldC5cbiAgICAgICAgICAgIC8vIEFsc28gZW1pdHMgbnVsbCBjYW5kaWRhdGUgd2hlbiBhbGwgZ2F0aGVyZXJzIGFyZSBjb21wbGV0ZS5cbiAgICAgICAgICAgIHN3aXRjaCAoc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSkge1xuICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgIHNlbGYuX2xvY2FsSWNlQ2FuZGlkYXRlc0J1ZmZlci5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kICYmIGNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9sb2NhbEljZUNhbmRpZGF0ZXNCdWZmZXIucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2dhdGhlcmluZyc6XG4gICAgICAgICAgICAgICAgc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcygpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub25pY2VjYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpKTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm9uaWNlY2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25pY2VjYW5kaWRhdGUobmV3IEV2ZW50KCdpY2VjYW5kaWRhdGUnKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzZWxmLmljZUdhdGhlcmluZ1N0YXRlID0gJ2NvbXBsZXRlJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlJzpcbiAgICAgICAgICAgICAgICAvLyBzaG91bGQgbm90IGhhcHBlbi4uLiBjdXJyZW50bHkhXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6IC8vIG5vLW9wLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWNlVHJhbnNwb3J0Lm9uaWNlc3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgZHRsc1RyYW5zcG9ydCA9IG5ldyBSVENEdGxzVHJhbnNwb3J0KGljZVRyYW5zcG9ydCk7XG4gICAgICAgICAgZHRsc1RyYW5zcG9ydC5vbmR0bHNzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBkdGxzVHJhbnNwb3J0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIG9uZXJyb3IgZG9lcyBub3Qgc2V0IHN0YXRlIHRvIGZhaWxlZCBieSBpdHNlbGYuXG4gICAgICAgICAgICBkdGxzVHJhbnNwb3J0LnN0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGljZUdhdGhlcmVyOiBpY2VHYXRoZXJlcixcbiAgICAgICAgICAgIGljZVRyYW5zcG9ydDogaWNlVHJhbnNwb3J0LFxuICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogZHRsc1RyYW5zcG9ydFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAvLyBTdGFydCB0aGUgUlRQIFNlbmRlciBhbmQgUmVjZWl2ZXIgZm9yIGEgdHJhbnNjZWl2ZXIuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdHJhbnNjZWl2ZSA9IGZ1bmN0aW9uKHRyYW5zY2VpdmVyLFxuICAgICAgICBzZW5kLCByZWN2KSB7XG4gICAgICB2YXIgcGFyYW1zID0gdGhpcy5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKHRyYW5zY2VpdmVyLmxvY2FsQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcyk7XG4gICAgICBpZiAoc2VuZCAmJiB0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiBTRFBVdGlscy5sb2NhbENOYW1lXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyLnNlbmQocGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWN2ICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBSVFggZmllbGQgaW4gRWRnZSAxNDk0MlxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ3ZpZGVvJ1xuICAgICAgICAgICAgJiYgdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycykge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICBkZWxldGUgcC5ydHg7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zLmVuY29kaW5ncyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgIHBhcmFtcy5ydGNwID0ge1xuICAgICAgICAgIGNuYW1lOiB0cmFuc2NlaXZlci5jbmFtZVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucnRjcC5zc3JjID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnJlY2VpdmUocGFyYW1zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID1cbiAgICAgICAgZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydDtcbiAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgICAgICAgLy8gRklYTUU6IFdoYXQgd2FzIHRoZSBwdXJwb3NlIG9mIHRoaXMgZW1wdHkgaWYgc3RhdGVtZW50P1xuICAgICAgICAgICAgLy8gaWYgKCF0aGlzLl9wZW5kaW5nT2ZmZXIpIHtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fcGVuZGluZ09mZmVyKSB7XG4gICAgICAgICAgICAgIC8vIFZFUlkgbGltaXRlZCBzdXBwb3J0IGZvciBTRFAgbXVuZ2luZy4gTGltaXRlZCB0bzpcbiAgICAgICAgICAgICAgLy8gKiBjaGFuZ2luZyB0aGUgb3JkZXIgb2YgY29kZWNzXG4gICAgICAgICAgICAgIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhcHMgPSBTRFBVdGlscy5wYXJzZVJ0cFBhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9wZW5kaW5nT2ZmZXJbc2RwTUxpbmVJbmRleF0ubG9jYWxDYXBhYmlsaXRpZXMgPSBjYXBzO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2NlaXZlcnMgPSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9wZW5kaW5nT2ZmZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJykge1xuICAgICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHNlbGYucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBpc0ljZUxpdGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChzZXNzaW9ucGFydCxcbiAgICAgICAgICAgICAgICAnYT1pY2UtbGl0ZScpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgICB2YXIgdHJhbnNjZWl2ZXIgPSBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIHZhciBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG4gICAgICAgICAgICAgIHZhciByZW1vdGVDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWVkaWFTZWN0aW9uLnNwbGl0KCdcXG4nLCAxKVswXVxuICAgICAgICAgICAgICAgICAgLnNwbGl0KCcgJywgMilbMV0gPT09ICcwJztcblxuICAgICAgICAgICAgICBpZiAoIXJlamVjdGVkICYmICF0cmFuc2NlaXZlci5pc0RhdGFjaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKFxuICAgICAgICAgICAgICAgICAgICBtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNJY2VMaXRlKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgY2FuZHMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWNhbmRpZGF0ZTonKVxuICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihjYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAnMSc7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIC8vIGljZS1saXRlIG9ubHkgaW5jbHVkZXMgaG9zdCBjYW5kaWRhdGVzIGluIHRoZSBTRFAgc28gd2UgY2FuXG4gICAgICAgICAgICAgICAgICAvLyB1c2Ugc2V0UmVtb3RlQ2FuZGlkYXRlcyAod2hpY2ggaW1wbGllcyBhblxuICAgICAgICAgICAgICAgICAgLy8gUlRDSWNlQ2FuZGlkYXRlQ29tcGxldGUpXG4gICAgICAgICAgICAgICAgICBpZiAoY2FuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMoXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChpc0ljZUxpdGUpIHtcbiAgICAgICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzLnJvbGUgPSAnc2VydmVyJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYudXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgIGlzSWNlTGl0ZSA/ICdjb250cm9sbGluZycgOiAnY29udHJvbGxlZCcpO1xuICAgICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGludGVyc2VjdGlvbiBvZiBjYXBhYmlsaXRpZXMuXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHNlbGYuX2dldENvbW1vbkNhcGFiaWxpdGllcyhsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzKTtcblxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBTZW5kZXIuIFRoZSBSVENSdHBSZWNlaXZlciBmb3IgdGhpc1xuICAgICAgICAgICAgICAgIC8vIHRyYW5zY2VpdmVyIGhhcyBhbHJlYWR5IGJlZW4gc3RhcnRlZCBpbiBzZXRSZW1vdGVEZXNjcmlwdGlvbi5cbiAgICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuY29kZWNzLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgICAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgICAgICAgfTtcbiAgICAgICAgICBzd2l0Y2ggKGRlc2NyaXB0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ29mZmVyJzpcbiAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtbG9jYWwtb2ZmZXInKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbnN3ZXInOlxuICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICtcbiAgICAgICAgICAgICAgICAgICdcIicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIGEgc3VjY2VzcyBjYWxsYmFjayB3YXMgcHJvdmlkZWQsIGVtaXQgSUNFIGNhbmRpZGF0ZXMgYWZ0ZXIgaXRcbiAgICAgICAgICAvLyBoYXMgYmVlbiBleGVjdXRlZC4gT3RoZXJ3aXNlLCBlbWl0IGNhbGxiYWNrIGFmdGVyIHRoZSBQcm9taXNlIGlzXG4gICAgICAgICAgLy8gcmVzb2x2ZWQuXG4gICAgICAgICAgdmFyIGhhc0NhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbic7XG4gICAgICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgY2IgPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXRCdWZmZXJlZENhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcCA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgIHAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuaWNlR2F0aGVyaW5nU3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdnYXRoZXJpbmcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFVzdWFsbHkgY2FuZGlkYXRlcyB3aWxsIGJlIGVtaXR0ZWQgZWFybGllci5cbiAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoc2VsZi5fZW1pdEJ1ZmZlcmVkQ2FuZGlkYXRlcy5iaW5kKHNlbGYpLCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbiA9XG4gICAgICAgIGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgIHZhciBzdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgICB2YXIgcmVjZWl2ZXJMaXN0ID0gW107XG4gICAgICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgIHZhciBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICAgICAgdmFyIGlzSWNlTGl0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxuICAgICAgICAgICAgICAnYT1pY2UtbGl0ZScpLmxlbmd0aCA+IDA7XG4gICAgICAgICAgdGhpcy51c2luZ0J1bmRsZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxuICAgICAgICAgICAgICAnYT1ncm91cDpCVU5ETEUgJykubGVuZ3RoID4gMDtcbiAgICAgICAgICBzZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbiwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAgICAgdmFyIGxpbmVzID0gU0RQVXRpbHMuc3BsaXRMaW5lcyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIG1saW5lID0gbGluZXNbMF0uc3Vic3RyKDIpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIga2luZCA9IG1saW5lWzBdO1xuICAgICAgICAgICAgdmFyIHJlamVjdGVkID0gbWxpbmVbMV0gPT09ICcwJztcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBTRFBVdGlscy5nZXREaXJlY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG5cbiAgICAgICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPW1pZDonKTtcbiAgICAgICAgICAgIGlmIChtaWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG1pZCA9IG1pZFswXS5zdWJzdHIoNik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVqZWN0IGRhdGFjaGFubmVscyB3aGljaCBhcmUgbm90IGltcGxlbWVudGVkIHlldC5cbiAgICAgICAgICAgIGlmIChraW5kID09PSAnYXBwbGljYXRpb24nICYmIG1saW5lWzJdID09PSAnRFRMUy9TQ1RQJykge1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICAgICAgICBpc0RhdGFjaGFubmVsOiB0cnVlXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRyYW5zY2VpdmVyO1xuICAgICAgICAgICAgdmFyIGljZUdhdGhlcmVyO1xuICAgICAgICAgICAgdmFyIGljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgIHZhciBkdGxzVHJhbnNwb3J0O1xuICAgICAgICAgICAgdmFyIHJ0cFNlbmRlcjtcbiAgICAgICAgICAgIHZhciBydHBSZWNlaXZlcjtcbiAgICAgICAgICAgIHZhciBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgdmFyIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgIHZhciB0cmFjaztcbiAgICAgICAgICAgIC8vIEZJWE1FOiBlbnN1cmUgdGhlIG1lZGlhU2VjdGlvbiBoYXMgcnRjcC1tdXggc2V0LlxuICAgICAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IFNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuICAgICAgICAgICAgdmFyIHJlbW90ZUljZVBhcmFtZXRlcnM7XG4gICAgICAgICAgICB2YXIgcmVtb3RlRHRsc1BhcmFtZXRlcnM7XG4gICAgICAgICAgICBpZiAoIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHJlbW90ZUljZVBhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMgPSBTRFBVdGlscy5nZXREdGxzUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24sXG4gICAgICAgICAgICAgICAgICBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzLnJvbGUgPSAnY2xpZW50JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMgPVxuICAgICAgICAgICAgICAgIFNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG5cbiAgICAgICAgICAgIHZhciBjbmFtZTtcbiAgICAgICAgICAgIC8vIEdldHMgdGhlIGZpcnN0IFNTUkMuIE5vdGUgdGhhdCB3aXRoIFJUWCB0aGVyZSBtaWdodCBiZSBtdWx0aXBsZVxuICAgICAgICAgICAgLy8gU1NSQ3MuXG4gICAgICAgICAgICB2YXIgcmVtb3RlU3NyYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYzonKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouYXR0cmlidXRlID09PSAnY25hbWUnO1xuICAgICAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKHJlbW90ZVNzcmMpIHtcbiAgICAgICAgICAgICAgY25hbWUgPSByZW1vdGVTc3JjLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaXNDb21wbGV0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgICAgICAnYT1lbmQtb2YtY2FuZGlkYXRlcycsIHNlc3Npb25wYXJ0KS5sZW5ndGggPiAwO1xuICAgICAgICAgICAgdmFyIGNhbmRzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1jYW5kaWRhdGU6JylcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAnMSc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJyAmJiAhcmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSBzZWxmLnVzaW5nQnVuZGxlICYmIHNkcE1MaW5lSW5kZXggPiAwID8ge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyOiBzZWxmLnRyYW5zY2VpdmVyc1swXS5pY2VHYXRoZXJlcixcbiAgICAgICAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHNlbGYudHJhbnNjZWl2ZXJzWzBdLmljZVRyYW5zcG9ydCxcbiAgICAgICAgICAgICAgICBkdGxzVHJhbnNwb3J0OiBzZWxmLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0XG4gICAgICAgICAgICAgIH0gOiBzZWxmLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyhtaWQsIHNkcE1MaW5lSW5kZXgpO1xuXG4gICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQuc2V0UmVtb3RlQ2FuZGlkYXRlcyhjYW5kcyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IFJUQ1J0cFJlY2VpdmVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcblxuICAgICAgICAgICAgICAvLyBmaWx0ZXIgUlRYIHVudGlsIGFkZGl0aW9uYWwgc3R1ZmYgbmVlZGVkIGZvciBSVFggaXMgaW1wbGVtZW50ZWRcbiAgICAgICAgICAgICAgLy8gaW4gYWRhcHRlci5qc1xuICAgICAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MgPSBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oY29kZWMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvZGVjLm5hbWUgIT09ICdydHgnO1xuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMikgKiAxMDAxXG4gICAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICAgIHJ0cFJlY2VpdmVyID0gbmV3IFJUQ1J0cFJlY2VpdmVyKHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCwga2luZCk7XG5cbiAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlcl0pO1xuICAgICAgICAgICAgICAvLyBGSVhNRTogbm90IGNvcnJlY3Qgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgc3RyZWFtcyBidXQgdGhhdCBpc1xuICAgICAgICAgICAgICAvLyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiB0aGlzIHNoaW0uXG4gICAgICAgICAgICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG5cbiAgICAgICAgICAgICAgLy8gRklYTUU6IGxvb2sgYXQgZGlyZWN0aW9uLlxuICAgICAgICAgICAgICBpZiAoc2VsZi5sb2NhbFN0cmVhbXMubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0VHJhY2tzKCkubGVuZ3RoID49IHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxUcmFjaztcbiAgICAgICAgICAgICAgICBpZiAoa2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgICAgICAgbG9jYWxUcmFjayA9IHNlbGYubG9jYWxTdHJlYW1zWzBdLmdldEF1ZGlvVHJhY2tzKClbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgICAgICAgICBsb2NhbFRyYWNrID0gc2VsZi5sb2NhbFN0cmVhbXNbMF0uZ2V0VmlkZW9UcmFja3MoKVswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsVHJhY2spIHtcbiAgICAgICAgICAgICAgICAgIHJ0cFNlbmRlciA9IG5ldyBSVENSdHBTZW5kZXIobG9jYWxUcmFjayxcbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgIGljZUdhdGhlcmVyOiB0cmFuc3BvcnRzLmljZUdhdGhlcmVyLFxuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydDogdHJhbnNwb3J0cy5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LFxuICAgICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzOiBsb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICByZW1vdGVDYXBhYmlsaXRpZXM6IHJlbW90ZUNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgICBydHBTZW5kZXI6IHJ0cFNlbmRlcixcbiAgICAgICAgICAgICAgICBydHBSZWNlaXZlcjogcnRwUmVjZWl2ZXIsXG4gICAgICAgICAgICAgICAga2luZDoga2luZCxcbiAgICAgICAgICAgICAgICBtaWQ6IG1pZCxcbiAgICAgICAgICAgICAgICBjbmFtZTogY25hbWUsXG4gICAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVyczogc2VuZEVuY29kaW5nUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzOiByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIC8vIFN0YXJ0IHRoZSBSVENSdHBSZWNlaXZlciBub3cuIFRoZSBSVFBTZW5kZXIgaXMgc3RhcnRlZCBpblxuICAgICAgICAgICAgICAvLyBzZXRMb2NhbERlc2NyaXB0aW9uLlxuICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHNlbGYudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgICAgICAgIHRyYW5zY2VpdmVyID0gc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF07XG4gICAgICAgICAgICAgIGljZUdhdGhlcmVyID0gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXI7XG4gICAgICAgICAgICAgIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgIHJ0cFNlbmRlciA9IHRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICAgICAgICAgICAgcnRwUmVjZWl2ZXIgPSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICAgICAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzID0gdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXM7XG5cbiAgICAgICAgICAgICAgc2VsZi50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZW1vdGVDYXBhYmlsaXRpZXMgPVxuICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzO1xuICAgICAgICAgICAgICBzZWxmLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5jbmFtZSA9IGNuYW1lO1xuXG4gICAgICAgICAgICAgIGlmICgoaXNJY2VMaXRlIHx8IGlzQ29tcGxldGUpICYmIGNhbmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zZXRSZW1vdGVDYW5kaWRhdGVzKGNhbmRzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoIXNlbGYudXNpbmdCdW5kbGUgfHwgc2RwTUxpbmVJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zdGFydChpY2VHYXRoZXJlciwgcmVtb3RlSWNlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRyb2xsaW5nJyk7XG4gICAgICAgICAgICAgICAgZHRsc1RyYW5zcG9ydC5zdGFydChyZW1vdGVEdGxzUGFyYW1ldGVycyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZWxmLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3JlY3Zvbmx5JyxcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuXG4gICAgICAgICAgICAgIGlmIChydHBSZWNlaXZlciAmJlxuICAgICAgICAgICAgICAgICAgKGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpKSB7XG4gICAgICAgICAgICAgICAgdHJhY2sgPSBydHBSZWNlaXZlci50cmFjaztcbiAgICAgICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyXSk7XG4gICAgICAgICAgICAgICAgc3RyZWFtLmFkZFRyYWNrKHRyYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGSVhNRTogYWN0dWFsbHkgdGhlIHJlY2VpdmVyIHNob3VsZCBiZSBjcmVhdGVkIGxhdGVyLlxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXG4gICAgICAgICAgICBzZHA6IGRlc2NyaXB0aW9uLnNkcFxuICAgICAgICAgIH07XG4gICAgICAgICAgc3dpdGNoIChkZXNjcmlwdGlvbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdvZmZlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLXJlbW90ZS1vZmZlcicpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fuc3dlcic6XG4gICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdzdGFibGUnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bnN1cHBvcnRlZCB0eXBlIFwiJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICAgICAgICAgJ1wiJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdHJlYW0uZ2V0VHJhY2tzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxmLnJlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnYWRkc3RyZWFtJyk7XG4gICAgICAgICAgICAgIGV2ZW50LnN0cmVhbSA9IHN0cmVhbTtcbiAgICAgICAgICAgICAgc2VsZi5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgaWYgKHNlbGYub25hZGRzdHJlYW0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYub25hZGRzdHJlYW0oZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciB0cmFjayA9IGl0ZW1bMF07XG4gICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVyID0gaXRlbVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhY2tFdmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgICB0cmFja0V2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgICAgICAgICAgICAgdHJhY2tFdmVudC5yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgICAgICAgICAgICAgIHRyYWNrRXZlbnQuc3RyZWFtcyA9IFtzdHJlYW1dO1xuICAgICAgICAgICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub250cmFjayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub250cmFjayh0cmFja0V2ZW50KTtcbiAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGFyZ3VtZW50c1sxXSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgLyogbm90IHlldFxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQpIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0KSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEZJWE1FOiBjbGVhbiB1cCB0cmFja3MsIGxvY2FsIHN0cmVhbXMsIHJlbW90ZSBzdHJlYW1zLCBldGNcbiAgICAgIHRoaXMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdjbG9zZWQnKTtcbiAgICB9O1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzaWduYWxpbmcgc3RhdGUuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlU2lnbmFsaW5nU3RhdGUgPVxuICAgICAgICBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgICAgIHRoaXMuc2lnbmFsaW5nU3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ3NpZ25hbGluZ3N0YXRlY2hhbmdlJyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9uc2lnbmFsaW5nc3RhdGVjaGFuZ2UoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGZpcmUgdGhlIG5lZ290aWF0aW9ubmVlZGVkIGV2ZW50LlxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkID1cbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gRmlyZSBhd2F5IChmb3Igbm93KS5cbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ25lZ290aWF0aW9ubmVlZGVkJyk7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICBpZiAodGhpcy5vbm5lZ290aWF0aW9ubmVlZGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm9ubmVnb3RpYXRpb25uZWVkZWQoZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgY29ubmVjdGlvbiBzdGF0ZS5cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVDb25uZWN0aW9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBuZXdTdGF0ZTtcbiAgICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAgICduZXcnOiAwLFxuICAgICAgICBjbG9zZWQ6IDAsXG4gICAgICAgIGNvbm5lY3Rpbmc6IDAsXG4gICAgICAgIGNoZWNraW5nOiAwLFxuICAgICAgICBjb25uZWN0ZWQ6IDAsXG4gICAgICAgIGNvbXBsZXRlZDogMCxcbiAgICAgICAgZmFpbGVkOiAwXG4gICAgICB9O1xuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0YXRlXSsrO1xuICAgICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICAgIH0pO1xuICAgICAgLy8gSUNFVHJhbnNwb3J0LmNvbXBsZXRlZCBhbmQgY29ubmVjdGVkIGFyZSB0aGUgc2FtZSBmb3IgdGhpcyBwdXJwb3NlLlxuICAgICAgc3RhdGVzLmNvbm5lY3RlZCArPSBzdGF0ZXMuY29tcGxldGVkO1xuXG4gICAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgICAgaWYgKHN0YXRlcy5mYWlsZWQgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0aW5nID4gMCB8fCBzdGF0ZXMuY2hlY2tpbmcgPiAwKSB7XG4gICAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RpbmcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuZGlzY29ubmVjdGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMubmV3ID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGVkID4gMCB8fCBzdGF0ZXMuY29tcGxldGVkID4gMCkge1xuICAgICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV3U3RhdGUgIT09IHNlbGYuaWNlQ29ubmVjdGlvblN0YXRlKSB7XG4gICAgICAgIHNlbGYuaWNlQ29ubmVjdGlvblN0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIGlmICh0aGlzLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZShldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVPZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgaWYgKHRoaXMuX3BlbmRpbmdPZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWF0ZU9mZmVyIGNhbGxlZCB3aGlsZSB0aGVyZSBpcyBhIHBlbmRpbmcgb2ZmZXIuJyk7XG4gICAgICB9XG4gICAgICB2YXIgb2ZmZXJPcHRpb25zO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1swXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgb2ZmZXJPcHRpb25zID0gYXJndW1lbnRzWzJdO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHJhY2tzID0gW107XG4gICAgICB2YXIgbnVtQXVkaW9UcmFja3MgPSAwO1xuICAgICAgdmFyIG51bVZpZGVvVHJhY2tzID0gMDtcbiAgICAgIC8vIERlZmF1bHQgdG8gc2VuZHJlY3YuXG4gICAgICBpZiAodGhpcy5sb2NhbFN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgIG51bUF1ZGlvVHJhY2tzID0gdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGg7XG4gICAgICAgIG51bVZpZGVvVHJhY2tzID0gdGhpcy5sb2NhbFN0cmVhbXNbMF0uZ2V0VmlkZW9UcmFja3MoKS5sZW5ndGg7XG4gICAgICB9XG4gICAgICAvLyBEZXRlcm1pbmUgbnVtYmVyIG9mIGF1ZGlvIGFuZCB2aWRlbyB0cmFja3Mgd2UgbmVlZCB0byBzZW5kL3JlY3YuXG4gICAgICBpZiAob2ZmZXJPcHRpb25zKSB7XG4gICAgICAgIC8vIFJlamVjdCBDaHJvbWUgbGVnYWN5IGNvbnN0cmFpbnRzLlxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm1hbmRhdG9yeSB8fCBvZmZlck9wdGlvbnMub3B0aW9uYWwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAnTGVnYWN5IG1hbmRhdG9yeS9vcHRpb25hbCBjb25zdHJhaW50cyBub3Qgc3VwcG9ydGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbztcbiAgICAgICAgfVxuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgICAgLy8gUHVzaCBsb2NhbCBzdHJlYW1zLlxuICAgICAgICB0aGlzLmxvY2FsU3RyZWFtc1swXS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgdHJhY2tzLnB1c2goe1xuICAgICAgICAgICAga2luZDogdHJhY2sua2luZCxcbiAgICAgICAgICAgIHRyYWNrOiB0cmFjayxcbiAgICAgICAgICAgIHdhbnRSZWNlaXZlOiB0cmFjay5raW5kID09PSAnYXVkaW8nID9cbiAgICAgICAgICAgICAgICBudW1BdWRpb1RyYWNrcyA+IDAgOiBudW1WaWRlb1RyYWNrcyA+IDBcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgbnVtQXVkaW9UcmFja3MtLTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRyYWNrLmtpbmQgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIC8vIENyZWF0ZSBNLWxpbmVzIGZvciByZWN2b25seSBzdHJlYW1zLlxuICAgICAgd2hpbGUgKG51bUF1ZGlvVHJhY2tzID4gMCB8fCBudW1WaWRlb1RyYWNrcyA+IDApIHtcbiAgICAgICAgaWYgKG51bUF1ZGlvVHJhY2tzID4gMCkge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhdWRpbycsXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgICAgIHRyYWNrcy5wdXNoKHtcbiAgICAgICAgICAgIGtpbmQ6ICd2aWRlbycsXG4gICAgICAgICAgICB3YW50UmVjZWl2ZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHNkcCA9IFNEUFV0aWxzLndyaXRlU2Vzc2lvbkJvaWxlcnBsYXRlKCk7XG4gICAgICB2YXIgdHJhbnNjZWl2ZXJzID0gW107XG4gICAgICB0cmFja3MuZm9yRWFjaChmdW5jdGlvbihtbGluZSwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgICAvLyBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGFuIGljZSBnYXRoZXJlciwgaWNlIHRyYW5zcG9ydCxcbiAgICAgICAgLy8gZHRscyB0cmFuc3BvcnQsIHBvdGVudGlhbGx5IHJ0cHNlbmRlciBhbmQgcnRwcmVjZWl2ZXIuXG4gICAgICAgIHZhciB0cmFjayA9IG1saW5lLnRyYWNrO1xuICAgICAgICB2YXIga2luZCA9IG1saW5lLmtpbmQ7XG4gICAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcblxuICAgICAgICB2YXIgdHJhbnNwb3J0cyA9IHNlbGYudXNpbmdCdW5kbGUgJiYgc2RwTUxpbmVJbmRleCA+IDAgPyB7XG4gICAgICAgICAgaWNlR2F0aGVyZXI6IHRyYW5zY2VpdmVyc1swXS5pY2VHYXRoZXJlcixcbiAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQsXG4gICAgICAgICAgZHRsc1RyYW5zcG9ydDogdHJhbnNjZWl2ZXJzWzBdLmR0bHNUcmFuc3BvcnRcbiAgICAgICAgfSA6IHNlbGYuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzKG1pZCwgc2RwTUxpbmVJbmRleCk7XG5cbiAgICAgICAgdmFyIGxvY2FsQ2FwYWJpbGl0aWVzID0gUlRDUnRwU2VuZGVyLmdldENhcGFiaWxpdGllcyhraW5kKTtcbiAgICAgICAgLy8gZmlsdGVyIFJUWCB1bnRpbCBhZGRpdGlvbmFsIHN0dWZmIG5lZWRlZCBmb3IgUlRYIGlzIGltcGxlbWVudGVkXG4gICAgICAgIC8vIGluIGFkYXB0ZXIuanNcbiAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzID0gbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZpbHRlcihcbiAgICAgICAgICAgIGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjb2RlYy5uYW1lICE9PSAncnR4JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgICAgICAgIC8vIHdvcmsgYXJvdW5kIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD02NTUyXG4gICAgICAgICAgLy8gYnkgYWRkaW5nIGxldmVsLWFzeW1tZXRyeS1hbGxvd2VkPTFcbiAgICAgICAgICBpZiAoY29kZWMubmFtZSA9PT0gJ0gyNjQnICYmXG4gICAgICAgICAgICAgIGNvZGVjLnBhcmFtZXRlcnNbJ2xldmVsLWFzeW1tZXRyeS1hbGxvd2VkJ10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29kZWMucGFyYW1ldGVyc1snbGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQnXSA9ICcxJztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBydHBTZW5kZXI7XG4gICAgICAgIHZhciBydHBSZWNlaXZlcjtcblxuICAgICAgICAvLyBnZW5lcmF0ZSBhbiBzc3JjIG5vdywgdG8gYmUgdXNlZCBsYXRlciBpbiBydHBTZW5kZXIuc2VuZFxuICAgICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IFt7XG4gICAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMSkgKiAxMDAxXG4gICAgICAgIH1dO1xuICAgICAgICBpZiAodHJhY2spIHtcbiAgICAgICAgICBydHBTZW5kZXIgPSBuZXcgUlRDUnRwU2VuZGVyKHRyYWNrLCB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1saW5lLndhbnRSZWNlaXZlKSB7XG4gICAgICAgICAgcnRwUmVjZWl2ZXIgPSBuZXcgUlRDUnRwUmVjZWl2ZXIodHJhbnNwb3J0cy5kdGxzVHJhbnNwb3J0LCBraW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHtcbiAgICAgICAgICBpY2VHYXRoZXJlcjogdHJhbnNwb3J0cy5pY2VHYXRoZXJlcixcbiAgICAgICAgICBpY2VUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuaWNlVHJhbnNwb3J0LFxuICAgICAgICAgIGR0bHNUcmFuc3BvcnQ6IHRyYW5zcG9ydHMuZHRsc1RyYW5zcG9ydCxcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllczogbG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiBudWxsLFxuICAgICAgICAgIHJ0cFNlbmRlcjogcnRwU2VuZGVyLFxuICAgICAgICAgIHJ0cFJlY2VpdmVyOiBydHBSZWNlaXZlcixcbiAgICAgICAgICBraW5kOiBraW5kLFxuICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnMsXG4gICAgICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVyczogbnVsbFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy51c2luZ0J1bmRsZSkge1xuICAgICAgICBzZHAgKz0gJ2E9Z3JvdXA6QlVORExFICcgKyB0cmFuc2NlaXZlcnMubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdC5taWQ7XG4gICAgICAgIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuICAgICAgfVxuICAgICAgdHJhY2tzLmZvckVhY2goZnVuY3Rpb24obWxpbmUsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gdHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICBzZHAgKz0gU0RQVXRpbHMud3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcywgJ29mZmVyJywgc2VsZi5sb2NhbFN0cmVhbXNbMF0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3BlbmRpbmdPZmZlciA9IHRyYW5zY2VpdmVycztcbiAgICAgIHZhciBkZXNjID0gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6ICdvZmZlcicsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICYmIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzBdLCAwLCBkZXNjKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlQW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSgpO1xuICAgICAgaWYgKHRoaXMudXNpbmdCdW5kbGUpIHtcbiAgICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgdGhpcy50cmFuc2NlaXZlcnMubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gdC5taWQ7XG4gICAgICAgIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuICAgICAgfVxuICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIuaXNEYXRhY2hhbm5lbCkge1xuICAgICAgICAgIHNkcCArPSAnbT1hcHBsaWNhdGlvbiAwIERUTFMvU0NUUCA1MDAwXFxyXFxuJyArXG4gICAgICAgICAgICAgICdjPUlOIElQNCAwLjAuMC4wXFxyXFxuJyArXG4gICAgICAgICAgICAgICdhPW1pZDonICsgdHJhbnNjZWl2ZXIubWlkICsgJ1xcclxcbic7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICB2YXIgY29tbW9uQ2FwYWJpbGl0aWVzID0gc2VsZi5fZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKFxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICAgIHNkcCArPSBTRFBVdGlscy53cml0ZU1lZGlhU2VjdGlvbih0cmFuc2NlaXZlciwgY29tbW9uQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgJ2Fuc3dlcicsIHNlbGYubG9jYWxTdHJlYW1zWzBdKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGVzYyA9IG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiAnYW5zd2VyJyxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChhcmd1bWVudHNbMF0sIDAsIGRlc2MpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihjYW5kaWRhdGUpIHtcbiAgICAgIGlmIChjYW5kaWRhdGUgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoe30pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtTGluZUluZGV4ID0gY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXg7XG4gICAgICAgIGlmIChjYW5kaWRhdGUuc2RwTWlkKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRyYW5zY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNjZWl2ZXJzW2ldLm1pZCA9PT0gY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICAgICAgICBtTGluZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHRoaXMudHJhbnNjZWl2ZXJzW21MaW5lSW5kZXhdO1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICB2YXIgY2FuZCA9IE9iamVjdC5rZXlzKGNhbmRpZGF0ZS5jYW5kaWRhdGUpLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kaWRhdGUuY2FuZGlkYXRlKSA6IHt9O1xuICAgICAgICAgIC8vIElnbm9yZSBDaHJvbWUncyBpbnZhbGlkIGNhbmRpZGF0ZXMgc2luY2UgRWRnZSBkb2VzIG5vdCBsaWtlIHRoZW0uXG4gICAgICAgICAgaWYgKGNhbmQucHJvdG9jb2wgPT09ICd0Y3AnICYmIChjYW5kLnBvcnQgPT09IDAgfHwgY2FuZC5wb3J0ID09PSA5KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZ25vcmUgUlRDUCBjYW5kaWRhdGVzLCB3ZSBhc3N1bWUgUlRDUC1NVVguXG4gICAgICAgICAgaWYgKGNhbmQuY29tcG9uZW50ICE9PSAnMScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQSBkaXJ0eSBoYWNrIHRvIG1ha2Ugc2FtcGxlcyB3b3JrLlxuICAgICAgICAgIGlmIChjYW5kLnR5cGUgPT09ICdlbmRPZkNhbmRpZGF0ZXMnKSB7XG4gICAgICAgICAgICBjYW5kID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydC5hZGRSZW1vdGVDYW5kaWRhdGUoY2FuZCk7XG5cbiAgICAgICAgICAvLyB1cGRhdGUgdGhlIHJlbW90ZURlc2NyaXB0aW9uLlxuICAgICAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnModGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgICAgIHNlY3Rpb25zW21MaW5lSW5kZXggKyAxXSArPSAoY2FuZC50eXBlID8gY2FuZGlkYXRlLmNhbmRpZGF0ZS50cmltKClcbiAgICAgICAgICAgICAgOiAnYT1lbmQtb2YtY2FuZGlkYXRlcycpICsgJ1xcclxcbic7XG4gICAgICAgICAgdGhpcy5yZW1vdGVEZXNjcmlwdGlvbi5zZHAgPSBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYXJndW1lbnRzWzFdLCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICB0aGlzLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgIFsncnRwU2VuZGVyJywgJ3J0cFJlY2VpdmVyJywgJ2ljZUdhdGhlcmVyJywgJ2ljZVRyYW5zcG9ydCcsXG4gICAgICAgICAgICAnZHRsc1RyYW5zcG9ydCddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgICAgIGlmICh0cmFuc2NlaXZlclttZXRob2RdKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmFuc2NlaXZlclttZXRob2RdLmdldFN0YXRzKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGNiID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgIGFyZ3VtZW50c1sxXTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMuc2V0KGlkLCByZXN1bHRbaWRdKTtcbiAgICAgICAgICAgICAgcmVzdWx0c1tpZF0gPSByZXN1bHRbaWRdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYiwgMCwgcmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufTtcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB7UGVybWlzc2lvbkRlbmllZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJ31bZS5uYW1lXSB8fCBlLm5hbWUsXG4gICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnQsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBnZXRVc2VyTWVkaWEgZXJyb3Igc2hpbS5cbiAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGJyb3dzZXJEZXRhaWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5icm93c2VyRGV0YWlscztcblxudmFyIGZpcmVmb3hTaGltID0ge1xuICBzaGltT25UcmFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJiAhKCdvbnRyYWNrJyBpblxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbnRyYWNrJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9vbnRyYWNrO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICBpZiAodGhpcy5fb250cmFjaykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2spO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdhZGRzdHJlYW0nLCB0aGlzLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUuc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHt0cmFjazogdHJhY2t9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEZpcmVmb3ggaGFzIHN1cHBvcnRlZCBtb3pTcmNPYmplY3Qgc2luY2UgRkYyMiwgdW5wcmVmaXhlZCBpbiA0Mi5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudCAmJlxuICAgICAgICAhKCdzcmNPYmplY3QnIGluIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgICAgICAgLy8gU2hpbSB0aGUgc3JjT2JqZWN0IHByb3BlcnR5LCBvbmNlLCB3aGVuIEhUTUxNZWRpYUVsZW1lbnQgaXMgZm91bmQuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUsICdzcmNPYmplY3QnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1velNyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGlzLm1velNyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAnb2JqZWN0JyB8fCAhKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiB8fFxuICAgICAgICB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24pKSB7XG4gICAgICByZXR1cm47IC8vIHByb2JhYmx5IG1lZGlhLnBlZXJjb25uZWN0aW9uLmVuYWJsZWQ9ZmFsc2UgaW4gYWJvdXQ6Y29uZmlnXG4gICAgfVxuICAgIC8vIFRoZSBSVENQZWVyQ29ubmVjdGlvbiBvYmplY3QuXG4gICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKSB7XG4gICAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgMzgpIHtcbiAgICAgICAgICAvLyAudXJscyBpcyBub3Qgc3VwcG9ydGVkIGluIEZGIDwgMzguXG4gICAgICAgICAgLy8gY3JlYXRlIFJUQ0ljZVNlcnZlcnMgd2l0aCBhIHNpbmdsZSB1cmwuXG4gICAgICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgICAgIHZhciBuZXdJY2VTZXJ2ZXJzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBjQ29uZmlnLmljZVNlcnZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIHNlcnZlciA9IHBjQ29uZmlnLmljZVNlcnZlcnNbaV07XG4gICAgICAgICAgICAgIGlmIChzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VydmVyLnVybHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBuZXdTZXJ2ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyLnVybHNbal1cbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBpZiAoc2VydmVyLnVybHNbal0uaW5kZXhPZigndHVybicpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1NlcnZlci51c2VybmFtZSA9IHNlcnZlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLmNyZWRlbnRpYWwgPSBzZXJ2ZXIuY3JlZGVudGlhbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChuZXdTZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gocGNDb25maWcuaWNlU2VydmVyc1tpXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBjQ29uZmlnLmljZVNlcnZlcnMgPSBuZXdJY2VTZXJ2ZXJzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IG1velJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gbW96UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgICAgaWYgKG1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwgJ2dlbmVyYXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gPSBtb3pSVENTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gbW96UlRDSWNlQ2FuZGlkYXRlO1xuICAgIH1cblxuICAgIC8vIHNoaW0gYXdheSBuZWVkIGZvciBvYnNvbGV0ZSBSVENJY2VDYW5kaWRhdGUvUlRDU2Vzc2lvbkRlc2NyaXB0aW9uLlxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpID9cbiAgICAgICAgICAgICAgICBSVENJY2VDYW5kaWRhdGUgOiBSVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBhZGRJY2VDYW5kaWRhdGUobnVsbClcbiAgICB2YXIgbmF0aXZlQWRkSWNlQ2FuZGlkYXRlID1cbiAgICAgICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoYXJndW1lbnRzWzBdID09PSBudWxsKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHNbMV0pIHtcbiAgICAgICAgICBhcmd1bWVudHNbMV0uYXBwbHkobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZUFkZEljZUNhbmRpZGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICAvLyBzaGltIGdldFN0YXRzIHdpdGggbWFwbGlrZSBzdXBwb3J0XG4gICAgdmFyIG1ha2VNYXBTdGF0cyA9IGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICB2YXIgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgT2JqZWN0LmtleXMoc3RhdHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIG1hcC5zZXQoa2V5LCBzdGF0c1trZXldKTtcbiAgICAgICAgbWFwW2tleV0gPSBzdGF0c1trZXldO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWFwO1xuICAgIH07XG5cbiAgICB2YXIgbmF0aXZlR2V0U3RhdHMgPSBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHM7XG4gICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIG9uU3VjYywgb25FcnIpIHtcbiAgICAgIHJldHVybiBuYXRpdmVHZXRTdGF0cy5hcHBseSh0aGlzLCBbc2VsZWN0b3IgfHwgbnVsbF0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICAgICAgcmV0dXJuIG1ha2VNYXBTdGF0cyhzdGF0cyk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG9uU3VjYywgb25FcnIpO1xuICAgIH07XG4gIH1cbn07XG5cbi8vIEV4cG9zZSBwdWJsaWMgbWV0aG9kcy5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltT25UcmFjazogZmlyZWZveFNoaW0uc2hpbU9uVHJhY2ssXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZpcmVmb3hTaGltLnNoaW1Tb3VyY2VPYmplY3QsXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uLFxuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpXG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBsb2dnaW5nID0gcmVxdWlyZSgnLi4vdXRpbHMnKS5sb2c7XG52YXIgYnJvd3NlckRldGFpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLmJyb3dzZXJEZXRhaWxzO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2hpbUVycm9yXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZToge1xuICAgICAgICBTZWN1cml0eUVycm9yOiAnTm90QWxsb3dlZEVycm9yJyxcbiAgICAgICAgUGVybWlzc2lvbkRlbmllZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJ1xuICAgICAgfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgJ1RoZSBvcGVyYXRpb24gaXMgaW5zZWN1cmUuJzogJ1RoZSByZXF1ZXN0IGlzIG5vdCBhbGxvd2VkIGJ5IHRoZSAnICtcbiAgICAgICAgJ3VzZXIgYWdlbnQgb3IgdGhlIHBsYXRmb3JtIGluIHRoZSBjdXJyZW50IGNvbnRleHQuJ1xuICAgICAgfVtlLm1lc3NhZ2VdIHx8IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludCxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICh0aGlzLm1lc3NhZ2UgJiYgJzogJykgKyB0aGlzLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgdmFyIGNvbnN0cmFpbnRzVG9GRjM3XyA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gY1trZXldID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/XG4gICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICByLm1heCAhPT0gdW5kZWZpbmVkIHx8IHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSByLmV4YWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjLmFkdmFuY2VkID0gYy5hZHZhbmNlZCB8fCBbXTtcbiAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBvY1trZXldID0ge21pbjogci5pZGVhbCwgbWF4OiByLmlkZWFsfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICBjLnJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICBsb2dnaW5nKCdzcGVjOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICB9XG4gICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIG9uRXJyb3Ioc2hpbUVycm9yXyhlKSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZ2V0VXNlck1lZGlhXyhjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH1cbiAgICB9O1xuICB9XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGluZm9zID0gW1xuICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgIF07XG4gICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDkpIHtcbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgICBiaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykudGhlbihmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgLy8gV29yayBhcm91bmQgaHR0cHM6Ly9idWd6aWwubGEvODAyMzI2XG4gICAgICAgIGlmIChjLmF1ZGlvICYmICFzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggfHxcbiAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignVGhlIG9iamVjdCBjYW4gbm90IGJlIGZvdW5kIGhlcmUuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3RGb3VuZEVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDQpIHtcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFfKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNlIEZpcmVmb3ggNDQrJ3MgZGVwcmVjYXRpb24gd2FybmluZyB3aXRoIHVucHJlZml4ZWQgdmVyc2lvbi5cbiAgICBjb25zb2xlLndhcm4oJ25hdmlnYXRvci5nZXRVc2VyTWVkaWEgaGFzIGJlZW4gcmVwbGFjZWQgYnkgJyArXG4gICAgICAgICAgICAgICAgICduYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYScpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKS50aGVuKG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH07XG59O1xuIiwiLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgc2FmYXJpU2hpbSA9IHtcbiAgLy8gVE9ETzogRHJBbGV4LCBzaG91bGQgYmUgaGVyZSwgZG91YmxlIGNoZWNrIGFnYWluc3QgTGF5b3V0VGVzdHNcbiAgLy8gc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIC8vIFRPRE86IG9uY2UgdGhlIGJhY2stZW5kIGZvciB0aGUgbWFjIHBvcnQgaXMgZG9uZSwgYWRkLlxuICAvLyBUT0RPOiBjaGVjayBmb3Igd2Via2l0R1RLK1xuICAvLyBzaGltUGVlckNvbm5lY3Rpb246IGZ1bmN0aW9uKCkgeyB9LFxuXG4gIHNoaW1HZXRVc2VyTWVkaWE6IGZ1bmN0aW9uKCkge1xuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhO1xuICB9XG59O1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbUdldFVzZXJNZWRpYTogc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhXG4gIC8vIFRPRE9cbiAgLy8gc2hpbU9uVHJhY2s6IHNhZmFyaVNoaW0uc2hpbU9uVHJhY2ssXG4gIC8vIHNoaW1QZWVyQ29ubmVjdGlvbjogc2FmYXJpU2hpbS5zaGltUGVlckNvbm5lY3Rpb25cbn07XG4iLCIvKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ0Rpc2FibGVkXyA9IHRydWU7XG5cbi8vIFV0aWxpdHkgbWV0aG9kcy5cbnZhciB1dGlscyA9IHtcbiAgZGlzYWJsZUxvZzogZnVuY3Rpb24oYm9vbCkge1xuICAgIGlmICh0eXBlb2YgYm9vbCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcmd1bWVudCB0eXBlOiAnICsgdHlwZW9mIGJvb2wgK1xuICAgICAgICAgICcuIFBsZWFzZSB1c2UgYSBib29sZWFuLicpO1xuICAgIH1cbiAgICBsb2dEaXNhYmxlZF8gPSBib29sO1xuICAgIHJldHVybiAoYm9vbCkgPyAnYWRhcHRlci5qcyBsb2dnaW5nIGRpc2FibGVkJyA6XG4gICAgICAgICdhZGFwdGVyLmpzIGxvZ2dpbmcgZW5hYmxlZCc7XG4gIH0sXG5cbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChsb2dEaXNhYmxlZF8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgYnJvd3NlciB2ZXJzaW9uIG91dCBvZiB0aGUgcHJvdmlkZWQgdXNlciBhZ2VudCBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7IXN0cmluZ30gdWFzdHJpbmcgdXNlckFnZW50IHN0cmluZy5cbiAgICogQHBhcmFtIHshc3RyaW5nfSBleHByIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIGFzIG1hdGNoIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0geyFudW1iZXJ9IHBvcyBwb3NpdGlvbiBpbiB0aGUgdmVyc2lvbiBzdHJpbmcgdG8gYmUgcmV0dXJuZWQuXG4gICAqIEByZXR1cm4geyFudW1iZXJ9IGJyb3dzZXIgdmVyc2lvbi5cbiAgICovXG4gIGV4dHJhY3RWZXJzaW9uOiBmdW5jdGlvbih1YXN0cmluZywgZXhwciwgcG9zKSB7XG4gICAgdmFyIG1hdGNoID0gdWFzdHJpbmcubWF0Y2goZXhwcik7XG4gICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+PSBwb3MgJiYgcGFyc2VJbnQobWF0Y2hbcG9zXSwgMTApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBCcm93c2VyIGRldGVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHJlc3VsdCBjb250YWluaW5nIGJyb3dzZXIgYW5kIHZlcnNpb25cbiAgICogICAgIHByb3BlcnRpZXMuXG4gICAqL1xuICBkZXRlY3RCcm93c2VyOiBmdW5jdGlvbigpIHtcbiAgICAvLyBSZXR1cm5lZCByZXN1bHQgb2JqZWN0LlxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQuYnJvd3NlciA9IG51bGw7XG4gICAgcmVzdWx0LnZlcnNpb24gPSBudWxsO1xuXG4gICAgLy8gRmFpbCBlYXJseSBpZiBpdCdzIG5vdCBhIGJyb3dzZXJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgIXdpbmRvdy5uYXZpZ2F0b3IpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIGJyb3dzZXIuJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveC5cbiAgICBpZiAobmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSkge1xuICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnZmlyZWZveCc7XG4gICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvRmlyZWZveFxcLyhbMC05XSspXFwuLywgMSk7XG5cbiAgICAvLyBhbGwgd2Via2l0LWJhc2VkIGJyb3dzZXJzXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKSB7XG4gICAgICAvLyBDaHJvbWUsIENocm9taXVtLCBXZWJ2aWV3LCBPcGVyYSwgYWxsIHVzZSB0aGUgY2hyb21lIHNoaW0gZm9yIG5vd1xuICAgICAgaWYgKHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHRoaXMuZXh0cmFjdFZlcnNpb24obmF2aWdhdG9yLnVzZXJBZ2VudCxcbiAgICAgICAgICAvQ2hyb20oZXxpdW0pXFwvKFswLTldKylcXC4vLCAyKTtcblxuICAgICAgLy8gU2FmYXJpIG9yIHVua25vd24gd2Via2l0LWJhc2VkXG4gICAgICAvLyBmb3IgdGhlIHRpbWUgYmVpbmcgU2FmYXJpIGhhcyBzdXBwb3J0IGZvciBNZWRpYVN0cmVhbXMgYnV0IG5vdCB3ZWJSVENcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNhZmFyaSBVQSBzdWJzdHJpbmdzIG9mIGludGVyZXN0IGZvciByZWZlcmVuY2U6XG4gICAgICAgIC8vIC0gd2Via2l0IHZlcnNpb246ICAgICAgICAgICBBcHBsZVdlYktpdC82MDIuMS4yNSAoYWxzbyB1c2VkIGluIE9wLENyKVxuICAgICAgICAvLyAtIHNhZmFyaSBVSSB2ZXJzaW9uOiAgICAgICAgVmVyc2lvbi85LjAuMyAodW5pcXVlIHRvIFNhZmFyaSlcbiAgICAgICAgLy8gLSBzYWZhcmkgVUkgd2Via2l0IHZlcnNpb246IFNhZmFyaS82MDEuNC40IChhbHNvIHVzZWQgaW4gT3AsQ3IpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIGlmIHRoZSB3ZWJraXQgdmVyc2lvbiBhbmQgc2FmYXJpIFVJIHdlYmtpdCB2ZXJzaW9ucyBhcmUgZXF1YWxzLFxuICAgICAgICAvLyAuLi4gdGhpcyBpcyBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgICAgICAvL1xuICAgICAgICAvLyBvbmx5IHRoZSBpbnRlcm5hbCB3ZWJraXQgdmVyc2lvbiBpcyBpbXBvcnRhbnQgdG9kYXkgdG8ga25vdyBpZlxuICAgICAgICAvLyBtZWRpYSBzdHJlYW1zIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgLy9cbiAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oXFxkKykuKFxcZCspLykpIHtcbiAgICAgICAgICByZXN1bHQuYnJvd3NlciA9ICdzYWZhcmknO1xuICAgICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgL0FwcGxlV2ViS2l0XFwvKFswLTldKylcXC4vLCAxKTtcblxuICAgICAgICAvLyB1bmtub3duIHdlYmtpdC1iYXNlZCBicm93c2VyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmJyb3dzZXIgPSAnVW5zdXBwb3J0ZWQgd2Via2l0LWJhc2VkIGJyb3dzZXIgJyArXG4gICAgICAgICAgICAgICd3aXRoIEdVTSBzdXBwb3J0IGJ1dCBubyBXZWJSVEMgc3VwcG9ydC4nO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIC8vIEVkZ2UuXG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzICYmXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0VkZ2VcXC8oXFxkKykuKFxcZCspJC8pKSB7XG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdlZGdlJztcbiAgICAgIHJlc3VsdC52ZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9FZGdlXFwvKFxcZCspLihcXGQrKSQvLCAyKTtcblxuICAgIC8vIERlZmF1bHQgZmFsbHRocm91Z2g6IG5vdCBzdXBwb3J0ZWQuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIHN1cHBvcnRlZCBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbi8vIEV4cG9ydC5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2c6IHV0aWxzLmxvZyxcbiAgZGlzYWJsZUxvZzogdXRpbHMuZGlzYWJsZUxvZyxcbiAgYnJvd3NlckRldGFpbHM6IHV0aWxzLmRldGVjdEJyb3dzZXIoKSxcbiAgZXh0cmFjdFZlcnNpb246IHV0aWxzLmV4dHJhY3RWZXJzaW9uXG59O1xuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuLyoqXG4gKiBAbGljZW5zZVxuICogTGljZW5zZSBpbmZvIGZvciB3ZWJydGMtYWRhcHRlciBtb2R1bGUgYXNzZW1ibGVkIGludG8ganMgYnVuZGxlOlxuICogXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKiBcbiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqIFxuICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICogXG4gKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdvb2dsZSBub3IgdGhlIG5hbWVzIG9mIGl0cyBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICogXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbi8qKlxuICogQGxpY2Vuc2VcbiAqIExpY2Vuc2UgaW5mbyBmb3Igc2RwIG1vZHVsZSBhc3NlbWJsZWQgaW50byBqcyBidW5kbGU6XG4gKiBcbiAqIFNlZSBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9zZHBcbiAqL1xuaW1wb3J0ICd3ZWJydGMtYWRhcHRlcic7XG4vKipcbiAqIEBsaWNlbnNlXG4gKiBMaWNlbnNlIGluZm8gZm9yIHV1aWQgbW9kdWxlIGFzc2VtYmxlZCBpbnRvIGpzIGJ1bmRsZTpcbiAqIFxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKiBcbiAqIENvcHlyaWdodCAoYykgMjAxMC0yMDE2IFJvYmVydCBLaWVmZmVyIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqIFxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKiBcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5pbXBvcnQgUnRjU2Vzc2lvbiBmcm9tICcuL3J0Y19zZXNzaW9uJztcbmltcG9ydCB7UlRDX0VSUk9SU30gZnJvbSAnLi9ydGNfY29uc3QnO1xuXG5nbG9iYWwuY29ubmVjdCA9IGdsb2JhbC5jb25uZWN0IHx8IHt9O1xuZ2xvYmFsLmNvbm5lY3QuUlRDU2Vzc2lvbiA9IFJ0Y1Nlc3Npb247XG5nbG9iYWwuY29ubmVjdC5SVENFcnJvcnMgPSBSVENfRVJST1JTO1xuXG5nbG9iYWwubGlseSA9IGdsb2JhbC5saWx5IHx8IHt9O1xuZ2xvYmFsLmxpbHkuUlRDU2Vzc2lvbiA9IFJ0Y1Nlc3Npb247XG5nbG9iYWwubGlseS5SVENFcnJvcnMgPSBSVENfRVJST1JTOyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFRpbWVvdXRFeGNlcHRpb25OYW1lID0gJ1RpbWVvdXQnO1xuZXhwb3J0IGNsYXNzIFRpbWVvdXQgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobXNnKSB7XG4gICAgICAgIHN1cGVyKG1zZyk7XG4gICAgICAgIHRoaXMubmFtZSA9IFRpbWVvdXRFeGNlcHRpb25OYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IEd1bVRpbWVvdXRFeGNlcHRpb25OYW1lID0gJ0d1bVRpbWVvdXQnO1xuZXhwb3J0IGNsYXNzIEd1bVRpbWVvdXQgZXh0ZW5kcyBUaW1lb3V0IHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gR3VtVGltZW91dEV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgSWxsZWdhbFBhcmFtZXRlcnNFeGNlcHRpb25OYW1lID0gJ0lsbGVnYWxQYXJhbWV0ZXJzJztcbmV4cG9ydCBjbGFzcyBJbGxlZ2FsUGFyYW1ldGVycyBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gSWxsZWdhbFBhcmFtZXRlcnNFeGNlcHRpb25OYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IElsbGVnYWxTdGF0ZUV4Y2VwdGlvbk5hbWUgPSAnSWxsZWdhbFN0YXRlJztcbmV4cG9ydCBjbGFzcyBJbGxlZ2FsU3RhdGUgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobXNnKSB7XG4gICAgICAgIHN1cGVyKG1zZyk7XG4gICAgICAgIHRoaXMubmFtZSA9IElsbGVnYWxTdGF0ZUV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgVW5zdXBwb3J0ZWRPcGVyYXRpb25FeGNlcHRpb25OYW1lID0gJ1Vuc3VwcG9ydGVkT3BlcmF0aW9uJztcbmV4cG9ydCBjbGFzcyBVbnN1cHBvcnRlZE9wZXJhdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihtc2cpIHtcbiAgICAgICAgc3VwZXIobXNnKTtcbiAgICAgICAgdGhpcy5uYW1lID0gVW5zdXBwb3J0ZWRPcGVyYXRpb25FeGNlcHRpb25OYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IEJ1c3lFeGNlcHRpb25OYW1lID0gJ0J1c3lFeGNlcHRpb24nO1xuZXhwb3J0IGNsYXNzIEJ1c3lFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobXNnKSB7XG4gICAgICAgIHN1cGVyKG1zZyk7XG4gICAgICAgIHRoaXMubmFtZSA9IEJ1c3lFeGNlcHRpb25OYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IENhbGxOb3RGb3VuZEV4Y2VwdGlvbk5hbWUgPSAnQ2FsbE5vdEZvdW5kRXhjZXB0aW9uJztcbmV4cG9ydCBjbGFzcyBDYWxsTm90Rm91bmRFeGNlcHRpb24gZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobXNnKSB7XG4gICAgICAgIHN1cGVyKG1zZyk7XG4gICAgICAgIHRoaXMubmFtZSA9IENhbGxOb3RGb3VuZEV4Y2VwdGlvbk5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgVW5rbm93blNpZ25hbGluZ0Vycm9yTmFtZSA9ICdVbmtub3duU2lnbmFsaW5nRXJyb3InO1xuZXhwb3J0IGNsYXNzIFVua25vd25TaWduYWxpbmdFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gVW5rbm93blNpZ25hbGluZ0Vycm9yTmFtZTtcbiAgICB9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE3IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFtYXpvbiBTb2Z0d2FyZSBMaWNlbnNlICh0aGUgXCJMaWNlbnNlXCIpLiBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICBodHRwOi8vYXdzLmFtYXpvbi5jb20vYXNsL1xuICpcbiAqIG9yIGluIHRoZSBcIkxJQ0VOU0VcIiBmaWxlIGFjY29tcGFueWluZyB0aGlzIGZpbGUuIFRoaXMgZmlsZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBUaW1lb3V0IHdhaXRpbmcgZm9yIHNlcnZlciByZXNwb25zZSB0byBhY2NlcHQvaGFuZ3VwIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBjb25zdCBNQVhfQUNDRVBUX0JZRV9ERUxBWV9NUyA9IDIwMDA7XG4vKipcbiAqIFRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmVyIHJlc3BvbnNlIHRvIGludml0ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IE1BWF9JTlZJVEVfREVMQVlfTVMgPSA1MDAwO1xuLyoqXG4gKiAgRGVmYXVsdCB0aW1lb3V0IG9uIG9wZW5pbmcgV2ViU29ja2V0IGNvbm5lY3Rpb24uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTk5FQ1RfVElNRU9VVF9NUyA9IDEwMDAwO1xuLyoqXG4gKiBEZWZhdWx0IGljZSBjb2xsZWN0aW9uIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzLlxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9JQ0VfVElNRU9VVF9NUyA9IDgwMDA7XG4vKipcbiAqIERlZmF1bHQgZ3VtIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGJlIGVuZm9yY2VkIGR1cmluZyBzdGFydCBvZiBhIGNhbGwuXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0dVTV9USU1FT1VUX01TID0gMTAwMDA7XG5cbi8qKlxuICogUlRDIGVycm9yIG5hbWVzLlxuICovXG5leHBvcnQgY29uc3QgUlRDX0VSUk9SUyA9IHtcbiAgICAgSUNFX0NPTExFQ1RJT05fVElNRU9VVCA6ICdJY2UgQ29sbGVjdGlvbiBUaW1lb3V0JyxcbiAgICAgVVNFUl9CVVNZIDogJ1VzZXIgQnVzeScsXG4gICAgIFNJR05BTExJTkdfQ09OTkVDVElPTl9GQUlMVVJFIDogJ1NpZ25hbGxpbmcgQ29ubmVjdGlvbiBGYWlsdXJlJyxcbiAgICAgU0lHTkFMTElOR19IQU5EU0hBS0VfRkFJTFVSRSA6ICdTaWduYWxsaW5nIEhhbmRzaGFrZSBGYWlsdXJlJyxcbiAgICAgU0VUX1JFTU9URV9ERVNDUklQVElPTl9GQUlMVVJFIDogJ1NldCBSZW1vdGUgRGVzY3JpcHRpb24gRmFpbHVyZScsXG4gICAgIENSRUFURV9PRkZFUl9GQUlMVVJFIDogJ0NyZWF0ZSBPZmZlciBGYWlsdXJlJyxcbiAgICAgU0VUX0xPQ0FMX0RFU0NSSVBUSU9OX0ZBSUxVUkUgOiAnU2V0IExvY2FsIERlc2NyaXB0aW9uIEZhaWx1cmUnLFxuICAgICBJTlZBTElEX1JFTU9URV9TRFAgOiAnSW52YWxpZCBSZW1vdGUgU0RQJyxcbiAgICAgTk9fUkVNT1RFX0lDRV9DQU5ESURBVEUgOiAnTm8gUmVtb3RlIElDRSBDYW5kaWRhdGUnLFxuICAgICBHVU1fVElNRU9VVF9GQUlMVVJFIDogJ0dVTSBUaW1lb3V0IEZhaWx1cmUnLFxuICAgICBHVU1fT1RIRVJfRkFJTFVSRSA6ICdHVU0gT3RoZXIgRmFpbHVyZScsXG4gICAgIENBTExfTk9UX0ZPVU5EOiAnQ2FsbCBOb3QgRm91bmQnXG59OyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHsgaGl0Y2gsIHdyYXBMb2dnZXIsIGNsb3NlU3RyZWFtLCBTZHBPcHRpb25zLCB0cmFuc2Zvcm1TZHAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IFNlc3Npb25SZXBvcnQgfSBmcm9tICcuL3Nlc3Npb25fcmVwb3J0JztcbmltcG9ydCB7IERFRkFVTFRfSUNFX1RJTUVPVVRfTVMsIERFRkFVTFRfR1VNX1RJTUVPVVRfTVMsIFJUQ19FUlJPUlMgfSBmcm9tICcuL3J0Y19jb25zdCc7XG5pbXBvcnQgeyBVbnN1cHBvcnRlZE9wZXJhdGlvbiwgSWxsZWdhbFBhcmFtZXRlcnMsIElsbGVnYWxTdGF0ZSwgR3VtVGltZW91dCwgQnVzeUV4Y2VwdGlvbk5hbWUsIENhbGxOb3RGb3VuZEV4Y2VwdGlvbk5hbWUgfSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IFJ0Y1NpZ25hbGluZyBmcm9tICcuL3NpZ25hbGluZyc7XG5pbXBvcnQgdXVpZCBmcm9tICd1dWlkL3Y0JztcbmltcG9ydCB7ZXh0cmFjdE1lZGlhU3RhdHNGcm9tU3RhdHN9IGZyb20gJy4vcnRwLXN0YXRzJztcbmltcG9ydCB7IHBhcnNlQ2FuZGlkYXRlIH0gZnJvbSAnc2RwJztcblxuZXhwb3J0IGNsYXNzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1J0Y1Nlc3Npb259IHJ0Y1Nlc3Npb25cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihydGNTZXNzaW9uKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24gPSBydGNTZXNzaW9uO1xuICAgIH1cbiAgICBvbkVudGVyKCkge1xuICAgIH1cbiAgICBvbkV4aXQoKSB7XG4gICAgfVxuICAgIF9pc0N1cnJlbnRTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J0Y1Nlc3Npb24uX3N0YXRlID09PSB0aGlzO1xuICAgIH1cbiAgICB0cmFuc2l0KG5leHRTdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5faXNDdXJyZW50U3RhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi50cmFuc2l0KG5leHRTdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGxvZ2dlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J0Y1Nlc3Npb24uX2xvZ2dlcjtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24pKTtcbiAgICB9XG4gICAgb25JY2VDYW5kaWRhdGUoZXZ0KSB7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgICAvL2lnbm9yZSBjYW5kaWRhdGUgYnkgZGVmYXVsdCwgQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZSB3aWxsIG92ZXJyaWRlIHRvIGNvbGxlY3QgY2FuZGlkYXRlcywgYnV0IGNvbGxlY3RpbmcgcHJvY2VzcyBjb3VsZCBsYXN0IG11Y2ggbG9uZ2VyIHRoYW4gQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZVxuICAgICAgICAvL3dlIGRvbid0IHdhbnQgdG8gc3BhbSB0aGUgY29uc29sZSBsb2dcbiAgICB9XG4gICAgb25SZW1vdGVIdW5ndXAoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25SZW1vdGVIdW5ndXAgbm90IGltcGxlbWVudGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUlRDU2Vzc2lvblN0YXRlXCI7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nQ29ubmVjdGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ29uU2lnbmFsaW5nQ29ubmVjdGVkIG5vdCBpbXBsZW1lbnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdIYW5kc2hha2VkKCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ29uU2lnbmFsaW5nSGFuZHNoYWtlZCBub3QgaW1wbGVtZW50ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nRmFpbGVkKGUpIHsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25TaWduYWxpbmdGYWlsZWQgbm90IGltcGxlbWVudGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBvbkljZVN0YXRlQ2hhbmdlKGV2dCkgey8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR3JhYkxvY2FsTWVkaWFTdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKHNlbGYuX3J0Y1Nlc3Npb24uX3VzZXJBdWRpb1N0cmVhbSkge1xuICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBDcmVhdGVPZmZlclN0YXRlKHNlbGYuX3J0Y1Nlc3Npb24pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBndW1UaW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBHdW1UaW1lb3V0KCdMb2NhbCBtZWRpYSBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQgeWV0LicpKTtcbiAgICAgICAgICAgICAgICB9LCBzZWxmLl9ydGNTZXNzaW9uLl9ndW1UaW1lb3V0TWlsbGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHNlc3Npb25HdW1Qcm9taXNlID0gc2VsZi5fZ1VNKHNlbGYuX3J0Y1Nlc3Npb24uX2J1aWxkTWVkaWFDb25zdHJhaW50cygpKTtcblxuICAgICAgICAgICAgUHJvbWlzZS5yYWNlKFtzZXNzaW9uR3VtUHJvbWlzZSwgZ3VtVGltZW91dFByb21pc2VdKVxuICAgICAgICAgICAgICAgIC50aGVuKHN0cmVhbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX29uR3VtU3VjY2VzcyhzZWxmLl9ydGNTZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fbG9jYWxTdHJlYW0gPSBzdHJlYW07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtT3RoZXJGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuZ3VtVGltZW91dEZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBDcmVhdGVPZmZlclN0YXRlKHNlbGYuX3J0Y1Nlc3Npb24pKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1UaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVycm9yUmVhc29uO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEd1bVRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yUmVhc29uID0gUlRDX0VSUk9SUy5HVU1fVElNRU9VVF9GQUlMVVJFO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1UaW1lb3V0RmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lmd1bU90aGVyRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JSZWFzb24gPSBSVENfRVJST1JTLkdVTV9PVEhFUl9GQUlMVVJFO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1PdGhlckZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ndW1UaW1lb3V0RmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9nZ2VyLmVycm9yKCdMb2NhbCBtZWRpYSBpbml0aWFsaXphdGlvbiBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fb25HdW1FcnJvcihzZWxmLl9ydGNTZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZShzZWxmLl9ydGNTZXNzaW9uLCBlcnJvclJlYXNvbikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJHcmFiTG9jYWxNZWRpYVN0YXRlXCI7XG4gICAgfVxuICAgIF9nVU0oY29uc3RyYWludHMpIHtcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQ3JlYXRlT2ZmZXJTdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc3RyZWFtID0gc2VsZi5fcnRjU2Vzc2lvbi5fbG9jYWxTdHJlYW07XG4gICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3BjLmFkZFN0cmVhbShzdHJlYW0pO1xuICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9vbkxvY2FsU3RyZWFtQWRkZWQoc2VsZi5fcnRjU2Vzc2lvbiwgc3RyZWFtKTtcbiAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fcGMuY3JlYXRlT2ZmZXIoKS50aGVuKHJ0Y1Nlc3Npb25EZXNjcmlwdGlvbiA9PiB7XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9sb2NhbFNlc3Npb25EZXNjcmlwdGlvbiA9IHJ0Y1Nlc3Npb25EZXNjcmlwdGlvbjtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuY3JlYXRlT2ZmZXJGYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IFNldExvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbikpO1xuICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIHNlbGYubG9nZ2VyLmVycm9yKCdDcmVhdGVPZmZlciBmYWlsZWQnLCBlKTtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuY3JlYXRlT2ZmZXJGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5DUkVBVEVfT0ZGRVJfRkFJTFVSRSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkNyZWF0ZU9mZmVyU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU2V0TG9jYWxTZXNzaW9uRGVzY3JpcHRpb25TdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIGZpeC9tb2RpZnkgU0RQIGFzIG5lZWRlZCBoZXJlLCBiZWZvcmUgc2V0TG9jYWxEZXNjcmlwdGlvblxuICAgICAgICB2YXIgbG9jYWxEZXNjcmlwdGlvbiA9IHNlbGYuX3J0Y1Nlc3Npb24uX2xvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uO1xuICAgICAgICB2YXIgc2RwT3B0aW9ucyA9IG5ldyBTZHBPcHRpb25zKCk7XG4gICAgICAgIC8vIFNldCBhdWRpbyBjb2RlYy5cbiAgICAgICAgaWYgKHNlbGYuX3J0Y1Nlc3Npb24uX2ZvcmNlQXVkaW9Db2RlYykge1xuICAgICAgICAgICAgc2RwT3B0aW9ucy5mb3JjZUNvZGVjWydhdWRpbyddID0gc2VsZi5fcnRjU2Vzc2lvbi5fZm9yY2VBdWRpb0NvZGVjO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCB2aWRlbyBjb2RlYy5cbiAgICAgICAgaWYgKHNlbGYuX3J0Y1Nlc3Npb24uX2ZvcmNlVmlkZW9Db2RlYykge1xuICAgICAgICAgICAgc2RwT3B0aW9ucy5mb3JjZUNvZGVjWyd2aWRlbyddID0gc2VsZi5fcnRjU2Vzc2lvbi5fZm9yY2VWaWRlb0NvZGVjO1xuICAgICAgICB9XG4gICAgICAgIHNkcE9wdGlvbnMuZW5hYmxlT3B1c0R0eCA9IHNlbGYuX3J0Y1Nlc3Npb24uX2VuYWJsZU9wdXNEdHg7XG5cbiAgICAgICAgdmFyIHRyYW5zZm9ybWVkU2RwID0gdHJhbnNmb3JtU2RwKGxvY2FsRGVzY3JpcHRpb24uc2RwLCBzZHBPcHRpb25zKTtcbiAgICAgICAgbG9jYWxEZXNjcmlwdGlvbi5zZHAgPSB0cmFuc2Zvcm1lZFNkcC5zZHA7XG5cbiAgICAgICAgc2VsZi5sb2dnZXIuaW5mbygnTG9jYWxTRCcsIHNlbGYuX3J0Y1Nlc3Npb24uX2xvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uKTtcbiAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fcGMuc2V0TG9jYWxEZXNjcmlwdGlvbihzZWxmLl9ydGNTZXNzaW9uLl9sb2NhbFNlc3Npb25EZXNjcmlwdGlvbikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbGl6YXRpb25UaW1lID0gRGF0ZS5ub3coKSAtIHNlbGYuX3J0Y1Nlc3Npb24uX2Nvbm5lY3RUaW1lU3RhbXA7XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmluaXRpYWxpemF0aW9uVGltZU1pbGxpcyA9IGluaXRpYWxpemF0aW9uVGltZTtcbiAgICAgICAgICAgIHNlbGYuX3J0Y1Nlc3Npb24uX29uU2Vzc2lvbkluaXRpYWxpemVkKHNlbGYuX3J0Y1Nlc3Npb24sIGluaXRpYWxpemF0aW9uVGltZSk7XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IENvbm5lY3RTaWduYWxpbmdBbmRJY2VDb2xsZWN0aW9uU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbiwgdHJhbnNmb3JtZWRTZHAubUxpbmVzKSk7XG4gICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5sb2dnZXIuZXJyb3IoJ1NldExvY2FsRGVzY3JpcHRpb24gZmFpbGVkJywgZSk7XG4gICAgICAgICAgICBzZWxmLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUoc2VsZi5fcnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5TRVRfTE9DQUxfREVTQ1JJUFRJT05fRkFJTFVSRSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlNldExvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uU3RhdGVcIjtcbiAgICB9XG59XG5cbi8qKlxuICogS2ljayBvZmYgc2lnbmFsaW5nIGNvbm5lY3Rpb24uIFdhaXQgdW50aWwgc2lnbmFsaW5nIGNvbm5lY3RzIGFuZCBJQ0UgY29sbGVjdGlvbiAod2hpY2ggYWxyZWFkeSBzdGFydGVkIGluIHByZXZpb3VzIHN0YXRlKSBjb21wbGV0ZXMuXG4gKiBJQ0UgY29sbGVjdGlvbiB0aW1lcyBvdXQgYWZ0ZXIgdXNlciBzcGVjaWZpZWQgYW1vdW50IG9mIHRpbWUgKGRlZmF1bHQgdG8gREVGQVVMVF9JQ0VfVElNRU9VVF9NUykgaW4gY2FzZSB1c2VyIGhhcyBjb21wbGV4IG5ldHdvcmsgZW52aXJvbm1lbnQgdGhhdCBibGFja2hvbGVzIFNUVU4vVFVSTiByZXF1ZXN0cy4gSW4gdGhpcyBjYXNlIGF0IGxlYXN0IG9uZSBjYW5kaWRhdGUgaXMgcmVxdWlyZWQgdG8gbW92ZSBmb3J3YXJkLlxuICogSUNFIGNvbGxlY3Rpb24gY291bGQgYWxzbyB3cmFwIHVwIGJlZm9yZSB0aW1lb3V0IGlmIGl0J3MgZGV0ZXJtaW5lZCB0aGF0IFJUUCBjYW5kaWRhdGVzIGZyb20gc2FtZSBUVVJOIHNlcnZlciBoYXZlIGJlZW4gY29sbGVjdGVkIGZvciBhbGwgbSBsaW5lcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbm5lY3RTaWduYWxpbmdBbmRJY2VDb2xsZWN0aW9uU3RhdGUgZXh0ZW5kcyBSVENTZXNzaW9uU3RhdGUge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBDb25uZWN0U2lnbmFsaW5nQW5kSWNlQ29sbGVjdGlvblN0YXRlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge1J0Y1Nlc3Npb259IHJ0Y1Nlc3Npb25cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbUxpbmVzIE51bWJlciBvZiBtIGxpbmVzIGluIFNEUFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJ0Y1Nlc3Npb24sIG1MaW5lcykge1xuICAgICAgICBzdXBlcihydGNTZXNzaW9uKTtcbiAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlcyA9IFtdO1xuICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVGb3VuZGF0aW9uc01hcCA9IHt9O1xuICAgICAgICB0aGlzLl9tTGluZXMgPSBtTGluZXM7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VsZi5faXNDdXJyZW50U3RhdGUoKSAmJiAhc2VsZi5faWNlQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIud2FybignSUNFIGNvbGxlY3Rpb24gdGltZWQgb3V0Jyk7XG4gICAgICAgICAgICAgICAgc2VsZi5fcmVwb3J0SWNlQ29tcGxldGVkKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLl9ydGNTZXNzaW9uLl9pY2VUaW1lb3V0TWlsbGlzKTtcbiAgICAgICAgc2VsZi5fcnRjU2Vzc2lvbi5fY3JlYXRlU2lnbmFsaW5nQ2hhbm5lbCgpLmNvbm5lY3QoKTtcbiAgICB9XG4gICAgb25TaWduYWxpbmdDb25uZWN0ZWQoKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3NpZ25hbGxpbmdDb25uZWN0VGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMgPSB0aGlzLl9ydGNTZXNzaW9uLl9zaWduYWxsaW5nQ29ubmVjdFRpbWVzdGFtcCAtIHRoaXMuX3N0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fb25TaWduYWxpbmdDb25uZWN0ZWQodGhpcy5fcnRjU2Vzc2lvbik7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2lnbmFsbGluZ0Nvbm5lY3Rpb25GYWlsdXJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NoZWNrQW5kVHJhbnNpdCgpO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0ZhaWxlZChlKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuc2lnbmFsbGluZ0Nvbm5lY3RUaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHRoaXMuX3N0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0ZhaWxlZCBjb25uZWN0aW5nIHRvIHNpZ25hbGluZyBzZXJ2ZXInLCBlKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24sIFJUQ19FUlJPUlMuU0lHTkFMTElOR19DT05ORUNUSU9OX0ZBSUxVUkUpKTtcbiAgICB9XG4gICAgX2NyZWF0ZUxvY2FsQ2FuZGlkYXRlKGluaXREaWN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUlRDSWNlQ2FuZGlkYXRlKGluaXREaWN0KTtcbiAgICB9XG4gICAgb25JY2VDYW5kaWRhdGUoZXZ0KSB7XG4gICAgICAgIHZhciBjYW5kaWRhdGUgPSBldnQuY2FuZGlkYXRlO1xuICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ29uaWNlY2FuZGlkYXRlICcgKyBKU09OLnN0cmluZ2lmeShjYW5kaWRhdGUpKTtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlcy5wdXNoKHRoaXMuX2NyZWF0ZUxvY2FsQ2FuZGlkYXRlKGNhbmRpZGF0ZSkpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2ljZUNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoZWNrQ2FuZGlkYXRlc1N1ZmZpY2llbnQoY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVwb3J0SWNlQ29tcGxldGVkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfY2hlY2tDYW5kaWRhdGVzU3VmZmljaWVudChjYW5kaWRhdGUpIHtcbiAgICAgICAgLy9jaGVjayBpZiB3ZSBjb2xsZWN0ZWQgc3VmZmljaWVudCBjYW5kaWRhdGVzIGZyb20gc2luZ2xlIG1lZGlhIHNlcnZlciB0byBzdGFydCB0aGUgY2FsbFxuICAgICAgICB2YXIgY2FuZGlkYXRlT2JqID0gcGFyc2VDYW5kaWRhdGUoY2FuZGlkYXRlLmNhbmRpZGF0ZSk7XG4gICAgICAgIGlmIChjYW5kaWRhdGVPYmouY29tcG9uZW50ICE9IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FuZGlkYXRlRm91bmRhdGlvbiA9IGNhbmRpZGF0ZU9iai5mb3VuZGF0aW9uO1xuICAgICAgICB2YXIgY2FuZGlkYXRlTUxpbmVJbmRleCA9IGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4O1xuICAgICAgICBpZiAoY2FuZGlkYXRlRm91bmRhdGlvbiAmJiBjYW5kaWRhdGVNTGluZUluZGV4ID49IDAgJiYgY2FuZGlkYXRlTUxpbmVJbmRleCA8IHRoaXMuX21MaW5lcykge1xuICAgICAgICAgICAgdmFyIG1JbmRleExpc3QgPSB0aGlzLl9pY2VDYW5kaWRhdGVGb3VuZGF0aW9uc01hcFtjYW5kaWRhdGVGb3VuZGF0aW9uXSB8fCBbXTtcbiAgICAgICAgICAgIGlmICghbUluZGV4TGlzdC5pbmNsdWRlcyhjYW5kaWRhdGVNTGluZUluZGV4KSkge1xuICAgICAgICAgICAgICAgIG1JbmRleExpc3QucHVzaChjYW5kaWRhdGVNTGluZUluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZUZvdW5kYXRpb25zTWFwW2NhbmRpZGF0ZUZvdW5kYXRpb25dID0gbUluZGV4TGlzdDtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX21MaW5lcyA9PSBtSW5kZXhMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlcG9ydEljZUNvbXBsZXRlZChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgX3JlcG9ydEljZUNvbXBsZXRlZChpc1RpbWVvdXQpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5pY2VDb2xsZWN0aW9uVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX2ljZUNvbXBsZXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX29uSWNlQ29sbGVjdGlvbkNvbXBsZXRlKHRoaXMuX3J0Y1Nlc3Npb24sIGlzVGltZW91dCwgdGhpcy5faWNlQ2FuZGlkYXRlcy5sZW5ndGgpO1xuICAgICAgICBpZiAodGhpcy5faWNlQ2FuZGlkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmljZUNvbGxlY3Rpb25GYWlsdXJlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9jaGVja0FuZFRyYW5zaXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdObyBJQ0UgY2FuZGlkYXRlJyk7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmljZUNvbGxlY3Rpb25GYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgUlRDX0VSUk9SUy5JQ0VfQ09MTEVDVElPTl9USU1FT1VUKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2NoZWNrQW5kVHJhbnNpdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ljZUNvbXBsZXRlZCAmJiB0aGlzLl9zaWduYWxpbmdDb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgSW52aXRlQW5zd2VyU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgdGhpcy5faWNlQ2FuZGlkYXRlcykpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLl9pY2VDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygnUGVuZGluZyBJQ0UgY29sbGVjdGlvbicpO1xuICAgICAgICB9IGVsc2Ugey8vaW1wbGllcyBfc2lnbmFsaW5nQ29ubmVjdGVkID09IGZhbHNlXG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5sb2coJ1BlbmRpbmcgc2lnbmFsaW5nIGNvbm5lY3Rpb24nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiQ29ubmVjdFNpZ25hbGluZ0FuZEljZUNvbGxlY3Rpb25TdGF0ZVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludml0ZUFuc3dlclN0YXRlIGV4dGVuZHMgUlRDU2Vzc2lvblN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihydGNTZXNzaW9uLCBpY2VDYW5kaWRhdGVzKSB7XG4gICAgICAgIHN1cGVyKHJ0Y1Nlc3Npb24pO1xuICAgICAgICB0aGlzLl9pY2VDYW5kaWRhdGVzID0gaWNlQ2FuZGlkYXRlcztcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHJ0Y1Nlc3Npb24gPSB0aGlzLl9ydGNTZXNzaW9uO1xuICAgICAgICBydGNTZXNzaW9uLl9vblNpZ25hbGluZ1N0YXJ0ZWQocnRjU2Vzc2lvbik7XG4gICAgICAgIHJ0Y1Nlc3Npb24uX3NpZ25hbGluZ0NoYW5uZWwuaW52aXRlKHJ0Y1Nlc3Npb24uX2xvY2FsU2Vzc2lvbkRlc2NyaXB0aW9uLnNkcCxcbiAgICAgICAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZXMpO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0Fuc3dlcmVkKHNkcCwgY2FuZGlkYXRlcykge1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnVzZXJCdXN5RmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LmhhbmRzaGFraW5nRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEFjY2VwdFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24sIHNkcCwgY2FuZGlkYXRlcykpO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0ZhaWxlZChlKSB7XG4gICAgICAgIHZhciByZWFzb247XG4gICAgICAgIGlmIChlLm5hbWUgPT0gQnVzeUV4Y2VwdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdVc2VyIEJ1c3ksIHBvc3NpYmx5IG11bHRpcGxlIENDUCB3aW5kb3dzIG9wZW4nLCBlKTtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQudXNlckJ1c3lGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaGFuZHNoYWtpbmdGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlYXNvbiA9IFJUQ19FUlJPUlMuVVNFUl9CVVNZO1xuICAgICAgICB9IGVsc2UgaWYgKGUubmFtZSA9PSBDYWxsTm90Rm91bmRFeGNlcHRpb25OYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignQ2FsbCBub3QgZm91bmQuIE9uZSBvZiB0aGUgcGFydGljaXBhbnQgcHJvYmFibHkgaHVuZ3VwLicsIGUpO1xuICAgICAgICAgICAgcmVhc29uID0gUlRDX0VSUk9SUy5DQUxMX05PVF9GT1VORDtcbiAgICAgICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaGFuZHNoYWtpbmdGYWlsdXJlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdGYWlsZWQgaGFuZHNoYWtpbmcgd2l0aCBzaWduYWxpbmcgc2VydmVyJywgZSk7XG4gICAgICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnVzZXJCdXN5RmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5oYW5kc2hha2luZ0ZhaWx1cmUgPSB0cnVlO1xuICAgICAgICAgICAgcmVhc29uID0gUlRDX0VSUk9SUy5TSUdOQUxMSU5HX0hBTkRTSEFLRV9GQUlMVVJFO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fcnRjU2Vzc2lvbiwgcmVhc29uKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJJbnZpdGVBbnN3ZXJTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBBY2NlcHRTdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgY29uc3RydWN0b3IocnRjU2Vzc2lvbiwgc2RwLCBjYW5kaWRhdGVzKSB7XG4gICAgICAgIHN1cGVyKHJ0Y1Nlc3Npb24pO1xuICAgICAgICB0aGlzLl9zZHAgPSBzZHA7XG4gICAgICAgIHRoaXMuX2NhbmRpZGF0ZXMgPSBjYW5kaWRhdGVzO1xuICAgIH1cbiAgICBfY3JlYXRlU2Vzc2lvbkRlc2NyaXB0aW9uKGluaXREaWN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKGluaXREaWN0KTtcbiAgICB9XG4gICAgX2NyZWF0ZVJlbW90ZUNhbmRpZGF0ZShpbml0RGljdCkge1xuICAgICAgICByZXR1cm4gbmV3IFJUQ0ljZUNhbmRpZGF0ZShpbml0RGljdCk7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHJ0Y1Nlc3Npb24gPSBzZWxmLl9ydGNTZXNzaW9uO1xuXG4gICAgICAgIGlmICghc2VsZi5fc2RwKSB7XG4gICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignSW52YWxpZCByZW1vdGUgU0RQJyk7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zdG9wU2Vzc2lvbigpO1xuICAgICAgICAgICAgcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5pbnZhbGlkUmVtb3RlU0RQRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHJ0Y1Nlc3Npb24sIFJUQ19FUlJPUlMuSU5WQUxJRF9SRU1PVEVfU0RQKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoIXNlbGYuX2NhbmRpZGF0ZXMgfHwgc2VsZi5fY2FuZGlkYXRlcy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICBzZWxmLmxvZ2dlci5lcnJvcignTm8gcmVtb3RlIElDRSBjYW5kaWRhdGUnKTtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3N0b3BTZXNzaW9uKCk7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0Lm5vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHJ0Y1Nlc3Npb24sIFJUQ19FUlJPUlMuTk9fUkVNT1RFX0lDRV9DQU5ESURBVEUpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJ0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaW52YWxpZFJlbW90ZVNEUEZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5ub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmUgPSBmYWxzZTtcbiAgICAgICAgdmFyIHNldFJlbW90ZURlc2NyaXB0aW9uUHJvbWlzZSA9IHJ0Y1Nlc3Npb24uX3BjLnNldFJlbW90ZURlc2NyaXB0aW9uKHNlbGYuX2NyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgICAgICB0eXBlOiAnYW5zd2VyJyxcbiAgICAgICAgICAgIHNkcDogc2VsZi5fc2RwXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2V0UmVtb3RlRGVzY3JpcHRpb25Qcm9taXNlLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgc2VsZi5sb2dnZXIuZXJyb3IoJ1NldFJlbW90ZURlc2NyaXB0aW9uIGZhaWxlZCcsIGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2V0UmVtb3RlRGVzY3JpcHRpb25Qcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdmFyIHJlbW90ZUNhbmRpZGF0ZVByb21pc2VzID0gUHJvbWlzZS5hbGwoc2VsZi5fY2FuZGlkYXRlcy5tYXAoZnVuY3Rpb24gKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciByZW1vdGVDYW5kaWRhdGUgPSBzZWxmLl9jcmVhdGVSZW1vdGVDYW5kaWRhdGUoY2FuZGlkYXRlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvZ2dlci5pbmZvKCdBZGRpbmcgcmVtb3RlIGNhbmRpZGF0ZScsIHJlbW90ZUNhbmRpZGF0ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ0Y1Nlc3Npb24uX3BjLmFkZEljZUNhbmRpZGF0ZShyZW1vdGVDYW5kaWRhdGUpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmVtb3RlQ2FuZGlkYXRlUHJvbWlzZXMuY2F0Y2gocmVhc29uID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvZ2dlci53YXJuKCdFcnJvciBhZGRpbmcgcmVtb3RlIGNhbmRpZGF0ZScsIHJlYXNvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZW1vdGVDYW5kaWRhdGVQcm9taXNlcztcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5fcmVtb3RlRGVzY3JpcHRpb25TZXQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5fY2hlY2tBbmRUcmFuc2l0KCk7XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIHJ0Y1Nlc3Npb24uX3N0b3BTZXNzaW9uKCk7XG4gICAgICAgICAgICBydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHJ0Y1Nlc3Npb24sIFJUQ19FUlJPUlMuU0VUX1JFTU9URV9ERVNDUklQVElPTl9GQUlMVVJFKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvblNpZ25hbGluZ0hhbmRzaGFrZWQoKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQuaGFuZHNoYWtpbmdUaW1lTWlsbGlzID0gRGF0ZS5ub3coKSAtIHRoaXMuX3J0Y1Nlc3Npb24uX3NpZ25hbGxpbmdDb25uZWN0VGltZXN0YW1wO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdIYW5kc2hha2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2hlY2tBbmRUcmFuc2l0KCk7XG4gICAgfVxuICAgIF9jaGVja0FuZFRyYW5zaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zaWduYWxpbmdIYW5kc2hha2VkICYmIHRoaXMuX3JlbW90ZURlc2NyaXB0aW9uU2V0KSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFRhbGtpbmdTdGF0ZSh0aGlzLl9ydGNTZXNzaW9uKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX3NpZ25hbGluZ0hhbmRzaGFrZWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygnUGVuZGluZyBoYW5kc2hha2luZycpO1xuICAgICAgICB9IGVsc2Ugey8vaW1wbGllcyBfcmVtb3RlRGVzY3JpcHRpb25TZXQgPT0gZmFsc2VcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmxvZygnUGVuZGluZyBzZXR0aW5nIHJlbW90ZSBkZXNjcmlwdGlvbicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJBY2NlcHRTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBUYWxraW5nU3RhdGUgZXh0ZW5kcyBSVENTZXNzaW9uU3RhdGUge1xuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQucHJlVGFsa2luZ1RpbWVNaWxsaXMgPSB0aGlzLl9zdGFydFRpbWUgLSB0aGlzLl9ydGNTZXNzaW9uLl9jb25uZWN0VGltZVN0YW1wO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9vblNlc3Npb25Db25uZWN0ZWQodGhpcy5fcnRjU2Vzc2lvbik7XG4gICAgfVxuICAgIG9uU2lnbmFsaW5nUmVjb25uZWN0ZWQoKSB7XG4gICAgfVxuICAgIG9uUmVtb3RlSHVuZ3VwKCkge1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zaWduYWxpbmdDaGFubmVsLmhhbmd1cCgpO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IERpc2Nvbm5lY3RlZFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24pKTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zaWduYWxpbmdDaGFubmVsLmhhbmd1cCgpO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IERpc2Nvbm5lY3RlZFN0YXRlKHRoaXMuX3J0Y1Nlc3Npb24pKTtcbiAgICB9XG4gICAgb25JY2VTdGF0ZUNoYW5nZShldnQpIHtcbiAgICAgICAgaWYgKGV2dC5jdXJyZW50VGFyZ2V0LmljZUNvbm5lY3Rpb25TdGF0ZSA9PSAnZGlzY29ubmVjdGVkJykge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuaW5mbygnTG9zdCBJQ0UgY29ubmVjdGlvbicpO1xuICAgICAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5pY2VDb25uZWN0aW9uc0xvc3QgKz0gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvbkV4aXQoKSB7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX3Nlc3Npb25SZXBvcnQudGFsa2luZ1RpbWVNaWxsaXMgPSBEYXRlLm5vdygpIC0gdGhpcy5fc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9kZXRhY2hNZWRpYSgpO1xuICAgICAgICB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0LnNlc3Npb25FbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fb25TZXNzaW9uQ29tcGxldGVkKHRoaXMuX3J0Y1Nlc3Npb24pO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiVGFsa2luZ1N0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIENsZWFuVXBTdGF0ZSBleHRlbmRzIFJUQ1Nlc3Npb25TdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc3RvcFNlc3Npb24oKTtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5jbGVhbnVwVGltZU1pbGxpcyA9IERhdGUubm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX29uU2Vzc2lvbkRlc3Ryb3llZCh0aGlzLl9ydGNTZXNzaW9uLCB0aGlzLl9ydGNTZXNzaW9uLl9zZXNzaW9uUmVwb3J0KTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkNsZWFuVXBTdGF0ZVwiO1xuICAgIH1cbiAgICBoYW5ndXAoKSB7XG4gICAgICAgIC8vZG8gbm90aGluZywgYWxyZWFkeSBhdCB0aGUgZW5kIG9mIGxpZmVjeWNsZVxuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBEaXNjb25uZWN0ZWRTdGF0ZSBleHRlbmRzIENsZWFuVXBTdGF0ZSB7XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkRpc2Nvbm5lY3RlZFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWxlZFN0YXRlIGV4dGVuZHMgQ2xlYW5VcFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihydGNTZXNzaW9uLCBmYWlsdXJlUmVhc29uKSB7XG4gICAgICAgIHN1cGVyKHJ0Y1Nlc3Npb24pO1xuICAgICAgICB0aGlzLl9mYWlsdXJlUmVhc29uID0gZmFpbHVyZVJlYXNvbjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdGhpcy5fcnRjU2Vzc2lvbi5fc2Vzc2lvblJlcG9ydC5zZXNzaW9uRW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMuX3J0Y1Nlc3Npb24uX29uU2Vzc2lvbkZhaWxlZCh0aGlzLl9ydGNTZXNzaW9uLCB0aGlzLl9mYWlsdXJlUmVhc29uKTtcbiAgICAgICAgc3VwZXIub25FbnRlcigpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiRmFpbGVkU3RhdGVcIjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ0Y1Nlc3Npb24ge1xuICAgIC8qKlxuICAgICAqIEJ1aWxkIGFuIEFtYXpvbkNvbm5lY3QgUlRDIHNlc3Npb24uXG4gICAgICogQHBhcmFtIHsqfSBzaWduYWxpbmdVcmlcbiAgICAgKiBAcGFyYW0geyp9IGljZVNlcnZlcnMgQXJyYXkgb2YgaWNlIHNlcnZlcnNcbiAgICAgKiBAcGFyYW0geyp9IGNvbnRhY3RUb2tlbiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGNvbnRhY3QgdG9rZW4gKG9wdGlvbmFsKVxuICAgICAqIEBwYXJhbSB7Kn0gbG9nZ2VyIEFuIG9iamVjdCBwcm92aWRlcyBsb2dnaW5nIGZ1bmN0aW9ucywgc3VjaCBhcyBjb25zb2xlXG4gICAgICogQHBhcmFtIHsqfSBjb250YWN0SWQgTXVzdCBiZSBVVUlELCB1bmlxdWVseSBpZGVudGlmaWVzIHRoZSBzZXNzaW9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZ1VyaSwgaWNlU2VydmVycywgY29udGFjdFRva2VuLCBsb2dnZXIsIGNvbnRhY3RJZCkge1xuICAgICAgICBpZiAodHlwZW9mIHNpZ25hbGluZ1VyaSAhPT0gJ3N0cmluZycgfHwgc2lnbmFsaW5nVXJpLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygnc2lnbmFsaW5nVXJpIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpY2VTZXJ2ZXJzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFBhcmFtZXRlcnMoJ2ljZVNlcnZlcnMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxvZ2dlciAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbGxlZ2FsUGFyYW1ldGVycygnbG9nZ2VyIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb250YWN0SWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxJZCA9IHV1aWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbGxJZCA9IGNvbnRhY3RJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nlc3Npb25SZXBvcnQgPSBuZXcgU2Vzc2lvblJlcG9ydCgpO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdVcmkgPSBzaWduYWxpbmdVcmk7XG4gICAgICAgIHRoaXMuX2ljZVNlcnZlcnMgPSBpY2VTZXJ2ZXJzO1xuICAgICAgICB0aGlzLl9jb250YWN0VG9rZW4gPSBjb250YWN0VG9rZW47XG4gICAgICAgIHRoaXMuX29yaWdpbmFsTG9nZ2VyID0gbG9nZ2VyO1xuICAgICAgICB0aGlzLl9sb2dnZXIgPSB3cmFwTG9nZ2VyKHRoaXMuX29yaWdpbmFsTG9nZ2VyLCB0aGlzLl9jYWxsSWQsICdTRVNTSU9OJyk7XG4gICAgICAgIHRoaXMuX2ljZVRpbWVvdXRNaWxsaXMgPSBERUZBVUxUX0lDRV9USU1FT1VUX01TO1xuICAgICAgICB0aGlzLl9ndW1UaW1lb3V0TWlsbGlzID0gREVGQVVMVF9HVU1fVElNRU9VVF9NUztcblxuICAgICAgICB0aGlzLl9lbmFibGVBdWRpbyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2VuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2ZhY2luZ01vZGUgPSAndXNlcic7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHVzZXIgbWF5IHByb3ZpZGUgdGhlIHN0cmVhbSB0byB0aGUgUnRjU2Vzc2lvbiBkaXJlY3RseSB0byBjb25uZWN0IHRvIHRoZSBvdGhlciBlbmQuXG4gICAgICAgICAqIHVzZXIgbWF5IGFsc28gYWNxdWlyZSB0aGUgc3RyZWFtIGZyb20gdGhlIGxvY2FsIGRldmljZS5cbiAgICAgICAgICogVGhpcyBmbGFnIGlzIHVzZWQgdG8gdHJhY2sgd2hlcmUgdGhlIHN0cmVhbSBpcyBhY3F1aXJlZC5cbiAgICAgICAgICogSWYgaXQncyBhY3F1aXJlZCBmcm9tIGxvY2FsIGRldmljZXMsIHRoZW4gd2UgbXVzdCBjbG9zZSB0aGUgc3RyZWFtIHdoZW4gdGhlIHNlc3Npb24gZW5kcy5cbiAgICAgICAgICogSWYgaXQncyBwcm92aWRlZCBieSB1c2VyIChyYXRoZXIgdGhhbiBsb2NhbCBjYW1lcmEvbWljcm9waG9uZSksIHRoZW4gd2Ugc2hvdWxkIGxlYXZlIGl0IG9wZW4gd2hlbiB0aGVcbiAgICAgICAgICogc2Vzc2lvbiBlbmRzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdXNlclByb3ZpZGVkU3RyZWFtID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fb25HdW1FcnJvciA9XG4gICAgICAgICAgICB0aGlzLl9vbkd1bVN1Y2Nlc3MgPVxuICAgICAgICAgICAgdGhpcy5fb25Mb2NhbFN0cmVhbUFkZGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uU2Vzc2lvbkZhaWxlZCA9XG4gICAgICAgICAgICB0aGlzLl9vblNlc3Npb25Jbml0aWFsaXplZCA9XG4gICAgICAgICAgICB0aGlzLl9vblNpZ25hbGluZ0Nvbm5lY3RlZCA9XG4gICAgICAgICAgICB0aGlzLl9vbkljZUNvbGxlY3Rpb25Db21wbGV0ZSA9XG4gICAgICAgICAgICB0aGlzLl9vblNpZ25hbGluZ1N0YXJ0ZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29ubmVjdGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uUmVtb3RlU3RyZWFtQWRkZWQgPVxuICAgICAgICAgICAgdGhpcy5fb25TZXNzaW9uQ29tcGxldGVkID1cbiAgICAgICAgICAgIHRoaXMuX29uU2Vzc2lvbkRlc3Ryb3llZCA9ICgpID0+IHtcbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGdldCBzZXNzaW9uUmVwb3J0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvblJlcG9ydDtcbiAgICB9XG4gICAgZ2V0IGNhbGxJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbGxJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogZ2V0TWVkaWFTdHJlYW0gcmV0dXJucyB0aGUgbG9jYWwgc3RyZWFtLCB3aGljaCBtYXkgYmUgYWNxdWlyZWQgZnJvbSBsb2NhbCBkZXZpY2Ugb3IgZnJvbSB1c2VyIHByb3ZpZGVkIHN0cmVhbS5cbiAgICAgKiBSYXRoZXIgdGhhbiBnZXR0aW5nIGEgc3RyZWFtIGJ5IGNhbGxpbmcgZ2V0VXNlck1lZGlhICh3aGljaCBnZXRzIGEgc3RyZWFtIGZyb20gbG9jYWwgZGV2aWNlIHN1Y2ggYXMgY2FtZXJhKSxcbiAgICAgKiB1c2VyIGNvdWxkIGFsc28gcHJvdmlkZSB0aGUgc3RyZWFtIHRvIHRoZSBSdGNTZXNzaW9uIGRpcmVjdGx5IHRvIGNvbm5lY3QgdG8gdGhlIG90aGVyIGVuZC5cbiAgICAgKi9cbiAgICBnZXQgbWVkaWFTdHJlYW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbFN0cmVhbTtcbiAgICB9XG4gICAgZ2V0IHJlbW90ZVZpZGVvU3RyZWFtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVtb3RlVmlkZW9TdHJlYW07XG4gICAgfVxuICAgIHBhdXNlTG9jYWxWaWRlbygpIHtcbiAgICAgICAgaWYodGhpcy5fbG9jYWxTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciB2aWRlb1RyYWNrID0gdGhpcy5fbG9jYWxTdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXTtcbiAgICAgICAgICAgIGlmKHZpZGVvVHJhY2spIHtcbiAgICAgICAgICAgICAgICB2aWRlb1RyYWNrLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXN1bWVMb2NhbFZpZGVvKCkge1xuICAgICAgICBpZih0aGlzLl9sb2NhbFN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHZpZGVvVHJhY2sgPSB0aGlzLl9sb2NhbFN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdO1xuICAgICAgICAgICAgaWYodmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHZpZGVvVHJhY2suZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGF1c2VSZW1vdGVWaWRlbygpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlbW90ZVZpZGVvU3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgdmlkZW9UcmFjayA9IHRoaXMuX3JlbW90ZVZpZGVvU3RyZWFtLmdldFRyYWNrcygpWzFdO1xuICAgICAgICAgICAgaWYodmlkZW9UcmFjaykge1xuICAgICAgICAgICAgICAgIHZpZGVvVHJhY2suZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlc3VtZVJlbW90ZVZpZGVvKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVtb3RlVmlkZW9TdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciB2aWRlb1RyYWNrID0gdGhpcy5fcmVtb3RlVmlkZW9TdHJlYW0uZ2V0VHJhY2tzKClbMV07XG4gICAgICAgICAgICBpZih2aWRlb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgdmlkZW9UcmFjay5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXVzZUxvY2FsQXVkaW8oKSB7XG4gICAgICAgIGlmICh0aGlzLl9sb2NhbFN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIGF1ZGlvVHJhY2sgPSB0aGlzLl9sb2NhbFN0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdO1xuICAgICAgICAgICAgaWYoYXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2suZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlc3VtZUxvY2FsQXVkaW8oKSB7XG4gICAgICAgIGlmICh0aGlzLl9sb2NhbFN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIGF1ZGlvVHJhY2sgPSB0aGlzLl9sb2NhbFN0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdO1xuICAgICAgICAgICAgaWYoYXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2suZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGF1c2VSZW1vdGVBdWRpbygpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlbW90ZUF1ZGlvU3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgYXVkaW9UcmFjayA9IHRoaXMuX3JlbW90ZUF1ZGlvU3RyZWFtLmdldFRyYWNrcygpWzBdO1xuICAgICAgICAgICAgaWYoYXVkaW9UcmFjaykge1xuICAgICAgICAgICAgICAgIGF1ZGlvVHJhY2suZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlc3VtZVJlbW90ZUF1ZGlvKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBhdWRpb1RyYWNrID0gdGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0uZ2V0VHJhY2tzKClbMF07XG4gICAgICAgICAgICBpZihhdWRpb1RyYWNrKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9UcmFjay5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIGdVTSBzdWNjZWVkcy5cbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25HdW1TdWNjZXNzKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25HdW1TdWNjZXNzID0gaGFuZGxlcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgd2hlbiBnVU0gZmFpbHMuXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICogU2Vjb25kIHBhcmFtIGlzIHRoZSBlcnJvci5cbiAgICAgKi9cbiAgICBzZXQgb25HdW1FcnJvcihoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uR3VtRXJyb3IgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBpZiBmYWlsZWQgaW5pdGlhbGl6aW5nIGxvY2FsIHJlc291cmNlc1xuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvblNlc3Npb25GYWlsZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblNlc3Npb25GYWlsZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBhZnRlciBsb2NhbCB1c2VyIG1lZGlhIHN0cmVhbSBpcyBhZGRlZCB0byB0aGUgc2Vzc2lvbi5cbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKiBTZWNvbmQgcGFyYW0gaXMgbWVkaWEgc3RyZWFtXG4gICAgICovXG4gICAgc2V0IG9uTG9jYWxTdHJlYW1BZGRlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uTG9jYWxTdHJlYW1BZGRlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gYWxsIGxvY2FsIHJlc291cmNlcyBhcmUgcmVhZHkuIEVzdGFibGlzaGluZyBzaWduYWxpbmcgY2hhbmVsIGFuZCBJQ0UgY29sbGVjdGlvbiBoYXBwZW5zIGF0IHRoZSBzYW1lIHRpbWUgYWZ0ZXIgdGhpcy5cbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TZXNzaW9uSW5pdGlhbGl6ZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblNlc3Npb25Jbml0aWFsaXplZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gc2lnbmFsaW5nIGNoYW5uZWwgaXMgZXN0YWJsaXNoZWQuXG4gICAgICogUlRDIHNlc3Npb24gd2lsbCBtb3ZlIGZvcndhcmQgb25seSBpZiBvblNpZ25hbGluZ0Nvbm5lY3RlZCBhbmQgb25JY2VDb2xsZWN0aW9uQ29tcGxldGUgYXJlIGJvdGggY2FsbGVkLlxuICAgICAqXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uU2lnbmFsaW5nQ29ubmVjdGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TaWduYWxpbmdDb25uZWN0ZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIElDRSBjb2xsZWN0aW9uIGNvbXBsZXRlcyBlaXRoZXIgYmVjYXVzZSB0aGVyZSBpcyBubyBtb3JlIGNhbmRpZGF0ZSBvciBjb2xsZWN0aW9uIHRpbWVkIG91dC5cbiAgICAgKiBSVEMgc2Vzc2lvbiB3aWxsIG1vdmUgZm9yd2FyZCBvbmx5IGlmIG9uU2lnbmFsaW5nQ29ubmVjdGVkIGFuZCBvbkljZUNvbGxlY3Rpb25Db21wbGV0ZSBhcmUgYm90aCBjYWxsZWQuXG4gICAgICpcbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKiBTZWNvbmQgcGFyYW0gaXMgYm9vbGVhbiwgVFJVRSAtIElDRSBjb2xsZWN0aW9uIHRpbWVkIG91dC5cbiAgICAgKiBUaGlyZCBwYXJhbSBpcyBudW1iZXIgb2YgY2FuZGlkYXRlcyBjb2xsZWN0ZWQuXG4gICAgICovXG4gICAgc2V0IG9uSWNlQ29sbGVjdGlvbkNvbXBsZXRlKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25JY2VDb2xsZWN0aW9uQ29tcGxldGUgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIHNpZ25hbGluZyBjaGFubmVsIGlzIGVzdGFibGlzaGVkIGFuZCBJQ0UgY29sbGVjdGlvbiBjb21wbGV0ZWQgd2l0aCBhdCBsZWFzdCBvbmUgY2FuZGlkYXRlLlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqL1xuICAgIHNldCBvblNpZ25hbGluZ1N0YXJ0ZWQoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9vblNpZ25hbGluZ1N0YXJ0ZWQgPSBoYW5kbGVyO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayB3aGVuIHRoZSBjYWxsIGlzIGVzdGFibGlzaGVkIChoYW5kc2hha2VkIGFuZCBtZWRpYSBzdHJlYW0gc2hvdWxkIGJlIGZsb3dpbmcpXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uU2Vzc2lvbkNvbm5lY3RlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uU2Vzc2lvbkNvbm5lY3RlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIHJlbW90ZSBtZWRpYSBzdHJlYW0gaXMgYWRkZWQgdG8gdGhlIHNlc3Npb24uXG4gICAgICogVGhpcyBjb3VsZCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgd2l0aCB0aGUgc2FtZSBzdHJlYW0gaWYgbXVsdGlwbGUgdHJhY2tzIGFyZSBpbmNsdWRlZCBpbiB0aGUgc2FtZSBzdHJlYW0uXG4gICAgICpcbiAgICAgKiBGaXJzdCBwYXJhbSBpcyBSdGNTZXNzaW9uIG9iamVjdC5cbiAgICAgKiBTZWNvbmQgcGFyYW0gaXMgbWVkaWEgc3RyZWFtIHRyYWNrLlxuICAgICAqL1xuICAgIHNldCBvblJlbW90ZVN0cmVhbUFkZGVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25SZW1vdGVTdHJlYW1BZGRlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIHdoZW4gdGhlIGhhbmd1cCBpcyBpbml0aWF0ZWQgKGltcGxpZXMgdGhlIGNhbGwgd2FzIHN1Y2Nlc3NmdWxseSBlc3RhYmxpc2hlZCkuXG4gICAgICogRmlyc3QgcGFyYW0gaXMgUnRjU2Vzc2lvbiBvYmplY3QuXG4gICAgICovXG4gICAgc2V0IG9uU2Vzc2lvbkNvbXBsZXRlZChoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX29uU2Vzc2lvbkNvbXBsZXRlZCA9IGhhbmRsZXI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGFmdGVyIHNlc3Npb24gaXMgY2xlYW5lZCB1cCwgbm8gbWF0dGVyIGlmIHRoZSBjYWxsIHdhcyBzdWNjZXNzZnVsbHkgZXN0YWJsaXNoZWQgb3Igbm90LlxuICAgICAqIEZpcnN0IHBhcmFtIGlzIFJ0Y1Nlc3Npb24gb2JqZWN0LlxuICAgICAqIFNlY29uZCBwYXJhbSBpcyBTZXNzaW9uUmVwb3J0IG9iamVjdC5cbiAgICAgKi9cbiAgICBzZXQgb25TZXNzaW9uRGVzdHJveWVkKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fb25TZXNzaW9uRGVzdHJveWVkID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBzZXQgZW5hYmxlQXVkaW8oZmxhZykge1xuICAgICAgICB0aGlzLl9lbmFibGVBdWRpbyA9IGZsYWc7XG4gICAgfVxuICAgIHNldCBlY2hvQ2FuY2VsbGF0aW9uKGZsYWcpIHtcbiAgICAgICAgdGhpcy5fZWNob0NhbmNlbGxhdGlvbiA9IGZsYWc7XG4gICAgfVxuICAgIHNldCBlbmFibGVWaWRlbyhmbGFnKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZVZpZGVvID0gZmxhZztcbiAgICB9XG4gICAgc2V0IG1heFZpZGVvRnJhbWVSYXRlKGZyYW1lUmF0ZSkge1xuICAgICAgICB0aGlzLl9tYXhWaWRlb0ZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcbiAgICB9XG4gICAgc2V0IG1pblZpZGVvRnJhbWVSYXRlKGZyYW1lUmF0ZSkge1xuICAgICAgICB0aGlzLl9taW5WaWRlb0ZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcbiAgICB9XG4gICAgc2V0IHZpZGVvRnJhbWVSYXRlKGZyYW1lUmF0ZSkge1xuICAgICAgICB0aGlzLl92aWRlb0ZyYW1lUmF0ZSA9IGZyYW1lUmF0ZTtcbiAgICB9XG4gICAgc2V0IG1heFZpZGVvV2lkdGgod2lkdGgpIHtcbiAgICAgICAgdGhpcy5fbWF4VmlkZW9XaWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBzZXQgbWluVmlkZW9XaWR0aCh3aWR0aCkge1xuICAgICAgICB0aGlzLl9taW5WaWRlb1dpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIHNldCBpZGVhbFZpZGVvV2lkdGgod2lkdGgpIHtcbiAgICAgICAgdGhpcy5faWRlYWxWaWRlb1dpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIHNldCBtYXhWaWRlb0hlaWdodChoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5fbWF4VmlkZW9IZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIHNldCBtaW5WaWRlb0hlaWdodChoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5fbWluVmlkZW9IZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIHNldCBpZGVhbFZpZGVvSGVpZ2h0KGhlaWdodCkge1xuICAgICAgICB0aGlzLl9pZGVhbFZpZGVvSGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgICBzZXQgZmFjaW5nTW9kZShtb2RlKSB7XG4gICAgICAgIHRoaXMuX2ZhY2luZ01vZGUgPSBtb2RlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbC4gUnRjU2Vzc2lvbiB3aWxsIGdyYWIgaW5wdXQgZGV2aWNlIGlmIHRoaXMgaXMgbm90IHNwZWNpZmllZC5cbiAgICAgKiBQbGVhc2Ugbm90ZTogdGhpcyBSdGNTZXNzaW9uIGNsYXNzIG9ubHkgc3VwcG9ydCBzaW5nbGUgYXVkaW8gdHJhY2sgYW5kL29yIHNpbmdsZSB2aWRlbyB0cmFjay5cbiAgICAgKi9cbiAgICBzZXQgbWVkaWFTdHJlYW0oaW5wdXQpIHtcbiAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW0gPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fdXNlclByb3ZpZGVkU3RyZWFtID0gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTmVlZGVkLCBleHBlY3QgYW4gYXVkaW8gZWxlbWVudCB0aGF0IGNhbiBiZSB1c2VkIHRvIHBsYXkgcmVtb3RlIGF1ZGlvIHN0cmVhbS5cbiAgICAgKi9cbiAgICBzZXQgcmVtb3RlQXVkaW9FbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3RlQXVkaW9FbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgc2V0IHJlbW90ZVZpZGVvRWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3JlbW90ZVZpZGVvRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHNpZ25hbGluZyBjb25uZWN0IHRpbWUgb3V0LlxuICAgICAqL1xuICAgIHNldCBzaWduYWxpbmdDb25uZWN0VGltZW91dChtcykge1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdDb25uZWN0VGltZW91dCA9IG1zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGUgZGVmYXVsdCBJQ0UgY29sbGVjdGlvbiB0aW1lIGxpbWl0LlxuICAgICAqL1xuICAgIHNldCBpY2VUaW1lb3V0TWlsbGlzKHRpbWVvdXRNaWxsaXMpIHtcbiAgICAgICAgdGhpcy5faWNlVGltZW91dE1pbGxpcyA9IHRpbWVvdXRNaWxsaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgR1VNIHRpbWVvdXQgdGltZSBsaW1pdC5cbiAgICAgKi9cbiAgICBzZXQgZ3VtVGltZW91dE1pbGxpcyh0aW1lb3V0TWlsbGlzKSB7XG4gICAgICAgIHRoaXMuX2d1bVRpbWVvdXRNaWxsaXMgPSB0aW1lb3V0TWlsbGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNvbm5lY3QtcnRjLWpzIGluaXRpYXRlIHRoZSBoYW5kc2hha2luZyB3aXRoIGFsbCBicm93c2VyIHN1cHBvcnRlZCBjb2RlYyBieSBkZWZhdWx0LCBBbWF6b24gQ29ubmVjdCBzZXJ2aWNlIHdpbGwgY2hvb3NlIHRoZSBjb2RlYyBhY2NvcmRpbmcgdG8gaXRzIHByZWZlcmVuY2Ugc2V0dGluZy5cbiAgICAgKiBTZXR0aW5nIHRoaXMgYXR0cmlidXRlIHdpbGwgZm9yY2UgY29ubmVjdC1ydGMtanMgdG8gb25seSB1c2Ugc3BlY2lmaWVkIGNvZGVjLlxuICAgICAqIFdBUk5JTkc6IFNldHRpbmcgdGhpcyB0byB1bnN1cHBvcnRlZCBjb2RlYyB3aWxsIGNhdXNlIHRoZSBmYWlsdXJlIG9mIGhhbmRzaGFraW5nLlxuICAgICAqIFN1cHBvcnRlZCBhdWRpbyBjb2RlY3M6IG9wdXMuXG4gICAgICovXG4gICAgc2V0IGZvcmNlQXVkaW9Db2RlYyhhdWRpb0NvZGVjKSB7XG4gICAgICAgIHRoaXMuX2ZvcmNlQXVkaW9Db2RlYyA9IGF1ZGlvQ29kZWM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29ubmVjdC1ydGMtanMgaW5pdGlhdGUgdGhlIGhhbmRzaGFraW5nIHdpdGggYWxsIGJyb3dzZXIgc3VwcG9ydGVkIGNvZGVjIGJ5IGRlZmF1bHQsIEFtYXpvbiBDb25uZWN0IHNlcnZpY2Ugd2lsbCBjaG9vc2UgdGhlIGNvZGVjIGFjY29yZGluZyB0byBpdHMgcHJlZmVyZW5jZSBzZXR0aW5nLlxuICAgICAqIFNldHRpbmcgdGhpcyBhdHRyaWJ1dGUgd2lsbCBmb3JjZSBjb25uZWN0LXJ0Yy1qcyB0byBvbmx5IHVzZSBzcGVjaWZpZWQgY29kZWMuXG4gICAgICogV0FSTklORzogU2V0dGluZyB0aGlzIHRvIHVuc3VwcG9ydGVkIGNvZGVjIHdpbGwgY2F1c2UgdGhlIGZhaWx1cmUgb2YgaGFuZHNoYWtpbmcuXG4gICAgICogU3VwcG9ydGVkIHZpZGVvIGNvZGVjczogVlA4LCBWUDksIEgyNjQuXG4gICAgICovXG4gICAgc2V0IGZvcmNlVmlkZW9Db2RlYyh2aWRlb0NvZGVjKSB7XG4gICAgICAgIHRoaXMuX2ZvcmNlVmlkZW9Db2RlYyA9IHZpZGVvQ29kZWM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29ubmVjdC1ydGMtanMgZGlzYWJsZXMgT1BVUyBEVFggYnkgZGVmYXVsdCBiZWNhdXNlIGl0IGhhcm1zIGF1ZGlvIHF1YWxpdHkuXG4gICAgICogQHBhcmFtIGZsYWcgYm9vbGVhblxuICAgICAqL1xuICAgIHNldCBlbmFibGVPcHVzRHR4KGZsYWcpIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlT3B1c0R0eCA9IGZsYWc7XG4gICAgfVxuXG4gICAgdHJhbnNpdChuZXh0U3RhdGUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlci5pbmZvKCh0aGlzLl9zdGF0ZSA/IHRoaXMuX3N0YXRlLm5hbWUgOiAnbnVsbCcpICsgJyA9PiAnICsgbmV4dFN0YXRlLm5hbWUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0YXRlICYmIHRoaXMuX3N0YXRlLm9uRXhpdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0YXRlLm9uRXhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBuZXh0U3RhdGU7XG4gICAgICAgICAgICBpZiAobmV4dFN0YXRlLm9uRW50ZXIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0U3RhdGUub25FbnRlcigpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLndhcm4obmV4dFN0YXRlLm5hbWUgKyAnI29uRW50ZXIgZmFpbGVkJywgZSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5zYWZlLWZpbmFsbHlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlU2lnbmFsaW5nQ2hhbm5lbCgpIHtcbiAgICAgICAgdmFyIHNpZ25hbGluZ0NoYW5uZWwgPSBuZXcgUnRjU2lnbmFsaW5nKHRoaXMuX2NhbGxJZCwgdGhpcy5fc2lnbmFsaW5nVXJpLCB0aGlzLl9jb250YWN0VG9rZW4sIHRoaXMuX29yaWdpbmFsTG9nZ2VyLCB0aGlzLl9zaWduYWxpbmdDb25uZWN0VGltZW91dCk7XG4gICAgICAgIHNpZ25hbGluZ0NoYW5uZWwub25Db25uZWN0ZWQgPSBoaXRjaCh0aGlzLCB0aGlzLl9zaWduYWxpbmdDb25uZWN0ZWQpO1xuICAgICAgICBzaWduYWxpbmdDaGFubmVsLm9uQW5zd2VyZWQgPSBoaXRjaCh0aGlzLCB0aGlzLl9zaWduYWxpbmdBbnN3ZXJlZCk7XG4gICAgICAgIHNpZ25hbGluZ0NoYW5uZWwub25IYW5kc2hha2VkID0gaGl0Y2godGhpcywgdGhpcy5fc2lnbmFsaW5nSGFuZHNoYWtlZCk7XG4gICAgICAgIHNpZ25hbGluZ0NoYW5uZWwub25SZW1vdGVIdW5ndXAgPSBoaXRjaCh0aGlzLCB0aGlzLl9zaWduYWxpbmdSZW1vdGVIdW5ndXApO1xuICAgICAgICBzaWduYWxpbmdDaGFubmVsLm9uRmFpbGVkID0gaGl0Y2godGhpcywgdGhpcy5fc2lnbmFsaW5nRmFpbGVkKTtcbiAgICAgICAgc2lnbmFsaW5nQ2hhbm5lbC5vbkRpc2Nvbm5lY3RlZCA9IGhpdGNoKHRoaXMsIHRoaXMuX3NpZ25hbGluZ0Rpc2Nvbm5lY3RlZCk7XG5cbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nQ2hhbm5lbCA9IHNpZ25hbGluZ0NoYW5uZWw7XG5cbiAgICAgICAgcmV0dXJuIHNpZ25hbGluZ0NoYW5uZWw7XG4gICAgfVxuXG4gICAgX3NpZ25hbGluZ0Nvbm5lY3RlZCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25TaWduYWxpbmdDb25uZWN0ZWQoKTtcbiAgICB9XG4gICAgX3NpZ25hbGluZ0Fuc3dlcmVkKHNkcCwgY2FuZGlkYXRlcykge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vblNpZ25hbGluZ0Fuc3dlcmVkKHNkcCwgY2FuZGlkYXRlcyk7XG4gICAgfVxuICAgIF9zaWduYWxpbmdIYW5kc2hha2VkKCkge1xuICAgICAgICB0aGlzLl9zdGF0ZS5vblNpZ25hbGluZ0hhbmRzaGFrZWQoKTtcbiAgICB9XG4gICAgX3NpZ25hbGluZ1JlbW90ZUh1bmd1cCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25SZW1vdGVIdW5ndXAoKTtcbiAgICB9XG4gICAgX3NpZ25hbGluZ0ZhaWxlZChlKSB7XG4gICAgICAgIHRoaXMuX3N0YXRlLm9uU2lnbmFsaW5nRmFpbGVkKGUpO1xuICAgIH1cbiAgICBfc2lnbmFsaW5nRGlzY29ubmVjdGVkKCkge1xuICAgIH1cbiAgICBfY3JlYXRlUGVlckNvbm5lY3Rpb24oY29uZmlndXJhdGlvbikge1xuICAgICAgICByZXR1cm4gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGNvbmZpZ3VyYXRpb24pO1xuICAgIH1cbiAgICBjb25uZWN0KCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBzZWxmLl9zZXNzaW9uUmVwb3J0LnNlc3Npb25TdGFydFRpbWUgPSBub3c7XG4gICAgICAgIHNlbGYuX2Nvbm5lY3RUaW1lU3RhbXAgPSBub3cuZ2V0VGltZSgpO1xuXG4gICAgICAgIHNlbGYuX3BjID0gc2VsZi5fY3JlYXRlUGVlckNvbm5lY3Rpb24oe1xuICAgICAgICAgICAgaWNlU2VydmVyczogc2VsZi5faWNlU2VydmVycyxcbiAgICAgICAgICAgIGljZVRyYW5zcG9ydFBvbGljeTogJ3JlbGF5JyxcbiAgICAgICAgICAgIHJ0Y3BNdXhQb2xpY3k6ICdyZXF1aXJlJyxcbiAgICAgICAgICAgIGJ1bmRsZVBvbGljeTogJ2JhbGFuY2VkJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICBvcHRpb25hbDogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ0RzY3A6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuX3BjLm9udHJhY2sgPSBoaXRjaChzZWxmLCBzZWxmLl9vbnRyYWNrKTtcbiAgICAgICAgc2VsZi5fcGMub25pY2VjYW5kaWRhdGUgPSBoaXRjaChzZWxmLCBzZWxmLl9vbkljZUNhbmRpZGF0ZSk7XG4gICAgICAgIHNlbGYuX3BjLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gaGl0Y2goc2VsZiwgc2VsZi5fb25JY2VTdGF0ZUNoYW5nZSk7XG5cbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBHcmFiTG9jYWxNZWRpYVN0YXRlKHNlbGYpKTtcbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ2FjY2VwdCBkb2VzIG5vdCBnbyB0aHJvdWdoIHNpZ25hbGluZyBjaGFubmVsIGF0IHRoaXMgbW9tZW50Jyk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUuaGFuZ3VwKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhIHByb21pc2Ugb2YgTWVkaWFSdHBTdGF0cyBvYmplY3QgZm9yIHJlbW90ZSBhdWRpbyAoZnJvbSBBbWF6b24gQ29ubmVjdCB0byBjbGllbnQpLlxuICAgICAqIEByZXR1cm4gUmVqZWN0ZWQgcHJvbWlzZSBpZiBmYWlsZWQgdG8gZ2V0IE1lZGlhUnRwU3RhdHMuIFRoZSBwcm9taXNlIGlzIG5ldmVyIHJlc29sdmVkIHdpdGggbnVsbCB2YWx1ZS5cbiAgICAgKi9cbiAgICBnZXRSZW1vdGVBdWRpb1N0YXRzKCkge1xuICAgICAgICB2YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgICAgICAgaWYgKHRoaXMuX3BjICYmIHRoaXMuX3BjLnNpZ25hbGluZ1N0YXRlID09PSAnc3RhYmxlJyAmJiB0aGlzLl9yZW1vdGVBdWRpb1N0cmVhbSkge1xuICAgICAgICAgICAgdmFyIGF1ZGlvVHJhY2tzID0gdGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYy5nZXRTdGF0cyhhdWRpb1RyYWNrc1swXSkudGhlbihmdW5jdGlvbihzdGF0cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnRjSnNTdGF0cyA9IGV4dHJhY3RNZWRpYVN0YXRzRnJvbVN0YXRzKHRpbWVzdGFtcCwgc3RhdHMsICdhdWRpb19vdXRwdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcnRjSnNTdGF0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGV4dHJhY3QgTWVkaWFSdHBTdGF0cyBmcm9tIFJUQ1N0YXRzUmVwb3J0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnRjSnNTdGF0cztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IElsbGVnYWxTdGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBwcm9taXNlIG9mIE1lZGlhUnRwU3RhdHMgb2JqZWN0IGZvciB1c2VyIGF1ZGlvIChmcm9tIGNsaWVudCB0byBBbWF6b24gQ29ubmVjdCkuXG4gICAgICogQHJldHVybiBSZWplY3RlZCBwcm9taXNlIGlmIGZhaWxlZCB0byBnZXQgTWVkaWFSdHBTdGF0cy4gVGhlIHByb21pc2UgaXMgbmV2ZXIgcmVzb2x2ZWQgd2l0aCBudWxsIHZhbHVlLlxuICAgICAqL1xuICAgIGdldFVzZXJBdWRpb1N0YXRzKCkge1xuICAgICAgICB2YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgICAgICAgaWYgKHRoaXMuX3BjICYmIHRoaXMuX3BjLnNpZ25hbGluZ1N0YXRlID09PSAnc3RhYmxlJyAmJiB0aGlzLl9sb2NhbFN0cmVhbSkge1xuICAgICAgICAgICAgdmFyIGF1ZGlvVHJhY2tzID0gdGhpcy5fbG9jYWxTdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYy5nZXRTdGF0cyhhdWRpb1RyYWNrc1swXSkudGhlbihmdW5jdGlvbihzdGF0cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnRjSnNTdGF0cyA9IGV4dHJhY3RNZWRpYVN0YXRzRnJvbVN0YXRzKHRpbWVzdGFtcCwgc3RhdHMsICdhdWRpb19pbnB1dCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFydGNKc1N0YXRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZXh0cmFjdCBNZWRpYVJ0cFN0YXRzIGZyb20gUlRDU3RhdHNSZXBvcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBydGNKc1N0YXRzO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgSWxsZWdhbFN0YXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgcHJvbWlzZSBvZiBNZWRpYVJ0cFN0YXRzIG9iamVjdCBmb3IgdXNlciB2aWRlbyAoZnJvbSBjbGllbnQgdG8gQW1hem9uIENvbm5lY3QpLlxuICAgICAqIEByZXR1cm4gUmVqZWN0ZWQgcHJvbWlzZSBpZiBmYWlsZWQgdG8gZ2V0IE1lZGlhUnRwU3RhdHMuIFRoZSBwcm9taXNlIGlzIG5ldmVyIHJlc29sdmVkIHdpdGggbnVsbCB2YWx1ZS5cbiAgICAgKi9cbiAgICBnZXRSZW1vdGVWaWRlb1N0YXRzKCkge1xuICAgICAgICB2YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgICAgICAgaWYgKHRoaXMuX3BjICYmIHRoaXMuX3BjLnNpZ25hbGluZ1N0YXRlID09PSAnc3RhYmxlJyAmJiB0aGlzLl9yZW1vdGVWaWRlb1N0cmVhbSkge1xuICAgICAgICAgICAgdmFyIHZpZGVvVHJhY2tzID0gdGhpcy5fcmVtb3RlVmlkZW9TdHJlYW0uZ2V0VmlkZW9UcmFja3MoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYy5nZXRTdGF0cyh2aWRlb1RyYWNrc1swXSkudGhlbihmdW5jdGlvbihzdGF0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ0Y0pzU3RhdHMgPSBleHRyYWN0TWVkaWFTdGF0c0Zyb21TdGF0cyh0aW1lc3RhbXAsIHN0YXRzLCAndmlkZW9fb3V0cHV0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJ0Y0pzU3RhdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBleHRyYWN0IE1lZGlhUnRwU3RhdHMgZnJvbSBSVENTdGF0c1JlcG9ydCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ0Y0pzU3RhdHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgSWxsZWdhbFN0YXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgcHJvbWlzZSBvZiBNZWRpYVJ0cFN0YXRzIG9iamVjdCBmb3IgdXNlciB2aWRlbyAoZnJvbSBjbGllbnQgdG8gQW1hem9uIENvbm5lY3QpLlxuICAgICAqIEByZXR1cm4gUmVqZWN0ZWQgcHJvbWlzZSBpZiBmYWlsZWQgdG8gZ2V0IE1lZGlhUnRwU3RhdHMuIFRoZSBwcm9taXNlIGlzIG5ldmVyIHJlc29sdmVkIHdpdGggbnVsbCB2YWx1ZS5cbiAgICAgKi9cbiAgICBnZXRVc2VyVmlkZW9TdGF0cygpIHtcbiAgICAgICAgdmFyIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGlmICh0aGlzLl9wYyAmJiB0aGlzLl9wYy5zaWduYWxpbmdTdGF0ZSA9PT0gJ3N0YWJsZScgJiYgdGhpcy5fbG9jYWxTdHJlYW0pIHtcbiAgICAgICAgICAgIHZhciBhdWRpb1RyYWNrcyA9IHRoaXMuX2xvY2FsU3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGMuZ2V0U3RhdHMoYXVkaW9UcmFja3NbMF0pLnRoZW4oZnVuY3Rpb24oc3RhdHMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ0Y0pzU3RhdHMgPSBleHRyYWN0TWVkaWFTdGF0c0Zyb21TdGF0cyh0aW1lc3RhbXAsIHN0YXRzLCAndmlkZW9faW5wdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcnRjSnNTdGF0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGV4dHJhY3QgTWVkaWFSdHBTdGF0cyBmcm9tIFJUQ1N0YXRzUmVwb3J0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnRjSnNTdGF0cztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IElsbGVnYWxTdGF0ZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbkljZUNhbmRpZGF0ZShldnQpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25JY2VDYW5kaWRhdGUoZXZ0KTtcbiAgICB9XG5cbiAgICBfb25JY2VTdGF0ZUNoYW5nZShldnQpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUub25JY2VTdGF0ZUNoYW5nZShldnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCByZW1vdGUgbWVkaWEgc3RyZWFtIHRvIHdlYiBlbGVtZW50LlxuICAgICAqL1xuICAgIF9vbnRyYWNrKGV2dCkge1xuICAgICAgICBpZiAoZXZ0LnN0cmVhbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLndhcm4oJ0ZvdW5kIG1vcmUgdGhhbiAxIHN0cmVhbXMgZm9yICcgKyBldnQudHJhY2sua2luZCArICcgdHJhY2sgJyArIGV2dC50cmFjay5pZCArICcgOiAnICtcbiAgICAgICAgICAgICAgICBldnQuc3RyZWFtcy5tYXAoc3RyZWFtID0+IHN0cmVhbS5pZCkuam9pbignLCcpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZ0LnRyYWNrLmtpbmQgPT09ICd2aWRlbycgJiYgdGhpcy5fcmVtb3RlVmlkZW9FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVWaWRlb0VsZW1lbnQuc3JjT2JqZWN0ID0gZXZ0LnN0cmVhbXNbMF07XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVWaWRlb1N0cmVhbSA9IGV2dC5zdHJlYW1zWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKGV2dC50cmFjay5raW5kID09PSAnYXVkaW8nICYmIHRoaXMuX3JlbW90ZUF1ZGlvRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3RlQXVkaW9FbGVtZW50LnNyY09iamVjdCA9IGV2dC5zdHJlYW1zWzBdO1xuICAgICAgICAgICAgdGhpcy5fcmVtb3RlQXVkaW9TdHJlYW0gPSBldnQuc3RyZWFtc1swXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vblJlbW90ZVN0cmVhbUFkZGVkKHRoaXMsIGV2dC5zdHJlYW1zWzBdKTtcbiAgICB9XG4gICAgX2RldGFjaE1lZGlhKCkge1xuICAgICAgICBpZiAodGhpcy5fcmVtb3RlVmlkZW9FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVWaWRlb0VsZW1lbnQuc3JjT2JqZWN0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcmVtb3RlQXVkaW9FbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdGVBdWRpb0VsZW1lbnQuc3JjT2JqZWN0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUF1ZGlvU3RyZWFtID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfc3RvcFNlc3Npb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbG9jYWxTdHJlYW0gJiYgIXRoaXMuX3VzZXJQcm92aWRlZFN0cmVhbSkge1xuICAgICAgICAgICAgICAgIGNsb3NlU3RyZWFtKHRoaXMuX2xvY2FsU3RyZWFtKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2NhbFN0cmVhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXNlclByb3ZpZGVkU3RyZWFtID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wYykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBlYXQgZXhjZXB0aW9uXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3BjID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9idWlsZE1lZGlhQ29uc3RyYWludHMoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG1lZGlhQ29uc3RyYWludHMgPSB7fTtcblxuICAgICAgICBpZiAoc2VsZi5fZW5hYmxlQXVkaW8pIHtcbiAgICAgICAgICAgIHZhciBhdWRpb0NvbnN0cmFpbnRzID0ge307XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX2VjaG9DYW5jZWxsYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9Db25zdHJhaW50cy5lY2hvQ2FuY2VsbGF0aW9uID0gISFzZWxmLl9lY2hvQ2FuY2VsbGF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGF1ZGlvQ29uc3RyYWludHMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUNvbnN0cmFpbnRzLmF1ZGlvID0gYXVkaW9Db25zdHJhaW50cztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVkaWFDb25zdHJhaW50cy5hdWRpbyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZWRpYUNvbnN0cmFpbnRzLmF1ZGlvID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5fZW5hYmxlVmlkZW8pIHtcbiAgICAgICAgICAgIHZhciB2aWRlb0NvbnN0cmFpbnRzID0ge307XG4gICAgICAgICAgICB2YXIgd2lkdGhDb25zdHJhaW50cyA9IHt9O1xuICAgICAgICAgICAgdmFyIGhlaWdodENvbnN0cmFpbnRzID0ge307XG4gICAgICAgICAgICB2YXIgZnJhbWVSYXRlQ29uc3RyYWludHMgPSB7fTtcblxuICAgICAgICAgICAgLy9idWlsZCB2aWRlbyB3aWR0aCBjb25zdHJhaW50c1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9pZGVhbFZpZGVvV2lkdGggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgd2lkdGhDb25zdHJhaW50cy5pZGVhbCA9IHNlbGYuX2lkZWFsVmlkZW9XaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWF4VmlkZW9XaWR0aCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB3aWR0aENvbnN0cmFpbnRzLm1heCA9IHNlbGYuX21heFZpZGVvV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX21pblZpZGVvV2lkdGggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgd2lkdGhDb25zdHJhaW50cy5taW4gPSBzZWxmLl9taW5WaWRlb1dpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYnVpbGQgdmlkZW8gaGVpZ2h0IGNvbnN0cmFpbnRzXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX2lkZWFsVmlkZW9IZWlnaHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0Q29uc3RyYWludHMuaWRlYWwgPSBzZWxmLl9pZGVhbFZpZGVvSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLl9tYXhWaWRlb0hlaWdodCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRDb25zdHJhaW50cy5tYXggPSBzZWxmLl9tYXhWaWRlb0hlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWluVmlkZW9IZWlnaHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0Q29uc3RyYWludHMubWluID0gc2VsZi5fbWluVmlkZW9IZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihPYmplY3Qua2V5cyh3aWR0aENvbnN0cmFpbnRzKS5sZW5ndGggPiAwICYmIE9iamVjdC5rZXlzKGhlaWdodENvbnN0cmFpbnRzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmlkZW9Db25zdHJhaW50cy53aWR0aCA9IHdpZHRoQ29uc3RyYWludHM7XG4gICAgICAgICAgICAgICAgdmlkZW9Db25zdHJhaW50cy5oZWlnaHQgPSBoZWlnaHRDb25zdHJhaW50cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJ1aWxkIGZyYW1lIHJhdGUgY29uc3RyYWludHNcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fdmlkZW9GcmFtZVJhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZnJhbWVSYXRlQ29uc3RyYWludHMuaWRlYWwgPSBzZWxmLl92aWRlb0ZyYW1lUmF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5fbWluVmlkZW9GcmFtZVJhdGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZnJhbWVSYXRlQ29uc3RyYWludHMubWluID0gc2VsZi5fbWluVmlkZW9GcmFtZVJhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuX21heFZpZGVvRnJhbWVSYXRlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGZyYW1lUmF0ZUNvbnN0cmFpbnRzLm1heCA9IHNlbGYuX21heFZpZGVvRnJhbWVSYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMoZnJhbWVSYXRlQ29uc3RyYWludHMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2aWRlb0NvbnN0cmFpbnRzLmZyYW1lUmF0ZSA9IGZyYW1lUmF0ZUNvbnN0cmFpbnRzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBidWlsZCBmYWNpbmcgbW9kZSBjb25zdHJhaW50c1xuICAgICAgICAgICAgaWYoc2VsZi5fZmFjaW5nTW9kZSAhPT0gJ3VzZXInICYmIHNlbGYuX2ZhY2luZ01vZGUgIT09IFwiZW52aXJvbm1lbnRcIikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2ZhY2luZ01vZGUgPSAndXNlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2aWRlb0NvbnN0cmFpbnRzLmZhY2luZ01vZGUgPSBzZWxmLl9mYWNpbmdNb2RlO1xuXG4gICAgICAgICAgICAvLyBzZXQgdmlkZW8gY29uc3RyYWludHNcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh2aWRlb0NvbnN0cmFpbnRzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbWVkaWFDb25zdHJhaW50cy52aWRlbyA9IHZpZGVvQ29uc3RyYWludHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lZGlhQ29uc3RyYWludHMudmlkZW8gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1lZGlhQ29uc3RyYWludHM7XG4gICAgfVxufVxuIiwiLyoqXG4qIEV4dHJhY3QgcnRwIHN0YXRzIG9mIHNwZWNpZmllZCBzdHJlYW0gZnJvbSBSVENTdGF0c1JlcG9ydFxuKiBDaHJvbWUgcmVwb3J0cyBhbGwgc3RyZWFtIHN0YXRzIGluIHN0YXRzUmVwb3J0cyB3aGVyZWFzIGZpcmVmb3ggcmVwb3J0cyBvbmx5IHNpbmdsZSBzdHJlYW0gc3RhdHMgaW4gcmVwb3J0XG4qIFN0cmVhbVR5cGUgaXMgcGFzc2VkIG9ubHkgdG8gcHVsbCByaWdodCBzdHJlYW0gc3RhdHMgYXVkaW9faW5wdXQgb3IgYXVkaW9fb3V0cHV0LlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0TWVkaWFTdGF0c0Zyb21TdGF0cyh0aW1lc3RhbXAsIHN0YXRzLCBzdHJlYW1UeXBlKSB7XG4gICAgdmFyIGNhbGxTdGF0cyA9IG51bGw7XG4gICAgaWYgKCFzdGF0cykge1xuICAgICAgICByZXR1cm4gY2FsbFN0YXRzO1xuICAgIH1cbiAgICB2YXIgc3RhdHNSZXBvcnRzID0gT2JqZWN0LmtleXMoc3RhdHMpO1xuICAgIGlmIChzdGF0c1JlcG9ydHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0c1JlcG9ydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzdGF0c1JlcG9ydCA9IHN0YXRzW3N0YXRzUmVwb3J0c1tpXV07XG4gICAgICAgICAgICBpZiAoc3RhdHNSZXBvcnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFja2V0c0xvc3QgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBhdWRpb0xldmVsID0gbnVsbDtcbiAgICAgICAgICAgICAgICB2YXIgcnR0TXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHZhciBqYk1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHNSZXBvcnQudHlwZSA9PT0gJ3NzcmMnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY2hyb21lLCBvcGVyYSBjYXNlLiBjaHJvbWUgcmVwb3J0cyBzdGF0cyBmb3IgYWxsIHN0cmVhbXMsIG5vdCBqdXN0IHRoZSBzdHJlYW0gcGFzc2VkIGluLlxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0LnBhY2tldHNTZW50ICE9PSAndW5kZWZpbmVkJyAmJiBzdGF0c1JlcG9ydC5tZWRpYVR5cGUgPT0gJ2F1ZGlvJyAmJiBzdHJlYW1UeXBlID09PSAnYXVkaW9faW5wdXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0LmF1ZGlvSW5wdXRMZXZlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpb0xldmVsID0gc3RhdHNSZXBvcnQuYXVkaW9JbnB1dExldmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCAhPT0gJ3VuZGVmaW5lZCcgJiYgc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIHJlcG9ydHMgLTEgd2hlbiB0aGVyZSBpcyBubyBwYWNrZXQgbG9zc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2tldHNMb3N0ID0gc3RhdHNSZXBvcnQucGFja2V0c0xvc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0Lmdvb2dSdHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnR0TXMgPSBzdGF0c1JlcG9ydC5nb29nUnR0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFN0YXRzID0gbmV3IE1lZGlhUnRwU3RhdHModGltZXN0YW1wLCBwYWNrZXRzTG9zdCwgc3RhdHNSZXBvcnQucGFja2V0c1NlbnQsIGF1ZGlvTGV2ZWwsIHJ0dE1zLCBudWxsLCBzdGF0c1JlcG9ydC5ieXRlc1NlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN0YXRzUmVwb3J0LnBhY2tldHNSZWNlaXZlZCAhPT0gJ3VuZGVmaW5lZCcgJiYgc3RhdHNSZXBvcnQubWVkaWFUeXBlID09ICdhdWRpbycgJiYgc3RyZWFtVHlwZSA9PT0gJ2F1ZGlvX291dHB1dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQuYXVkaW9PdXRwdXRMZXZlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdWRpb0xldmVsID0gc3RhdHNSZXBvcnQuYXVkaW9PdXRwdXRMZXZlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgIT09ICd1bmRlZmluZWQnICYmIHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSByZXBvcnRzIC0xIHdoZW4gdGhlcmUgaXMgbm8gcGFja2V0IGxvc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzTG9zdCA9IHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5nb29nSml0dGVyQnVmZmVyTXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamJNcyA9IHN0YXRzUmVwb3J0Lmdvb2dKaXR0ZXJCdWZmZXJNcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxTdGF0cyA9IG5ldyBNZWRpYVJ0cFN0YXRzKHRpbWVzdGFtcCwgcGFja2V0c0xvc3QsIHN0YXRzUmVwb3J0LnBhY2tldHNSZWNlaXZlZCwgYXVkaW9MZXZlbCwgbnVsbCwgamJNcywgbnVsbCwgc3RhdHNSZXBvcnQuYnl0ZXNSZWNlaXZlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c1NlbnQgIT09ICd1bmRlZmluZWQnICYmIHN0YXRzUmVwb3J0Lm1lZGlhVHlwZSA9PSAndmlkZW8nICYmIHN0cmVhbVR5cGUgPT09ICd2aWRlb19pbnB1dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgIT09ICd1bmRlZmluZWQnICYmIHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSByZXBvcnRzIC0xIHdoZW4gdGhlcmUgaXMgbm8gcGFja2V0IGxvc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzTG9zdCA9IHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5nb29nUnR0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ0dE1zID0gc3RhdHNSZXBvcnQuZ29vZ1J0dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcmFtZVJhdGVTZW5kID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQuZ29vZ0ZyYW1lUmF0ZVNlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVSYXRlU2VuZCA9IHN0YXRzUmVwb3J0Lmdvb2dGcmFtZVJhdGVTZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdHMgPSBuZXcgTWVkaWFSdHBTdGF0cyh0aW1lc3RhbXAsIHBhY2tldHNMb3N0LCBzdGF0c1JlcG9ydC5wYWNrZXRzU2VudCwgbnVsbCwgcnR0TXMsIG51bGwsIHN0YXRzUmVwb3J0LmJ5dGVzU2VudCwgbnVsbCwgc3RhdHNSZXBvcnQuZnJhbWVzRW5jb2RlZCwgbnVsbCwgZnJhbWVSYXRlU2VuZCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQucGFja2V0c1JlY2VpdmVkICE9PSAndW5kZWZpbmVkJyAmJiBzdGF0c1JlcG9ydC5tZWRpYVR5cGUgPT0gJ3ZpZGVvJyAmJiBzdHJlYW1UeXBlID09PSAndmlkZW9fb3V0cHV0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCAhPT0gJ3VuZGVmaW5lZCcgJiYgc3RhdHNSZXBvcnQucGFja2V0c0xvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIHJlcG9ydHMgLTEgd2hlbiB0aGVyZSBpcyBubyBwYWNrZXQgbG9zc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2tldHNMb3N0ID0gc3RhdHNSZXBvcnQucGFja2V0c0xvc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRzUmVwb3J0Lmdvb2dKaXR0ZXJCdWZmZXJNcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqYk1zID0gc3RhdHNSZXBvcnQuZ29vZ0ppdHRlckJ1ZmZlck1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZyYW1lUmF0ZVJlY2VpdmVkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdHNSZXBvcnQuZ29vZ0ZyYW1lUmF0ZVJlY2VpdmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lUmF0ZVJlY2VpdmVkID0gc3RhdHNSZXBvcnQuZ29vZ0ZyYW1lUmF0ZVJlY2VpdmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsU3RhdHMgPSBuZXcgTWVkaWFSdHBTdGF0cyh0aW1lc3RhbXAsIHBhY2tldHNMb3N0LCBzdGF0c1JlcG9ydC5wYWNrZXRzUmVjZWl2ZWQsIG51bGwsIG51bGwsIGpiTXMsIG51bGwsIHN0YXRzUmVwb3J0LmJ5dGVzUmVjZWl2ZWQsIG51bGwsIHN0YXRzUmVwb3J0LmZyYW1lc0RlY29kZWQsIG51bGwsIGZyYW1lUmF0ZVJlY2VpdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdGF0c1JlcG9ydC50eXBlID09PSAnaW5ib3VuZHJ0cCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9GaXJlZm94IGNhc2UuIEZpcmVmb3ggcmVwb3J0cyBwYWNrZXRzTG9zdCBwYXJhbWV0ZXIgb25seSBpbiBpbmJvdW5kcnRwIHR5cGUsIGFuZCBkb2Vzbid0IHJlcG9ydCBpbiBvdXRib3VuZHJ0cCB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAvL1NvIHdlIG9ubHkgcHVsbCBmcm9tIGluYm91bmRydHAuIEZpcmVmb3ggcmVwb3J0cyBvbmx5IHN0YXRzIGZvciB0aGUgc3RyZWFtIHBhc3NlZCBpbi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHN0YXRzUmVwb3J0LnBhY2tldHNSZWNlaXZlZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gYXVkaW8gbGV2ZWwgaW4gZmlyZWZveFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0c1JlcG9ydC5hdWRpb0lucHV0TGV2ZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXVkaW9MZXZlbCA9IHN0YXRzUmVwb3J0LmF1ZGlvSW5wdXRMZXZlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0c1JlcG9ydC5wYWNrZXRzTG9zdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrZXRzTG9zdCA9IHN0YXRzUmVwb3J0LnBhY2tldHNMb3N0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm8gamIgc2l6ZSBpbiBmaXJlZm94XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBydHQgaXMgYnJva2VuIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTEyNDEwNjZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxTdGF0cyA9IG5ldyBNZWRpYVJ0cFN0YXRzKHRpbWVzdGFtcCwgcGFja2V0c0xvc3QsIHN0YXRzUmVwb3J0LnBhY2tldHNSZWNlaXZlZCwgYXVkaW9MZXZlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2FsbFN0YXRzO1xufVxuXG4vKipcbiogQmFzaWMgUlRQIHN0YXRpc3RpY3Mgb2JqZWN0LCByZXByZXNlbnRzIHN0YXRpc3RpY3Mgb2YgYW4gYXVkaW8gb3IgdmlkZW8gc3RyZWFtLlxuKi9cbmNsYXNzIE1lZGlhUnRwU3RhdHMge1xuICAgIGNvbnN0cnVjdG9yKHRpbWVzdGFtcCwgcGFja2V0c0xvc3QsIHBhY2tldHNDb3VudCwgYXVkaW9MZXZlbCwgcnR0TWlsbGlzZWNvbmRzLCBqYk1pbGxpc2Vjb25kcywgYnl0ZXNTZW50LCBieXRlc1JlY2VpdmVkLCBmcmFtZXNFbmNvZGVkLCBmcmFtZXNEZWNvZGVkLCBmcmFtZVJhdGVTZW50LCBmcmFtZVJhdGVSZWNlaXZlZCkge1xuICAgICAgICB0aGlzLl90aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgICAgIHRoaXMuX3BhY2tldHNMb3N0ID0gcGFja2V0c0xvc3Q7XG4gICAgICAgIHRoaXMuX3BhY2tldHNDb3VudCA9IHBhY2tldHNDb3VudDtcbiAgICAgICAgdGhpcy5fYXVkaW9MZXZlbCA9IGF1ZGlvTGV2ZWw7XG4gICAgICAgIHRoaXMuX3J0dE1pbGxpc2Vjb25kcyA9IHJ0dE1pbGxpc2Vjb25kcztcbiAgICAgICAgdGhpcy5famJNaWxsaXNlY29uZHMgPSBqYk1pbGxpc2Vjb25kcztcbiAgICAgICAgdGhpcy5fYnl0ZXNTZW50ID0gYnl0ZXNTZW50O1xuICAgICAgICB0aGlzLl9ieXRlc1JlY2VpdmVkID0gYnl0ZXNSZWNlaXZlZDtcbiAgICAgICAgdGhpcy5fZnJhbWVzRW5jb2RlZCA9IGZyYW1lc0VuY29kZWQ7XG4gICAgICAgIHRoaXMuX2ZyYW1lc0RlY29kZWQgPSBmcmFtZXNEZWNvZGVkO1xuICAgICAgICB0aGlzLl9mcmFtZVJhdGVTZW50ID0gZnJhbWVSYXRlU2VudDtcbiAgICAgICAgdGhpcy5fZnJhbWVSYXRlUmVjZWl2ZWQgPSBmcmFtZVJhdGVSZWNlaXZlZDtcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IG51bWJlciBvZiBwYWNrZXRzIHNlbnQgdG8gdGhlIGNoYW5uZWwgKi9cbiAgICBnZXQgcGFja2V0c0NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFja2V0c0NvdW50O1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHBhY2tldHMgbG9zdCBhZnRlciB0cmF2ZWxsaW5nIHRocm91Z2ggdGhlIGNoYW5uZWwgKi9cbiAgICBnZXQgcGFja2V0c0xvc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWNrZXRzTG9zdDtcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IG51bWJlciBvZiBwYWNrZXRzIGxvc3QgYWZ0ZXIgdHJhdmVsbGluZyB0aHJvdWdoIHRoZSBjaGFubmVsICovXG4gICAgZ2V0IHBhY2tldExvc3NQZXJjZW50YWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFja2V0c0NvdW50ID4gMCA/IHRoaXMuX3BhY2tldHNMb3N0IC8gdGhpcy5fcGFja2V0c0NvdW50IDogMDtcbiAgICB9XG4gICAgLyoqIEF1ZGlvIHZvbHVtZSBsZXZlbFxuICAgICogQ3VycmVudGx5IGZpcmVmb3ggZG9lc24ndCBwcm92aWRlIGF1ZGlvIGxldmVsIGluIHJ0cCBzdGF0cy5cbiAgICAqL1xuICAgIGdldCBhdWRpb0xldmVsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYXVkaW9MZXZlbDtcbiAgICB9XG4gICAgLyoqIFRpbWVzdGFtcCB3aGVuIHN0YXRzIGFyZSBjb2xsZWN0ZWQuICovXG4gICAgZ2V0IHRpbWVzdGFtcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWVzdGFtcDtcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IFJvdW5kIHRyaXAgdGltZSBjYWxjdWxhdGVkIHdpdGggUlRDUCByZXBvcnRzICovXG4gICAgZ2V0IHJ0dE1pbGxpc2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J0dE1pbGxpc2Vjb25kcztcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IEJyb3dzZXIvY2xpZW50IHNpZGUgaml0dGVyIGJ1ZmZlciBsZW5ndGggKi9cbiAgICBnZXQgamJNaWxsaXNlY29uZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9qYk1pbGxpc2Vjb25kcztcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IG51bWJlciBvZiBieXRlcyBzZW50IHRvIHRoZSBjaGFubmVsKi9cbiAgICBnZXQgYnl0ZXNTZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZXNTZW50O1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIGJ5dGVzIHJlY2VpdmVkIGZyb20gdGhlIGNoYW5uZWwqL1xuICAgIGdldCBieXRlc1JlY2VpdmVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZXNSZWNlaXZlZDtcbiAgICB9XG4gICAgLyoqIHtudW1iZXJ9IG51bWJlciBvZiB2aWRlbyBmcmFtZXMgZW5jb2RlZCovXG4gICAgZ2V0IGZyYW1lc0VuY29kZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZXNFbmNvZGVkO1xuICAgIH1cbiAgICAvKioge251bWJlcn0gbnVtYmVyIG9mIHZpZGVvIGZyYW1lcyBkZWNvZGVkKi9cbiAgICBnZXQgZnJhbWVzRGVjb2RlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lc0RlY29kZWQ7XG4gICAgfVxuICAgIC8qKiB7bnVtYmVyfSBmcmFtZXMgcGVyIHNlY29uZCBzZW50IHRvIHRoZSBjaGFubmVsKi9cbiAgICBnZXQgZnJhbWVSYXRlU2VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lUmF0ZVNlbnQ7XG4gICAgfVxuICAgIC8qKiB7bnVtYmVyfSBmcmFtZXMgcGVyIHNlY29uZCByZWNlaXZlZCBmcm9tIHRoZSBjaGFubmVsKi9cbiAgICBnZXQgZnJhbWVSYXRlUmVjZWl2ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZVJhdGVSZWNlaXZlZDtcbiAgICB9XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE3IEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFtYXpvbiBTb2Z0d2FyZSBMaWNlbnNlICh0aGUgXCJMaWNlbnNlXCIpLiBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICBodHRwOi8vYXdzLmFtYXpvbi5jb20vYXNsL1xuICpcbiAqIG9yIGluIHRoZSBcIkxJQ0VOU0VcIiBmaWxlIGFjY29tcGFueWluZyB0aGlzIGZpbGUuIFRoaXMgZmlsZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuZXhwb3J0IGNsYXNzIFNlc3Npb25SZXBvcnQge1xuICAgIC8qKlxuICAgICAqIEBjbGFzcyBQcm90b3R5cGUgZm9yIHRyYWNraW5nIHZhcmlvdXMgUlRDIHNlc3Npb24gcmVwb3J0XG4gICAgICogQGNvbnN0cnVjdHNcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fc2Vzc2lvblN0YXJ0VGltZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3Nlc3Npb25FbmRUaW1lID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZ3VtVGltZU1pbGxpcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemF0aW9uVGltZU1pbGxpcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2ljZUNvbGxlY3Rpb25UaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2lnbmFsbGluZ0Nvbm5lY3RUaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faGFuZHNoYWtpbmdUaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHJlVGFsa2luZ1RpbWVNaWxsaXMgPSBudWxsO1xuICAgICAgICB0aGlzLl90YWxraW5nVGltZU1pbGxpcyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2ljZUNvbm5lY3Rpb25zTG9zdCA9IDA7XG4gICAgICAgIHRoaXMuX2NsZWFudXBUaW1lTWlsbGlzID0gbnVsbDtcbiAgICAgICAgdGhpcy5faWNlQ29sbGVjdGlvbkZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9oYW5kc2hha2luZ0ZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9ndW1PdGhlckZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9ndW1UaW1lb3V0RmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NyZWF0ZU9mZmVyRmFpbHVyZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3NldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdXNlckJ1c3lGYWlsdXJlID0gbnVsbDtcbiAgICAgICAgdGhpcy5faW52YWxpZFJlbW90ZVNEUEZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9ub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9zZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmUgPSBudWxsO1xuICAgICAgICB0aGlzLl9zdHJlYW1TdGF0cyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlRpbWVzdGFtcCB3aGVuIFJUQ1Nlc3Npb24gc3RhcnRlZC5cbiAgICAgKi9cbiAgICBnZXQgc2Vzc2lvblN0YXJ0VGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nlc3Npb25TdGFydFRpbWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWVzdGFtcCB3aGVuIFJUQ1Nlc3Npb24gZW5kZWQuXG4gICAgICovXG4gICAgZ2V0IHNlc3Npb25FbmRUaW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbkVuZFRpbWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWUgdGFrZW4gZm9yIGdyYWJiaW5nIHVzZXIgbWljcm9waG9uZSBhdCB0aGUgdGltZSBvZiBjb25uZWN0aW5nIFJUQ1Nlc3Npb24uXG4gICAgICovXG4gICAgZ2V0IGd1bVRpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ndW1UaW1lTWlsbGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaW1lIHRha2VuIGZvciBzZXNzaW9uIGluaXRpYWxpemF0aW9uIGluIG1pbGxpcy4gSW5jbHVkZXMgdGltZSBzcGVudCBpbiBHcmFiTG9jYWxNZWRpYSwgU2V0TG9jYWxTRFAgc3RhdGVzLlxuICAgICAqL1xuICAgIGdldCBpbml0aWFsaXphdGlvblRpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsaXphdGlvblRpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWUgc3BlbnQgb24gSUNFQ29sbGVjdGlvbiBpbiBtaWxsaXMuXG4gICAgICovXG4gICAgZ2V0IGljZUNvbGxlY3Rpb25UaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWNlQ29sbGVjdGlvblRpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWUgdGFrZW4gZm9yIGNvbm5lY3RpbmcgdGhlIHNpZ25hbGxpbmcgaW4gbWlsbGlzLlxuICAgICAqL1xuICAgIGdldCBzaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdFRpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRpbWVzIHNwZW50IGZyb20gUlRDU2Vzc2lvbiBjb25uZWN0aW9uIHVudGlsIGVudGVyaW5nIFRhbGtpbmcgc3RhdGUgaW4gbWlsbGlzLlxuICAgICAqL1xuICAgIGdldCBwcmVUYWxraW5nVGltZU1pbGxpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZVRhbGtpbmdUaW1lTWlsbGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgVGltZXMgc3BlbnQgaW4gY29tcGxldGluZyBoYW5kc2hha2luZyBwcm9jZXNzIG9mIHRoZSBSVENTZXNzaW9uIGluIG1pbGxpcy5cbiAgICAgKi9cbiAgICBnZXQgaGFuZHNoYWtpbmdUaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFuZHNoYWtpbmdUaW1lTWlsbGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgVGltZXMgc3BlbnQgaW4gVGFsa2luZyBzdGF0ZSBpbiBtaWxsaXMuXG4gICAgICovXG4gICAgZ2V0IHRhbGtpbmdUaW1lTWlsbGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGFsa2luZ1RpbWVNaWxsaXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhvdyBtYW55IHRpbWVzIHRoZSBSVENTZXNzaW9uIGhhcyBsb3N0IElDRSBjb25uZWN0aW9uIGluIHRhbGtpbmcgc3RhdGUuXG4gICAgICovXG4gICAgZ2V0IGljZUNvbm5lY3Rpb25zTG9zdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ljZUNvbm5lY3Rpb25zTG9zdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGltZXMgc3BlbnQgaW4gQ2xlYW51cCBzdGF0ZSBpbiBtaWxsaXNcbiAgICAgKi9cbiAgICBnZXQgY2xlYW51cFRpbWVNaWxsaXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jbGVhbnVwVGltZU1pbGxpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGVsbHMgaWYgdGhlIFJUQ1Nlc3Npb24gZmFpbHMgaW4gSUNFQ29sbGVjdGlvbi5cbiAgICAgKi9cbiAgICBnZXQgaWNlQ29sbGVjdGlvbkZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pY2VDb2xsZWN0aW9uRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGVsbHMgaWYgdGhlIFJUQ1Nlc3Npb24gZmFpbGVkIGluIHNpZ25hbGxpbmcgY29ubmVjdCBzdGFnZS5cbiAgICAgKi9cbiAgICBnZXQgc2lnbmFsbGluZ0Nvbm5lY3Rpb25GYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsbGluZ0Nvbm5lY3Rpb25GYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kc2hha2luZyBmYWlsdXJlIG9mIHRoZSBSVENTZXNzaW9uXG4gICAgICovXG4gICAgZ2V0IGhhbmRzaGFraW5nRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRzaGFraW5nRmFpbHVyZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR3VtIGZhaWxlZCBkdWUgdG8gdGltZW91dCBhdCB0aGUgdGltZSBvZiBuZXcgUlRDU2Vzc2lvbiBjb25uZWN0aW9uXG4gICAgICovXG4gICAgZ2V0IGd1bVRpbWVvdXRGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ3VtVGltZW91dEZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEd1bSBmYWlsZWQgZHVlIHRvIG90aGVyIHJlYXNvbnMgKG90aGVyIHRoYW4gVGltZW91dClcbiAgICAgKi9cbiAgICBnZXQgZ3VtT3RoZXJGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ3VtT3RoZXJGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSVEMgU2Vzc2lvbiBmYWlsZWQgaW4gY3JlYXRlIE9mZmVyIHN0YXRlLlxuICAgICAqL1xuICAgIGdldCBjcmVhdGVPZmZlckZhaWx1cmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVPZmZlckZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRlbGxzIGlmIHNldExvY2FsRGVzY3JpcHRpb24gZmFpbGVkIGZvciB0aGUgUlRDIFNlc3Npb24uXG4gICAgICovXG4gICAgZ2V0IHNldExvY2FsRGVzY3JpcHRpb25GYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0TG9jYWxEZXNjcmlwdGlvbkZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRlbGxzIGlmIGhhbmRzaGFraW5nIGZhaWxlZCBkdWUgdG8gdXNlciBidXN5IGNhc2UsXG4gICAgICogaGFwcGVucyB3aGVuIG11bHRpcGxlIHNvZnRwaG9uZSBjYWxscyBhcmUgaW5pdGlhdGVkIGF0IHNhbWUgdGltZS5cbiAgICAgKi9cbiAgICBnZXQgdXNlckJ1c3lGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNlckJ1c3lGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUZWxscyBpdCByZW1vdGUgU0RQIGlzIGludmFsaWQuXG4gICAgICovXG4gICAgZ2V0IGludmFsaWRSZW1vdGVTRFBGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52YWxpZFJlbW90ZVNEUEZhaWx1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRlbGxzIGlmIHRoZSBzZXRSZW1vdGVEZXNjcmlwdGlvbiBmYWlsZWQgZm9yIHRoZSBSVEMgU2Vzc2lvbi5cbiAgICAgKi9cbiAgICBnZXQgc2V0UmVtb3RlRGVzY3JpcHRpb25GYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2V0UmVtb3RlRGVzY3JpcHRpb25GYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIGZhaWx1cmUgY2FzZSB3aGVuIHRoZXJlIGlzIG5vIFJlbW90ZUljZUNhbmRpZGF0ZS5cbiAgICAgKi9cbiAgICBnZXQgbm9SZW1vdGVJY2VDYW5kaWRhdGVGYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbm9SZW1vdGVJY2VDYW5kaWRhdGVGYWlsdXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGF0aXN0aWNzIGZvciBlYWNoIHN0cmVhbShhdWRpby1pbiwgYXVkaW8tb3V0LCB2aWRlby1pbiwgdmlkZW8tb3V0KSBvZiB0aGUgUlRDU2Vzc2lvbi5cbiAgICAgKi9cbiAgICBnZXQgc3RyZWFtU3RhdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJlYW1TdGF0cztcbiAgICB9XG5cbiAgICBzZXQgc2Vzc2lvblN0YXJ0VGltZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zZXNzaW9uU3RhcnRUaW1lID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBzZXNzaW9uRW5kVGltZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zZXNzaW9uRW5kVGltZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgZ3VtVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9ndW1UaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBpbml0aWFsaXphdGlvblRpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6YXRpb25UaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBpY2VDb2xsZWN0aW9uVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9pY2VDb2xsZWN0aW9uVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgc2lnbmFsbGluZ0Nvbm5lY3RUaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGxpbmdDb25uZWN0VGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgcHJlVGFsa2luZ1RpbWVNaWxsaXModmFsdWUpIHtcbiAgICAgICAgdGhpcy5fcHJlVGFsa2luZ1RpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGhhbmRzaGFraW5nVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9oYW5kc2hha2luZ1RpbWVNaWxsaXMgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHRhbGtpbmdUaW1lTWlsbGlzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RhbGtpbmdUaW1lTWlsbGlzID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBpY2VDb25uZWN0aW9uc0xvc3QodmFsdWUpIHtcbiAgICAgICAgdGhpcy5faWNlQ29ubmVjdGlvbnNMb3N0ID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBjbGVhbnVwVGltZU1pbGxpcyh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jbGVhbnVwVGltZU1pbGxpcyA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgaWNlQ29sbGVjdGlvbkZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5faWNlQ29sbGVjdGlvbkZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHNpZ25hbGxpbmdDb25uZWN0aW9uRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zaWduYWxsaW5nQ29ubmVjdGlvbkZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGhhbmRzaGFraW5nRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9oYW5kc2hha2luZ0ZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IGd1bVRpbWVvdXRGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2d1bVRpbWVvdXRGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBndW1PdGhlckZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZ3VtT3RoZXJGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBjcmVhdGVPZmZlckZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlT2ZmZXJGYWlsdXJlID0gdmFsdWU7XG4gICAgfVxuICAgIHNldCBzZXRMb2NhbERlc2NyaXB0aW9uRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zZXRMb2NhbERlc2NyaXB0aW9uRmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgdXNlckJ1c3lGYWlsdXJlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3VzZXJCdXN5RmFpbHVyZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXQgaW52YWxpZFJlbW90ZVNEUEZhaWx1cmUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5faW52YWxpZFJlbW90ZVNEUEZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IG5vUmVtb3RlSWNlQ2FuZGlkYXRlRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9ub1JlbW90ZUljZUNhbmRpZGF0ZUZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHNldFJlbW90ZURlc2NyaXB0aW9uRmFpbHVyZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9zZXRSZW1vdGVEZXNjcmlwdGlvbkZhaWx1cmUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0IHN0cmVhbVN0YXRzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3N0cmVhbVN0YXRzID0gdmFsdWU7XG4gICAgfVxufSIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBoaXRjaCwgd3JhcExvZ2dlciB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgTUFYX0lOVklURV9ERUxBWV9NUywgTUFYX0FDQ0VQVF9CWUVfREVMQVlfTVMsIERFRkFVTFRfQ09OTkVDVF9USU1FT1VUX01TIH0gZnJvbSAnLi9ydGNfY29uc3QnO1xuaW1wb3J0IHsgVW5zdXBwb3J0ZWRPcGVyYXRpb24sIFRpbWVvdXQsIEJ1c3lFeGNlcHRpb24sIENhbGxOb3RGb3VuZEV4Y2VwdGlvbiwgVW5rbm93blNpZ25hbGluZ0Vycm9yIH0gZnJvbSAnLi9leGNlcHRpb25zJztcblxudmFyIHJlcUlkU2VxID0gMTtcblxudmFyIENPTk5FQ1RfTUFYX1JFVFJJRVMgPSAzO1xuXG4vKipcbiAqIEFic3RyYWN0IHNpZ25hbGluZyBzdGF0ZSBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0Ftem5SdGNTaWduYWxpbmd9IHNpZ25hbGluZyBTaWduYWxpbmcgb2JqZWN0LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZykge1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcgPSBzaWduYWxpbmc7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9XG4gICAgc2V0U3RhdGVUaW1lb3V0KHRpbWVvdXRNcykge1xuICAgICAgICBzZXRUaW1lb3V0KGhpdGNoKHRoaXMsIHRoaXMuX29uVGltZW91dENoZWNrZWQpLCB0aW1lb3V0TXMpO1xuICAgIH1cbiAgICBnZXQgaXNDdXJyZW50U3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzID09PSB0aGlzLl9zaWduYWxpbmcuc3RhdGU7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgfVxuICAgIF9vblRpbWVvdXRDaGVja2VkKCkge1xuICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnRTdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblRpbWVvdXQoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbigpO1xuICAgIH1cbiAgICB0cmFuc2l0KG5ld1N0YXRlKSB7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZy50cmFuc2l0KG5ld1N0YXRlKTtcbiAgICB9XG4gICAgb25FeGl0KCkge1xuICAgIH1cbiAgICBvbk9wZW4oKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25PcGVuIG5vdCBzdXBwb3J0ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIG9uRXJyb3IoKSB7XG4gICAgICAgIHRoaXMuY2hhbm5lbERvd24oKTtcbiAgICB9XG4gICAgb25DbG9zZSgpIHtcbiAgICAgICAgdGhpcy5jaGFubmVsRG93bigpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdjaGFubmVsRG93biBub3Qgc3VwcG9ydGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBvblJwY01zZyhycGNNc2cpIHsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignb25ScGNNc2cgbm90IHN1cHBvcnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgaW52aXRlKHNkcCwgaWNlQ2FuZGlkYXRlcykgey8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgICAgdGhyb3cgbmV3IFVuc3VwcG9ydGVkT3BlcmF0aW9uKCdpbnZpdGUgbm90IHN1cHBvcnRlZCBieSAnICsgdGhpcy5uYW1lKTtcbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB0aHJvdyBuZXcgVW5zdXBwb3J0ZWRPcGVyYXRpb24oJ2FjY2VwdCBub3Qgc3VwcG9ydGVkIGJ5ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICBoYW5ndXAoKSB7XG4gICAgICAgIHRocm93IG5ldyBVbnN1cHBvcnRlZE9wZXJhdGlvbignaGFuZ3VwIG5vdCBzdXBwb3J0ZWQgYnkgJyArIHRoaXMubmFtZSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJTaWduYWxpbmdTdGF0ZVwiO1xuICAgIH1cbiAgICBnZXQgbG9nZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsaW5nLl9sb2dnZXI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWxPblRpbWVvdXRTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIHRpbWVvdXRNcykge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcpO1xuICAgICAgICB0aGlzLl90aW1lb3V0TXMgPSB0aW1lb3V0TXM7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGVUaW1lb3V0KHRoaXMuX3N0YXRlVGltZW91dE1zKTtcbiAgICB9XG4gICAgb25UaW1lb3V0KCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZywgbmV3IFRpbWVvdXQoKSkpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiRmFpbE9uVGltZW91dFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFBlbmRpbmdDb25uZWN0U3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgdGltZW91dE1zLCBpbml0aWFsU3RhcnRUaW1lSW4sIHJldHJpZXNJbikge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIHRpbWVvdXRNcyk7XG4gICAgICAgIHRoaXMuX2luaXRpYWxTdGFydFRpbWUgPSBpbml0aWFsU3RhcnRUaW1lSW4gfHwgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuX3JldHJpZXMgPSByZXRyaWVzSW4gfHwgMDtcbiAgICB9XG4gICAgb25PcGVuKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdJbnZpdGVTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdmFyIHVudGlsVGltZW91dE1zID0gKHRoaXMuX2luaXRpYWxTdGFydFRpbWUgKyB0aGlzLl90aW1lb3V0TXMpIC0gbm93O1xuICAgICAgICBpZiAodW50aWxUaW1lb3V0TXMgPiAwICYmICsrdGhpcy5fcmV0cmllcyA8IENPTk5FQ1RfTUFYX1JFVFJJRVMpIHtcbiAgICAgICAgICAgIHRoaXMuX3NpZ25hbGluZy5fY29ubmVjdCgpO1xuICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nQ29ubmVjdFN0YXRlKHRoaXMuX3NpZ25hbGluZywgdW50aWxUaW1lb3V0TXMsIHRoaXMuX2luaXRpYWxTdGFydFRpbWUsIHRoaXMuX3JldHJpZXMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nLCBuZXcgRXJyb3IoJ2NoYW5uZWxEb3duJykpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUGVuZGluZ0Nvbm5lY3RTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nSW52aXRlU3RhdGUgZXh0ZW5kcyBTaWduYWxpbmdTdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlDb25uZWN0ZWQocmVzb2x2ZSkge1xuICAgICAgICAgICAgc2VsZi5fc2lnbmFsaW5nLl9jb25uZWN0ZWRIYW5kbGVyKCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnZpdGUoc2RwLCBpY2VDYW5kaWRhdGVzKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGludml0ZUlkID0gcmVxSWRTZXErKztcblxuICAgICAgICB2YXIgaW52aXRlUGFyYW1zID0ge1xuICAgICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgICBjYW5kaWRhdGVzOiBpY2VDYW5kaWRhdGVzXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYubG9nZ2VyLmxvZygnU2VuZGluZyBTRFAnLCBzZHApO1xuICAgICAgICBzZWxmLl9zaWduYWxpbmcuX3dzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICAgICAgbWV0aG9kOiAnaW52aXRlJyxcbiAgICAgICAgICAgIHBhcmFtczogaW52aXRlUGFyYW1zLFxuICAgICAgICAgICAgaWQ6IGludml0ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBQZW5kaW5nQW5zd2VyU3RhdGUoc2VsZi5fc2lnbmFsaW5nLCBpbnZpdGVJZCkpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdJbnZpdGVTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nQW5zd2VyU3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgaW52aXRlSWQpIHtcbiAgICAgICAgc3VwZXIoc2lnbmFsaW5nLCBNQVhfSU5WSVRFX0RFTEFZX01TKTtcbiAgICAgICAgdGhpcy5faW52aXRlSWQgPSBpbnZpdGVJZDtcbiAgICB9XG4gICAgb25ScGNNc2cobXNnKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKG1zZy5pZCA9PT0gdGhpcy5faW52aXRlSWQpIHtcbiAgICAgICAgICAgIGlmIChtc2cuZXJyb3IgfHwgIW1zZy5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZywgc2VsZi50cmFuc2xhdGVJbnZpdGVFcnJvcihtc2cpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIG5vdGlmeUFuc3dlcmVkKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2dnZXIubG9nKCdSZWNlaXZlZCBTRFAnLCBtc2cucmVzdWx0LnNkcCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5fYW5zd2VyZWRIYW5kbGVyKG1zZy5yZXN1bHQuc2RwLCBtc2cucmVzdWx0LmNhbmRpZGF0ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nQWNjZXB0U3RhdGUodGhpcy5fc2lnbmFsaW5nLCB0aGlzLl9zaWduYWxpbmcuX2F1dG9BbnN3ZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB0cmFuc2xhdGVJbnZpdGVFcnJvcihtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5lcnJvciAmJiBtc2cuZXJyb3IuY29kZSA9PSA0ODYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQnVzeUV4Y2VwdGlvbihtc2cuZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLmVycm9yICYmIG1zZy5lcnJvci5jb2RlID09IDQwNCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDYWxsTm90Rm91bmRFeGNlcHRpb24obXNnLmVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVbmtub3duU2lnbmFsaW5nRXJyb3IoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nQW5zd2VyU3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ0FjY2VwdFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgYXV0b0Fuc3dlcikge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcpO1xuICAgICAgICB0aGlzLl9hdXRvQW5zd2VyID0gYXV0b0Fuc3dlcjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9BbnN3ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWNjZXB0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWNjZXB0KCkge1xuICAgICAgICB2YXIgYWNjZXB0SWQgPSByZXFJZFNlcSsrO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcuX3dzcy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGpzb25ycGM6ICcyLjAnLFxuICAgICAgICAgICAgbWV0aG9kOiAnYWNjZXB0JyxcbiAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICBpZDogYWNjZXB0SWRcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdBY2NlcHRBY2tTdGF0ZSh0aGlzLl9zaWduYWxpbmcsIGFjY2VwdElkKSk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IEZhaWxlZFN0YXRlKHRoaXMuX3NpZ25hbGluZykpO1xuICAgIH1cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiUGVuZGluZ0FjY2VwdFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFBlbmRpbmdBY2NlcHRBY2tTdGF0ZSBleHRlbmRzIEZhaWxPblRpbWVvdXRTdGF0ZSB7XG4gICAgY29uc3RydWN0b3Ioc2lnbmFsaW5nLCBhY2NlcHRJZCkge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIE1BWF9BQ0NFUFRfQllFX0RFTEFZX01TKTtcbiAgICAgICAgdGhpcy5fYWNjZXB0SWQgPSBhY2NlcHRJZDtcbiAgICB9XG4gICAgb25ScGNNc2cobXNnKSB7XG4gICAgICAgIGlmIChtc2cuaWQgPT09IHRoaXMuX2FjY2VwdElkKSB7XG4gICAgICAgICAgICBpZiAobXNnLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBGYWlsZWRTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl9jbGllbnRUb2tlbiA9IG1zZy5yZXN1bHQuY2xpZW50VG9rZW47XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBUYWxraW5nU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdBY2NlcHRBY2tTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBUYWxraW5nU3RhdGUgZXh0ZW5kcyBTaWduYWxpbmdTdGF0ZSB7XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlIYW5kc2hha2VkKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5faGFuZHNoYWtlZEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGhhbmd1cCgpIHtcbiAgICAgICAgdmFyIGJ5ZUlkID0gcmVxSWRTZXErKztcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl93c3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgICAgICAgIG1ldGhvZDogJ2J5ZScsXG4gICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgaWQ6IGJ5ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy50cmFuc2l0KG5ldyBQZW5kaW5nUmVtb3RlSGFuZ3VwU3RhdGUodGhpcy5fc2lnbmFsaW5nLCBieWVJZCkpO1xuICAgIH1cbiAgICBvblJwY01zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5tZXRob2QgPT09ICdieWUnKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFBlbmRpbmdMb2NhbEhhbmd1cFN0YXRlKHRoaXMuX3NpZ25hbGluZywgbXNnLmlkKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1ldGhvZCA9PT0gJ3JlbmV3Q2xpZW50VG9rZW4nKSB7XG4gICAgICAgICAgICB0aGlzLl9zaWduYWxpbmcuX2NsaWVudFRva2VuID0gbXNnLnBhcmFtcy5jbGllbnRUb2tlbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLl9yZWNvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5fc2lnbmFsaW5nLnRyYW5zaXQobmV3IFBlbmRpbmdSZWNvbm5lY3RTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlRhbGtpbmdTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nUmVjb25uZWN0U3RhdGUgZXh0ZW5kcyBGYWlsT25UaW1lb3V0U3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZykge1xuICAgICAgICBzdXBlcihzaWduYWxpbmcsIERFRkFVTFRfQ09OTkVDVF9USU1FT1VUX01TKTtcbiAgICB9XG4gICAgb25PcGVuKCkge1xuICAgICAgICB0aGlzLnRyYW5zaXQobmV3IFRhbGtpbmdTdGF0ZSh0aGlzLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRmFpbGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nUmVjb25uZWN0U3RhdGVcIjtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUGVuZGluZ1JlbW90ZUhhbmd1cFN0YXRlIGV4dGVuZHMgRmFpbE9uVGltZW91dFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIGJ5ZUlkKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZywgTUFYX0FDQ0VQVF9CWUVfREVMQVlfTVMpO1xuICAgICAgICB0aGlzLl9ieWVJZCA9IGJ5ZUlkO1xuICAgIH1cbiAgICBvblJwY01zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1zZy5pZCA9PT0gdGhpcy5fYnllSWQpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIlBlbmRpbmdSZW1vdGVIYW5ndXBTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBQZW5kaW5nTG9jYWxIYW5ndXBTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihzaWduYWxpbmcsIGJ5ZUlkKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX2J5ZUlkID0gYnllSWQ7XG4gICAgfVxuICAgIG9uRW50ZXIoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgbmV3IFByb21pc2UoZnVuY3Rpb24gbm90aWZ5UmVtb3RlSHVuZ3VwKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NpZ25hbGluZy5fcmVtb3RlSHVuZ3VwSGFuZGxlcigpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3NpZ25hbGluZy5fd3NzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAganNvbnJwYzogJzIuMCcsXG4gICAgICAgICAgICByZXN1bHQ6IHt9LFxuICAgICAgICAgICAgaWQ6IHNlbGYuX2J5ZUlkXG4gICAgICAgIH0pKTtcbiAgICAgICAgc2VsZi50cmFuc2l0KG5ldyBEaXNjb25uZWN0ZWRTdGF0ZShzZWxmLl9zaWduYWxpbmcpKTtcbiAgICB9XG4gICAgY2hhbm5lbERvd24oKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgRGlzY29ubmVjdGVkU3RhdGUodGhpcy5fc2lnbmFsaW5nKSk7XG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJQZW5kaW5nTG9jYWxIYW5ndXBTdGF0ZVwiO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBEaXNjb25uZWN0ZWRTdGF0ZSBleHRlbmRzIFNpZ25hbGluZ1N0YXRlIHtcbiAgICBvbkVudGVyKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIG5vdGlmeURpc2Nvbm5lY3RlZChyZXNvbHZlKSB7XG4gICAgICAgICAgICBzZWxmLl9zaWduYWxpbmcuX2Rpc2Nvbm5lY3RlZEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NpZ25hbGluZy5fd3NzLmNsb3NlKCk7XG4gICAgfVxuICAgIGNoYW5uZWxEb3duKCkge1xuICAgICAgICAvL0RvIG5vdGhpbmdcbiAgICB9XG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiBcIkRpc2Nvbm5lY3RlZFN0YXRlXCI7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZhaWxlZFN0YXRlIGV4dGVuZHMgU2lnbmFsaW5nU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKHNpZ25hbGluZywgZXhjZXB0aW9uKSB7XG4gICAgICAgIHN1cGVyKHNpZ25hbGluZyk7XG4gICAgICAgIHRoaXMuX2V4Y2VwdGlvbiA9IGV4Y2VwdGlvbjtcbiAgICB9XG4gICAgb25FbnRlcigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiBub3RpZnlGYWlsZWQocmVzb2x2ZSkge1xuICAgICAgICAgICAgc2VsZi5fc2lnbmFsaW5nLl9mYWlsZWRIYW5kbGVyKHNlbGYuX2V4Y2VwdGlvbik7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmcuX3dzcy5jbG9zZSgpO1xuICAgIH1cbiAgICBjaGFubmVsRG93bigpIHtcbiAgICAgICAgLy9EbyBub3RoaW5nXG4gICAgfVxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gXCJGYWlsZWRTdGF0ZVwiO1xuICAgIH1cbiAgICBnZXQgZXhjZXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhjZXB0aW9uO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW16blJ0Y1NpZ25hbGluZyB7XG4gICAgY29uc3RydWN0b3IoY2FsbElkLCBzaWduYWxpbmdVcmksIGNvbnRhY3RUb2tlbiwgbG9nZ2VyLCBjb25uZWN0VGltZW91dE1zKSB7XG4gICAgICAgIHRoaXMuX2NhbGxJZCA9IGNhbGxJZDtcbiAgICAgICAgdGhpcy5fY29ubmVjdFRpbWVvdXRNcyA9IGNvbm5lY3RUaW1lb3V0TXMgfHwgREVGQVVMVF9DT05ORUNUX1RJTUVPVVRfTVM7XG4gICAgICAgIHRoaXMuX2F1dG9BbnN3ZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zaWduYWxpbmdVcmkgPSBzaWduYWxpbmdVcmk7XG4gICAgICAgIHRoaXMuX2NvbnRhY3RUb2tlbiA9IGNvbnRhY3RUb2tlbjtcbiAgICAgICAgdGhpcy5fbG9nZ2VyID0gd3JhcExvZ2dlcihsb2dnZXIsIGNhbGxJZCwgJ1NJR05BTElORycpO1xuXG4gICAgICAgIC8vZW1wdHkgZXZlbnQgaGFuZGxlcnNcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkSGFuZGxlciA9XG4gICAgICAgICAgICB0aGlzLl9hbnN3ZXJlZEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5faGFuZHNoYWtlZEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5fcmVjb25uZWN0ZWRIYW5kbGVyID1cbiAgICAgICAgICAgIHRoaXMuX3JlbW90ZUh1bmd1cEhhbmRsZXIgPVxuICAgICAgICAgICAgdGhpcy5fZGlzY29ubmVjdGVkSGFuZGxlciA9XG4gICAgICAgICAgICB0aGlzLl9mYWlsZWRIYW5kbGVyID0gZnVuY3Rpb24gbm9PcCgpIHtcbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGdldCBjYWxsSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWxsSWQ7XG4gICAgfVxuICAgIHNldCBvbkNvbm5lY3RlZChjb25uZWN0ZWRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZEhhbmRsZXIgPSBjb25uZWN0ZWRIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25BbnN3ZXJlZChhbnN3ZXJlZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fYW5zd2VyZWRIYW5kbGVyID0gYW5zd2VyZWRIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25IYW5kc2hha2VkKGhhbmRzaGFrZWRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRzaGFrZWRIYW5kbGVyID0gaGFuZHNoYWtlZEhhbmRsZXI7XG4gICAgfVxuICAgIHNldCBvblJlY29ubmVjdGVkKHJlY29ubmVjdGVkSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9yZWNvbm5lY3RlZEhhbmRsZXIgPSByZWNvbm5lY3RlZEhhbmRsZXI7XG4gICAgfVxuICAgIHNldCBvblJlbW90ZUh1bmd1cChyZW1vdGVIdW5ndXBIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX3JlbW90ZUh1bmd1cEhhbmRsZXIgPSByZW1vdGVIdW5ndXBIYW5kbGVyO1xuICAgIH1cbiAgICBzZXQgb25EaXNjb25uZWN0ZWQoZGlzY29ubmVjdGVkSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9kaXNjb25uZWN0ZWRIYW5kbGVyID0gZGlzY29ubmVjdGVkSGFuZGxlcjtcbiAgICB9XG4gICAgc2V0IG9uRmFpbGVkKGZhaWxlZEhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fZmFpbGVkSGFuZGxlciA9IGZhaWxlZEhhbmRsZXI7XG4gICAgfVxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH1cbiAgICBjb25uZWN0KCkge1xuICAgICAgICB0aGlzLl9jb25uZWN0KCk7XG4gICAgICAgIHRoaXMudHJhbnNpdChuZXcgUGVuZGluZ0Nvbm5lY3RTdGF0ZSh0aGlzLCB0aGlzLl9jb25uZWN0VGltZW91dE1zKSk7XG4gICAgfVxuICAgIF9jb25uZWN0KCkge1xuICAgICAgICB0aGlzLl93c3MgPSB0aGlzLl9jb25uZWN0V2ViU29ja2V0KHRoaXMuX2J1aWxkSW52aXRlVXJpKCkpO1xuICAgIH1cbiAgICB0cmFuc2l0KG5leHRTdGF0ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmluZm8oKHRoaXMuX3N0YXRlID8gdGhpcy5fc3RhdGUubmFtZSA6ICdudWxsJykgKyAnID0+ICcgKyBuZXh0U3RhdGUubmFtZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm9uRXhpdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub25FeGl0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IG5leHRTdGF0ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZS5vbkVudGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUub25FbnRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIF9jb25uZWN0V2ViU29ja2V0KHVyaSkge1xuICAgICAgICB2YXIgd3NDb25uZWN0aW9uID0gbmV3IFdlYlNvY2tldCh1cmkpO1xuICAgICAgICB3c0Nvbm5lY3Rpb24ub25vcGVuID0gaGl0Y2godGhpcywgdGhpcy5fb25PcGVuKTtcbiAgICAgICAgd3NDb25uZWN0aW9uLm9ubWVzc2FnZSA9IGhpdGNoKHRoaXMsIHRoaXMuX29uTWVzc2FnZSk7XG4gICAgICAgIHdzQ29ubmVjdGlvbi5vbmVycm9yID0gaGl0Y2godGhpcywgdGhpcy5fb25FcnJvcik7XG4gICAgICAgIHdzQ29ubmVjdGlvbi5vbmNsb3NlID0gaGl0Y2godGhpcywgdGhpcy5fb25DbG9zZSk7XG4gICAgICAgIHJldHVybiB3c0Nvbm5lY3Rpb247XG4gICAgfVxuICAgIF9idWlsZEludml0ZVVyaSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRhY3RUb2tlbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkVXJpQmFzZSgpICsgJyZjb250YWN0Q3R4PScgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5fY29udGFjdFRva2VuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9idWlsZFVyaUJhc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfYnVpbGRSZWNvbm5lY3RVcmkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9idWlsZFVyaUJhc2UoKSArICcmY2xpZW50VG9rZW49JyArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLl9jbGllbnRUb2tlbik7XG4gICAgfVxuICAgIF9idWlsZFVyaUJhc2UoKSB7XG4gICAgICAgIHZhciBzZXBhcmF0b3IgPSAnPyc7XG4gICAgICAgIGlmICh0aGlzLl9zaWduYWxpbmdVcmkuaW5kZXhPZihzZXBhcmF0b3IpID4gLTEpIHtcbiAgICAgICAgICAgIHNlcGFyYXRvciA9ICcmJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsaW5nVXJpICsgc2VwYXJhdG9yICsgJ2NhbGxJZD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuX2NhbGxJZCk7XG4gICAgfVxuICAgIF9vbk1lc3NhZ2UoZXZ0KSB7XG4gICAgICAgIHRoaXMuc3RhdGUub25ScGNNc2coSlNPTi5wYXJzZShldnQuZGF0YSkpO1xuICAgIH1cbiAgICBfb25PcGVuKGV2dCkge1xuICAgICAgICB0aGlzLnN0YXRlLm9uT3BlbihldnQpO1xuICAgIH1cbiAgICBfb25FcnJvcihldnQpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5vbkVycm9yKGV2dCk7XG4gICAgfVxuICAgIF9vbkNsb3NlKGV2dCkge1xuICAgICAgICB0aGlzLl9sb2dnZXIubG9nKCdXZWJTb2NrZXQgb25jbG9zZSBjb2RlPScgKyBldnQuY29kZSArICcsIHJlYXNvbj0nICsgZXZ0LnJlYXNvbik7XG4gICAgICAgIHRoaXMuc3RhdGUub25DbG9zZShldnQpO1xuICAgIH1cbiAgICBfcmVjb25uZWN0KCkge1xuICAgICAgICB0aGlzLl93c3MgPSB0aGlzLl9jb25uZWN0V2ViU29ja2V0KHRoaXMuX2J1aWxkUmVjb25uZWN0VXJpKCkpO1xuICAgIH1cbiAgICBpbnZpdGUoc2RwLCBpY2VDYW5kaWRhdGVzKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuaW52aXRlKHNkcCwgaWNlQ2FuZGlkYXRlcyk7XG4gICAgfVxuICAgIGFjY2VwdCgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hY2NlcHQoKTtcbiAgICB9XG4gICAgaGFuZ3VwKCkge1xuICAgICAgICB0aGlzLnN0YXRlLmhhbmd1cCgpO1xuICAgIH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgQW1hem9uLmNvbSwgSW5jLiBvciBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQW1hem9uIFNvZnR3YXJlIExpY2Vuc2UgKHRoZSBcIkxpY2Vuc2VcIikuIFlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gQSBjb3B5IG9mIHRoZSBMaWNlbnNlIGlzIGxvY2F0ZWQgYXRcbiAqXG4gKiAgIGh0dHA6Ly9hd3MuYW1hem9uLmNvbS9hc2wvXG4gKlxuICogb3IgaW4gdGhlIFwiTElDRU5TRVwiIGZpbGUgYWNjb21wYW55aW5nIHRoaXMgZmlsZS4gVGhpcyBmaWxlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBJbGxlZ2FsUGFyYW1ldGVycyB9IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQgeyBzcGxpdFNlY3Rpb25zLCBzcGxpdExpbmVzLCBwYXJzZVJ0cE1hcCwgZ2V0S2luZCwgcGFyc2VSdHBQYXJhbWV0ZXJzLCB3cml0ZUZtdHAgfSBmcm9tICdzZHAnO1xuXG4vKipcbiAqIEFsbCBsb2dnaW5nIG1ldGhvZHMgdXNlZCBieSBjb25uZWN0LXJ0Yy5cbiAqL1xudmFyIGxvZ01ldGhvZHMgPSBbJ2xvZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXTtcblxuLyoqXG4qIEJpbmRzIHRoZSBnaXZlbiBpbnN0YW5jZSBvYmplY3QgYXMgdGhlIGNvbnRleHQgZm9yXG4qIHRoZSBtZXRob2QgcHJvdmlkZWQuXG4qXG4qIEBwYXJhbSBzY29wZSBUaGUgaW5zdGFuY2Ugb2JqZWN0IHRvIGJlIHNldCBhcyB0aGUgc2NvcGVcbiogICAgb2YgdGhlIGZ1bmN0aW9uLlxuKiBAcGFyYW0gbWV0aG9kIFRoZSBtZXRob2QgdG8gYmUgZW5jYXBzdWxhdGVkLlxuKlxuKiBBbGwgb3RoZXIgYXJndW1lbnRzLCBpZiBhbnksIGFyZSBib3VuZCB0byB0aGUgbWV0aG9kXG4qIGludm9jYXRpb24gaW5zaWRlIHRoZSBjbG9zdXJlLlxuKlxuKiBAcmV0dXJuIEEgY2xvc3VyZSBlbmNhcHN1bGF0aW5nIHRoZSBpbnZvY2F0aW9uIG9mIHRoZVxuKiAgICBtZXRob2QgcHJvdmlkZWQgaW4gY29udGV4dCBvZiB0aGUgZ2l2ZW4gaW5zdGFuY2UuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGhpdGNoKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB2YXIgc2NvcGUgPSBhcmdzLnNoaWZ0KCk7XG4gICAgdmFyIG1ldGhvZCA9IGFyZ3Muc2hpZnQoKTtcblxuICAgIGlmICghc2NvcGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxQYXJhbWV0ZXJzKCd1dGlscy5oaXRjaCgpOiBzY29wZSBpcyByZXF1aXJlZCEnKTtcbiAgICB9XG5cbiAgICBpZiAoIW1ldGhvZCkge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFBhcmFtZXRlcnMoJ3V0aWxzLmhpdGNoKCk6IG1ldGhvZCBpcyByZXF1aXJlZCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFBhcmFtZXRlcnMoJ3V0aWxzLmhpdGNoKCk6IG1ldGhvZCBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gX2hpdGNoZWRGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNsb3N1cmVBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseShzY29wZSwgYXJncy5jb25jYXQoY2xvc3VyZUFyZ3MpKTtcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcExvZ2dlcihsb2dnZXIsIGNhbGxJZCwgbG9nQ2F0ZWdvcnkpIHtcbiAgICB2YXIgX2xvZ2dlciA9IHt9O1xuICAgIGxvZ01ldGhvZHMuZm9yRWFjaChmdW5jdGlvbiAobG9nTWV0aG9kKSB7XG4gICAgICAgIGlmICghbG9nZ2VyW2xvZ01ldGhvZF0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTG9nZ2luZyBtZXRob2QgJyArIGxvZ01ldGhvZCArICcgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBfbG9nZ2VyW2xvZ01ldGhvZF0gPSBoaXRjaChsb2dnZXIsIGxvZ2dlcltsb2dNZXRob2RdLCBjYWxsSWQsIGxvZ0NhdGVnb3J5KTtcbiAgICB9KTtcbiAgICByZXR1cm4gX2xvZ2dlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb3NlU3RyZWFtKHN0cmVhbSkge1xuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgICAgdmFyIHRyYWNrcyA9IHN0cmVhbS5nZXRUcmFja3MoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHRyYWNrc1tpXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIGVhdCBleGNlcHRpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIHBhcmFtZXRlciBvZiB0cmFuc2Zvcm1TZHAuXG4gKiBUaGlzIGRlZmluZXMgYWxsIHRoZSBTRFAgb3B0aW9ucyBjb25uZWN0LXJ0Yy1qcyBzdXBwb3J0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNkcE9wdGlvbnMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9mb3JjZUNvZGVjID0ge307XG4gICAgfVxuXG4gICAgZ2V0IGVuYWJsZU9wdXNEdHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbmFibGVPcHVzRHR4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgdHJhbnNmb3JtU2RwIGRpc2FibGVzIGR0eCBmb3IgT1BVUyBjb2RlYy5cbiAgICAgKiBTZXR0aW5nIHRoaXMgdG8gdHJ1ZSB3b3VsZCBmb3JjZSBpdCB0byB0dXJuIG9uIERUWC5cbiAgICAgKi9cbiAgICBzZXQgZW5hYmxlT3B1c0R0eChmbGFnKSB7XG4gICAgICAgIHRoaXMuX2VuYWJsZU9wdXNEdHggPSBmbGFnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIGZyb20gbWVkaWEgdHlwZSAoYXVkaW8vdmlkZW8pIHRvIGNvZGVjIChjYXNlIGluc2Vuc2l0aXZlKS5cbiAgICAgKiBBZGQgZW50cnkgZm9yIGZvcmNlIGNvbm5lY3QtcnRjLWpzIHRvIHVzZSBzcGVjaWZpZWQgY29kZWMgZm9yIGNlcnRhaW4gbWVkaWEgdHlwZS5cbiAgICAgKiBGb3IgZXhhbXBsZTogc2RwT3B0aW9ucy5mb3JjZUNvZGVjWydhdWRpbyddID0gJ29wdXMnO1xuICAgICAqL1xuICAgIGdldCBmb3JjZUNvZGVjKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZm9yY2VDb2RlYztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUZXN0IGlmIGdpdmVuIGNvZGVjIHNob3VsZCBiZSByZW1vdmVkIGZyb20gU0RQLlxuICAgICAqIEBwYXJhbSBtZWRpYVR5cGUgYXVkaW98dmlkZW9cbiAgICAgKiBAcGFyYW0gY29kZWNOYW1lIGNhc2UgaW5zZW5zaXRpdmVcbiAgICAgKiBAcmV0dXJuIFRSVUUgLSBzaG91bGQgcmVtb3ZlXG4gICAgICovXG4gICAgX3Nob3VsZERlbGV0ZUNvZGVjKG1lZGlhVHlwZSwgY29kZWNOYW1lKSB7XG4gICAgICAgIHZhciB1cHBlckNhc2VDb2RlY05hbWUgPSBjb2RlY05hbWUudG9VcHBlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZvcmNlQ29kZWNbbWVkaWFUeXBlXSAmJiB1cHBlckNhc2VDb2RlY05hbWUgIT09IHRoaXMuX2ZvcmNlQ29kZWNbbWVkaWFUeXBlXS50b1VwcGVyQ2FzZSgpICYmIHVwcGVyQ2FzZUNvZGVjTmFtZSAhPT0gJ1RFTEVQSE9ORS1FVkVOVCc7XG4gICAgfVxufVxuXG4vKipcbiAqIE1vZGlmaWVzIGlucHV0IFNEUCBhY2NvcmRpbmcgdG8gc2RwT3B0aW9ucy5cbiAqIFNlZSBTZHBPcHRpb25zIGZvciBhdmFpbGFibGUgb3B0aW9ucy5cbiAqIEBwYXJhbSBzZHAgb3JpZ2luYWwgU0RQXG4gKiBAcGFyYW0gc2RwT3B0aW9ucyBkZWZpbmVzIGNoYW5nZXMgdG8gYmUgYXBwbGllZCB0byBTRFBcbiAqIEByZXR1cm5zIGEgbWFwIHdpdGggJ3NkcCcgY29udGFpbmluZyB0aGUgdHJhbnNmb3JtZWQgU0RQIGFuZCAnbUxpbmVzJyBjb250YWluaW5nIHRoZSBudW1iZXIgb2YgbSBsaW5lcyBpbiBTRFBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVNkcChzZHAsIHNkcE9wdGlvbnMpIHtcbiAgICB2YXIgc2VjdGlvbnMgPSBzcGxpdFNlY3Rpb25zKHNkcCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBzZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbWVkaWFUeXBlID0gZ2V0S2luZChzZWN0aW9uc1tpXSk7XG4gICAgICAgIHZhciBydHBQYXJhbXMgPSBwYXJzZVJ0cFBhcmFtZXRlcnMoc2VjdGlvbnNbaV0pO1xuICAgICAgICAvLyBhIG1hcCBmcm9tIHBheWxvYWQgdHlwZSAoc3RyaW5nKSB0byBjb2RlYyBvYmplY3RcbiAgICAgICAgdmFyIGNvZGVjTWFwID0gcnRwUGFyYW1zLmNvZGVjcy5yZWR1Y2UoKG1hcCwgY29kZWMpID0+IHtcbiAgICAgICAgICAgIG1hcFsnJyArIGNvZGVjLnBheWxvYWRUeXBlXSA9IGNvZGVjO1xuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBzZWN0aW9uc1tpXSA9IHNwbGl0TGluZXMoc2VjdGlvbnNbaV0pLm1hcChsaW5lID0+IHtcbiAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ209JykpIHtcbiAgICAgICAgICAgICAgICAvLyBtb2RpZnkgbT0gbGluZSBpZiBTZHBPcHRpb25zI2ZvcmNlQ29kZWMgc3BlY2lmaWVzIGNvZGVjIGZvciBjdXJyZW50IG1lZGlhIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAoc2RwT3B0aW9ucy5mb3JjZUNvZGVjW21lZGlhVHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldENvZGVjUHRzID0gT2JqZWN0LmtleXMoY29kZWNNYXApLmZpbHRlcihwdCA9PiAhc2RwT3B0aW9ucy5fc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjb2RlY01hcFtwdF0ubmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZS5zdWJzdHJpbmcoMCwgbGluZS5pbmRleE9mKCdVRFAvVExTL1JUUC9TQVZQRiAnKSArICdVRFAvVExTL1JUUC9TQVZQRiAnLmxlbmd0aCkgKyB0YXJnZXRDb2RlY1B0cy5qb2luKCcgJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ2E9cnRwbWFwOicpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ0cE1hcCA9IHBhcnNlUnRwTWFwKGxpbmUpO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q29kZWMgPSBjb2RlY01hcFtydHBNYXAucGF5bG9hZFR5cGVdO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoaXMgY29kZWMgaWYgU2RwT3B0aW9ucyNmb3JjZUNvZGVjIHNwZWNpZmllcyBhIGRpZmZlcmVudCBjb2RlYyBmb3IgY3VycmVudCBtZWRpYSB0eXBlXG4gICAgICAgICAgICAgICAgaWYgKHNkcE9wdGlvbnMuX3Nob3VsZERlbGV0ZUNvZGVjKG1lZGlhVHlwZSwgY3VycmVudENvZGVjLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBhcHBlbmQgYT1mbXRwIGxpbmUgaW1tZWRpYXRlbHkgaWYgY3VycmVudCBjb2RlYyBpcyBPUFVTICh0byBleHBsaWNpdGx5IHNwZWNpZnkgT1BVUyBwYXJhbWV0ZXJzKVxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnT1BVUycpIHsgXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb2RlYy5wYXJhbWV0ZXJzLnVzZWR0eCA9IHNkcE9wdGlvbnMuZW5hYmxlT3B1c0R0eCA/IDEgOiAwO1xuICAgICAgICAgICAgICAgICAgICAvLyBnZW5lcmF0ZSBmbXRwIGxpbmUgaW1tZWRpYXRlbHkgYWZ0ZXIgcnRwbWFwIGxpbmUsIGFuZCByZW1vdmUgb3JpZ2luYWwgZm10cCBsaW5lIG9uY2Ugd2Ugc2VlIGl0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAobGluZSArIFwiXFxyXFxuXCIgKyB3cml0ZUZtdHAoY3VycmVudENvZGVjKSkudHJpbSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdhPWZtdHA6JykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHQgPSBsaW5lLnN1YnN0cmluZygnYT1mbXRwOicubGVuZ3RoLCBsaW5lLmluZGV4T2YoJyAnKSk7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDb2RlYyA9IGNvZGVjTWFwW3B0XTsvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlZGVjbGFyZVxuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoaXMgY29kZWMgaWYgU2RwT3B0aW9ucyNmb3JjZUNvZGVjIHNwZWNpZmllcyBhIGRpZmZlcmVudCBjb2RlYyBmb3IgY3VycmVudCBtZWRpYSB0eXBlXG4gICAgICAgICAgICAgICAgaWYgKHNkcE9wdGlvbnMuX3Nob3VsZERlbGV0ZUNvZGVjKG1lZGlhVHlwZSwgY3VycmVudENvZGVjLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q29kZWMubmFtZS50b1VwcGVyQ2FzZSgpID09PSAnT1BVUycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIGxpbmUgZm9yIE9QVVMsIHJlbW92ZSBpdCBiZWNhdXNlIEZNVFAgbGluZSBpcyBhbHJlYWR5IGdlbmVyYXRlZCB3aGVuIHJ0cG1hcCBsaW5lIGlzIHByb2Nlc3NlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnYT1ydGNwLWZiOicpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHB0ID0gbGluZS5zdWJzdHJpbmcobGluZS5pbmRleE9mKCc6JykgKyAxLCBsaW5lLmluZGV4T2YoJyAnKSk7Ly8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZWRlY2xhcmVcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudENvZGVjID0gY29kZWNNYXBbcHRdOy8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVkZWNsYXJlXG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhpcyBjb2RlYyBpZiBTZHBPcHRpb25zI2ZvcmNlQ29kZWMgc3BlY2lmaWVzIGEgZGlmZmVyZW50IGNvZGVjIGZvciBjdXJyZW50IG1lZGlhIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAoc2RwT3B0aW9ucy5fc2hvdWxkRGVsZXRlQ29kZWMobWVkaWFUeXBlLCBjdXJyZW50Q29kZWMubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZmlsdGVyKGxpbmUgPT4gbGluZSAhPT0gbnVsbCkuam9pbignXFxyXFxuJyk7XG5cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2RwOiBzZWN0aW9ucy5tYXAoc2VjdGlvbiA9PiBzZWN0aW9uLnRyaW0oKSkuam9pbignXFxyXFxuJykgKyAnXFxyXFxuJyxcbiAgICAgICAgbUxpbmVzOiBzZWN0aW9ucy5sZW5ndGggLSAxIC8vIGZpcnN0IHNlY3Rpb24gaXMgc2Vzc2lvbiBkZXNjcmlwdGlvbiwgdGhlIHJlc3QgYXJlIG1lZGlhIGRlc2NyaXB0aW9uc1xuICAgIH07XG59Il19
