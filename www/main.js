window.addEventListener("DOMContentLoaded", () => {

  function speak(text) {

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1;        // speed
  utterance.pitch = 1;       // tone
  utterance.volume = 1;      // volume

  // When speaking starts
  utterance.onstart = () => {
    if (!isListening) {
      listeningScreen.classList.remove("hidden");
      drawWave();
    }
  };

  // When speaking ends
  utterance.onend = () => {
    stopListening();
  };
  const voices = speechSynthesis.getVoices();
utterance.voice = voices.find(v => v.name.includes("Google"));
  speechSynthesis.speak(utterance);
}
  /* ================= PARTICLES ================= */

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

  /* ================= WAVE ================= */

  const micBtn = document.getElementById("micBtn");
  const micIcon = micBtn.querySelector("i");
  const assistantInput = document.querySelector(".assistant-input");
  const listeningScreen = document.getElementById("listeningScreen");
  const waveCanvas = document.getElementById("siriWaveCanvas");
  const waveCtx = waveCanvas.getContext("2d");

  waveCanvas.width = 800;
  waveCanvas.height = 150;

  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let stream = null;

  let animationId = null;
  let isListening = false;
  let time = 0;

  function drawWave() {
    animationId = requestAnimationFrame(drawWave);
    waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

    const centerY = waveCanvas.height / 2;
    const width = waveCanvas.width;

    let volume = 0;

    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      volume = sum / dataArray.length / 255;
    }

    function drawLayer(amplitude, wavelength, speed, opacity) {
      waveCtx.beginPath();

      for (let x = 0; x < width; x++) {
        const dynamicAmp = amplitude + volume * 60;

        const y =
          centerY +
          Math.sin((x + time * speed) * wavelength) *
          dynamicAmp;

        if (x === 0) waveCtx.moveTo(x, y);
        else waveCtx.lineTo(x, y);
      }

      waveCtx.strokeStyle = `rgba(255,255,255,${opacity})`;
      waveCtx.lineWidth = 1.8;
      waveCtx.shadowBlur = 8;
      waveCtx.shadowColor = "rgba(255,255,255,0.6)";
      waveCtx.stroke();
    }

    drawLayer(4, 0.018, 1.4, 0.9);
    drawLayer(7, 0.015, 1.1, 0.5);
    drawLayer(10, 0.012, 0.8, 0.3);

    time += 0.4;
  }

  async function startListening() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    listeningScreen.classList.remove("hidden");
    listeningScreen.classList.add("active-wave");

    drawWave();
  }

  function stopListening() {
    cancelAnimationFrame(animationId);
    animationId = null;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    analyser = null;
    dataArray = null;

    waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

    listeningScreen.classList.remove("active-wave");
    listeningScreen.classList.add("hidden");
  }

  micBtn.addEventListener("click", async () => {

    if (!isListening) {
      isListening = true;
      await startListening();

      micBtn.classList.add("active");
      assistantInput.classList.add("active");

    } else {
      isListening = false;
      stopListening();

      micBtn.classList.remove("active");
      assistantInput.classList.remove("active");
    }

  });
  const inputField = document.querySelector(".assistant-input input");

inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = inputField.value.trim();
    speak(text);
    inputField.value = "";
  }
});
  listeningScreen.addEventListener("click", () => {
    if (isListening) {
      isListening = false;
      stopListening();

      micBtn.classList.remove("active");
      assistantInput.classList.remove("active");
    }
  });

});