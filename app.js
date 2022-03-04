(function () {
    'use strict';

    var supportsVideo = !!document.createElement('video').canPlayType;

    if (supportsVideo) {
        // Obtain handles to main elements
        var videoContainer = document.getElementById('videoContainer');
        var video = document.getElementById('video');
        var videoControls = document.getElementById('video-controls');

        // Hide the default controls
        video.controls = false;

        // Display the user defined video controls
        videoControls.setAttribute('data-state', 'visible');

        // Obtain handles to buttons and other elements
        var playpause = document.getElementById('playpause');
        var stop = document.getElementById('stop');
        var mute = document.getElementById('mute');
        var volinc = document.getElementById('volinc');
        var voldec = document.getElementById('voldec');
        var progress = document.getElementById('progress');
        var progressBar = document.getElementById('progress-bar');
        var fullscreen = document.getElementById('fs');

        var supportsProgress = (document.createElement('progress').max !== undefined);
        if (!supportsProgress) progress.setAttribute('data-state', 'fake');

        var fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

        if (!fullScreenEnabled) {
            fullscreen.style.display = 'none';
        }

        // Check the volume
        var checkVolume = function (dir) {
            if (dir) {
                var currentVolume = Math.floor(video.volume * 10) / 10;
                if (dir === '+') {
                    if (currentVolume < 1) video.volume += 0.1;
                }
                else if (dir === '-') {
                    if (currentVolume > 0) video.volume -= 0.1;
                }

                if (currentVolume <= 0) video.muted = true;
                else video.muted = false;
            }
            changeButtonState('mute');
        }

        // Change the volume
        var alterVolume = function (dir) {
            checkVolume(dir);
        }

        // Set the video container's fullscreen state
        var setFullscreenData = function (state) {
            videoContainer.setAttribute('data-fullscreen', !!state);
            // Set the fullscreen button's 'data-state' which allows the correct button image to be set via CSS
            fullscreen.setAttribute('data-state', !!state ? 'cancel-fullscreen' : 'go-fullscreen');
        }

        // Checks if the document is currently in fullscreen mode
        var isFullScreen = function () {
            return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
        }

        // Fullscreen
        var handleFullscreen = function () {
            if (isFullScreen()) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
                setFullscreenData(false);
            }
            else {

                if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
                else if (videoContainer.mozRequestFullScreen) videoContainer.mozRequestFullScreen();
                else if (videoContainer.webkitRequestFullScreen) {

                    video.webkitRequestFullScreen();
                }
                else if (videoContainer.msRequestFullscreen) videoContainer.msRequestFullscreen();
                setFullscreenData(true);
            }
        }

        // Only add the events if addEventListener is supported (IE8 and less don't support it, but that will use Flash anyway)
        if (document.addEventListener) {
            // Wait for the video's meta data to be loaded, then set the progress bar's max value to the duration of the video
            video.addEventListener('loadedmetadata', function () {
                progress.setAttribute('max', video.duration);
            });

            // Changes the button state of certain button's so the correct visuals can be displayed with CSS
            var changeButtonState = function (type) {
                // Play/Pause button
                if (type == 'playpause') {
                    if (video.paused || video.ended) {
                        playpause.setAttribute('data-state', 'play');
                    }
                    else {
                        playpause.setAttribute('data-state', 'pause');
                    }
                }
                // Mute button
                else if (type == 'mute') {
                    mute.setAttribute('data-state', video.muted ? 'unmute' : 'mute');
                }
            }

            // Add event listeners for video specific events
            video.addEventListener('play', function () {
                changeButtonState('playpause');
            }, false);
            video.addEventListener('pause', function () {
                changeButtonState('playpause');
            }, false);
            video.addEventListener('volumechange', function () {
                checkVolume();
            }, false);

            // Add events for all buttons			
            playpause.addEventListener('click', function (e) {
                if (video.paused || video.ended) video.play();
                else video.pause();
            });

            // The Media API has no 'stop()' function, so pause the video and reset its time and the progress bar
            stop.addEventListener('click', function (e) {
                video.pause();
                video.currentTime = 0;
                progress.value = 0;

                changeButtonState('playpause');
            });
            mute.addEventListener('click', function (e) {
                video.muted = !video.muted;
                changeButtonState('mute');
            });
            volinc.addEventListener('click', function (e) {
                alterVolume('+');
            });
            voldec.addEventListener('click', function (e) {
                alterVolume('-');
            });
            fs.addEventListener('click', function (e) {
                handleFullscreen();
            });

            video.addEventListener('timeupdate', function () {
                if (!progress.getAttribute('max')) progress.setAttribute('max', video.duration);
                progress.value = video.currentTime;
                progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
            });

            progress.addEventListener('click', function (e) {
                var pos = (e.pageX - (this.offsetLeft + this.offsetParent.offsetLeft)) / this.offsetWidth;
                video.currentTime = pos * video.duration;
            });

            document.addEventListener('fullscreenchange', function (e) {
                setFullscreenData(!!(document.fullScreen || document.fullscreenElement));
            });
            document.addEventListener('webkitfullscreenchange', function () {
                setFullscreenData(!!document.webkitIsFullScreen);
            });
            document.addEventListener('mozfullscreenchange', function () {
                setFullscreenData(!!document.mozFullScreen);
            });
            document.addEventListener('msfullscreenchange', function () {
                setFullscreenData(!!document.msFullscreenElement);
            });
        }
    }

})();