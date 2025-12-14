document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio playback for all radio cards
    document.querySelectorAll('.play-radio').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card-container');
            if (!card) return;

            const audio = card.querySelector('audio');
            if (!audio) return;

            const icon = button.querySelector('sl-icon');
            if (!icon) return;

            const volumeControl = card.querySelector('.volume-control');
            if (!volumeControl) return;

            if (audio.paused) {
                const streamUrl = audio.src;

                if (streamUrl.includes('.m3u') || streamUrl.includes('.pls') || streamUrl.includes('.asx') || streamUrl.includes('.xspf') || streamUrl.includes('.qtl')) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(streamUrl);
                        hls.attachMedia(audio);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            audio.play()
                                .then(() => {
                                    icon.setAttribute('name', 'pause-circle-fill');
                                    button.textContent = 'Pause';
                                })
                                .catch(error => {
                                    console.error(`Error playing stream ${streamUrl}:`, error);
                                    alert(`Error playing stream. Check console for details.`);
                                });
                        });
                        hls.on(Hls.Events.ERROR, (event, data) => {
                            if (data.fatal) {
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.error(`Fatal network error encountered with stream ${streamUrl}:`, data);
                                        hls.startLoad();
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.error(`Fatal media error encountered with stream ${streamUrl}:`, data);
                                        hls.recoverMediaError();
                                        break;
                                    default:
                                        console.error(`Fatal error encountered with stream ${streamUrl}:`, data);
                                        alert(`Fatal error playing stream. Check console for details.`);
                                        break;
                                }
                            }
                        });
                    } else if (audio.canPlayType('application/vnd.apple.mpegurl') ||
                               audio.canPlayType('audio/x-mpegurl') ||
                               audio.canPlayType('audio/x-ms-wma') ||
                               audio.canPlayType('application/xspf+xml') ||
                               audio.canPlayType('video/quicktime')) {
                        audio.play()
                            .then(() => {
                                icon.setAttribute('name', 'pause-circle-fill');
                                button.textContent = 'Pause';
                            })
                            .catch(error => {
                                console.error(`Error playing stream ${streamUrl}:`, error);
                                alert(`Error playing stream. Check console for details.`);
                            });
                    } else {
                        alert(`Stream format not supported for ${streamUrl}`);
                    }
                } else {
                    // Standard audio playback
                    audio.play()
                        .then(() => {
                            icon.setAttribute('name', 'pause-circle-fill');
                            button.textContent = 'Pause';
                        })
                        .catch(error => {
                            console.error(`Error playing stream ${streamUrl}:`, error);
                            alert(`Error playing stream. Check console for details.`);
                        });
                }
            } else {
                audio.pause();
                icon.setAttribute('name', 'play-circle-fill');
                button.textContent = 'Play';
            }

            // Volume Control
            volumeControl.addEventListener('sl-change', () => {
                if (audio) {
                    audio.volume = volumeControl.value / 100;
                }
            });

            if (audio) {
                audio.volume = volumeControl.value / 100;
            }
        });
    });
});
