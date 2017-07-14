$(document).ready(function () {
    var audioElement = $('#remoteAudio')[0];
    var videoElement = document.getElementById('remoteVideo');

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

        session.remoteVideoElement = videoElement;

        session.forceAudioCodec = 'OPUS';

        // enable video with 480p requested.
        session.enableVideo = true;

        session.videoWidth = 854;

        session.videoHeight = 480;

        var statsCollector;
        session.onSessionConnected = () => {
            statsCollector = setInterval(() => {
                var collectTime = new Date();
                Promise.all([session.getUserAudioStats(), session.getRemoteAudioStats()]).then((streamStats) => {
                   console.log(collectTime, JSON.stringify(streamStats));
                });
                Promise.all([session.getUserAudioStats(), session.getRemoteAudioStats()]).then((streamStats) => {
                    console.log(collectTime, JSON.stringify(streamStats));
                });
            }, 2000);
        };
        session.onSessionCompleted = () => {
            if (statsCollector) {
                clearInterval(statsCollector);
                statsCollector = null;
            }
        };

        $('#makeCall').prop('disabled', true);
        $('#echoCancellationOption').prop('disabled', true);
        $('#disconnectCall').prop('disabled', false);

        $('#disconnectCall').click(function () {
            if (session) {
                try {
                    session.hangup();
                } finally {
                    $('#makeCall').prop('disabled', false);
                    $('#echoCancellationOption').prop('disabled', false);
                    $('#disconnectCall').prop('disabled', true);
                }
            }
        });

        session.connect();
    });
});
