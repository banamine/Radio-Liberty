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
                const backupStreams = audio.getAttribute('data-backup-streams');
                const streams = backupStreams ? JSON.parse(backupStreams) : [];
                streams.unshift(audio.src); // Add the primary stream to the beginning of the array

                const tryNextStream = (index) => {
                    if (index >= streams.length) {
                        console.error("All streams failed to load.");
                        alert("All streams failed to load. Check console for details.");
                        return;
                    }

                    const streamUrl = streams[index];
                    audio.src = streamUrl;

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
                                        tryNextStream(index + 1);
                                    });
                            });
                            hls.on(Hls.Events.ERROR, (event, data) => {
                                if (data.fatal) {
                                    console.error(`Fatal error encountered with stream ${streamUrl}:`, data);
                                    tryNextStream(index + 1);
                                }
                            });
                        } else if (audio.canPlayType('application/vnd.apple.mpegurl') || audio.canPlayType('audio/x-mpegurl') || audio.canPlayType('audio/x-ms-wma') || audio.canPlayType('application/xspf+xml') || audio.canPlayType('video/quicktime')) {
                            audio.play()
                                .then(() => {
                                    icon.setAttribute('name', 'pause-circle-fill');
                                    button.textContent = 'Pause';
                                })
                                .catch(error => {
                                    console.error(`Error playing stream ${streamUrl}:`, error);
                                    tryNextStream(index + 1);
                                });
                        } else {
                            console.error(`Stream format not supported for ${streamUrl}`);
                            tryNextStream(index + 1);
                        }
                    } else {
                        audio.play()
                            .then(() => {
                                icon.setAttribute('name', 'pause-circle-fill');
                                button.textContent = 'Pause';
                            })
                            .catch(error => {
                                console.error(`Error playing stream ${streamUrl}:`, error);
                                tryNextStream(index + 1);
                            });
                    }
                };

                tryNextStream(0);
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
