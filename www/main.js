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

  function drawWave() {
    animationId = requestAnimationFrame(drawWave);

    waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

    if (!isListening || !analyser) return;

    analyser.getByteTimeDomainData(dataArray);

    const centerY = waveCanvas.height / 2;

    waveCtx.beginPath();
    waveCtx.moveTo(0, centerY);

    for (let i = 0; i < dataArray.length; i++) {
      const x = (i / dataArray.length) * waveCanvas.width;
      const v = dataArray[i] / 128.0;
      const y = (v - 1) * 60 + centerY;
      waveCtx.lineTo(x, y);
    }

    const gradient = waveCtx.createLinearGradient(0, 0, waveCanvas.width, 0);
    gradient.addColorStop(0, "#ff4d6d");
    gradient.addColorStop(0.5, "#4d79ff");
    gradient.addColorStop(1, "#00f7ff");

    waveCtx.strokeStyle = gradient;
    waveCtx.lineWidth = 3;
    waveCtx.shadowBlur = 25;
    waveCtx.shadowColor = "#00f7ff";
    waveCtx.stroke();
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

      isListening = true;

      waveCanvas.classList.remove("hidden");
      waveCanvas.classList.add("active-wave");

      micBtn.style.color = "#ff004f";
      micBtn.style.textShadow = "0 0 15px #ff004f";

    } else {

      isListening = false;

      waveCanvas.classList.remove("active-wave");
      waveCanvas.classList.add("hidden");

      micBtn.style.color = "#ffffff";
      micBtn.style.textShadow = "none";

      stopMic();
    }

  });

});