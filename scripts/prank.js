let prankHideTimeout = null;

function ensurePrankOverlay() {
    let overlay = document.getElementById("prank-overlay");

    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "prank-overlay";
    overlay.hidden = true;

    const text = document.createElement("span");
    text.className = "prank-text";
    text.textContent = "ХУЙ ТЕБЕ";
    overlay.appendChild(text);

    overlay.addEventListener("click", hidePrank);
    document.body.appendChild(overlay);

    return overlay;
}

function playPrankSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const now = context.currentTime;

    const master = context.createGain();
    master.gain.value = 0.85;
    master.connect(context.destination);

    // Долгое эхо: линия задержки с обратной связью
    const delay = context.createDelay(2);
    delay.delayTime.value = 0.33;
    const feedback = context.createGain();
    feedback.gain.value = 0.5;
    const echoTone = context.createBiquadFilter();
    echoTone.type = "lowpass";
    echoTone.frequency.value = 800;

    delay.connect(feedback);
    feedback.connect(echoTone);
    echoTone.connect(delay);
    delay.connect(master);

    // Тело звука: пилообразный осциллятор с падающей частотой и дрожанием
    const body = context.createOscillator();
    body.type = "sawtooth";
    body.frequency.setValueAtTime(90, now);
    body.frequency.exponentialRampToValueAtTime(42, now + 0.9);

    const wobble = context.createOscillator();
    wobble.frequency.value = 27;
    const wobbleDepth = context.createGain();
    wobbleDepth.gain.value = 24;
    wobble.connect(wobbleDepth);
    wobbleDepth.connect(body.frequency);

    const tone = context.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(500, now);
    tone.frequency.exponentialRampToValueAtTime(160, now + 1.0);
    tone.Q.value = 7;

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(1.0, now + 0.06);
    envelope.gain.setValueAtTime(1.0, now + 0.45);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    body.connect(envelope);
    envelope.connect(tone);
    tone.connect(master);
    tone.connect(delay);

    // Шелест: короткий шумовой всплеск поверх основного тона
    const noiseLength = Math.floor(context.sampleRate * 0.9);
    const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseEnvelope = context.createGain();
    noiseEnvelope.gain.setValueAtTime(0.35, now);
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.002, now + 0.8);

    noise.connect(noiseEnvelope);
    noiseEnvelope.connect(tone);

    body.start(now);
    wobble.start(now);
    noise.start(now);
    body.stop(now + 1.2);
    wobble.stop(now + 1.2);
    noise.stop(now + 0.9);

    window.setTimeout(function () {
        context.close();
    }, 6000);
}

function triggerPrank() {
    const overlay = ensurePrankOverlay();

    overlay.hidden = false;
    overlay.classList.remove("is-playing");
    void overlay.offsetWidth;
    overlay.classList.add("is-playing");

    playPrankSound();

    window.clearTimeout(prankHideTimeout);
    prankHideTimeout = window.setTimeout(hidePrank, 3500);
}

function hidePrank() {
    window.clearTimeout(prankHideTimeout);
    const overlay = document.getElementById("prank-overlay");
    if (overlay) overlay.hidden = true;
}
