window.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     PARTICLE CORE ANIMATION
  ================================= */

  const particleCanvas = document.getElementById("innerParticles");
  const pCtx = particleCanvas.getContext("2d");

  particleCanvas.width = 160;
  particleCanvas.height = 160;

  const centerX = 80;
  const centerY = 80;
  const maxRadius = 75;

  let particles = [];

  for (let i = 0; i < 600; i++) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * maxRadius,
      drift: 0.2 + Math.random() * 0.5,
      size: Math.random() * 0.6 + 0.1
    });
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, 160, 160);

    particles.forEach(p => {
      p.radius += 0.1;
      p.angle += 0.002 * p.drift;

      if (p.radius > maxRadius) p.radius = 0;

      const x = centerX + Math.cos(p.angle) * p.radius;
      const y = centerY + Math.sin(p.angle) * p.radius;

      const intensity = 1 - (p.radius / maxRadius);

      pCtx.beginPath();
      pCtx.arc(x, y, p.size, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(255,255,255,${0.4 + intensity})`;
      pCtx.shadowBlur = 20 * intensity;
      pCtx.shadowColor = "rgba(255,255,255,0.9)";
      pCtx.fill();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();


  /* ===============================
     JARVIS CINEMATIC WAVE
  ================================= */

  const waveCanvas = document.getElementById("siriWaveCanvas");
  const waveCtx = waveCanvas.getContext("2d");

  waveCanvas.width = 800;
  waveCanvas.height = 200;

  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let animationId = null;
  let isListening = false;
  let streamRef = null;

  async function initMic() {
    streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(streamRef);
    source.connect(analyser);

    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  let idleTime = 0;

function drawWave() {

  animationId = requestAnimationFrame(drawWave);
  waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

  const centerX = waveCanvas.width / 2;
  const centerY = waveCanvas.height / 2;

  const waveWidth = 300;   // how wide wave spreads
  const segments = 60;     // smoothness
  const maxHeight = 35;

  waveCtx.beginPath();

  for (let i = 0; i <= segments; i++) {

    const progress = i / segments;
    const x = centerX - waveWidth/2 + progress * waveWidth;

    let amplitude;

    if ((isListening || isSpeaking) && analyser) {
      analyser.getByteFrequencyData(dataArray);
      amplitude = (dataArray[i] / 255) * maxHeight;
    } else {
      // Elegant idle breathing wave
      amplitude = Math.sin(progress * Math.PI) *
                  Math.sin(idleTime) * 15;
    }

    const y = centerY - amplitude;

    if (i === 0) {
      waveCtx.moveTo(x, y);
    } else {
      waveCtx.lineTo(x, y);
    }
  }

  // Mirror bottom part for blob shape
  for (let i = segments; i >= 0; i--) {

    const progress = i / segments;
    const x = centerX - waveWidth/2 + progress * waveWidth;

    let amplitude;

    if (isListening && analyser) {
      amplitude = (dataArray[i] / 255) * maxHeight;
    } else {
      amplitude = Math.sin(progress * Math.PI) *
                  Math.sin(idleTime) * 15;
    }

    const y = centerY + amplitude;
    waveCtx.lineTo(x, y);
  }

  waveCtx.closePath();

  // 💎 Elegant color (matches your UI)
  const gradient = waveCtx.createLinearGradient(
  centerX - waveWidth/2,
  0,
  centerX + waveWidth/2,
  0
);

gradient.addColorStop(0, "rgba(0,0,0,0.2)");
gradient.addColorStop(0.3, "rgba(180,180,180,0.6)");
gradient.addColorStop(0.5, "#ffffff");
gradient.addColorStop(0.7, "rgba(180,180,180,0.6)");
gradient.addColorStop(1, "rgba(0,0,0,0.2)");

waveCtx.fillStyle = gradient;
waveCtx.shadowBlur = 35;
waveCtx.shadowColor = "rgba(255,255,255,0.7)";

  waveCtx.fill();

  idleTime += 0.02;
}

  function stopMic() {
    if (streamRef) {
      streamRef.getTracks().forEach(track => track.stop());
      streamRef = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    cancelAnimationFrame(animationId);
  }


  /* ===============================
     MIC BUTTON CONTROL
  ================================= */

  const micBtn = document.getElementById("micBtn");

  micBtn.addEventListener("click", async () => {

    if (!isListening) {

      if (!audioContext) {
        await initMic();
        drawWave();
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      let isSpeaking = false;
      isListening = true;

      waveCanvas.classList.remove("hidden");
      waveCanvas.classList.add("active-wave");

      micBtn.style.color = "rgba(0,255,255,0.6)";
      micBtn.style.textShadow = "0 0 15px #ffffff";

    } else {

      isListening = false;
      cancelAnimationFrame(animationId);
      waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      waveCanvas.classList.remove("active-wave");
      waveCanvas.classList.add("hidden");

      micBtn.style.color = "#ffffff";
      micBtn.style.textShadow = "none";

      stopMic();
    }

  });

});