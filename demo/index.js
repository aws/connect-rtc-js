$(document).ready(function () {
    var audioElement = $('#remoteAudio')[0];
    var videoElement = $('#remoteVideo')[0];

    if (window.location.hash) {
        $('#softphoneMediaInfo').val(decodeURIComponent(window.location.hash.substr(1)));
    }

    $('#makeCall').click(function () {
        var mediaInfo = JSON.parse($('#softphoneMediaInfo').val());
        var rtcConfig = mediaInfo.webcallConfig || JSON.parse(mediaInfo.callConfigJson);//mediaInfo.webcallConfig is used internally by Amazon Connect team only
        var session = new connect.RTCSession(rtcConfig.signalingEndpoint,
            rtcConfig.iceServers,
            mediaInfo.callContextToken,
            console);

        session.echoCancellation = $('#echoCancellationOption').is(':checked');

        session.remoteAudioElement = audioElement;

        session.forceAudioCodec = 'OPUS';

        // Set video codec if it presents
        var forceVideoCodec = $('#forced-video-codec option:selected').val();
        if (forceVideoCodec !== 'NONE') {
            session.forceVideoCodec = forceVideoCodec;
        }

        if ($('#enable-video')[0].checked) {
          $('#video-display')[0].style.display = 'block';
          session.remoteVideoElement = videoElement;
          // enable video with 240p requested.
          session.enableVideo = true;
          session.maxVideoWidth = 426;
          session.maxVideoHeight = 240;
        } else {
          $('#video-display')[0].style.display = 'none';
          session.remoteVideoElement = null;
        }

        var statsCollector;
        session.onSessionConnected = () => {
            statsCollector = setInterval(() => {
                var collectTime = new Date();
                Promise.all([session.getUserAudioStats(), session.getRemoteAudioStats()]).then((streamStats) => {
                    console.log(collectTime + " Audio statistics : " + JSON.stringify(streamStats));
                });
                if ($('#enable-video')[0].checked) {
                    Promise.all([session.getUserVideoStats(), session.getRemoteVideoStats()]).then((streamStats) => {
                        console.log(collectTime + " Video statistics : " + JSON.stringify(streamStats));
                    });
                }
            }, 2000);
        };
        session.onSessionCompleted = () => {
            if (statsCollector) {
                clearInterval(statsCollector);
                statsCollector = null;
            }
        };

        session.onSessionDestroyed = (s, report) => {
            console.log('Session report : ' + JSON.stringify(report));
        };

        $('#makeCall').prop('disabled', true);
        $('#echoCancellationOption').prop('disabled', true);
        $('#enable-video').prop('disabled', true);
        $('#disconnectCall').prop('disabled', false);

        $('#disconnectCall').click(function () {
            if (session) {
                try {
                    session.hangup();
                } finally {
                    $('#makeCall').prop('disabled', false);
                    $('#echoCancellationOption').prop('disabled', false);
                    $('#enable-video').prop('disabled', false);
                    $('#disconnectCall').prop('disabled', true);
                    audioElement.src = null;
                    videoElement.src = null;
                }
            }
        });

        $('#pause-local-video').click(function(){
            if(session) {
                if($('#pause-local-video').is(':checked'))
                    session.pauseLocalVideo();
                else {
                    session.resumeLocalVideo();
                }
            }
        });

        $('#pause-remote-video').click(function(){
            if(session) {
                if($('#pause-remote-video').is(':checked'))
                    session.pauseRemoteVideo();
                else {
                    session.resumeRemoteVideo();
                }
            }
        });

        $('#pause-local-audio').click(function(){
            if(session) {
                if($('#pause-local-audio').is(':checked'))
                    session.pauseLocalAudio();
                else {
                    session.resumeLocalAudio();
                }
            }
        });

        $('#pause-remote-audio').click(function(){
            if(session) {
                if($('#pause-remote-audio').is(':checked'))
                    session.pauseRemoteAudio();
                else {
                    session.resumeRemoteAudio();
                }
            }
        });

        session.connect();
    });
});
