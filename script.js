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
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyser.connect(audioContext.destination);
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }
        } catch (e) {
            console.error("AudioContext failed:", e);
        }
    }

    function draw(visualizer) {
        if (!analyser) return;
        animationId = requestAnimationFrame(() => draw(visualizer));
        analyser.getByteFrequencyData(dataArray);
        const ctx = visualizer.getContext('2d');
        ctx.clearRect(0, 0, visualizer.width, visualizer.height);

        const barWidth = (visualizer.width / dataArray.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(0, 255, 0)`; 
            ctx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    function stopAllAudio() {
        cancelAnimationFrame(animationId);
        document.querySelectorAll('.audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        document.querySelectorAll('.play-radio').forEach(btn => {
            btn.innerHTML = `<sl-icon slot="prefix" name="play-circle-fill"></sl-icon> Play`;
            btn.variant = 'primary';
        });

        document.querySelectorAll('.visualizer').forEach(v => {
            v.getContext('2d').clearRect(0, 0, v.width, v.height);
        });
    }

    // Listener for Play/Stop Buttons
    document.body.addEventListener('click', async (e) => {
        const playBtn = e.target.closest('.play-radio');
        const stopBtn = e.target.closest('.stop-radio');

        if (playBtn) {
            const card = playBtn.closest('.card-container');
            const audio = card.querySelector('.audio');
            const visualizer = card.querySelector('.visualizer');
            const title = playBtn.getAttribute('data-title');

            initAudioContext();
            if (audioContext.state === 'suspended') await audioContext.resume();

            if (audio.paused) {
                stopAllAudio();
                if (!sourceNodes.has(audio)) {
                    const source = audioContext.createMediaElementSource(audio);
                    source.connect(analyser);
                    sourceNodes.set(audio, source);
                }
                audio.play().then(() => {
                    playBtn.innerHTML = `<sl-icon slot="prefix" name="pause-circle-fill"></sl-icon> Pause`;
                    playBtn.variant = 'warning';
                    nowPlayingTitle.textContent = title;
                    draw(visualizer);
                }).catch(err => console.error("Playback failed:", err));
            } else {
                audio.pause();
                playBtn.innerHTML = `<sl-icon slot="prefix" name="play-circle-fill"></sl-icon> Play`;
                playBtn.variant = 'primary';
            }
        }

        if (stopBtn) {
            stopAllAudio();
            nowPlayingTitle.textContent = "None";
        }
    });

    // Stream Selector Logic (The Fix for the dropdown)
    document.querySelectorAll('.stream-selector').forEach(selector => {
        selector.addEventListener('sl-change', (e) => {
            const card = selector.closest('.card-container');
            const audio = card.querySelector('.audio');
            audio.src = e.target.value;
            stopAllAudio();
        });
    });
});
