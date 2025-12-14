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
