document.addEventListener('DOMContentLoaded', () => {
    const nowPlayingTitle = document.getElementById('now-playing-title');
    const currentTimeElement = document.getElementById('current-time');
    let currentAudio = null;
    let currentVisualizer = null;
    let audioContext;
    let analyser;
    let dataArray;
    let animationId;

    // Update the clock
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Initialize audio playback for all radio cards
    document.querySelectorAll('.play-radio').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card-container');
            if (!card) return;

            const audio = card.querySelector('audio');
            if (!audio) return;

            const icon = button.querySelector('sl-icon');
            if (!icon) return;

            const visualizer = card.querySelector('.visualizer');
            if (!visualizer) return;

            const volumeControl = card.querySelector('.volume-control');
            if (!volumeControl) return;

            const title = button.getAttribute('data-title');

            // Stop any currently playing audio
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                const currentButton = currentAudio.closest('.card-container').querySelector('.play-radio');
                if (currentButton) {
                    const currentIcon = currentButton.querySelector('sl-icon');
                    if (currentIcon) {
                        currentIcon.setAttribute('name', 'play-circle-fill');
                        currentButton.textContent = 'Play';
                    }
                }
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            }

            if (audio.paused) {
                // Resume the audio context if it's suspended
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume();
                }

                audio.play()
                    .then(() => {
                        if (icon) {
                            icon.setAttribute('name', 'pause-circle-fill');
                            button.textContent = 'Pause';
                        }
                        if (nowPlayingTitle) {
                            nowPlayingTitle.textContent = title;
                        }
                        currentAudio = audio;
                        currentVisualizer = visualizer;

                        // Setup audio visualizer
                        if (!audioContext) {
                            audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        }

                        if (audioContext.state === 'suspended') {
                            audioContext.resume();
                        }

                        analyser = audioContext.createAnalyser();
                        const source = audioContext.createMediaElementSource(audio);
                        source.connect(analyser);
                        analyser.connect(audioContext.destination);
                        analyser.fftSize = 256;
                        const bufferLength = analyser.frequencyBinCount;
                        dataArray = new Uint8Array(bufferLength);

                        function draw() {
                            animationId = requestAnimationFrame(draw);
                            analyser.getByteFrequencyData(dataArray);
                            const ctx = visualizer.getContext('2d');
                            ctx.fillStyle = 'rgb(0, 0, 0)';
                            ctx.fillRect(0, 0, visualizer.width, visualizer.height);

                            const barWidth = (visualizer.width / bufferLength) * 2.5;
                            let x = 0;

                            for (let i = 0; i < bufferLength; i++) {
                                const barHeight = dataArray[i] / 2;
                                ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                                ctx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
                                x += barWidth + 1;
                            }
                        }
                        draw();
                    })
                    .catch(error => {
                        console.error("Error playing audio:", error);
                        alert("Error playing stream. Check console for details.");
                    });
            } else {
                audio.pause();
                if (icon) {
                    icon.setAttribute('name', 'play-circle-fill');
                    button.textContent = 'Play';
                }
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
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

    // Stop buttons
    document.querySelectorAll('.stop-radio').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card-container');
            if (!card) return;

            const audio = card.querySelector('audio');
            if (!audio) return;

            const playButton = card.querySelector('.play-radio');
            if (!playButton) return;

            const icon = playButton.querySelector('sl-icon');
            if (!icon) return;

            audio.pause();
            audio.currentTime = 0;
            icon.setAttribute('name', 'play-circle-fill');
            playButton.textContent = 'Play';
            if (nowPlayingTitle) {
                nowPlayingTitle.textContent = 'None';
            }
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        });
    });

    // Handle user interaction to resume audio context
    document.addEventListener('click', () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
});
