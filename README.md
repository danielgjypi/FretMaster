# 🎸 FretMaster

**FretMaster** is a premium, high-performance desktop application designed for guitarists to explore scales, chords, and music theory in a beautiful, distraction-free environment. Built with modern web technologies and wrapped in Electron, it provides a seamless, offline-first experience.

<div align="center">
  <img src="public/img/fretmaster.png" width="128" alt="FretMaster Logo">
</div>

## ✨ Features

-   **Interactive Fretboard**: Explore scales and chords across the entire neck.
-   **High-Fidelity Sound**: Realistic guitar samples powered by a native Tone.js engine, now featuring **Overdriven** and **Distortion** profiles.
-   **Undo/Redo System**: History-aware progression editing with full keyboard shortcut support (`Ctrl+Z`, `Ctrl+Y`).
-   **Pro Export Suite**: Export your creations as High-Res Images, PDF Documents, or redesigned Text Sheets.
-   **Intelligent Track Naming**: Automatic synchronization between saved tracks and document export titles.
-   **Track Manager**: Organize your progressions into collections and folders with real-time search.
-   **Theme Search & Live Preview**: Instantly filter through 25+ professional themes and visualize custom color combinations in real-time.
-   **Premium "Studio" UI**: Redesigned industrial-style modals and a sleek, glassmorphic interface for a distraction-free workflow.
-   **Offline First**: All assets, fonts, and sounds are locally hosted for zero-latency usage.
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

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

### 💾 Data Persistence
FretMaster stores your saved progressions, collections, and settings in the local application data directory. This data is tied to the application ID (`com.fretmaster.app`) and will **persist automatically** when you install updates or new versions of the application.

---

*Handcrafted for guitarists, by guitarists.*
