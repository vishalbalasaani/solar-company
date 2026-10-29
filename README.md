# The Solar Company — Next-Gen Clean Energy Scroll Experience

A cinematic, high-performance web experience built with a 299-frame scroll-driven canvas animation. As you scroll from the blazing sun in deep space down through Earth's atmosphere onto rooftop solar panels, the story of clean energy unfolds smoothly with zero lag.

---

## 🌟 Highlights

- **299 High-Definition Frames**: Seamless, hardware-accelerated `<canvas>` rendering supporting Retina and High-DPI screens.
- **Buttery LERP Smoothing**: Dynamic linear damping interpolation prevents wheel and trackpad stuttering during fast scrubs.
- **Zero Watermark**: All 299 frames processed with sub-pixel inpainting for a clean, pristine look.
- **Adaptive Keyframe Preloader**: Staged loading ensures rapid initial rendering with zero flicker.
- **Modern Clean UI**:
  - Floating capsule navbar with dropdowns and mobile drawer.
  - Interactive **Free Solar Quote Calculator** with real-time kW, 25-year financial savings, and CO₂ offset estimates.
  - Interactive **Live Site Directory & Grid** with category filters and inquiry triggers.
  - Floating **Visit Site** bar with rotating clean energy verification seal.
  - Elegant typography and frosted glassmorphism that keeps the background video 100% visible.
- **Fully Responsive**: Optimized for desktop, laptops, tablets, and mobile devices.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/vishalbalasaani/solar-company.git
cd solar-company
```

### 2. Run Locally
With Node.js (zero dependencies required):
```bash
node server.mjs
```
or with `npm`:
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

Alternatively, you can open `index.html` directly or serve with any static web server (e.g. `npx serve .` or `python -m http.server`).

---

## 📂 Project Structure

```
├── index.html            # Main HTML structure and modals
├── style.css             # Glassmorphic, responsive CSS styles
├── script.js             # Canvas scroll animation engine & UI controllers
├── server.mjs            # Zero-dependency Node HTTP server
├── package.json          # Node project metadata and scripts
├── assets/               # Branding graphics, icons, and SVGs
└── frames/               # 299 clean 1080p video frames (frame_0001.jpg to frame_0299.jpg)
```

---

## 📄 License
MIT © Vishal Balasaani
