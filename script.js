// ========== Romantic Apology Website for Ariba ==========
// Made with love, courage & a sorry heart 💖

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initFloatingHearts();
    initSparkles();
    initCursorTrail();
    initMusicPlayer();
    initScene1();
    
    // Show footer after delay
    setTimeout(() => {
        document.getElementById('footer').classList.add('visible');
    }, 2000);
});

// ========== Floating Hearts Background ==========
function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const hearts = ['💕', '💖', '💗', '💓', '💞', '💘', '🩷', '🤍'];
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (15 + Math.random() * 20) + 'px';
        heart.style.animationDuration = (6 + Math.random() * 6) + 's';
        heart.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 14000);
    }
    
    // Create initial hearts
    for (let i = 0; i < 10; i++) {
        setTimeout(createHeart, i * 500);
    }
    
    // Continuously create hearts
    setInterval(createHeart, 1500);
}

// ========== Sparkles Effect ==========
function initSparkles() {
    const container = document.getElementById('sparklesContainer');
    
    function createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 4000);
    }
    
    // Create initial sparkles
    for (let i = 0; i < 15; i++) {
        setTimeout(createSparkle, i * 300);
    }
    
    // Continuously create sparkles
    setInterval(createSparkle, 800);
}

// ========== Cursor Heart Trail ==========
function initCursorTrail() {
    const container = document.getElementById('cursorTrail');
    const hearts = ['💕', '💖', '💗', '✨', '💓'];
    let lastTime = 0;
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime < 100) return; // Throttle
        lastTime = now;
        
        const heart = document.createElement('div');
        heart.className = 'trail-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = e.clientX + 'px';
        heart.style.top = e.clientY + 'px';
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 1000);
    });
}

// ========== Music Player ==========
function initMusicPlayer() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    const statusText = musicToggle.querySelector('.music-status');
    
    bgMusic.volume = 0.3; // Gentle volume
    
    let isPlaying = false;
    let hasInteracted = false;
    
    musicToggle.addEventListener('click', () => {
        if (!hasInteracted) {
            hasInteracted = true;
        }
        
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            statusText.textContent = 'OFF';
            isPlaying = false;
        } else {
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                statusText.textContent = 'ON';
                isPlaying = true;
            }).catch(err => {
                console.log('Audio play failed:', err);
            });
        }
    });
    
    // Try to autoplay on first user interaction anywhere
    document.addEventListener('click', function autoplayHandler() {
        if (!isPlaying && !hasInteracted) {
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                statusText.textContent = 'ON';
                isPlaying = true;
                hasInteracted = true;
            }).catch(err => {
                console.log('Autoplay blocked:', err);
            });
        }
    }, { once: true });
}

// ========== Scene Management ==========
function showScene(sceneId) {
    // Hide all scenes
    document.querySelectorAll('.scene').forEach(scene => {
        scene.classList.remove('active');
    });
    
    // Show target scene
    const targetScene = document.getElementById(sceneId);
    setTimeout(() => {
        targetScene.classList.add('active');
    }, 100);
}

// ========== Scene 1: Playful Pop-up ==========
function initScene1() {
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const teasingText = document.getElementById('teasingText');
    const modal = document.querySelector('.popup-modal');
    
    const teasingMessages = [
        "Hehe 😜 don't lieee~",
        "Come on, tell the truth 🥺",
        "I know you're mad at me 💔",
        "Please? For me? 🥹",
        "You can't escape the truth~ 😏",
        "I won't give up! 💪💖"
    ];
    let messageIndex = 0;
    
    // Animate modal entrance
    gsap.from(modal, {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
    });
    
    // YES button click
    btnYes.addEventListener('click', () => {
        // Vibrate on mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Create heart burst
        createHeartBurst(btnYes);
        
        // Animate out and go to Scene 2
        gsap.to(modal, {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                showScene('scene2');
                initScene2();
            }
        });
    });
    
    // NO button - playful dodge
    btnNo.addEventListener('mouseenter', handleNoDodge);
    btnNo.addEventListener('click', handleNoDodge);
    btnNo.addEventListener('touchstart', handleNoDodge);
    
    function handleNoDodge(e) {
        e.preventDefault();
        
        // Vibrate on mobile
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        // Show teasing message
        teasingText.textContent = teasingMessages[messageIndex % teasingMessages.length];
        messageIndex++;
        
        // Animate teasing text
        gsap.from(teasingText, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3
        });
        
        // Move button to random position
        const container = btnNo.parentElement;
        const containerRect = container.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();
        
        // Calculate random position within container bounds
        const maxX = containerRect.width - btnRect.width;
        const maxY = 80; // Limited vertical movement
        
        const randomX = Math.random() * maxX - maxX/2;
        const randomY = Math.random() * maxY - maxY/2;
        
        gsap.to(btnNo, {
            x: randomX,
            y: randomY,
            duration: 0.2,
            ease: "power2.out"
        });
    }
}

// ========== Scene 2: Affection Pop-up ==========
function initScene2() {
    const modal = document.querySelector('.affection-modal');
    const btnOkay = document.getElementById('btnOkay');
    
    // Animate modal entrance
    gsap.from(modal, {
        scale: 0.5,
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: "back.out(1.7)"
    });
    
    // Bebo title special animation
    gsap.from('.bebo-title', {
        scale: 0,
        rotation: -10,
        duration: 0.8,
        delay: 0.3,
        ease: "elastic.out(1, 0.5)"
    });
    
    // Create mini confetti
    setTimeout(() => {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#ff6b9d', '#ffacc7', '#ffd6e0', '#e8d5f2']
        });
    }, 400);
    
    btnOkay.addEventListener('click', () => {
        // Vibrate
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Animate out
        gsap.to(modal, {
            scale: 0.8,
            opacity: 0,
            y: -50,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                showScene('scene3');
                initScene3();
            }
        });
    });
}

// ========== Scene 3: Apology Letter ==========
function initScene3() {
    const letterCard = document.getElementById('letterCard');
    const btnSurprise = document.getElementById('btnSurprise');
    
    // Animate letter card entrance
    gsap.to(letterCard, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    });
    
    // Animate paragraphs sequentially
    const paragraphs = letterCard.querySelectorAll('.letter-para, .letter-greeting, .letter-closing');
    paragraphs.forEach((para, index) => {
        gsap.from(para, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: 0.5 + (index * 0.15),
            ease: "power2.out"
        });
    });
    
    // Surprise button click
    btnSurprise.addEventListener('click', () => {
        // Vibrate
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
        
        // Big confetti burst
        launchConfetti();
        
        // Animate out
        gsap.to(letterCard, {
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => {
                showScene('scene4');
                initScene4();
            }
        });
    });
}

// ========== Scene 4: Gift Game ==========
function initScene4() {
    const giftBoxes = document.querySelectorAll('.gift-box');
    const resultModal = document.getElementById('giftResultModal');
    const resultCard = document.querySelector('.gift-result-card');
    const btnContinue = document.getElementById('btnContinue');
    
    let firstClick = true;
    
    // Animate gift boxes entrance
    giftBoxes.forEach((box, index) => {
        gsap.from(box, {
            scale: 0,
            rotation: 360,
            duration: 0.5,
            delay: index * 0.1,
            ease: "back.out(1.7)"
        });
        
        // Add hover animation
        box.addEventListener('mouseenter', () => {
            if (!box.classList.contains('opened')) {
                gsap.to(box, {
                    scale: 1.1,
                    duration: 0.2
                });
            }
        });
        
        box.addEventListener('mouseleave', () => {
            if (!box.classList.contains('opened')) {
                gsap.to(box, {
                    scale: 1,
                    duration: 0.2
                });
            }
        });
        
        // Click handler
        box.addEventListener('click', () => {
            if (box.classList.contains('opened')) return;
            
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate([30, 30, 30, 30, 100]);
            }
            
            box.classList.add('opened');
            
            // Create explosion effect at box position
            const rect = box.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            
            // Confetti from box
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { x, y },
                colors: ['#ff6b9d', '#ffd700', '#ffacc7', '#e8d5f2']
            });
            
            // Show result modal on first click
            if (firstClick) {
                firstClick = false;
                
                // Launch big fireworks
                setTimeout(() => {
                    launchFireworks();
                }, 300);
                
                setTimeout(() => {
                    showGiftResult();
                }, 800);
            }
        });
    });
    
    function showGiftResult() {
        resultModal.classList.add('active');
        
        gsap.to(resultCard, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        // Continuous confetti
        launchConfetti();
    }
    
    btnContinue.addEventListener('click', () => {
        // Vibrate
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        gsap.to(resultCard, {
            scale: 0.8,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                resultModal.classList.remove('active');
                showScene('scene5');
                initScene5();
            }
        });
    });
}

// ========== Scene 5: Outfit Selection ==========
function initScene5() {
    const outfitCards = document.querySelectorAll('.outfit-card');
    
    // Animate cards entrance
    outfitCards.forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            scale: 0.9,
            duration: 0.5,
            delay: index * 0.1,
            ease: "power2.out"
        });
        
        // Click handler
        card.addEventListener('click', () => {
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100]);
            }
            
            // Add selected effect
            gsap.to(card, {
                scale: 1.05,
                boxShadow: "0 30px 80px rgba(255, 107, 157, 0.6)",
                duration: 0.3
            });
            
            // Launch confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff6b9d', '#ffacc7', '#ffd6e0', '#ffd700']
            });
            
            // Transition to final scene after delay
            setTimeout(() => {
                showScene('sceneFinal');
                initFinalScene();
            }, 1000);
        });
    });
}

// ========== Final Scene: WhatsApp Redirect ==========
function initFinalScene() {
    // Big heart animation
    gsap.from('.heart-animation', {
        scale: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
    });
    
    gsap.from('.final-title', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.3
    });
    
    gsap.from('.final-text', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.5
    });
    
    // Confetti shower
    launchConfetti();
    
    // Redirect to WhatsApp after delay
    setTimeout(() => {
        const whatsappUrl = "https://wa.me/919569909426?text=Love%20you%20mohammmaduuuu%20💕🥹";
        window.location.href = whatsappUrl;
    }, 3000);
}

// ========== Confetti Effects ==========
function launchConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const colors = ['#ff6b9d', '#ffacc7', '#ffd6e0', '#e8d5f2', '#ffd700', '#ff4081'];
    
    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });
        
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function launchFireworks() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1001 };
    
    const colors = ['#ff6b9d', '#ffd700', '#ff4081', '#ffacc7', '#e8d5f2'];
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Random fireworks
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: colors
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: colors
        });
    }, 250);
}

// ========== Heart Burst Effect ==========
function createHeartBurst(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const hearts = ['💕', '💖', '💗', '💓', '✨'];
    
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = '20px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        document.body.appendChild(heart);
        
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        
        gsap.to(heart, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity - 50,
            opacity: 0,
            scale: 0.5,
            duration: 1,
            ease: "power2.out",
            onComplete: () => heart.remove()
        });
    }
}

// ========== Utility: Add Vibration Class ==========
function addVibration(element) {
    element.classList.add('vibrate');
    setTimeout(() => {
        element.classList.remove('vibrate');
    }, 300);
}

// ========== Smooth Scroll for Touch Devices ==========
document.addEventListener('touchmove', function(e) {
    // Allow smooth scrolling in letter scene
}, { passive: true });

// ========== Prevent Double Tap Zoom ==========
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// ========== Console Easter Egg ==========
console.log(`
💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖
💖                              💖
💖   Made with love for Ariba   💖
💖   From her sorry boyfriend   💖
💖                              💖
💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖
`);
