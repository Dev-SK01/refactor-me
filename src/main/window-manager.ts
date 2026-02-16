import { BrowserWindow, screen, shell, app } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

// Determine icon path based on environment
const icon = app.isPackaged
    ? join(__dirname, '../dist/logo.png')
    : join(__dirname, '../public/logo.png');


export class WindowManager {
  private dashboardWindow: BrowserWindow | null = null;
  private overlayWindow: BrowserWindow | null = null;

  createDashboardWindow(): BrowserWindow {
    if (this.dashboardWindow && !this.dashboardWindow.isDestroyed()) {
      this.dashboardWindow.focus();
      return this.dashboardWindow;
    }

    const preloadPath = join(__dirname, "preload.cjs");
    console.log('Preload Path:', preloadPath);
    this.dashboardWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#09090b', // zinc-950
        symbolColor: '#ffffff',
        height: 40,
      },
      icon,
      webPreferences: {
        preload: preloadPath,
        sandbox: false,
      },
    });

    this.dashboardWindow.on("ready-to-show", () => {
      this.dashboardWindow?.show();
    });

    this.dashboardWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    const devUrl =
      process.env["ELECTRON_RENDERER_URL"] ||
      process.env["VITE_DEV_SERVER_URL"];
    console.log("Dev URL:", devUrl);
    console.log("is.dev:", is.dev);

    if (is.dev && devUrl) {
      this.dashboardWindow.loadURL(devUrl);
    } else {
      this.dashboardWindow.loadFile(join(__dirname, '../dist/index.html'));
    }

    return this.dashboardWindow;
  }

  createOverlayWindow(strictMode: boolean = false): BrowserWindow {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.focus();
      return this.overlayWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    this.overlayWindow = new BrowserWindow({
      width,
      height,
      x: 0,
      y: 0,
      show: false,
      frame: false,
      fullscreen: true,
      alwaysOnTop: true, // strictMode ? true : false - actually always on top for overlay
      skipTaskbar: true,
      closable: !strictMode,
      kiosk: strictMode,

      resizable: false,
      movable: false,
      minimizable: false,
      webPreferences: {
        preload: join(__dirname, "preload.cjs"),
        sandbox: false,
      },
    });

    // Load the overlay route
    const devUrl = process.env['ELECTRON_RENDERER_URL'] || process.env['VITE_DEV_SERVER_URL'];
    const overlayUrl = is.dev && devUrl
      ? `${devUrl}/#/overlay`
      : `file://${join(__dirname, '../dist/index.html')}#/overlay`;

    this.overlayWindow.loadURL(overlayUrl);

    this.overlayWindow.on("ready-to-show", () => {
      this.overlayWindow?.show();
      if (strictMode) {
        this.overlayWindow?.setIgnoreMouseEvents(false);
        this.overlayWindow?.setAlwaysOnTop(true, "screen-saver");
      }
    });

    return this.overlayWindow;
  }

  closeOverlay() {
    console.log('[WindowManager] closeOverlay called');
    try {
      if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
        console.log('[WindowManager] Closing overlay window');
        this.overlayWindow.close();
        this.overlayWindow = null;
      } else {
        console.log('[WindowManager] Overlay window not found or already destroyed');
        this.overlayWindow = null;
      }
    } catch (error) {
      console.error('[WindowManager] Error closing overlay window:', error);
      // Force null if error occurs to prevent stuck state
      this.overlayWindow = null;
    }
  }

  getDashboardWindow() {
    return this.dashboardWindow;
  }

  getOverlayWindow() {
    return this.overlayWindow;
  }
}

export const windowManager = new WindowManager();
