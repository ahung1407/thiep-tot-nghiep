window.GradEffects = (() => {
  const pCanvas = document.getElementById("particlesCanvas");
  const pCtx = pCanvas.getContext("2d");
  const cCanvas = document.getElementById("confettiCanvas");
  const cCtx = cCanvas.getContext("2d");

  let particlesEnabled = true;
  let confettiEnabled = true;
  let particleRgb = "184, 134, 59";
  let confettiColors = ["#b8863b", "#e3be76", "#ffffff", "#d97706"];

  let particles = [];
  let confettiPieces = [];
  let cAnimId = null;

  function resize() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.4 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.15,
      alpha: Math.random() * 0.45 + 0.2
    }));
  }

  function loopParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    if (particlesEnabled) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = pCanvas.height + 10; p.x = Math.random() * pCanvas.width; }
        if (p.x < -10) p.x = pCanvas.width + 10;
        if (p.x > pCanvas.width + 10) p.x = -10;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(${particleRgb}, ${p.alpha})`;
        pCtx.fill();
      }
    }
    requestAnimationFrame(loopParticles);
  }

  function loopConfetti() {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    confettiPieces = confettiPieces.filter(p => p.y < cCanvas.height + 40 && p.life > 0.02);

    for (const p of confettiPieces) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;
      if (p.y > cCanvas.height * 0.85) p.life -= 0.03;

      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate(p.rot);
      cCtx.globalAlpha = p.life;
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cCtx.restore();
    }

    if (confettiPieces.length > 0) {
      cAnimId = requestAnimationFrame(loopConfetti);
    } else {
      cAnimId = null;
      cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    }
  }

  function fireConfetti(count = 110, force = false) {
    if (!confettiEnabled && !force) return;
    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
        y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 120,
        w: Math.random() * 8 + 5,
        h: Math.random() * 5 + 4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 14 - 4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        life: 1
      });
    }
    if (!cAnimId) loopConfetti();
  }

  function bindTilt(cardEl, isTiltActive) {
    cardEl.addEventListener("mousemove", (e) => {
      if (!isTiltActive()) return;
      const rect = cardEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cardEl.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
    cardEl.addEventListener("mouseleave", () => {
      cardEl.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  }

  window.addEventListener("resize", resize);
  resize();
  initParticles();
  loopParticles();

  return {
    setParticles: (val) => { particlesEnabled = val; },
    setConfetti: (val) => { confettiEnabled = val; },
    setPalette: (rgb, confList) => {
      if (rgb) particleRgb = rgb;
      if (confList) confettiColors = confList;
    },
    fireConfetti,
    bindTilt
  };
})();