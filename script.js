document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('track-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeBtn = document.querySelector('.close-btn');

    document.querySelectorAll('.track').forEach(track => {
        track.addEventListener('click', e => {
            if(e.target.tagName === 'AUDIO' || e.target.tagName === 'SOURCE') return;

            modalTitle.textContent = `${track.dataset.artist} - ${track.dataset.title}`;
            modalDesc.textContent = track.dataset.desc;
            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if(e.target === modal) {
            modal.style.display = 'none';
        }
    });

});


const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
canvas.width = 760;
canvas.height = 300;

let audioContext;
let analyser;
let source;
let dataArray;
let currentAudio = null;

const audioElements = document.querySelectorAll('.track audio');

audioElements.forEach(audio => {
    audio.addEventListener('play', () => {
        audioElements.forEach(a => {
            if (a !== audio) a.pause();
        });

        setupVisualizer(audio);
    });
});

function setupVisualizer(audioElement) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (source) {
        source.disconnect();
    }

    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    currentAudio = audioElement;
    draw();
}

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];
        const red = barHeight + 100;
        const green = 50;
        const blue = 200 - barHeight;

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}
