# For My Bebo 💖 - Romantic Apology Website

This is a fully interactive, aesthetic, and romantic website designed to apologize to Ariba.

## 🌟 Features
- **Interactive Scenes**: Playful and emotional pop-ups.
- **Animations**: Smooth transitions, confetti, fireworks, and floating hearts using GSAP.
- **Music**: Soft romantic background music with toggle.
- **Mobile-First**: Fully responsive and optimized for mobile devices.
- **WhatsApp Integration**: Sends a pre-filled message with the selected outfit choice.

## 🛠️ Setup & Customization

### 1. Adding Real Outfit Images
Currently, the outfit selection scene uses placeholders. To add real images:
1.  Place your images in an `images/` folder (create one if it doesn't exist).
2.  Open `index.html`.
3.  Locate `<!-- Scene 5: Outfit Selection -->`.
4.  Replace the `<div class="placeholder-img">...</div>` inside `.outfit-card` with your image tags:
    ```html
    <img src="images/outfit1.jpg" alt="Outfit 1" class="outfit-img">
    ```
5.  Update `style.css` to style `.outfit-img` if needed (e.g., `width: 100%; height: auto;`).

### 2. Changing Music
The background music is set in `index.html`. You can replace the `src` attribute of the `<audio>` tag with your own music file or URL.

### 3. Deployment
You can deploy this website using:
- **GitHub Pages**: Push to a GitHub repo and enable Pages.
- **Vercel / Netlify**: Drag and drop the folder.

## 📂 File Structure
- `index.html`: Main HTML structure.
- `style.css`: Styling and animations.
- `script.js`: Logic for scenes, interactions, and music.

Made with love, courage & a sorry heart 💖
