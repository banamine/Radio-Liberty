/**
 * Radio Liberty Core Logic
 * Handles Web Audio API, Visualizations, and Stream Controls
 */

document.addEventListener('DOMContentLoaded', () => {
    const nowPlayingTitle = document.getElementById('now-playing-title');
    const currentTimeElement = document.getElementById('current-time');
    
    let audioContext;
    let analyser;
    let dataArray;
    let animationId;
    const sourceNodes = new Map();

    // 1. Clock Logic
    setInterval(() => {
        const now = new Date();
        currentTimeElement.textContent = now.toTimeString().split(' ')[0];
    }, 1000);

    // 2. Audio Context Initialization (User-gesture required)
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.connect(audioContext.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
    }

    // 3. Visualization Rendering
    function draw(visualizer) {
        animationId = requestAnimationFrame(() => draw(visualizer));
        analyser.getByteFrequencyData(dataArray);
        const ctx = visualizer.getContext('2d');
        ctx.clearRect(0, 0, visualizer.width, visualizer.height);

        const barWidth = (visualizer.width / dataArray.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(${barHeight + 100}, 255, 0)`; 
            ctx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    // 4. Unified Stop Function
    function stopAllAudio() {
        cancelAnimationFrame(animationId);
        document.querySelectorAll('.audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0; // Reset stream
        });

        document.querySelectorAll('.play-radio').forEach(btn => {
            btn.textContent = 'Play';
            btn.variant = 'primary';
            const icon = btn.querySelector('sl-icon');
            if (icon) icon.name = 'play-circle-fill';
        });

        document.querySelectorAll('.visualizer').forEach(v => {
            v.getContext('2d').clearRect(0, 0, v.width, v.height);
        });
    }

    // 5. Alert System for Error Handling
    function notifyError(title, message) {
        const alert = Object.assign(document.createElement('sl-alert'), {
            variant: 'danger',
            closable: true,
            duration: 8000,
            innerHTML: `
                <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
                <strong>${title} Offline:</strong> ${message}
            `
        });
        document.body.append(alert);
        alert.toast();
    }

    // 6. Play/Pause Listener
    document.querySelectorAll('.play-radio').forEach(button => {
        const card = button.closest('.card-container');
        const audio = card.querySelector('.audio');
        const visualizer = card.querySelector('.visualizer');
        const title = button.getAttribute('data-title');

        // Attach error listener once
        audio.addEventListener('error', (e) => {
            notifyError(title, "The stream could not be loaded or was interrupted.");
            stopAllAudio();
            nowPlayingTitle.textContent = "None";
        });

        button.addEventListener('click', async () => {
            initAudioContext();
            if (audioContext.state === 'suspended') await audioContext.resume();

            if (audio.paused) {
                stopAllAudio(); // Clear previous station

                if (!sourceNodes.has(audio)) {
                    const source = audioContext.createMediaElementSource(audio);
                    source.connect(analyser);
                    sourceNodes.set(audio, source);
                }

                audio.play().then(() => {
                    button.textContent = 'Pause';
                    button.variant = 'warning';
                    const icon = button.querySelector('sl-icon');
                    if (icon) icon.name = 'pause-circle-fill';
                    
                    nowPlayingTitle.textContent = title;
                    draw(visualizer);
                }).catch(err => {
                    notifyError(title, "Playback blocked. Please check your connection.");
                });
            } else {
                audio.pause();
                button.textContent = 'Play';
                button.variant = 'primary';
                const icon = button.querySelector('sl-icon');
                if (icon) icon.name = 'play-circle-fill';
                cancelAnimationFrame(animationId);
            }
        });
    });

    // 7. Stop Button Listener
    document.querySelectorAll('.stop-radio').forEach(button => {
        button.addEventListener('click', () => {
            stopAllAudio();
            nowPlayingTitle.textContent = "None";
        });
    });

    // 8. Volume Control (sl-input for Shoelace)
    document.querySelectorAll('.volume-control').forEach(slider => {
        slider.addEventListener('sl-input', (e) => {
            const audio = e.target.closest('.card-container').querySelector('.audio');
            audio.volume = e.target.value / 100;
        });
    });
});
