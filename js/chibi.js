window.GradChibi = (() => {
  function createChibiSvg() {
    return `
      <svg class="chibi-svg" viewBox="0 0 124 148" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="62" cy="141" rx="22" ry="4.8" fill="rgba(0,0,0,0.14)" />

        <!-- Đôi chân bước đi -->
        <g class="chibi-leg-left">
          <rect x="46" y="112" width="10" height="20" rx="5" fill="#1e293b" />
          <ellipse cx="49" cy="133" rx="8.5" ry="4.5" fill="#0f172a" />
        </g>
        <g class="chibi-leg-right">
          <rect x="66" y="112" width="10" height="20" rx="5" fill="#1e293b" />
          <ellipse cx="71" cy="133" rx="8.5" ry="4.5" fill="#0f172a" />
        </g>

        <g class="chibi-body">
          <!-- Tay trái CHỈ VỀ BÊN TRÁI (chỉ vào Ngày giờ / Địa điểm) -->
          <g class="chibi-arm-pointer">
            <path d="M43 76 L19 72 L19 82 L44 86 Z" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1.5" stroke-linejoin="round" />
            <!-- Bàn tay + ngón trỏ chỉ sang trái -->
            <circle cx="18" cy="77" r="5" fill="#fde2cc" />
            <rect x="6" y="74" width="12" height="4.8" rx="2.4" fill="#fde2cc" />
          </g>

          <!-- Thân áo choàng tốt nghiệp MÀU XANH DƯƠNG -->
          <path d="M41 72 L83 72 L91 118 L33 118 Z" fill="#2563eb" stroke="#1e40af" stroke-width="1.8" stroke-linejoin="round" />
          <path d="M61 74 L61 117" stroke="#1e40af" stroke-width="1.3" opacity="0.5" />

          <!-- Ruy băng / Dải choàng MÀU TRẮNG -->
          <path d="M48 71 L56 71 L54 109 L49 105 L44 109 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3" stroke-linejoin="round" />
          <path d="M66 71 L74 71 L78 109 L73 105 L68 109 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.3" stroke-linejoin="round" />
          <path d="M50 71 Q61 79 72 71" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
          <circle cx="61" cy="76" r="2.7" fill="#facc15" />

          <!-- Tay phải cầm CHỨNG NHẬN TỐT NGHIỆP -->
          <g class="chibi-arm-cert">
            <path d="M81 76 L98 85 L93 94 L77 85 Z" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1.5" stroke-linejoin="round" />
            <g transform="translate(86, 54) rotate(-8)">
              <rect x="0" y="0" width="26" height="33" rx="3" fill="#fffdf5" stroke="#d97706" stroke-width="1.8" />
              <rect x="3" y="3" width="20" height="27" rx="1.5" fill="none" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="2 1" />
              <line x1="7" y1="9" x2="19" y2="9" stroke="#1e40af" stroke-width="1.8" stroke-linecap="round" />
              <line x1="6" y1="14" x2="20" y2="14" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round" />
              <line x1="8" y1="18" x2="18" y2="18" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round" />
              <circle cx="13" cy="24.5" r="3.4" fill="#dc2626" />
              <path d="M11 27 L10 31.5 L13 29.5 L16 31.5 L15 27 Z" fill="#f59e0b" />
            </g>
            <circle cx="94" cy="88" r="5.2" fill="#fde2cc" />
          </g>

          <!-- Đầu Chibi (ánh mắt nhìn nhẹ sang trái hướng thông tin) -->
          <ellipse cx="61" cy="47" rx="23.5" ry="21.5" fill="#fde2cc" stroke="#f3c6a5" stroke-width="1.2" />
          <path d="M37 45 C37 26, 85 26, 85 45 C81 36, 72 34, 66 39 C61 33, 53 34, 48 40 C44 36, 39 39, 37 45 Z" fill="#292524" />
          <ellipse cx="44" cy="53" rx="4" ry="2.2" fill="#fca5a5" opacity="0.75" />
          <ellipse cx="76" cy="53" rx="4" ry="2.2" fill="#fca5a5" opacity="0.75" />
          <circle cx="50" cy="48" r="3.2" fill="#1c1917" />
          <circle cx="48.8" cy="46.8" r="1.15" fill="#ffffff" />
          <circle cx="69" cy="48" r="3.2" fill="#1c1917" />
          <circle cx="67.8" cy="46.8" r="1.15" fill="#ffffff" />
          <path d="M55 55 Q60 60 65 55" fill="none" stroke="#9a3412" stroke-width="1.8" stroke-linecap="round" />

          <!-- Mũ cử nhân xanh dương + tua rua vàng -->
          <path d="M44 29 L78 29 L76 20 L46 20 Z" fill="#1e3a8a" />
          <polygon points="61,10 91,20 61,30 31,20" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1.4" stroke-linejoin="round" />
          <circle cx="61" cy="20" r="2.2" fill="#facc15" />
          <path d="M61 20 L39 23 L38 35" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="38" cy="36" r="2.3" fill="#facc15" />
        </g>
      </svg>
    `;
  }

  let guideTimer = null;

  function render(cardMount, cfg) {
    if (guideTimer) {
      clearInterval(guideTimer);
      guideTimer = null;
    }

    const globalMount = document.getElementById("chibiGlobalMount");
    const infoRailMount = cardMount ? cardMount.querySelector("#chibiInfoRail") : null;
    const cardChibiMount = cardMount ? cardMount.querySelector("#chibiCardMount") : null;
    const infoStage = cardMount ? cardMount.querySelector("#infoChibiStage") : null;
    const timeBox = cardMount ? cardMount.querySelector("#timeBox") : null;
    const placeBox = cardMount ? cardMount.querySelector("#placeBox") : null;

    if (globalMount) globalMount.innerHTML = "";
    if (infoRailMount) infoRailMount.innerHTML = "";
    if (cardChibiMount) cardChibiMount.innerHTML = "";
    if (infoStage) infoStage.classList.remove("has-chibi-rail");
    if (timeBox) timeBox.classList.remove("chibi-focus");
    if (placeBox) placeBox.classList.remove("chibi-focus");

    if (!cfg.chibiEnabled) return;

    const mode = cfg.chibiMode || "guide-info";
    const timeMsg = cfg.chibiTimeMsg || "Lưu lịch này nha! ⏰";
    const placeMsg = cfg.chibiPlaceMsg || "Địa điểm ở đây! 📍";

    if (mode === "guide-info" && infoRailMount && infoStage && timeBox && placeBox) {
      infoStage.classList.add("has-chibi-rail");
      infoRailMount.innerHTML = `
        <div class="chibi-guide-walker" id="chibiGuideWalker">
          <div class="chibi-actor" title="Nhấn vào bé Chibi!">
            <div class="chibi-bubble" id="chibiGuideBubble">${window.GRAD_UTILS.escapeHtml(timeMsg)}</div>
            ${createChibiSvg()}
          </div>
        </div>
      `;

      const walker = infoRailMount.querySelector("#chibiGuideWalker");
      const bubble = infoRailMount.querySelector("#chibiGuideBubble");
      const actor = infoRailMount.querySelector(".chibi-actor");
      let pointingAt = "time";

      function moveTo(target) {
        pointingAt = target;
        const targetBox = target === "time" ? timeBox : placeBox;
        const otherBox = target === "time" ? placeBox : timeBox;

        targetBox.classList.add("chibi-focus");
        otherBox.classList.remove("chibi-focus");
        bubble.textContent = target === "time" ? timeMsg : placeMsg;

        walker.classList.add("is-walking");
        const topPos = Math.max(0, targetBox.offsetTop + (targetBox.offsetHeight / 2) - 58);
        walker.style.top = `${topPos}px`;

        setTimeout(() => {
          walker.classList.remove("is-walking");
        }, 950);
      }

      // Khởi động ở vị trí Thời gian, sau đó luân phiên đi dọc xuống Địa điểm
      requestAnimationFrame(() => moveTo("time"));
      guideTimer = setInterval(() => {
        moveTo(pointingAt === "time" ? "place" : "time");
      }, 3600);

      // Cho phép khách bấm trực tiếp vào thẻ Thời gian/Địa điểm hoặc Chibi
      timeBox.addEventListener("click", () => moveTo("time"));
      placeBox.addEventListener("click", () => moveTo("place"));
      actor.addEventListener("click", () => window.GradEffects.fireConfetti(45, true));

    } else if (mode === "vertical-card" && cardChibiMount) {
      cardChibiMount.innerHTML = `
        <div class="chibi-track-vertical">
          <div class="chibi-actor">
            <div class="chibi-bubble">${window.GRAD_UTILS.escapeHtml(timeMsg)}</div>
            ${createChibiSvg()}
          </div>
        </div>
      `;
      cardChibiMount.querySelector(".chibi-actor").addEventListener("click", () => {
        window.GradEffects.fireConfetti(45, true);
      });
    } else if (mode === "horizontal-bottom" && globalMount) {
      globalMount.innerHTML = `
        <div class="chibi-track-horizontal">
          <div class="chibi-actor">${createChibiSvg()}</div>
        </div>
      `;
      globalMount.querySelector(".chibi-actor").addEventListener("click", () => {
        window.GradEffects.fireConfetti(45, true);
      });
    }
  }

  return { render };
})();