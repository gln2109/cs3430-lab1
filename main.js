const keyboardFrequencyMap = {
    '90': [261.625565300598634, "C"],  //Z - C
    '83': [277.182630976872096, "C#"], //S - C#
    '88': [293.664767917407560, "D"],  //X - D
    '68': [311.126983722080910, "D#"], //D - D#
    '67': [329.627556912869929, "E"],  //C - E
    '86': [349.228231433003884, "F"],  //V - F
    '71': [369.994422711634398, "F#"], //G - F#
    '66': [391.995435981749294, "G"],  //B - G
    '72': [415.304697579945138, "G#"], //H - G#
    '78': [440.000000000000000, "A"],  //N - A
    '74': [466.163761518089916, "A#"], //J - A#
    '77': [493.883301256124111, "B"],  //M - B
    '81': [523.251130601197269, "C"],  //Q - C
    '50': [554.365261953744192, "C#"], //2 - C#
    '87': [587.329535834815120, "D"],  //W - D
    '51': [622.253967444161821, "D#"], //3 - D#
    '69': [659.255113825739859, "E"],  //E - E
    '82': [698.456462866007768, "F"],  //R - F
    '53': [739.988845423268797, "F#"], //5 - F#
    '84': [783.990871963498588, "G"],  //T - G
    '54': [830.609395159890277, "G#"], //6 - G#
    '89': [880.000000000000000, "A"],  //Y - A
    '55': [932.327523036179832, "A#"], //7 - A#
    '85': [987.766602512248223, "B"],  //U - B
}

var audioCtx;
var globalGain;
document.addEventListener("DOMContentLoaded", function(event) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);
})

var waveform = 'sine';
document.getElementById('waveform').addEventListener('change', (ev) => {
    waveform = ev.target.value;
});

activeOscillators = {}
window.addEventListener('keydown', keyDown, false);
window.addEventListener('keyup', keyUp, false);

function keyDown(event) {
    const key = (event.detail || event.which).toString();
    if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
        playNote(key);
        update();
        let h = (keyboardFrequencyMap[key][0] - 261) / 4;
        document.getElementById("header").style.color = `hsl(${h}, 100%, 40%)`
    }
}

function keyUp(event) {
    const key = (event.detail || event.which).toString();
    if (keyboardFrequencyMap[key] && activeOscillators[key]) {
        const gainNode = activeOscillators[key][1]
        const time = audioCtx.currentTime;
        gainNode.gain.cancelAndHoldAtTime(time);
        gainNode.gain.setTargetAtTime(0, time, 0.1);
        activeOscillators[key][0].stop(time + 0.6);
        delete activeOscillators[key];
        update();
    }
}

function playNote(key) {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const time = audioCtx.currentTime;
    osc.frequency.setValueAtTime(keyboardFrequencyMap[key][0], time)
    osc.type = waveform;
    gainNode.gain.setValueAtTime(0.001, time);
    gainNode.gain.exponentialRampToValueAtTime(0.9, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.3, time + 0.5);
    osc.connect(gainNode).connect(globalGain);
    osc.start();
    activeOscillators[key] = [osc, gainNode];
}

function update() {
    const keys = Object.keys(activeOscillators);
    let num = Math.max(1, keys.length);
    globalGain.gain.setTargetAtTime(0.6/Math.sqrt(num), audioCtx.currentTime, 0.01);
    let noteList = keys.map(key => keyboardFrequencyMap[key][1])
    document.getElementById("notes").innerText = noteList.join(" ");
}
