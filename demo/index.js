$(document).ready(function () {
    var audioElement = $('#remoteAudio')[0];
    var videoElement = $('#remoteVideo')[0];
    var playFromFile = false;

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

        if ($('#enable-video')[0].checked) {
          $('#video-display')[0].style.display = 'block';
          session.remoteVideoElement = videoElement;
          // enable video with 480p requested.
          session.enableVideo = true;
          session.maxVideoWidth = 480;
          session.maxVideoHeight = 360;
        } else {
          $('#video-display')[0].style.display = 'none';
          session.remoteVideoElement = null;
        }

        if (playFromFile){
            var fileToPlay = $('#fileInput')[0].files[0];
            var audioToPlay = new Audio(URL.createObjectURL(fileToPlay));
            var fileStream = audioToPlay.captureStream();
            var context = new AudioContext();
            var source = context.createMediaElementSource(audioToPlay);
            var remote = context.createMediaStreamDestination();
            source.connect(remote);
            session.mediaStream = remote.stream;
        }

        var statsCollector;
        session.onSessionConnected = () => {
            statsCollector = setInterval(() => {
                var collectTime = new Date();
                Promise.all([session.getUserAudioStats(), session.getRemoteAudioStats()]).then((streamStats) => {
                    console.log(collectTime, JSON.stringify(streamStats));
                });
            }, 2000);

            if (playFromFile){
                console.log("Playing file");
                audioToPlay.play();
            }
        };
        session.onSessionCompleted = () => {
            if (statsCollector) {
                clearInterval(statsCollector);
                statsCollector = null;
            }
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
        session.connect();
    });
    $('#playFile').click(function(){
        playFromFile = true;
    });
});
