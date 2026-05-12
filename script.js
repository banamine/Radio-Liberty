// Optimized Logic for script.js
let audioContext;
const sourceNodes = new Map();

// Helper to init Audio Context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
    }
}

// Inside your Play listener:
button.addEventListener('click', async () => {
    initAudioContext();
    if (audioContext.state === 'suspended') await audioContext.resume();
    
    // Check if source exists for THIS specific audio element
    if (!sourceNodes.has(audio)) {
        const node = audioContext.createMediaElementSource(audio);
        node.connect(analyser);
        sourceNodes.set(audio, node);
    }
    
    // ... start animation loop (ensure only one is running)
});
