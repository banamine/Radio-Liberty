// Add this inside your DOMContentLoaded listener
document.querySelectorAll('.stream-selector').forEach(selector => {
    selector.addEventListener('sl-change', (event) => {
        const card = selector.closest('.card-container');
        const audio = card.querySelector('.audio');
        const playBtn = card.querySelector('.play-radio');
        
        // 1. Stop current playback
        const wasPlaying = !audio.paused;
        audio.pause();
        
        // 2. Update the source to the new selected value
        audio.src = event.target.value;
        audio.load(); // Force the browser to recognize the new stream
        
        // 3. If it was playing, restart with the new stream automatically
        if (wasPlaying) {
            audio.play().catch(() => {
                // If autoplay is blocked, reset the button UI
                playBtn.textContent = 'Play';
                playBtn.variant = 'primary';
            });
        }
    });
});

// Update the CSP connect-src in your HTML to include the new domain if needed:
// connect-src 'self' https://stream.alexjones.media ...
