const canvas = document.getElementById("innerParticles");
const ctx = canvas.getContext("2d");

canvas.width = 160;
canvas.height = 160;

const centerX = 80;
const centerY = 80;
const maxRadius = 75;

let particles = [];

for (let i = 0; i < 1200; i++) {

  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * maxRadius;

  particles.push({
    angle,
    radius,
    speed: 0.1 + Math.random() * 0.3,
    drift: 0.2 + Math.random() * 0.5,
    size: Math.random() * 0.6 + 0.1
  });
}

function animate() {

  ctx.clearRect(0, 0, 160, 160);

  particles.forEach(p => {

    // slight outward flow + turbulence
    p.radius += 0.1;
    p.angle += 0.002 * p.drift;

    if (p.radius > maxRadius) {
      p.radius = 0;
    }

    const x = centerX + Math.cos(p.angle) * p.radius;
    const y = centerY + Math.sin(p.angle) * p.radius;

    const intensity = 1 - (p.radius / maxRadius);

    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(255,255,255,${0.4 + intensity})`;

    ctx.shadowBlur = 25 * intensity;
    ctx.shadowColor = "rgba(255,255,255,0.9)";

    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();