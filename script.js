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

    function stopAllAudio() {
        cancelAnimationFrame(animationId);
        document.querySelectorAll('.audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
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

    // Stream Selector Logic
    document.querySelectorAll('.stream-selector').forEach(selector => {
        selector.addEventListener('sl-change', (e) => {
            const card = selector.closest('.card-container');
            const audio = card.querySelector('.audio');
            audio.src = e.target.value;
            stopAllAudio();
            nowPlayingTitle.textContent = "None";
        });
    });

    // Play/Stop Button logic remains similar to previous version...
    // [Insert previous play/stop/volume listeners here]
});
