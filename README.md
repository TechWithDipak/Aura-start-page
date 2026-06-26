# Aura Start Page

![Premium Start Page](https://img.shields.io/badge/UI-Premium-blue?style=for-the-badge)
![Glassmorphism](https://img.shields.io/badge/Style-Glassmorphism-purple?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=for-the-badge)

A premium, macOS-inspired browser start page extension that completely transforms your default new tab into a highly aesthetic, productive, and customizable dashboard. Built completely with Vanilla JavaScript, HTML, and CSS to ensure blazing-fast performance without heavy frameworks.

## ✨ Overall Goal

The goal of this project is to provide an ultra-clean, modern, and immersive browser start page that combines aesthetic superiority (glassmorphism, micro-animations, vibrant gradients) with raw productivity. It replaces the cluttered, standard new tab page with a focused workspace that brings your favorite shortcuts, search, and bookmarks right to your fingertips, while feeling like a native operating system experience.

## 🚀 Key Features

*   **🎨 Premium Glassmorphism UI**: Beautiful frosted-glass effects, subtle shadows, and sleek micro-animations for an operating system-level feel.
*   **🕒 Dynamic Clock & Greeting**: A large, elegant clock that adapts its greeting based on the time of day (Morning, Afternoon, Evening, Night).
*   **🔍 Smart Search Bar**: Centered search functionality that supports both URL navigation and Google queries. Includes a smart local search history dropdown with a dedicated clear button. Use the `/` hotkey to instantly focus the search bar from anywhere!
*   **📌 Customizable Suggestions Grid**: A robust 12-card grid (2x6) for your most visited sites.
    *   **Drag & Drop**: Easily rearrange your shortcuts.
    *   **Add/Edit/Delete**: Fully manage your shortcuts with dynamic domain-based gradient generation.
    *   **Smart Logos**: Automatically fetches high-quality favicons for your added sites.
*   **🖼️ Custom Wallpapers & Theming**: 
    *   Upload your own custom background image.
    *   Toggle between Light Mode, Dark Mode, or Auto (System preference).
    *   Intelligent contrast detection ensures text is always readable against your wallpaper.
*   **🚀 Zero Dependencies**: Built entirely with native web technologies (HTML/CSS/JS) for maximum speed and security.

## 🛠️ Installation (Chrome / Edge / Brave / Safari)

Since this is an unpacked browser extension, you can easily load it into any Chromium-based browser (and Safari via extension builder):

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/TechWithDipak/Aura-start-page.git
    ```
2.  **Open Extension Settings**:
    *   *Chrome/Edge/Brave*: Type `chrome://extensions/` (or `edge://extensions/`) in your URL bar and hit Enter.
3.  **Enable Developer Mode**: Toggle the "Developer mode" switch in the top right corner.
4.  **Load the Extension**: Click the **"Load unpacked"** button and select the cloned repository folder (`Aura-start-page`).
5.  **Open a New Tab**: Open a new tab (`Ctrl+T` or `Cmd+T`) and enjoy your new premium dashboard!

## 📂 Project Structure

```text
├── manifest.json          # Browser Extension manifest
├── newtab.html            # Main markup and layout structure
├── newtab.css             # Premium styling, animations, and glassmorphism rules
├── newtab.js              # Entry point for module initialization
├── components/            # Modular JS components
│   ├── clock.js           # Time and dynamic greeting logic
│   ├── search.js          # Search bar, hotkeys, and history management
│   ├── settings.js        # Theme, wallpaper, and animation toggles
│   └── shortcuts.js       # Suggestions grid, drag-and-drop, and CRUD operations
└── utils/
    └── storage.js         # Wrapper for browser.storage / localStorage
```

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/TechWithDipak/Aura-start-page/issues) if you want to contribute.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
