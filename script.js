document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioElements = {};

    document.querySelectorAll('.play-radio').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card-container');
            const audioElement = card.querySelector('audio');
            const icon = button.querySelector('sl-icon');
            const volumeControl = card.querySelector('.volume-control');
            const audioSrc = audioElement.src;

            if (audioElement.paused) {
                if (audioSrc.includes('.m3u')) {
                    if (Hls.isSupported()) {
                        if (!audioElements[audioSrc]) {
                            const hls = new Hls();
                            hls.loadSource(audioSrc);
                            const audio = new Audio();
                            hls.attachMedia(audio);
                            audioElements[audioSrc] = { hls: hls, audio: audio };
                        }

                        const audioObj = audioElements[audioSrc];
                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            const source = audioContext.createMediaElementSource(audioObj.audio);
                            source.connect(audioContext.destination);
                            audioObj.audio.play()
                                .then(() => {
                                    icon.setAttribute('name', 'pause-circle-fill');
                                    button.textContent = 'Pause';
                                })
                                .catch(error => {
                                    console.error("Error playing audio:", error);
                                    alert("Error playing stream. Check console for details.");
                                });
                        });
                    } else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
                        audioElement.play()
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
                    if (!audioElements[audioSrc]) {
                        const audio = new Audio(audioSrc);
                        audioElements[audioSrc] = audio;
                    }

                    const audioObj = audioElements[audioSrc];
                    const source = audioContext.createMediaElementSource(audioObj);
                    source.connect(audioContext.destination);
                    audioObj.play()
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
                if (audioElements[audioSrc]) {
                    audioElements[audioSrc].pause();
                } else {
                    audioElement.pause();
                }
                icon.setAttribute('name', 'play-circle-fill');
                button.textContent = 'Play';
            }

            volumeControl.addEventListener('sl-change', () => {
                if (audioElements[audioSrc]) {
                    audioElements[audioSrc].volume = volumeControl.value / 100;
                } else {
                    audioElement.volume = volumeControl.value / 100;
                }
            });

            if (audioElements[audioSrc]) {
                audioElements[audioSrc].volume = volumeControl.value / 100;
            } else {
                audioElement.volume = volumeControl.value / 100;
            }
        });
    });
});
