document.addEventListener('DOMContentLoaded', () => {
    const nowPlayingTitle = document.getElementById('now-playing-title');
    const currentTimeElement = document.getElementById('current-time');
    
    let audioContext;
    let analyser;
    let dataArray;
    let animationId;
    const sourceNodes = new Map();

    // Clock Logic
    setInterval(() => {
        const now = new Date();
        currentTimeElement.textContent = now.toTimeString().split(' ')[0];
    }, 1000);

    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.connect(audioContext.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
    }

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

    // Function to reset all buttons and audio
    function stopAllAudio() {
        document.querySelectorAll('.audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        document.querySelectorAll('.play-radio').forEach(btn => {
            btn.textContent = 'Play';
            btn.variant = 'primary';
            // Reset the icon manually if needed
            const icon = btn.querySelector('sl-icon');
            if (icon) icon.name = 'play-circle-fill';
        });
        cancelAnimationFrame(animationId);
        // Clear all visualizers
        document.querySelectorAll('.visualizer').forEach(v => {
            const ctx = v.getContext('2d');
            ctx.clearRect(0, 0, v.width, v.height);
        });
    }

    // Play/Pause Button Logic
    document.querySelectorAll('.play-radio').forEach(button => {
        button.addEventListener('click', async () => {
            const card = button.closest('.card-container');
            const audio = card.querySelector('.audio');
            const visualizer = card.querySelector('.visualizer');
            const title = button.getAttribute('data-title');

            initAudioContext();
            if (audioContext.state === 'suspended') await audioContext.resume();

            if (audio.paused) {
                stopAllAudio(); // Stop others before playing new one

                if (!sourceNodes.has(audio)) {
                    const source = audioContext.createMediaElementSource(audio);
                    source.connect(analyser);
                    sourceNodes.set(audio, source);
                }

                audio.play().then(() => {
                    button.textContent = 'Pause';
                    button.variant = 'warning';
                    nowPlayingTitle.textContent = title;
                    draw(visualizer);
                }).catch(e => console.error("Stream Blocked:", e));
            } else {
                audio.pause();
                button.textContent = 'Play';
                button.variant = 'primary';
                cancelAnimationFrame(animationId);
            }
        });
    });

    // NEW: Stop Button Logic
    document.querySelectorAll('.stop-radio').forEach(button => {
        button.addEventListener('click', () => {
            stopAllAudio();
            nowPlayingTitle.textContent = "None";
        });
    });

    // Volume Handling
    document.querySelectorAll('.volume-control').forEach(slider => {
        slider.addEventListener('sl-input', (e) => {
            const audio = e.target.closest('.card-container').querySelector('.audio');
            audio.volume = e.target.value / 100;
        });
    });
});
