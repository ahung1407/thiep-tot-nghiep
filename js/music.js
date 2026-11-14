/**
 * music.js — Quản lý phát nhạc nền, đĩa nhạc quay, tua đoạn điệp khúc & vượt rào Autoplay
 */
window.GRAD_MUSIC_TRACKS = [
  {
    id: "local-custom",
    name: "🎵 Bài hát của bạn (audio/nhac-tot-nghiep.mp3)",
    url: "audio/nhac-tot-nghiep.mp3",
    desc: "File nhạc trong thư mục audio/ của bạn.",
    suggestedStart: "00:00"
  },
  {
    id: "canon-piano",
    name: "🎹 Canon in D (Piano tốt nghiệp nhẹ nhàng)",
    url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=graduation-piano-112190.mp3",
    desc: "Giai điệu piano kinh điển, trang trọng và đầy cảm xúc cho lễ tốt nghiệp.",
    suggestedStart: "00:00"
  },
  {
    id: "acoustic-warm",
    name: "🎸 Acoustic Guitar (Ấm áp, hoài niệm)",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitars-ambient-10986.mp3",
    desc: "Tiếng đàn guitar mộc mạc, phù hợp với không khí bạn bè sum vầy.",
    suggestedStart: "00:15"
  },
  {
    id: "piano-memories",
    name: "🌸 Kỷ Niệm Tươi Đẹp (Piano & Dàn dây)",
    url: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=piano-moment-9835.mp3",
    desc: "Giai điệu trong trẻo, mang lại cảm giác xúc động và tự hào.",
    suggestedStart: "00:00"
  }
];

window.GradMusic = (() => {
  let audioEl = null;
  let floatingBtn = null;
  let isPlaying = false;
  let userPaused = false;
  let timeUpdateCallbacks = [];

  let currentCfg = {
    musicEnabled: true,
    musicAutoplay: true,
    musicUrl: (window.GRAD_CONFIG && window.GRAD_CONFIG.musicUrl) || "audio/nhac-tot-nghiep.mp3",
    musicTitle: (window.GRAD_CONFIG && window.GRAD_CONFIG.musicTitle) || "Nhạc Lễ Tốt Nghiệp",
    musicVolume: 0.6,
    musicStartTime: (window.GRAD_CONFIG && window.GRAD_CONFIG.musicStartTime) || "00:00",
    musicEndTime: (window.GRAD_CONFIG && window.GRAD_CONFIG.musicEndTime) || ""
  };

  /** Chuyển "01:25" hoặc "85" -> số giây (85) */
  function parseTimeToSeconds(val) {
    if (typeof val === "number") return Math.max(0, val);
    const s = String(val || "").trim();
    if (!s) return 0;
    if (s.includes(":")) {
      const parts = s.split(":").map(Number);
      if (parts.length === 2) return Math.max(0, (parts[0] || 0) * 60 + (parts[1] || 0));
      if (parts.length === 3) return Math.max(0, (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0));
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  /** Chuyển 85 -> "01:25" */
  function formatSecondsToTime(sec) {
    const total = Math.floor(Math.max(0, sec || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function getOrCreateAudio() {
    if (!audioEl) {
      audioEl = document.createElement("audio");
      audioEl.id = "gradBgAudio";
      audioEl.preload = "auto";
      audioEl.volume = currentCfg.musicVolume || 0.6;
      document.body.appendChild(audioEl);

      audioEl.addEventListener("play", () => {
        isPlaying = true;
        updateButtonState();
      });

      audioEl.addEventListener("pause", () => {
        isPlaying = false;
        updateButtonState();
      });

      audioEl.addEventListener("timeupdate", () => {
        const startSec = parseTimeToSeconds(currentCfg.musicStartTime);
        const endSec = parseTimeToSeconds(currentCfg.musicEndTime);

        // Nếu có cài đặt đoạn kết thúc và đã chạy tới đó -> quay lại đoạn bắt đầu (loop đoạn điệp khúc)
        if (endSec > startSec && audioEl.currentTime >= endSec) {
          audioEl.currentTime = startSec;
        }

        // Gọi các callback nghe thử
        timeUpdateCallbacks.forEach(cb => {
          try { cb(audioEl.currentTime, audioEl.duration || 0); } catch {}
        });
      });

      audioEl.addEventListener("ended", () => {
        // Tự động lặp lại từ đoạn start time
        const startSec = parseTimeToSeconds(currentCfg.musicStartTime);
        audioEl.currentTime = startSec;
        audioEl.play().catch(() => {});
      });

      audioEl.addEventListener("loadedmetadata", () => {
        const startSec = parseTimeToSeconds(currentCfg.musicStartTime);
        if (startSec > 0 && audioEl.currentTime < startSec) {
          audioEl.currentTime = startSec;
        }
      });

      audioEl.addEventListener("error", (e) => {
        console.warn("[GradMusic] Không tải được bài hát:", audioEl.src, e);
        isPlaying = false;
        updateButtonState();
      });
    }
    return audioEl;
  }

  function getOrCreateButton() {
    if (!floatingBtn) {
      floatingBtn = document.createElement("button");
      floatingBtn.type = "button";
      floatingBtn.className = "music-floating-btn hidden";
      floatingBtn.setAttribute("aria-label", "Bật/Tắt nhạc nền");
      floatingBtn.innerHTML = `
        <div class="music-disc-wrap">
          <div class="music-disc">
            <span class="disc-core"></span>
          </div>
          <span class="music-icon-state">🎵</span>
        </div>
        <div class="music-soundwaves">
          <span></span><span></span><span></span>
        </div>
        <div class="music-tooltip" id="musicTooltip">Nhạc nền: Đang phát</div>
      `;

      floatingBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle();
      });

      document.body.appendChild(floatingBtn);
    }
    return floatingBtn;
  }

  function updateButtonState() {
    const btn = getOrCreateButton();
    const tooltip = document.getElementById("musicTooltip");
    if (!currentCfg.musicEnabled) {
      btn.classList.add("hidden");
      return;
    }

    btn.classList.remove("hidden");
    if (isPlaying) {
      btn.classList.add("is-playing");
      btn.classList.remove("is-paused");
      if (tooltip) {
        tooltip.textContent = `🎵 Đang phát: ${currentCfg.musicTitle || "Nhạc tốt nghiệp"}`;
      }
    } else {
      btn.classList.remove("is-playing");
      btn.classList.add("is-paused");
      if (tooltip) {
        tooltip.textContent = "🔇 Nhạc đang tắt (Bấm để bật)";
      }
    }
  }

  async function play(forceFromStart = false) {
    if (!currentCfg.musicEnabled || !currentCfg.musicUrl) return false;
    const a = getOrCreateAudio();
    const startSec = parseTimeToSeconds(currentCfg.musicStartTime);
    const endSec = parseTimeToSeconds(currentCfg.musicEndTime);

    if (!a.src || !a.src.includes(currentCfg.musicUrl)) {
      a.src = currentCfg.musicUrl;
      a.load();
    }
    a.volume = currentCfg.musicVolume || 0.6;

    // Tua đến đoạn bắt đầu nếu cần
    if (forceFromStart || a.currentTime < startSec || (endSec > startSec && a.currentTime >= endSec)) {
      try { a.currentTime = startSec; } catch {}
    }

    try {
      await a.play();
      isPlaying = true;
      userPaused = false;
      updateButtonState();
      return true;
    } catch (err) {
      console.log("[GradMusic] Chờ người dùng tương tác để phát nhạc:", err.message);
      isPlaying = false;
      updateButtonState();
      return false;
    }
  }

  function pause() {
    if (audioEl) {
      audioEl.pause();
    }
    isPlaying = false;
    userPaused = true;
    updateButtonState();
  }

  function toggle() {
    if (isPlaying) {
      pause();
    } else {
      userPaused = false;
      play();
    }
  }

  function seekTo(sec) {
    const a = getOrCreateAudio();
    const target = Math.max(0, sec || 0);
    try {
      a.currentTime = target;
    } catch {}
  }

  function applyConfig(cfg) {
    if (!cfg) return;
    const oldUrl = currentCfg.musicUrl;
    currentCfg = {
      ...currentCfg,
      musicEnabled: cfg.musicEnabled !== false,
      musicAutoplay: cfg.musicAutoplay !== false,
      musicUrl: (cfg.musicUrl || "").trim() || window.GRAD_MUSIC_TRACKS[0].url,
      musicTitle: cfg.musicTitle || "Nhạc Lễ Tốt Nghiệp",
      musicVolume: typeof cfg.musicVolume === "number" ? cfg.musicVolume : 0.6,
      musicStartTime: cfg.musicStartTime !== undefined ? cfg.musicStartTime : "00:00",
      musicEndTime: cfg.musicEndTime !== undefined ? cfg.musicEndTime : ""
    };

    getOrCreateButton();
    const a = getOrCreateAudio();

    if (!currentCfg.musicEnabled) {
      if (audioEl) audioEl.pause();
      updateButtonState();
      return;
    }

    // Nếu đổi bài hát khác
    if (a && oldUrl !== currentCfg.musicUrl) {
      const wasPlaying = isPlaying;
      a.src = currentCfg.musicUrl;
      a.load();
      if (wasPlaying && !userPaused) {
        play(true);
      }
    }

    updateButtonState();
  }

  // Hook tương tác đầu tiên để kích hoạt âm thanh mượt mà
  function setupAutoplayUnlock() {
    const unlock = () => {
      if (currentCfg.musicEnabled && currentCfg.musicAutoplay && !isPlaying && !userPaused) {
        play();
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true, passive: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  return {
    init(cfg) {
      applyConfig(cfg);
      setupAutoplayUnlock();
    },
    updateConfig(cfg) {
      applyConfig(cfg);
    },
    play,
    pause,
    toggle,
    seekTo,
    isPlaying: () => isPlaying,
    getCurrentTime: () => (audioEl ? audioEl.currentTime : 0),
    getDuration: () => (audioEl ? audioEl.duration || 0 : 0),
    formatTime: formatSecondsToTime,
    parseTime: parseTimeToSeconds,
    onTimeUpdate(fn) {
      if (typeof fn === "function") timeUpdateCallbacks.push(fn);
    },
    getCurrentConfig: () => ({ ...currentCfg })
  };
})();
