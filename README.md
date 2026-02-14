# RefactorMe: Developer Wellness Protocol

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

**RefactorMe** is a developer-focused wellness application designed to prevent burnout and Repetitive Strain Injury (RSI). It enforces regular breaks using a non-intrusive timer that transitions into a mandatory, full-screen overlay when it's time to rest. Built with Electron, React, and TypeScript, it sits quietly in your system tray until you need it.

![Application Screenshot](src/assets/logo.png) _<!-- Replace with actual screenshot in future -->_

## 🚀 Features

- **Smart Timer**: Configurable Pomodoro-style timer (e.g., 20m work / 20s break).
- **Strict Mode**: Enforces breaks by making the overlay always-on-top and preventing interaction with other windows.
- **System Tray Integration**: Minimizes to the tray to keep your taskbar clean.
- **Customizable**: Adjust work duration, break duration, and strict mode settings.
- **Beautiful UI**: Modern, dark-themed interface built with TailwindCSS and Framer Motion.
- **Native Notifications**: System layout toast notifications for timer updates.

## 🛠️ Tech Stack

### Core

- **[Electron](https://www.electronjs.org/)**: Cross-platform desktop application framework.
- **[React](https://react.dev/)**: UI library for building the renderer process.
- **[TypeScript](https://www.typescriptlang.org/)**: Typed superset of JavaScript for type safety.
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling for fast builds and HMR.

### State & Storage

- **[Zustand](https://zustand-demo.pmnd.rs/)**: Small, fast, and scalable bearbones state-management solution.
- **[electron-store](https://github.com/sindresorhus/electron-store)**: Simple data persistence for Electron apps.

### Styling & UI

- **[TailwindCSS](https://tailwindcss.com/)**: Utility-first CSS framework.
- **[Framer Motion](https://www.framer.com/motion/)**: Production-ready animation library for React.
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icons.

## 📂 Project Structure

The project follows a standard Electron-Vite structure, separating the **Main** (backend) and **Renderer** (frontend) processes.

```text
src/
├── main/                  # Main Process (Node.js environment)
│   ├── index.ts           # Application entry point, IPC handling
│   ├── scheduler.ts       # Timer logic, interval management, and state
│   ├── store.ts           # Persistence layer (electron-store wrapper)
│   └── window-manager.ts  # Window creation, management, and tray logic
├── preload.ts             # Preload script (Bridge between Main and Renderer)
└── renderer/              # Renderer Process (React application)
    ├── App.tsx            # Root component and routing
    ├── main.tsx           # React entry point
    ├── components/
    │   ├── Dashboard.tsx  # Main control panel view
    │   ├── Overlay.tsx    # Full-screen break enforcement view
    │   ├── Toast.tsx      # Custom notification component
    │   ├── layout/        # Layout components (Header, etc.)
    │   ├── preferences/   # Settings configuration components
    │   └── timer/         # Timer display and control components
    └── stores/
        ├── useSettingsStore.ts # Global settings state (Zustand)
        └── useToastStore.ts    # Notification state (Zustand)
```

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher (or yarn/pnpm)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/refactorme.git
   cd refactorme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Development

Run the application in development mode with HMR (Hot Module Replacement):

```bash
npm run dev
```

This will start the Vite dev server for the renderer and launch the Electron app.

### Build

Build the application for production (creates an installer/executable):

```bash
npm run build
```

The output will be in the `dist` or `release` directory depending on your OS.

## 🤝 Contribution Guide

We welcome contributions! Please follow these steps to contribute:

1.  **Fork the Project**: Click the "Fork" button at the top right of the repository page.
2.  **Create your Feature Branch**:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3.  **Commit your Changes**:
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4.  **Push to the Branch**:
    ```bash
    git push origin feature/AmazingFeature
    ```
5.  **Open a Pull Request**: Go to the original repository and open a Pull Request from your forked branch.

### Coding Standards

- Use **TypeScript** for all new files.
- Ensure **ESLint** checks pass (`npm run lint`).
- Follow the existing folder structure.

## 📄 License

## Download Lastest Release
- **[Virus Total](https://www.virustotal.com/gui/file/035ea02d158fa1013fae1a775d503f7c8d25e1ce09465c0b1facdb08b5debae2/detection)**: Check Virus Free.
- - **[windows](https://drive.proton.me/urls/8FYX8WWH1C#enXFT20UNvbJ)**: Download windows executable.
Distributed under the MIT License. See `LICENSE` for more information.
