/* eslint-disable no-use-before-define */
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const WA_URL =
    "https://wa.me/919569909426?text=Love%20you%20mohammmaduuuu%20%F0%9F%92%95%F0%9F%A5%B9";

  const state = {
    musicOn: false,
    audio: null,
    audioStartedOnce: false,
    firstGiftClicked: false,
    allowTrail: true,
    lastTrailAt: 0,
    noMoves: 0,
  };

  const el = {
    app: qs("#app"),
    fx: qs("#fx"),
    veil: qs("#fadeVeil"),

    musicToggle: qs("#musicToggle"),
    musicLabel: qs("#musicLabel"),

    scene1: qs("#scene1"),
    scene2: qs("#scene2"),
    tease: qs("#s1-tease"),
    btnYes: qs("#btnYes"),
    btnNo: qs("#btnNo"),
    btnOkay: qs("#btnOkay"),

    letterStage: qs("#letterStage"),
    letterCard: qs("#letterCard"),
    btnSurprise: qs("#btnSurprise"),

    giftStage: qs("#giftStage"),
    giftGrid: qs("#giftGrid"),
    giftPopup: qs("#giftPopup"),
    btnPopupOk: qs("#btnPopupOk"),

    outfitModal: qs("#outfitModal"),
    outfitGrid: qs("#outfitGrid"),
  };

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) state.allowTrail = false;

  // ---------- small haptics ----------
  function buzz(ms = 18) {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (_) {
      // ignore
    }
  }

  // ---------- cursor / touch heart trail ----------
  function spawnTrailHeart(x, y) {
    if (!state.allowTrail) return;
    const now = performance.now();
    if (now - state.lastTrailAt < 28) return; // throttle
    state.lastTrailAt = now;

    const h = document.createElement("span");
    h.className = "trail-heart";
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    h.style.setProperty("--dx", `${(Math.random() * 26 - 13).toFixed(1)}px`);
    document.body.appendChild(h);
    window.setTimeout(() => h.remove(), 980);
  }

  function onPointerMove(ev) {
    if (ev.touches && ev.touches[0]) {
      spawnTrailHeart(ev.touches[0].clientX, ev.touches[0].clientY);
      return;
    }
    spawnTrailHeart(ev.clientX, ev.clientY);
  }

  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });

  // ---------- dreamy background “music” (Web Audio synth) ----------
  function createDreamySynth() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.8;
    filter.connect(master);

    // gentle shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 0.18;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 140;
    shimmer.connect(shimmerGain);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);

    const chords = [
      [261.63, 329.63, 392.0], // C
      [293.66, 369.99, 440.0], // Dm
      [329.63, 415.3, 493.88], // Em
      [349.23, 440.0, 523.25], // F
      [392.0, 493.88, 587.33], // G
      [440.0, 554.37, 659.25], // A
    ];

    let step = 0;
    const voices = [];

    function voice(freq) {
      const o = ctx.createOscillator();
      o.type = "triangle";

      const g = ctx.createGain();
      g.gain.value = 0.0001;

      // tiny chorus detune
      o.frequency.value = freq;
      shimmerGain.connect(o.frequency);
      lfoGain.connect(g.gain);

      o.connect(g);
      g.connect(filter);
      o.start();
      return { o, g };
    }

    // create 3 voices
    for (let i = 0; i < 3; i++) voices.push(voice(chords[0][i]));

    shimmer.start();
    lfo.start();

    function setChord(index) {
      const chord = chords[index % chords.length];
      chord.forEach((f, i) => {
        voices[i].o.frequency.setTargetAtTime(f, ctx.currentTime, 0.08);
        // gentle pluck-ish envelope
        voices[i].g.gain.cancelScheduledValues(ctx.currentTime);
        voices[i].g.gain.setValueAtTime(0.0001, ctx.currentTime);
        voices[i].g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.2);
        voices[i].g.gain.exponentialRampToValueAtTime(0.012, ctx.currentTime + 1.3);
      });
    }

    const timer = window.setInterval(() => {
      step += 1;
      setChord(step);
    }, 2200);

    function setEnabled(enabled) {
      const target = enabled ? 0.18 : 0.0001; // gentle volume
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(target, ctx.currentTime, 0.06);
    }

    function destroy() {
      window.clearInterval(timer);
      try {
        shimmer.stop();
        lfo.stop();
      } catch (_) {
        // ignore
      }
      voices.forEach((v) => {
        try {
          v.o.stop();
        } catch (_) {
          // ignore
        }
      });
      try {
        ctx.close();
      } catch (_) {
        // ignore
      }
    }

    return { ctx, setEnabled, destroy };
  }

  function ensureAudioStarted() {
    if (state.audioStartedOnce) return;
    state.audioStartedOnce = true;
    state.audio = createDreamySynth();
    updateMusicUI();
  }

  function setMusic(on) {
    ensureAudioStarted();
    state.musicOn = on;
    if (state.audio?.ctx?.state === "suspended") state.audio.ctx.resume().catch(() => {});
    state.audio?.setEnabled(on);
    updateMusicUI();
  }

  function toggleMusic() {
    buzz(16);
    ensureAudioStarted();
    setMusic(!state.musicOn);
  }

  function updateMusicUI() {
    el.musicLabel.textContent = state.musicOn ? "Music On" : "Muted";
    el.musicToggle.style.boxShadow = state.musicOn
      ? "0 18px 55px rgba(255,95,178,.26), 0 0 0 1px rgba(255,255,255,.25)"
      : "";
  }

  // autoplay only after first user interaction
  const firstInteraction = () => {
    document.removeEventListener("pointerdown", firstInteraction);
    document.removeEventListener("keydown", firstInteraction);
    ensureAudioStarted();
    // start muted by default; user can toggle, but we can gently turn on after interaction:
    setMusic(true);
  };
  document.addEventListener("pointerdown", firstInteraction, { passive: true });
  document.addEventListener("keydown", firstInteraction);

  el.musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMusic();
  });

  // ---------- GSAP helpers ----------
  function showLayer(layer) {
    layer.classList.remove("is-hidden");
  }
  function hideLayer(layer) {
    layer.classList.add("is-hidden");
  }

  function gsapIn(target, vars = {}) {
    if (prefersReduced) return;
    gsap.fromTo(
      target,
      { y: 18, opacity: 0, scale: 0.98, filter: "blur(6px)" },
      { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", ...vars },
    );
  }

  function gsapOut(target, vars = {}) {
    if (prefersReduced) return;
    gsap.to(target, {
      y: -10,
      opacity: 0,
      scale: 0.98,
      filter: "blur(8px)",
      duration: 0.45,
      ease: "power2.inOut",
      ...vars,
    });
  }

  // ---------- hearts burst ----------
  function heartBurst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 16) {
    for (let i = 0; i < count; i++) {
      const h = document.createElement("span");
      h.className = "trail-heart";
      h.style.left = `${x}px`;
      h.style.top = `${y}px`;
      h.style.setProperty("--dx", `${(Math.random() * 120 - 60).toFixed(1)}px`);
      h.style.animationDuration = `${700 + Math.random() * 600}ms`;
      h.style.opacity = `${0.7 + Math.random() * 0.3}`;
      h.style.transform = `translate(-50%,-50%) rotate(45deg) scale(${0.9 + Math.random() * 0.8})`;
      document.body.appendChild(h);
      window.setTimeout(() => h.remove(), 1300);
    }
  }

  // ---------- Scene 1: playful NO ----------
  function moveNoButtonAway(pointerX, pointerY) {
    const btn = el.btnNo;
    const rect = btn.getBoundingClientRect();
    const pad = 14;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // place within viewport padding, biased away from pointer
    const awayX = rect.left + rect.width / 2 - pointerX;
    const awayY = rect.top + rect.height / 2 - pointerY;
    const biasX = awayX >= 0 ? 1 : -1;
    const biasY = awayY >= 0 ? 1 : -1;

    const nx = clamp(
      Math.random() * (w - rect.width - pad * 2) + pad + biasX * 30,
      pad,
      w - rect.width - pad,
    );
    const ny = clamp(
      Math.random() * (h - rect.height - pad * 2) + pad + biasY * 24,
      pad,
      h - rect.height - pad,
    );

    btn.style.position = "fixed";
    btn.style.left = `${nx}px`;
    btn.style.top = `${ny}px`;
    btn.style.zIndex = "80";
    btn.style.willChange = "transform";

    if (!prefersReduced) {
      gsap.fromTo(btn, { scale: 0.98 }, { scale: 1.03, yoyo: true, repeat: 1, duration: 0.12, ease: "power1.inOut" });
    }

    state.noMoves += 1;
    el.tease.textContent = "Hehe 😜 don’t lieee~";
    buzz(12);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function attachNoDodge() {
    const btn = el.btnNo;
    const dodge = (ev) => {
      const px = ev.clientX ?? (ev.touches && ev.touches[0] ? ev.touches[0].clientX : window.innerWidth / 2);
      const py = ev.clientY ?? (ev.touches && ev.touches[0] ? ev.touches[0].clientY : window.innerHeight / 2);
      moveNoButtonAway(px, py);
    };

    btn.addEventListener("mouseenter", (ev) => {
      // a tiny grace: first hover just wiggles, then runs away
      if (state.noMoves === 0 && !prefersReduced) {
        gsap.fromTo(btn, { x: 0 }, { x: 8, yoyo: true, repeat: 3, duration: 0.08 });
        state.noMoves += 1;
        el.tease.textContent = "Hehe 😜 don’t lieee~";
        return;
      }
      dodge(ev);
    });
    btn.addEventListener("touchstart", dodge, { passive: true });
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      dodge(ev);
    });
  }

  // ---------- Scene flow ----------
  function goScene2() {
    showLayer(el.scene2);
    gsapIn(qs(".modal", el.scene2), { y: 26, scale: 0.96, duration: 0.62 });
  }

  function goLetter() {
    hideLayer(el.scene2);
    showLayer(el.letterStage);
    el.letterStage.classList.add("is-active");

    if (!prefersReduced) {
      gsap.fromTo(
        el.letterCard,
        { y: -78, opacity: 0, scale: 0.98, filter: "blur(10px)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
      );
    }

    window.setTimeout(() => {
      el.letterCard.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    }, 180);
  }

  function goGifts() {
    hideLayer(el.letterStage);
    el.letterStage.classList.remove("is-active");
    showLayer(el.giftStage);
    gsapIn(el.giftStage, { y: 18, duration: 0.7 });
    window.setTimeout(() => {
      el.giftStage.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    }, 120);
  }

  // ---------- Gift grid ----------
  function buildGifts() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "gift";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Gift box ${i + 1}`);
      cell.innerHTML = `
        <div class="gift__spark" aria-hidden="true"></div>
        <div class="gift__box" aria-hidden="true">
          <div class="gift__ribbon"></div>
          <div class="gift__lid"></div>
        </div>
      `;
      cell.addEventListener("click", (ev) => onGiftClick(ev, cell));
      frag.appendChild(cell);
    }
    el.giftGrid.appendChild(frag);
  }

  // ---------- Confetti + fireworks on canvas ----------
  const fx = (() => {
    const canvas = el.fx;
    const ctx = canvas.getContext("2d");
    const particles = [];
    const sparks = [];

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function addConfettiBurst(x, y) {
      const colors = ["#ff5fb2", "#a48bff", "#ffd38a", "#3dd6c6", "#ffffff"];
      const n = 140;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2.6 + Math.random() * 5.4;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2.2,
          g: 0.12 + Math.random() * 0.08,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          w: 5 + Math.random() * 6,
          h: 2 + Math.random() * 4,
          life: 60 + Math.random() * 40,
          color: colors[(Math.random() * colors.length) | 0],
        });
      }
    }

    function addFirework(x, y) {
      const palette = ["#ff5fb2", "#a48bff", "#ffd38a", "#ffe7ff", "#3dd6c6"];
      const c = palette[(Math.random() * palette.length) | 0];
      const n = 90;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
        const sp = 2.2 + Math.random() * 4.8;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          g: 0.05 + Math.random() * 0.03,
          life: 46 + Math.random() * 20,
          r: 1.2 + Math.random() * 1.8,
          color: c,
        });
      }
    }

    let last = performance.now();
    function tick(now) {
      const dt = Math.min(33, now - last);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // confetti
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt / 16;
        p.vy += p.g * (dt / 16);
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.rot += p.vr * (dt / 16);
        p.vx *= 0.994;
        p.vy *= 0.996;

        const alpha = clamp(p.life / 60, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha * 0.95;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.life <= 0 || p.y > window.innerHeight + 60) particles.splice(i, 1);
      }

      // fireworks sparks
      ctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt / 16;
        s.vy += s.g * (dt / 16);
        s.x += s.vx * (dt / 16);
        s.y += s.vy * (dt / 16);
        s.vx *= 0.985;
        s.vy *= 0.985;
        const alpha = clamp(s.life / 46, 0, 1);

        ctx.beginPath();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.life <= 0) sparks.splice(i, 1);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function boom(x, y) {
      addConfettiBurst(x, y);
      addFirework(x, y);
      addFirework(x + (Math.random() * 120 - 60), y - (Math.random() * 80));
      addFirework(x + (Math.random() * 140 - 70), y + (Math.random() * 50 - 25));
    }

    return { boom };
  })();

  function showGiftPopup() {
    showLayer(el.giftPopup);
    gsapIn(qs(".popup__card", el.giftPopup), { y: 28, scale: 0.96, duration: 0.62 });
  }

  function hideGiftPopup() {
    if (prefersReduced) {
      hideLayer(el.giftPopup);
      return;
    }
    gsapOut(qs(".popup__card", el.giftPopup), {
      onComplete: () => hideLayer(el.giftPopup),
    });
  }

  function onGiftClick(ev, cell) {
    buzz(22);
    cell.classList.add("is-open");

    const rect = cell.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    fx.boom(x, y);
    heartBurst(x, y, 10);

    showGiftPopup();

    if (!state.firstGiftClicked) {
      state.firstGiftClicked = true;
      window.setTimeout(() => {
        showOutfits();
      }, 5000);
    }
  }

  // ---------- Outfit selection ----------
  function buildOutfits() {
    const outfits = [
      { id: "pastel-silver", name: "Pastel Silver Saree", vibe: "dreamy ✨", colors: ["#ffd1e8", "#f5f0ff", "#ffffff"] },
      { id: "sky-blue", name: "Sky Blue Saree", vibe: "soft & sweet 🫶", colors: ["#cfe7ff", "#d8c8ff", "#ffffff"] },
      { id: "cocoa-cozy", name: "Cocoa Cozy Fit", vibe: "cute & comfy 🤎", colors: ["#f0d8c8", "#caa58c", "#5f3a2a"] },
      { id: "midnight-indigo", name: "Midnight Indigo Dress", vibe: "wow factor 🌙", colors: ["#2a2f55", "#6b78ff", "#ffffff"] },
      { id: "powder-blue", name: "Powder Blue Set", vibe: "date-ready 💙", colors: ["#cfe7ff", "#ffe7c9", "#ffffff"] },
      { id: "sage-green", name: "Sage Green Casual", vibe: "cool & calm 🌿", colors: ["#b8d3c3", "#3d6b57", "#ffffff"] },
    ];

    const frag = document.createDocumentFragment();
    outfits.forEach((o, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "outfit";
      card.dataset.outfitId = o.id;
      card.dataset.outfitName = o.name;
      card.dataset.colors = o.colors.join(",");
      card.innerHTML = `
        <div class="outfit__img" aria-hidden="true"></div>
        <div class="outfit__label">
          <span>${escapeHtml(o.name)}</span>
          <span class="outfit__tag">${escapeHtml(o.vibe)}</span>
        </div>
      `;
      const img = qs(".outfit__img", card);
      img.style.background = `linear-gradient(135deg, ${o.colors[0]}, ${o.colors[1]}, ${o.colors[2]})`;

      card.addEventListener("click", () => onSelectOutfit(o, idx));
      frag.appendChild(card);
    });

    el.outfitGrid.appendChild(frag);
  }

  function showOutfits() {
    showLayer(el.outfitModal);
    gsapIn(qs(".modal", el.outfitModal), { y: 20, scale: 0.97 });
  }

  function hideOutfits() {
    if (prefersReduced) {
      hideLayer(el.outfitModal);
      return;
    }
    gsapOut(qs(".modal", el.outfitModal), {
      onComplete: () => hideLayer(el.outfitModal),
    });
  }

  async function onSelectOutfit(outfit, idx) {
    buzz(30);
    hideOutfits();
    await fadeAndDeliver(outfit, idx);
  }

  function outfitPlaceholderDataUrl(outfit) {
    const w = 1200;
    const h = 630;
    const c0 = outfit.colors[0] || "#ffd1e8";
    const c1 = outfit.colors[1] || "#d8c8ff";
    const c2 = outfit.colors[2] || "#ffe7c9";
    const name = outfit.name || "Outfit";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${c0}"/>
            <stop offset="0.55" stop-color="${c1}"/>
            <stop offset="1" stop-color="${c2}"/>
          </linearGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <circle cx="220" cy="180" r="130" fill="rgba(255,255,255,.35)" filter="url(#blur)"/>
        <circle cx="980" cy="140" r="170" fill="rgba(255,255,255,.22)" filter="url(#blur)"/>
        <circle cx="920" cy="520" r="220" fill="rgba(255,255,255,.18)" filter="url(#blur)"/>
        <text x="60" y="120" font-family="Inter, Arial" font-size="44" font-weight="800" fill="rgba(42,33,51,.85)">Ariba’s Surprise Outfit</text>
        <text x="60" y="185" font-family="Inter, Arial" font-size="28" font-weight="700" fill="rgba(42,33,51,.70)">${escapeXml(
          name,
        )}</text>
        <text x="60" y="555" font-family="Inter, Arial" font-size="20" font-weight="700" fill="rgba(42,33,51,.58)">Made with love, courage & a sorry heart 💖</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  async function dataUrlToFile(dataUrl, filename) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : blob.type.includes("jpeg") ? "jpg" : "svg";
    return new File([blob], `${filename}.${ext}`, { type: blob.type });
  }

  async function tryWebShare(outfit) {
    if (!navigator.share) return false;

    const shareText = "Love you mohammmaduuuu 💕🥹";
    const dataUrl = outfitPlaceholderDataUrl(outfit);

    try {
      const file = await dataUrlToFile(dataUrl, "ariba-outfit");
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
      if (!canShareFiles) return false;

      await navigator.share({
        title: "For Ariba 💗",
        text: shareText,
        files: [file],
        url: WA_URL, // some UAs will include this
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function fadeAndDeliver(outfit) {
    showLayer(el.veil);
    if (!prefersReduced) {
      gsap.to(el.veil, { opacity: 1, duration: 0.75, ease: "power2.out" });
    } else {
      el.veil.style.opacity = "1";
    }

    // a tiny pause for “cinematic” feel
    await sleep(520);

    const shared = await tryWebShare(outfit);
    if (shared) {
      // after sharing, still open WhatsApp link to deliver the text reliably
      await sleep(300);
    }
    window.location.href = WA_URL;
  }

  // ---------- Wiring ----------
  function init() {
    // background floating hearts (very light)
    if (!prefersReduced) {
      const bg = qs(".bg");
      const n = 10;
      for (let i = 0; i < n; i++) {
        const h = document.createElement("span");
        h.className = "bg-heart";
        h.style.left = `${Math.random() * 100}%`;
        h.style.top = `${60 + Math.random() * 60}%`;
        h.style.setProperty("--dur", `${9 + Math.random() * 8}s`);
        h.style.setProperty("--s", `${0.7 + Math.random() * 1.0}`);
        h.style.animationDelay = `${Math.random() * 6}s`;
        bg.appendChild(h);
      }
    }

    // entrance
    gsapIn(qs(".modal", el.scene1), { y: 28, scale: 0.96, duration: 0.72 });

    attachNoDodge();
    buildGifts();
    buildOutfits();

    el.btnYes.addEventListener("click", (ev) => {
      buzz(26);
      const rect = ev.currentTarget.getBoundingClientRect();
      heartBurst(rect.left + rect.width / 2, rect.top, 16);

      if (prefersReduced) {
        hideLayer(el.scene1);
        goScene2();
        return;
      }

      gsapOut(qs(".modal", el.scene1), {
        onComplete: () => {
          hideLayer(el.scene1);
          goScene2();
        },
      });
    });

    el.btnOkay.addEventListener("click", () => {
      buzz(20);
      goLetter();
    });

    el.btnSurprise.addEventListener("click", (ev) => {
      buzz(28);
      const rect = ev.currentTarget.getBoundingClientRect();
      fx.boom(rect.left + rect.width / 2, rect.top + rect.height / 2);
      heartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
      goGifts();
    });

    el.btnPopupOk.addEventListener("click", () => {
      buzz(18);
      hideGiftPopup();
    });

    // tapping backdrop closes popup
    el.giftPopup.addEventListener("click", (ev) => {
      if (ev.target === el.giftPopup) hideGiftPopup();
    });

    // safety: if user clicks outside outfit modal, do nothing (keeps focus on choice)
  }

  // ---------- utils ----------
  function sleep(ms) {
    return new Promise((r) => window.setTimeout(r, ms));
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeXml(str) {
    return escapeHtml(str);
  }

  init();
})();

