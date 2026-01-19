// Initialize GSAP
gsap.registerPlugin();

// Music Control
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false;

// Attempt autoplay on first interaction
document.body.addEventListener('click', () => {
    if (!isMusicPlaying) {
        music.play().then(() => {
            isMusicPlaying = true;
            updateMusicIcon();
        }).catch(err => console.log('Autoplay blocked:', err));
    }
}, { once: true });

musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        music.pause();
    } else {
        music.play();
    }
    isMusicPlaying = !isMusicPlaying;
    updateMusicIcon();
});

function updateMusicIcon() {
    const icon = musicToggle.querySelector('.icon');
    const text = musicToggle.querySelector('.text');
    if (isMusicPlaying) {
        icon.textContent = '🎵';
        text.textContent = 'Playing...';
        musicToggle.style.opacity = '0.7';
    } else {
        icon.textContent = '🔇';
        text.textContent = 'Play Music';
        musicToggle.style.opacity = '1';
    }
}

// Scene Management
function switchScene(fromId, toId) {
    const fromScene = document.getElementById(fromId);
    const toScene = document.getElementById(toId);

    gsap.to(fromScene, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            fromScene.classList.add('hidden');
            fromScene.classList.remove('active');
            
            toScene.classList.remove('hidden');
            // Force reflow
            void toScene.offsetWidth; 
            toScene.classList.add('active');
            
            gsap.fromTo(toScene, 
                { opacity: 0, scale: 0.9 }, 
                { opacity: 1, scale: 1, duration: 0.5 }
            );
        }
    });
}

// Scene 1: Playful Pop-up
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const teasingText = document.getElementById('teasing-text');

// "No" button evasion logic
function moveButton() {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 50);
    
    // Make sure it stays within view, simplified approach
    const btnRect = btnNo.getBoundingClientRect();
    const maxX = 200; // Limit movement range relative to initial position for better UX
    const maxY = 200;
    
    const randomX = (Math.random() - 0.5) * maxX;
    const randomY = (Math.random() - 0.5) * maxY;

    gsap.to(btnNo, {
        x: randomX,
        y: randomY,
        duration: 0.2,
        ease: "power1.out"
    });

    teasingText.classList.remove('hidden');
    gsap.fromTo(teasingText, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
}

btnNo.addEventListener('mouseover', moveButton);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent click on mobile
    moveButton();
});
btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveButton();
});

btnYes.addEventListener('click', () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff8fa3', '#c9184a', '#ffffff']
    });
    setTimeout(() => {
        switchScene('scene-1', 'scene-2');
    }, 1000);
});

// Scene 2: Affection Pop-up
document.getElementById('btn-okay').addEventListener('click', () => {
    switchScene('scene-2', 'scene-3');
});

// Scene 3: Apology Letter
document.getElementById('btn-open-surprise').addEventListener('click', () => {
    switchScene('scene-3', 'scene-4');
});

// Scene 4: Gift Game
const giftBoxes = document.querySelectorAll('.gift-box');
const surprisePopup = document.getElementById('surprise-popup');
let giftOpened = false;

giftBoxes.forEach(box => {
    box.addEventListener('click', () => {
        if (giftOpened) return; // Only trigger once
        
        // Visual feedback for click
        gsap.to(box, { scale: 0.9, yoyo: true, repeat: 1, duration: 0.1 });

        // Trigger effects
        fireworks();
        
        // Show popup
        setTimeout(() => {
            surprisePopup.classList.remove('hidden');
            gsap.fromTo(surprisePopup, 
                { opacity: 0, scale: 0.5 }, 
                { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }, 500);

        // Auto transition to Scene 5
        setTimeout(() => {
            switchScene('scene-4', 'scene-5');
        }, 5000); // 5 seconds delay

        giftOpened = true;
    });
});

function fireworks() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// Scene 5: Outfit Selection
const outfitCards = document.querySelectorAll('.outfit-card');

outfitCards.forEach(card => {
    card.addEventListener('click', () => {
        const outfitName = card.dataset.outfit;
        
        // Add selection effect
        card.style.borderColor = '#c9184a';
        card.style.transform = 'scale(1.05)';

        // Fade out
        gsap.to('body', {
            opacity: 0,
            duration: 1.5,
            onComplete: () => {
                redirectToWhatsApp(outfitName);
            }
        });
    });
});

function redirectToWhatsApp(outfit) {
    const phoneNumber = "919569909426";
    // Including the selected outfit in the message
    const message = `Love you mohammmaduuuu 💕🥹\n(I chose ${outfit} ✨)`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.location.href = url;
}

// Cursor Heart Trail
document.addEventListener('mousemove', (e) => {
    createHeart(e.clientX, e.clientY);
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    createHeart(touch.clientX, touch.clientY);
});

function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart-trail';
    heart.innerHTML = '💖';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    
    document.getElementById('cursor-trail').appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 1000);
}
