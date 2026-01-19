const whatsappUrl =
  "https://wa.me/919569909426?text=Love%20you%20mohammmaduuuu%20%F0%9F%92%95%F0%9F%A5%B9";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const audio = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const musicLabel = musicToggle.querySelector(".music-label");

const scene1 = document.getElementById("scene-1");
const scene2 = document.getElementById("scene-2");
const scene3 = document.getElementById("scene-3");
const scene4 = document.getElementById("scene-4");

const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const teaseText = document.getElementById("tease-text");
const playfulArea = document.getElementById("playful-area");

const okayBtn = document.getElementById("okay-btn");
const surpriseBtn = document.getElementById("surprise-btn");

const giftBoxes = Array.from(document.querySelectorAll(".gift-box"));
const giftMessage = document.getElementById("gift-message");

const outfitModal = document.getElementById("outfit-modal");
const outfitCards = Array.from(document.querySelectorAll(".outfit-card"));

const fireworksContainer = document.getElementById("fireworks-container");

let fireworksInstance = null;
let outfitTimer = null;
let musicStarted = false;
let teaseShown = false;

const vibrateSoft = (duration = 25) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
  }
};

const updateMusicLabel = (isPlaying) => {
  musicLabel.textContent = isPlaying ? "Music On" : "Music Off";
};

const startMusic = async () => {
  if (!audio || musicStarted) return;
  audio.volume = 0.25;
  try {
    await audio.play();
    musicStarted = true;
    updateMusicLabel(true);
  } catch (error) {
    updateMusicLabel(false);
  }
};

const toggleMusic = async () => {
  vibrateSoft(15);
  if (!musicStarted) {
    await startMusic();
    return;
  }

  if (audio.paused) {
    await audio.play();
    updateMusicLabel(true);
  } else {
    audio.pause();
    updateMusicLabel(false);
  }
};

musicToggle.addEventListener("click", toggleMusic);

const unlockAudioOnInteraction = () => {
  startMusic();
  window.removeEventListener("pointerdown", unlockAudioOnInteraction);
  window.removeEventListener("touchstart", unlockAudioOnInteraction);
};

window.addEventListener("pointerdown", unlockAudioOnInteraction);
window.addEventListener("touchstart", unlockAudioOnInteraction);

const showScene = (scene, fromOverrides = {}, toOverrides = {}) => {
  scene.classList.add("active");
  if (prefersReducedMotion) return;
  gsap.fromTo(
    scene,
    { opacity: 0, y: 30, scale: 0.98, ...fromOverrides },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
      ...toOverrides,
    }
  );
};

const hideScene = (scene, onComplete) => {
  if (prefersReducedMotion) {
    scene.classList.remove("active");
    if (onComplete) onComplete();
    return;
  }

  gsap.to(scene, {
    opacity: 0,
    y: -20,
    duration: 0.35,
    ease: "power2.in",
    onComplete: () => {
      scene.classList.remove("active");
      scene.style.opacity = "";
      scene.style.transform = "";
      if (onComplete) onComplete();
    },
  });
};

const moveNoButton = () => {
  const areaRect = playfulArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const maxX = Math.max(areaRect.width - btnRect.width, 0);
  const maxY = Math.max(areaRect.height - btnRect.height, 0);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  gsap.to(noBtn, {
    x,
    y,
    duration: 0.4,
    ease: "power2.out",
  });

  if (!teaseShown) {
    teaseShown = true;
    gsap.to(teaseText, { opacity: 1, duration: 0.4 });
  }
};

const positionNoButton = () => {
  const areaRect = playfulArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const initialX = Math.max(areaRect.width - btnRect.width, 0);
  gsap.set(noBtn, { x: initialX, y: 0 });
};

const spawnHeartBurst = (origin) => {
  if (prefersReducedMotion) return;
  const rect = origin.getBoundingClientRect();
  const baseX = rect.left + rect.width / 2;
  const baseY = rect.top + rect.height / 2;

  for (let i = 0; i < 14; i += 1) {
    const heart = document.createElement("span");
    heart.className = "cursor-heart";
    heart.textContent = "💖";
    document.body.appendChild(heart);
    const x = baseX + (Math.random() * 80 - 40);
    const y = baseY + (Math.random() * 20 - 10);
    gsap.set(heart, { left: x, top: y, opacity: 0 });
    gsap.to(heart, {
      opacity: 1,
      y: y - 90 - Math.random() * 40,
      x: x + Math.random() * 60 - 30,
      duration: 1.4,
      ease: "power1.out",
      onComplete: () => heart.remove(),
    });
  }
};

const sparkleBurst = (origin) => {
  if (prefersReducedMotion) return;
  const rect = origin.getBoundingClientRect();
  for (let i = 0; i < 10; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "cursor-heart";
    sparkle.textContent = "✨";
    document.body.appendChild(sparkle);
    const x = rect.left + rect.width / 2 + (Math.random() * 120 - 60);
    const y = rect.top + rect.height / 2 + (Math.random() * 60 - 30);
    gsap.set(sparkle, { left: x, top: y, opacity: 0 });
    gsap.to(sparkle, {
      opacity: 1,
      y: y - 60 - Math.random() * 30,
      duration: 1.2,
      ease: "power1.out",
      onComplete: () => sparkle.remove(),
    });
  }
};

const showGiftMessage = () => {
  giftMessage.classList.add("show");
  gsap.fromTo(
    giftMessage.querySelector(".modal"),
    { scale: 0.9, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
  );
  setTimeout(() => {
    giftMessage.classList.remove("show");
  }, 2300);
};

const showOutfitModal = () => {
  outfitModal.classList.add("show");
  gsap.fromTo(
    outfitModal.querySelector(".modal"),
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
  );
};

const triggerCelebration = () => {
  if (window.confetti) {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ff85b8", "#ffd6e8", "#fff1f8", "#cfe7ff"],
    });
    confetti({
      particleCount: 70,
      spread: 120,
      origin: { y: 0.4 },
      colors: ["#ffd3e3", "#e6c7ff", "#ffe5c7"],
    });
  }

  if (fireworksInstance) {
    fireworksInstance.start();
    setTimeout(() => fireworksInstance.stop(), 2500);
  }
};

const handleOutfitSelection = async (card) => {
  vibrateSoft(40);
  const imageUrl = card.dataset.image;
  const outfitName = card.dataset.name || "Outfit";
  const shareText = "Love you mohammmaduuuu 💕🥹";

  document.body.classList.add("fade-out");

  if (navigator.share && imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${outfitName}.svg`, {
        type: blob.type,
      });
      await navigator.share({
        title: "For you, Bebo",
        text: shareText,
        files: [file],
      });
    } catch (error) {
      // Share is optional; WhatsApp redirect handles the rest.
    }
  }

  setTimeout(() => {
    window.location.href = whatsappUrl;
  }, 900);
};

const initFireworks = () => {
  if (typeof Fireworks === "undefined") return;
  fireworksInstance = new Fireworks(fireworksContainer, {
    autoresize: true,
    opacity: 0.7,
    acceleration: 1.03,
    friction: 0.98,
    gravity: 1.5,
    particles: 80,
    traceSpeed: 3,
    explosion: 6,
    brightness: { min: 50, max: 80 },
    rocketsPoint: { min: 30, max: 70 },
  });
};

const initFloatingHearts = () => {
  const layer = document.querySelector(".floating-hearts");
  for (let i = 0; i < 18; i += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = Math.random() > 0.5 ? "💗" : "💞";
    const size = 14 + Math.random() * 16;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDelay = `${Math.random() * 6}s`;
    heart.style.animationDuration = `${10 + Math.random() * 8}s`;
    layer.appendChild(heart);
  }
};

const initCursorTrail = () => {
  if (prefersReducedMotion) return;
  let lastTime = 0;
  const spawnTrail = (x, y) => {
    const heart = document.createElement("span");
    heart.className = "cursor-heart";
    heart.textContent = "💖";
    document.body.appendChild(heart);
    gsap.set(heart, { left: x, top: y, opacity: 1, scale: 1 });
    gsap.to(heart, {
      y: y - 30,
      opacity: 0,
      scale: 0.2,
      duration: 1,
      onComplete: () => heart.remove(),
    });
  };

  document.addEventListener("pointermove", (event) => {
    const now = Date.now();
    if (now - lastTime < 60) return;
    lastTime = now;
    spawnTrail(event.clientX, event.clientY);
  });

  document.addEventListener("touchmove", (event) => {
    const now = Date.now();
    if (now - lastTime < 90) return;
    lastTime = now;
    const touch = event.touches[0];
    if (touch) spawnTrail(touch.clientX, touch.clientY);
  });
};

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesBtn.addEventListener("click", () => {
  vibrateSoft(30);
  spawnHeartBurst(yesBtn);
  hideScene(scene1, () => {
    showScene(scene2, { scale: 0.9 }, { duration: 0.7 });
  });
});

okayBtn.addEventListener("click", () => {
  vibrateSoft(30);
  hideScene(scene2, () => {
    document.body.classList.add("soft-blur");
    showScene(scene3, { y: -40, scale: 0.98 });
    sparkleBurst(scene3.querySelector(".letter-card"));
  });
});

surpriseBtn.addEventListener("click", () => {
  vibrateSoft(35);
  hideScene(scene3, () => {
    document.body.classList.remove("soft-blur");
    showScene(scene4, { y: 40 }, { duration: 0.7 });
  });
});

giftBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    vibrateSoft(20);
    box.classList.add("opened");
    triggerCelebration();
    showGiftMessage();
    if (!outfitTimer) {
      outfitTimer = setTimeout(showOutfitModal, 5000);
    }
  });
});

outfitCards.forEach((card) => {
  card.addEventListener("click", () => handleOutfitSelection(card));
});

window.addEventListener("resize", positionNoButton);

initFireworks();
initFloatingHearts();
initCursorTrail();
positionNoButton();
