/* Proposal page interactions (no dependencies). */

const $ = (sel, root = document) => root.querySelector(sel);

const state = {
  ronaldoMode: false,
  soundOn: false,
  confettiOn: false,
  audioCtx: null,
  noBtnArmed: false,
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function setAriaPressed(el, val) {
  if (!el) return;
  el.setAttribute("aria-pressed", val ? "true" : "false");
}

function startTypeLoop() {
  const el = $("#typeLine");
  if (!el) return;

  const lines = [
    "Ready for your highlight of the season?",
    "Basit, you’re my favorite win.",
    "Ronaldo vibes: relentless love, always improving.",
    "One question… and a lifetime of celebrations.",
  ];

  if (prefersReducedMotion()) {
    el.textContent = lines[1];
    return;
  }

  let i = 0;
  let t = 0;
  let direction = 1;
  const speed = 28;
  const pause = 900;

  const tick = () => {
    const current = lines[i];
    t += direction;
    el.textContent = current.slice(0, t);

    if (direction === 1 && t >= current.length) {
      direction = -1;
      window.setTimeout(tick, pause);
      return;
    }
    if (direction === -1 && t <= 0) {
      direction = 1;
      i = (i + 1) % lines.length;
      window.setTimeout(tick, 250);
      return;
    }
    window.setTimeout(tick, speed);
  };

  tick();
}

function setupModal() {
  const modal = $("#modal");
  if (!modal) return;
  const panel = $(".modal__panel", modal);
  const closeTargets = modal.querySelectorAll("[data-close='true']");

  const focusableSelector =
    "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";

  function open() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const focusable = panel?.querySelectorAll(focusableSelector);
    focusable?.[0]?.focus?.();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeTargets.forEach((el) => el.addEventListener("click", close));

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll(focusableSelector));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  $("#previewBtn")?.addEventListener("click", open);

  return { open, close };
}

function setupModeToggle() {
  const btn = $("#toggleMode");
  if (!btn) return;
  btn.addEventListener("click", () => {
    state.ronaldoMode = !state.ronaldoMode;
    document.body.classList.toggle("ronaldo-mode", state.ronaldoMode);
    setAriaPressed(btn, state.ronaldoMode);
  });
}

function ensureAudio() {
  if (state.audioCtx) return state.audioCtx;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  state.audioCtx = new AudioContext();
  return state.audioCtx;
}

function playStadiumChant() {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.08;
  master.connect(ctx.destination);

  const notes = [
    { f: 220, t: 0.0, d: 0.10 },
    { f: 247, t: 0.14, d: 0.10 },
    { f: 294, t: 0.28, d: 0.12 },
    { f: 220, t: 0.46, d: 0.12 },
    { f: 330, t: 0.62, d: 0.14 },
    { f: 392, t: 0.80, d: 0.18 },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(n.f, now + n.t);
    gain.gain.setValueAtTime(0.0001, now + n.t);
    gain.gain.exponentialRampToValueAtTime(0.6, now + n.t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + n.t);
    osc.stop(now + n.t + n.d + 0.02);
  });

  // Add a short "crowd" noise burst.
  const bufferSize = Math.floor(ctx.sampleRate * 0.35);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.0;
  noise.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now + 0.95);
  noiseGain.gain.setValueAtTime(0.0001, now + 0.95);
  noiseGain.gain.exponentialRampToValueAtTime(0.5, now + 1.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.22);
  noise.stop(now + 1.25);
}

function setupSoundToggle() {
  const btn = $("#soundBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    state.soundOn = !state.soundOn;
    setAriaPressed(btn, state.soundOn);
    if (!state.soundOn) return;
    try {
      await ensureAudio()?.resume?.();
      playStadiumChant();
    } catch {
      // ignore
    }
  });
}

function setupConfetti() {
  const canvas = $("#confetti");
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let particles = [];
  let raf = 0;

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(count = 160) {
    const colors = state.ronaldoMode
      ? ["#32d583", "#f8cc5a", "#ffffff", "#0ea5e9"]
      : ["#ff4d8d", "#6df3ff", "#ffffff", "#f8cc5a"];
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: w * 0.5 + (Math.random() - 0.5) * 120,
        y: -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 4.2,
        vy: 2.5 + Math.random() * 4.8,
        r: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.22,
        c: colors[Math.floor(Math.random() * colors.length)],
        life: 260 + Math.random() * 80,
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    for (const p of particles) {
      p.life -= 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.015;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = clamp(p.life / 240, 0, 1);
      ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
      ctx.restore();
    }
    raf = window.requestAnimationFrame(step);
  }

  function start() {
    if (state.confettiOn) return;
    state.confettiOn = true;
    canvas.classList.add("is-on");
    resize();
    spawn(prefersReducedMotion() ? 60 : 190);
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(step);
  }

  function stop() {
    state.confettiOn = false;
    canvas.classList.remove("is-on");
    particles = [];
    window.cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", () => {
    if (!state.confettiOn) return;
    resize();
  });

  return { start, stop };
}

function setupNoButtonDodge() {
  const noBtn = $("#noBtn");
  const yesBtn = $("#yesBtn");
  const wrap = $(".buttons");
  if (!noBtn || !wrap) return;

  // Only dodge pointer interactions (keyboard stays usable).
  const move = () => {
    state.noBtnArmed = true;
    wrap.style.minHeight = `${Math.max(wrap.offsetHeight, 64)}px`;
    noBtn.style.position = "absolute";
    noBtn.style.right = "auto";
    noBtn.style.bottom = "auto";

    const padding = 8;
    const box = wrap.getBoundingClientRect();
    const btnBox = noBtn.getBoundingClientRect();
    const yesBox = yesBtn?.getBoundingClientRect?.() ?? null;

    const maxX = Math.max(padding, box.width - btnBox.width - padding);
    const maxY = Math.max(padding, box.height - btnBox.height - padding);

    let x = 0;
    let y = 0;
    let tries = 0;
    do {
      x = Math.random() * maxX;
      y = Math.random() * maxY;
      tries++;
      if (!yesBox) break;
      const proposed = {
        left: box.left + x,
        right: box.left + x + btnBox.width,
        top: box.top + y,
        bottom: box.top + y + btnBox.height,
      };
      const overlap =
        proposed.left < yesBox.right + 8 &&
        proposed.right > yesBox.left - 8 &&
        proposed.top < yesBox.bottom + 8 &&
        proposed.bottom > yesBox.top - 8;
      if (!overlap) break;
    } while (tries < 10);

    noBtn.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };

  const onPointer = (e) => {
    // Don’t dodge if reduced motion is requested.
    if (prefersReducedMotion()) return;
    // If it was a direct click, still move first to be playful.
    if (e?.type === "click") e.preventDefault();
    move();
  };

  noBtn.addEventListener("pointerenter", onPointer);
  noBtn.addEventListener("pointerdown", onPointer);
  noBtn.addEventListener("click", onPointer);

  // If user tabs to it, let it behave normally.
  noBtn.addEventListener("focus", () => {
    noBtn.style.position = "";
    noBtn.style.transform = "";
  });

  // If they do manage to click "No" via keyboard, show a gentle message.
  noBtn.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const panel = $(".panel");
    if (!panel) return;
    panel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    const p = document.createElement("p");
    p.className = "small muted";
    p.textContent = "Nice try 😄 But my heart only has one answer for you.";
    panel.appendChild(p);
  });
}

function setupYesFlow(confetti) {
  const yesBtn = $("#yesBtn");
  const panel = $(".panel");
  const soundBtn = $("#soundBtn");
  if (!yesBtn || !panel) return;

  const celebrate = async () => {
    confetti?.start?.();
    try {
      // If sound is enabled, play a quick chant on "Yes".
      if (state.soundOn) {
        await ensureAudio()?.resume?.();
        playStadiumChant();
      }
    } catch {
      // ignore
    }

    panel.innerHTML = `
      <h2 class="h2">SIUUU! 🏆</h2>
      <p class="lead">
        Basit Chishti… you said <strong>YES</strong>.
        <span class="muted">My favorite win, forever.</span>
      </p>
      <div class="buttons" style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap;">
        <button id="copyBtn" class="btn btn--primary btn--lg" type="button">Copy a sweet message</button>
        <button id="againBtn" class="btn btn--ghost btn--lg" type="button">Celebrate again</button>
      </div>
      <p class="small muted" style="margin-top:12px;">
        Tip: press <kbd>Y</kbd> anytime for “Yes”.
      </p>
    `;

    $("#copyBtn")?.addEventListener("click", async () => {
      const text =
        "Basit Chishti, will you marry me and be my forever teammate? You said YES — SIUUU! 🏆💍";
      try {
        await navigator.clipboard.writeText(text);
        const b = $("#copyBtn");
        if (b) b.textContent = "Copied!";
        window.setTimeout(() => {
          const bb = $("#copyBtn");
          if (bb) bb.textContent = "Copy a sweet message";
        }, 1400);
      } catch {
        // fallback: do nothing
      }
    });

    $("#againBtn")?.addEventListener("click", () => {
      confetti?.start?.();
      if (state.soundOn) playStadiumChant();
    });

    // Keep sound toggle usable after replacing panel HTML.
    soundBtn?.focus?.();
  };

  yesBtn.addEventListener("click", celebrate);

  document.addEventListener("keydown", (e) => {
    if (e.key?.toLowerCase?.() === "y") celebrate();
  });
}

function init() {
  startTypeLoop();
  setupModal();
  setupModeToggle();
  setupSoundToggle();
  const confetti = setupConfetti();
  setupNoButtonDodge();
  setupYesFlow(confetti);
}

document.addEventListener("DOMContentLoaded", init);

