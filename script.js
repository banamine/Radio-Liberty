document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio playback for all radio cards
    document.querySelectorAll('.play-radio').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card-container');
            const audio = card.querySelector('audio');
            const icon = button.querySelector('sl-icon');
            const volumeControl = card.querySelector('.volume-control');

            if (audio.paused) {
                if (audio.src.includes('.m3u')) {
                    // Use HLS.js for .m3u streams
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(audio.src);
                        hls.attachMedia(audio);
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            audio.play()
                                .then(() => {
                                    icon.setAttribute('name', 'pause-circle-fill');
                                    button.textContent = 'Pause';
                                })
                                .catch(error => {
                                    console.error("Error playing audio:", error);
                                    alert("Error playing stream. Check console for details.");
                                });
                        });
                    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native HLS support (Safari)
                        audio.play()
                            .then(() => {
                                icon.setAttribute('name', 'pause-circle-fill');
                                button.textContent = 'Pause';
                            })
                            .catch(error => {
                                console.error("Error playing audio:", error);
                                alert("Error playing stream. Check console for details.");
                            });
                    } else {
                        alert("HLS is not supported in your browser.");
                    }
                } else {
                    // Standard audio playback
                    audio.play()
                        .then(() => {
                            icon.setAttribute('name', 'pause-circle-fill');
                            button.textContent = 'Pause';
                        })
                        .catch(error => {
                            console.error("Error playing audio:", error);
                            alert("Error playing stream. Check console for details.");
                        });
                }
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
