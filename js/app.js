(() => {
  const DEFAULT_CONFIG = window.GRAD_CONFIG;
  const THEMES = window.GRAD_THEMES;
  const PRESETS = window.GRAD_PRESETS;
  const { escapeHtml } = window.GRAD_UTILS;
  const STORAGE_KEY = "grad_card_draft_v5";

  function encodeCfg(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = "";
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodeCfg(str) {
    try {
      let s = str.replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4) s += "=";
      const bin = atob(s);
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return {};
    }
  }

  function sanitizeLinkUrl(url) {
    try {
      const u = new URL(url);
      return (u.protocol === "http:" || u.protocol === "https:") ? u.href : "#";
    } catch {
      return "#";
    }
  }

  function sanitizeImgSrc(src) {
    const s = (src || "").trim();
    if (!s) return "";
    if (s.startsWith("data:image/")) return s;
    if (/^(https?:\/\/|images\/|\.\/images\/)/i.test(s) || !s.includes(":")) return s;
    return "";
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2300);
  }

  const params = new URLSearchParams(window.location.search);
  const hasGuestParam = params.has("to") && params.get("to").trim() !== "";
  const isGuestMode = hasGuestParam && params.get("mode") !== "build";

  const fxState = { env: true, confetti: true, particles: true, tilt: true };
  if (params.has("fx")) {
    const list = params.get("fx").split(",");
    fxState.env = list.includes("env");
    fxState.confetti = list.includes("conf");
    fxState.particles = list.includes("part");
    fxState.tilt = list.includes("tilt");
  }

  let state = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  let guestName = params.get("to") ? params.get("to").trim() : "Minh Anh";

  if (isGuestMode) {
    if (params.has("d")) state = { ...state, ...decodeCfg(params.get("d")) };
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        if (saved.guestName && !params.has("to")) guestName = saved.guestName;
        if (saved.config) state = { ...state, ...saved.config };
        if (saved.fx) Object.assign(fxState, saved.fx);
      }
    } catch {}
  }

  function applyTheme(cfg) {
    const themeKey = THEMES[cfg.theme] ? cfg.theme : "ivory";
    document.body.setAttribute("data-theme", themeKey);

    if (cfg.customAccent) {
      document.body.style.setProperty("--accent", cfg.customAccent);
      document.body.style.setProperty("--accent-2", cfg.customAccent);
      document.body.style.setProperty("--border-accent", `${cfg.customAccent}55`);
    } else {
      document.body.style.removeProperty("--accent");
      document.body.style.removeProperty("--accent-2");
      document.body.style.removeProperty("--border-accent");
    }

    if (cfg.customBg) document.body.style.setProperty("--bg-page", cfg.customBg);
    else document.body.style.removeProperty("--bg-page");

    const palette = THEMES[themeKey];
    window.GradEffects.setPalette(palette.particleRgb, palette.confetti);
    window.GradEffects.setParticles(fxState.particles);
    window.GradEffects.setConfetti(fxState.confetti);
  }

  function renderHeadlineHtml(tpl, gName, format) {
    const safeTpl = escapeHtml(tpl || "");
    const g = escapeHtml(gName || "Bạn");
    if (!safeTpl.includes("{ten}")) return safeTpl;

    if (format === "stacked") {
      const parts = safeTpl.split("{ten}");
      const before = parts[0].trim();
      const after = parts.slice(1).join("").trim();
      return `
        ${before ? `<span class="hl-part">${before}</span>` : ""}
        <span class="guest-highlight">${g}</span>
        ${after ? `<span class="hl-part">${after}</span>` : ""}
      `;
    }
    return safeTpl.replace(/\{ten\}/g, `<span class="guest-highlight">${g}</span>`);
  }

  function renderPlain(tpl, gName) {
    const g = gName || "Bạn";
    return (tpl || "").includes("{ten}") ? tpl.replace(/\{ten\}/g, g) : (tpl || "");
  }

  function renderTpl(tpl, gName) {
    return escapeHtml(renderPlain(tpl, gName));
  }

  function buildSlotGalleryHtml(photos, layout) {
    if (!photos || photos.length === 0) return "";
    const layoutClass =
      layout === "polaroid" ? "gallery-grid gallery-polaroid" :
      layout === "strip" ? "gallery-strip" : "gallery-grid";

    const items = photos.map((p) => {
      const safeSrc = escapeHtml(sanitizeImgSrc(p.url));
      const safeCap = escapeHtml(p.caption || "");
      const sizeCls = p.size === "wide" ? "size-wide" : p.size === "tall" ? "size-tall" : "";
      const focusPos = p.focus === "top" ? "center top" : p.focus === "bottom" ? "center bottom" : "center center";
      return `
        <figure class="photo-card ${sizeCls}">
          <img src="${safeSrc}" alt="${safeCap || "Ảnh tốt nghiệp"}" style="object-position:${focusPos};" loading="lazy" />
          ${safeCap ? `<figcaption class="photo-caption">${safeCap}</figcaption>` : ""}
        </figure>
      `;
    }).join("");

    return `<div class="${layoutClass}">${items}</div>`;
  }

  function renderPhotosOnCard(mount, cfg) {
    const slots = {
      top: mount.querySelector("#photoSlotTop"),
      middle: mount.querySelector("#photoSlotMiddle"),
      bottom: mount.querySelector("#photoSlotBottom")
    };
    Object.values(slots).forEach(el => { if (el) el.innerHTML = ""; });

    const valid = (cfg.photos || []).filter(p => sanitizeImgSrc(p.url));
    const layout = cfg.photoLayout || "polaroid";

    ["top", "middle", "bottom"].forEach((slotKey) => {
      const list = valid.filter(p => (p.slot || "middle") === slotKey);
      if (list.length > 0 && slots[slotKey]) {
        slots[slotKey].innerHTML = buildSlotGalleryHtml(list, layout);
      }
    });

    mount.querySelectorAll(".photo-card").forEach((card) => {
      card.addEventListener("click", () => {
        const img = card.querySelector("img");
        const cap = card.querySelector(".photo-caption");
        document.getElementById("lightboxImg").src = img.src;
        document.getElementById("lightboxCaption").textContent = cap ? cap.textContent : "";
        document.getElementById("lightboxOverlay").classList.remove("hidden");
      });
    });
  }

  document.getElementById("closeLightboxBtn").addEventListener("click", () => {
    document.getElementById("lightboxOverlay").classList.add("hidden");
  });
  document.getElementById("lightboxOverlay").addEventListener("click", (e) => {
    if (e.target.id === "lightboxOverlay") e.currentTarget.classList.add("hidden");
  });

  function createCardIn(containerId, editable, onInlineChange, onSlotAdd) {
    const mount = document.getElementById(containerId);
    const tpl = document.getElementById("cardTemplate");
    mount.innerHTML = "";
    mount.appendChild(tpl.content.cloneNode(true));
    mount.classList.toggle("is-builder", editable);

    mount.querySelector("#btnCelebrate").addEventListener("click", () => {
      window.GradEffects.fireConfetti(95, true);
    });
    window.GradEffects.bindTilt(mount.querySelector("#gradCard"), () => fxState.tilt);

    if (editable) {
      mount.querySelectorAll("[data-edit]").forEach((el) => {
        const field = el.dataset.edit;
        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");
        if (el.tagName === "A") el.addEventListener("click", (e) => e.preventDefault());
        el.addEventListener("input", () => {
          state[field] = el.textContent;
          onInlineChange(field, el.textContent);
        });
      });

      mount.querySelectorAll("[data-edit-tpl]").forEach((el) => {
        const field = el.dataset.editTpl;
        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");
        el.addEventListener("input", () => {
          const raw = el.textContent;
          const g = guestName.trim() || "Bạn";
          state[field] = g && raw.includes(g) ? raw.replace(g, "{ten}") : raw;
          onInlineChange(field, state[field]);
        });
        el.addEventListener("blur", () => {
          if (field === "headlineTpl") el.innerHTML = renderHeadlineHtml(state[field], guestName, state.headlineFormat);
          else el.innerHTML = renderTpl(state[field], guestName);
        });
      });

      mount.querySelectorAll("[data-add-slot]").forEach((btn) => {
        btn.addEventListener("click", () => onSlotAdd && onSlotAdd(btn.dataset.addSlot));
      });
    }
    return mount;
  }

  function updateCardIn(mount, isGuestView = isGuestMode) {
    applyTheme(state);

    mount.querySelectorAll("[data-edit]").forEach((el) => {
      if (document.activeElement === el) return;
      el.textContent = state[el.dataset.edit] || "";
    });

    const hl = mount.querySelector("#cardHeadline");
    hl.classList.remove("hl-classic", "hl-script", "hl-stacked");
    hl.classList.add(`hl-${state.headlineFormat || "classic"}`);
    if (document.activeElement !== hl) {
      hl.innerHTML = renderHeadlineHtml(state.headlineTpl, guestName, state.headlineFormat);
    }

    const ft = mount.querySelector("#guestFooterNote");
    if (document.activeElement !== ft) {
      ft.innerHTML = renderTpl(state.footerTpl, guestName);
    }

    if (isGuestView) {
      const deg = mount.querySelector("#cardDegree");
      const msg = mount.querySelector("#cardMessage");
      if (deg) deg.classList.toggle("hidden", !(state.degree || "").trim());
      if (msg) msg.classList.toggle("hidden", !(state.message || "").trim());
    }

    mount.querySelector("#btnGate1").href = sanitizeLinkUrl(state.gate1Url);
    mount.querySelector("#btnGate2").href = sanitizeLinkUrl(state.gate2Url);

    const btnCall = mount.querySelector("#btnCall");
    const btnCel = mount.querySelector("#btnCelebrate");
    btnCall.classList.toggle("hidden", !state.showCallBtn);
    btnCel.classList.toggle("hidden", !state.showCelebrateBtn);
    mount.querySelector("#cardActions").classList.toggle("hidden", !state.showCallBtn && !state.showCelebrateBtn);

    const cleanPhone = (state.phone || "").replace(/[^\d+]/g, "");
    btnCall.href = cleanPhone ? `tel:${cleanPhone}` : "#";

    renderPhotosOnCard(mount, state);
    window.GradChibi.render(mount, state);
  }

  function openEnvelopeScreen() {
    const overlay = document.getElementById("envelopeOverlay");
    document.getElementById("envLabelView").textContent = state.envLabel || DEFAULT_CONFIG.envLabel;
    document.getElementById("envGuestName").textContent = renderPlain(state.envHeadlineTpl, guestName);
    document.getElementById("envHintView").textContent = state.envHint || "";
    document.getElementById("openEnvelopeBtn").textContent = state.envBtnText || DEFAULT_CONFIG.envBtnText;

    overlay.classList.remove("fade-out", "hidden");
    document.getElementById("openEnvelopeBtn").onclick = () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        overlay.classList.add("hidden");
        window.GradEffects.fireConfetti(140);
      }, 250);
    };
  }

  function buildFullConfigJsContent(cfgObj) {
    const exportCfg = {
      ...cfgObj,
      photos: (cfgObj.photos || []).filter(p => p.url && !p.url.startsWith("data:"))
    };
    return `window.GRAD_UTILS = {
  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

window.GRAD_THEMES = ${JSON.stringify(THEMES, null, 2)};

window.GRAD_CONFIG = ${JSON.stringify(exportCfg, null, 2)};

window.GRAD_PRESETS = ${JSON.stringify(PRESETS, null, 2)};
`;
  }

  /* ================= KHỞI CHẠY ================= */
  if (isGuestMode) {
    document.title = `Kính mời ${guestName} - Lễ Tốt Nghiệp`;
    document.getElementById("guestShell").classList.remove("hidden");
    const mount = createCardIn("guestMount", false);
    updateCardIn(mount, true);

    if (fxState.env) openEnvelopeScreen();
    else setTimeout(() => window.GradEffects.fireConfetti(100), 300);
  } else {
    document.getElementById("builderShell").classList.remove("hidden");

    const inputGuest = document.getElementById("inputGuest");
    const pickAccent = document.getElementById("pickAccent");
    const pickBg = document.getElementById("pickBg");
    const fxEnv = document.getElementById("fxEnv");
    const fxConfetti = document.getElementById("fxConfetti");
    const fxParticles = document.getElementById("fxParticles");
    const fxTilt = document.getElementById("fxTilt");
    const showCallBtn = document.getElementById("showCallBtn");
    const showCelebrateBtn = document.getElementById("showCelebrateBtn");
    const chibiEnabled = document.getElementById("chibiEnabled");
    const chibiMode = document.getElementById("chibiMode");
    const photoLayout = document.getElementById("photoLayout");
    const fieldInputs = document.querySelectorAll("[data-field]");

    function switchTab(tabId) {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.toggle("active", p.id === tabId));
    }

    function renderPhotoEditorList() {
      const listEl = document.getElementById("photoListEditor");
      const photos = state.photos || [];
      const hasDataUrl = photos.some(p => (p.url || "").startsWith("data:"));
      document.getElementById("localPhotoWarning").classList.toggle("hidden", !hasDataUrl);

      if (photos.length === 0) {
        listEl.innerHTML = `<p style="font-size:0.79rem;color:#6b7280;text-align:center;padding:12px;">Chưa có hình nào. Kéo ảnh vào ô trên hoặc bấm <strong>+ Chèn ảnh</strong> ngay trên thiệp!</p>`;
        return;
      }

      listEl.innerHTML = photos.map((p, idx) => `
        <div class="photo-item-ed">
          <img class="photo-thumb-ed" src="${escapeHtml(sanitizeImgSrc(p.url))}" alt="" onerror="this.style.opacity=0.25" />
          <div class="photo-controls-ed">
            <input type="text" class="form-control ph-url" data-idx="${idx}" value="${escapeHtml(p.url || "")}" placeholder="images/anh1.jpg hoặc link https://..." />
            <input type="text" class="form-control ph-cap" data-idx="${idx}" value="${escapeHtml(p.caption || "")}" placeholder="Chú thích dưới ảnh..." />
            <div class="photo-select-row">
              <select class="ph-slot" data-idx="${idx}" title="Vị trí đặt trên thiệp">
                <option value="top" ${p.slot === "top" ? "selected" : ""}>🔼 Đầu thiệp</option>
                <option value="middle" ${(!p.slot || p.slot === "middle") ? "selected" : ""}>↕️ Giữa thiệp</option>
                <option value="bottom" ${p.slot === "bottom" ? "selected" : ""}>🔽 Cuối thiệp</option>
              </select>
              <select class="ph-size" data-idx="${idx}" title="Kích thước">
                <option value="normal" ${(!p.size || p.size === "normal") ? "selected" : ""}>Khung vừa</option>
                <option value="wide" ${p.size === "wide" ? "selected" : ""}>Rộng 100%</option>
                <option value="tall" ${p.size === "tall" ? "selected" : ""}>Dáng đứng</option>
              </select>
              <select class="ph-focus" data-idx="${idx}" title="Căn vùng mặt">
                <option value="top" ${p.focus === "top" ? "selected" : ""}>Lấy phần trên</option>
                <option value="center" ${(!p.focus || p.focus === "center") ? "selected" : ""}>Lấy giữa</option>
                <option value="bottom" ${p.focus === "bottom" ? "selected" : ""}>Lấy phần dưới</option>
              </select>
            </div>
            <div class="photo-btn-bar">
              <button type="button" class="ph-up" data-idx="${idx}" ${idx === 0 ? "disabled" : ""}>⬆️ Lên</button>
              <button type="button" class="ph-down" data-idx="${idx}" ${idx === photos.length - 1 ? "disabled" : ""}>⬇️ Xuống</button>
              <button type="button" class="ph-del" data-idx="${idx}">🗑️ Xóa</button>
            </div>
          </div>
        </div>
      `).join("");

      listEl.querySelectorAll(".ph-url").forEach(inp => {
        inp.addEventListener("input", () => {
          state.photos[inp.dataset.idx].url = inp.value;
          const thumb = inp.closest(".photo-item-ed").querySelector(".photo-thumb-ed");
          thumb.style.opacity = 1;
          thumb.src = sanitizeImgSrc(inp.value);
          refreshAll();
        });
      });
      listEl.querySelectorAll(".ph-cap").forEach(inp => {
        inp.addEventListener("input", () => { state.photos[inp.dataset.idx].caption = inp.value; refreshAll(); });
      });
      listEl.querySelectorAll(".ph-slot").forEach(sel => {
        sel.addEventListener("change", () => { state.photos[sel.dataset.idx].slot = sel.value; refreshAll(); });
      });
      listEl.querySelectorAll(".ph-size").forEach(sel => {
        sel.addEventListener("change", () => { state.photos[sel.dataset.idx].size = sel.value; refreshAll(); });
      });
      listEl.querySelectorAll(".ph-focus").forEach(sel => {
        sel.addEventListener("change", () => { state.photos[sel.dataset.idx].focus = sel.value; refreshAll(); });
      });
      listEl.querySelectorAll(".ph-up").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = Number(btn.dataset.idx);
          if (i > 0) {
            [state.photos[i - 1], state.photos[i]] = [state.photos[i], state.photos[i - 1]];
            renderPhotoEditorList(); refreshAll();
          }
        });
      });
      listEl.querySelectorAll(".ph-down").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = Number(btn.dataset.idx);
          if (i < state.photos.length - 1) {
            [state.photos[i + 1], state.photos[i]] = [state.photos[i], state.photos[i + 1]];
            renderPhotoEditorList(); refreshAll();
          }
        });
      });
      listEl.querySelectorAll(".ph-del").forEach(btn => {
        btn.addEventListener("click", () => {
          state.photos.splice(Number(btn.dataset.idx), 1);
          renderPhotoEditorList(); refreshAll();
        });
      });
    }

    function syncSidebarFromState() {
      inputGuest.value = guestName;
      fieldInputs.forEach((inp) => { inp.value = state[inp.dataset.field] ?? ""; });
      document.querySelectorAll(".theme-chip").forEach((c) => {
        c.classList.toggle("active", c.dataset.theme === state.theme);
      });
      document.querySelectorAll("[data-hl]").forEach((b) => {
        b.classList.toggle("active", b.dataset.hl === (state.headlineFormat || "classic"));
      });
      if (state.customAccent) pickAccent.value = state.customAccent;
      if (state.customBg) pickBg.value = state.customBg;
      fxEnv.checked = fxState.env;
      fxConfetti.checked = fxState.confetti;
      fxParticles.checked = fxState.particles;
      fxTilt.checked = fxState.tilt;
      showCallBtn.checked = !!state.showCallBtn;
      showCelebrateBtn.checked = !!state.showCelebrateBtn;
      chibiEnabled.checked = !!state.chibiEnabled;
      chibiMode.value = state.chibiMode || "guide-info";
      photoLayout.value = state.photoLayout || "polaroid";
      renderPhotoEditorList();
    }

    function buildShareUrl() {
      const g = guestName.trim() || "Bạn";
      const q = new URLSearchParams();
      q.set("to", g);

      const fxList = [];
      if (fxState.env) fxList.push("env");
      if (fxState.confetti) fxList.push("conf");
      if (fxState.particles) fxList.push("part");
      if (fxState.tilt) fxList.push("tilt");
      q.set("fx", fxList.join(","));

      const diff = {};
      for (const key of Object.keys(DEFAULT_CONFIG)) {
        if (key === "photos") {
          const shareablePhotos = (state.photos || []).filter(p => p.url && !p.url.startsWith("data:"));
          if (JSON.stringify(shareablePhotos) !== JSON.stringify(DEFAULT_CONFIG.photos)) {
            diff.photos = shareablePhotos;
          }
        } else if (state[key] !== DEFAULT_CONFIG[key]) {
          diff[key] = state[key];
        }
      }
      if (Object.keys(diff).length > 0) q.set("d", encodeCfg(diff));

      const baseUrl = window.location.href.split("#")[0].split("?")[0];
      return `${baseUrl}?${q.toString()}`;
    }

    function saveDraftAndUrl(manual = false) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ guestName, config: state, fx: fxState }));
        const now = new Date();
        const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        document.getElementById("saveStatus").textContent = `● Đã lưu bản nháp lúc ${t}`;
        if (manual) showToast("Đã lưu format thiệp trên máy!");
      } catch {
        if (manual) showToast("Bộ nhớ trình duyệt đầy (hãy giảm bớt ảnh lớn)");
      }
      const url = buildShareUrl();
      document.getElementById("shareUrlPreview").textContent = url;
      document.getElementById("testLinkBtn").href = url;
      document.getElementById("testMap1").href = sanitizeLinkUrl(state.gate1Url);
      document.getElementById("testMap2").href = sanitizeLinkUrl(state.gate2Url);
    }

    let pendingSlotForUpload = null;

    const previewMount = createCardIn(
      "previewMount",
      true,
      (field, value) => {
        const inp = document.querySelector(`[data-field="${field}"]`);
        if (inp && document.activeElement !== inp) inp.value = value;
        saveDraftAndUrl();
      },
      (slotName) => {
        pendingSlotForUpload = slotName;
        switchTab("tab-photos");
        document.getElementById("uploadPhotoInput").click();
      }
    );

    function refreshAll() {
      updateCardIn(previewMount, false);
      saveDraftAndUrl();
    }

    syncSidebarFromState();
    refreshAll();

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Giả lập màn hình Máy tính / Điện thoại ngay trong Builder
    document.querySelectorAll("[data-vp]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-vp]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("previewStageWrap").classList.toggle("is-mobile-sim", btn.dataset.vp === "mobile");
        setTimeout(() => window.GradChibi.render(previewMount, state), 50);
      });
    });

    inputGuest.addEventListener("input", () => { guestName = inputGuest.value; refreshAll(); });
    fieldInputs.forEach((inp) => {
      inp.addEventListener("input", () => { state[inp.dataset.field] = inp.value; refreshAll(); });
    });

    document.querySelectorAll(".theme-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.theme = chip.dataset.theme; state.customAccent = ""; state.customBg = "";
        syncSidebarFromState(); refreshAll();
      });
    });
    pickAccent.addEventListener("input", () => { state.customAccent = pickAccent.value; refreshAll(); });
    pickBg.addEventListener("input", () => { state.customBg = pickBg.value; refreshAll(); });
    document.getElementById("clearCustomColorBtn").addEventListener("click", () => {
      state.customAccent = ""; state.customBg = ""; refreshAll();
    });

    document.querySelectorAll("[data-hl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.headlineFormat = btn.dataset.hl;
        syncSidebarFromState(); refreshAll();
      });
    });

    document.querySelectorAll(".style-pill[data-style]").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".style-pill[data-style]").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const p = PRESETS[pill.dataset.style];
        if (p) { state.headlineTpl = p.headlineTpl; state.message = p.message; syncSidebarFromState(); refreshAll(); }
      });
    });

    [fxEnv, fxConfetti, fxParticles, fxTilt, showCallBtn, showCelebrateBtn, chibiEnabled].forEach((cb) => {
      cb.addEventListener("change", () => {
        fxState.env = fxEnv.checked;
        fxState.confetti = fxConfetti.checked;
        fxState.particles = fxParticles.checked;
        fxState.tilt = fxTilt.checked;
        state.showCallBtn = showCallBtn.checked;
        state.showCelebrateBtn = showCelebrateBtn.checked;
        state.chibiEnabled = chibiEnabled.checked;
        refreshAll();
      });
    });

    chibiMode.addEventListener("change", () => { state.chibiMode = chibiMode.value; refreshAll(); });
    photoLayout.addEventListener("change", () => { state.photoLayout = photoLayout.value; refreshAll(); });

    // Upload & Kéo thả ảnh
    function compressLocalFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const maxW = 700;
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.72));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    async function handleSelectedFiles(files) {
      const targetSlot = pendingSlotForUpload || "middle";
      pendingSlotForUpload = null;
      state.photos = state.photos || [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        const dataUrl = await compressLocalFile(f);
        state.photos.push({ url: dataUrl, caption: "", slot: targetSlot, size: "normal", focus: "top" });
      }
      renderPhotoEditorList();
      refreshAll();
    }

    document.getElementById("uploadPhotoInput").addEventListener("change", async (e) => {
      await handleSelectedFiles(Array.from(e.target.files || []));
      e.target.value = "";
    });

    const dropzone = document.getElementById("dropzoneBox");
    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
      await handleSelectedFiles(Array.from(e.dataTransfer.files || []));
    });

    document.getElementById("addPhotoUrlBtn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.photos = state.photos || [];
      state.photos.push({ url: "images/anh1.jpg", caption: "", slot: "middle", size: "normal", focus: "top" });
      renderPhotoEditorList();
      refreshAll();
    });

    // XEM THỬ NGAY TRONG TRANG
    const builderShell = document.getElementById("builderShell");
    const guestShell = document.getElementById("guestShell");
    const quickBar = document.getElementById("quickPreviewBar");

    document.getElementById("quickPreviewBtn").addEventListener("click", () => {
      builderShell.classList.add("hidden");
      guestShell.classList.remove("hidden");
      quickBar.classList.remove("hidden");
      const mount = createCardIn("guestMount", false);
      updateCardIn(mount, true);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (fxState.env) openEnvelopeScreen();
      else window.GradEffects.fireConfetti(100);
    });

    document.getElementById("exitQuickPreviewBtn").addEventListener("click", () => {
      document.getElementById("envelopeOverlay").classList.add("hidden");
      guestShell.classList.add("hidden");
      quickBar.classList.add("hidden");
      builderShell.classList.remove("hidden");
      refreshAll();
    });

    // LƯU NHÁP & TẢI FILE CONFIG.JS ĐỂ PUSH WEB
    document.getElementById("saveNowBtn").addEventListener("click", () => saveDraftAndUrl(true));

    document.getElementById("downloadConfigBtn").addEventListener("click", () => {
      const content = buildFullConfigJsContent(state);
      const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "config.js";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Đã tải file config.js! Hãy chép đè vào thư mục js/");
    });

    document.getElementById("resetDraftBtn").addEventListener("click", () => {
      state = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      guestName = "Minh Anh";
      Object.assign(fxState, { env: true, confetti: true, particles: true, tilt: true });
      localStorage.removeItem(STORAGE_KEY);
      syncSidebarFromState();
      refreshAll();
      showToast("Đã khôi phục mặc định!");
    });

    document.getElementById("copyLinkBtn").addEventListener("click", async () => {
      const url = buildShareUrl();
      try { await navigator.clipboard.writeText(url); } catch {}
      showToast("Đã copy link gửi khách!");
    });

    const exportModal = document.getElementById("exportModal");
    document.getElementById("openExportBtn").addEventListener("click", () => {
      document.getElementById("exportCodeArea").value = buildFullConfigJsContent(state);
      exportModal.classList.remove("hidden");
    });
    document.getElementById("closeExportBtn").addEventListener("click", () => exportModal.classList.add("hidden"));
    document.getElementById("copyExportBtn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(document.getElementById("exportCodeArea").value); } catch {}
      showToast("Đã copy code config.js!");
    });
  }
})();