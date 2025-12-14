document.addEventListener('DOMContentLoaded', () => {
    // Play/Pause Logic
    document.querySelectorAll('.play-radio').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card-container');
            const audio = card.querySelector('audio');
            const icon = button.querySelector('sl-icon');
            const volumeControl = card.querySelector('.volume-control');

            if (audio.paused) {
                if (audio.src.endsWith('.m3u') || audio.src.endsWith('.m3u8')) {
                    // Use HLS.js for .m3u streams
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(audio.src);
                        hls.attachMedia(audio);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => audio.play());
                    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                        audio.play();
                    }
                } else {
                    audio.play();
                }
                icon.setAttribute('name', 'pause-circle-fill');
                button.textContent = 'Pause';
            } else {
                audio.pause();
                icon.setAttribute('name', 'play-circle-fill');
                button.textContent = 'Play';
            }

            // Volume Control
            volumeControl.addEventListener('sl-change', () => {
                audio.volume = volumeControl.value / 100;
            });
            audio.volume = volumeControl.value / 100;
        });
    });
});
