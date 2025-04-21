var video = document.getElementById('video');

function playM3u8(url) {
    if (Hls.isSupported()) {
        video.volume = 0.3;
        var hls = new Hls({
            xhrSetup: function(xhr, url) {
                xhr.withCredentials = false;
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
            },
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        
        var m3u8Url = decodeURIComponent(url);
        if (m3u8Url.startsWith('http://')) {
            m3u8Url += (m3u8Url.indexOf('?') === -1 ? '?' : '&') + '_=' + new Date().getTime();
        }
        
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.log('网络错误，尝试重新加载');
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log('媒体错误，尝试恢复');
                        hls.recoverMediaError();
                        break;
                    default:
                        console.log('无法恢复的错误');
                        hls.destroy();
                        break;
                }
            }
        });
        document.title = url;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (url.startsWith('http://')) {
            url = 'https://cors-anywhere.herokuapp.com/' + url;
        }
        video.src = url;
        video.addEventListener('canplay', function () {
            video.play();
        });
        video.volume = 0.3;
        document.title = url;
    }
}

function playPause() {
    video.paused ? video.play() : video.pause();
}

function volumeUp() {
    if (video.volume <= 0.9) video.volume += 0.1;
}

function volumeDown() {
    if (video.volume >= 0.1) video.volume -= 0.1;
}

function seekRight() {
    video.currentTime += 5;
}

function seekLeft() {
    video.currentTime -= 5;
}

function toggleMute() {
    video.muted = !video.muted;
}

function vidFullscreen() {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    }
}

playM3u8(window.location.href.split('#')[1]);
$(window).on('load', function () {
    $('#video').on('click', function () {
        this.paused ? this.play() : this.pause();
    });
    Mousetrap.bind('space', playPause);
    Mousetrap.bind('up', volumeUp);
    Mousetrap.bind('down', volumeDown);
    Mousetrap.bind('right', seekRight);
    Mousetrap.bind('left', seekLeft);
    Mousetrap.bind('f', vidFullscreen);
    Mousetrap.bind('m', toggleMute);
});