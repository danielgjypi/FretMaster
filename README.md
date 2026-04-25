# 🎸 FretMaster

**FretMaster** is a premium, high-performance desktop application designed for guitarists to explore scales, chords, and music theory in a beautiful, distraction-free environment. Built with modern web technologies and wrapped in Electron, it provides a seamless, offline-first experience.

<div align="center">
  <img src="public/img/fretmaster.png" width="128" alt="FretMaster Logo">
</div>

## ✨ Features

-   **Interactive Fretboard**: Explore scales and chords across the entire neck.
-   **High-Fidelity Sound**: Realistic guitar samples powered by a native Tone.js engine.
-   **Premium UI**: Sleek, glassmorphic design with multiple professional themes.
-   **Offline First**: All assets, fonts, and sounds are locally hosted for zero-latency, no-internet-required usage.
-   **Window Management**: Custom, frameless window controls for a modern desktop feel.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/fretmaster.git
    cd fretmaster
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development Mode**:
    ```bash
    npm run electron:dev
    ```

### Building the Executable

To create a standalone installer for Windows:
```bash
npm run electron:build
```
The installer will be generated in the `dist-electron` directory.

## 🛠️ Built With

FretMaster stands on the shoulders of these amazing open-source resources:

-   **[React](https://reactjs.org/)**: The core UI framework.
-   **[Electron](https://www.electronjs.org/)**: Enabling the native desktop experience.
-   **[Tone.js](https://tonejs.github.io/)**: Powering the interactive audio engine.
-   **[Vite](https://vitejs.dev/)**: Lightning-fast build tool and development server.
-   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
-   **[Motion](https://motion.dev/)**: Fluid animations and transitions.
-   **[Lucide React](https://lucide.dev/)**: Beautifully simple, consistent icons.
-   **[MIDI.js Soundfonts](https://github.com/gleitz/midi-js-soundfonts)**: Base samples for the guitar instruments.
-   **[Google Fonts](https://fonts.google.com/)**:
    -   *Playfair Display*: Elegant serif typography.
    -   *JetBrains Mono*: High-quality monospaced font for technical details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Handcrafted for guitarists, by guitarists.*
