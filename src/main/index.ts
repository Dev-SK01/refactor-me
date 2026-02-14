import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { windowManager } from './window-manager';
import { schedulerService } from './scheduler';
import { storeService } from './store';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine icon path based on environment
const icon = app.isPackaged
    ? join(__dirname, '../dist/logo.png')
    : join(__dirname, '../public/logo.png');


let tray: Tray | null = null;
let isQuitting = false;

// Set up IPC handlers
ipcMain.handle('get-settings', () => {
    return storeService.getSettings();
});

ipcMain.handle('set-settings', (_, settings) => {
    storeService.setSettings(settings);
    // Restart timers with new settings
    schedulerService.startTimers();
    return true;
});

ipcMain.handle('break-complete', () => {
    schedulerService.completeBreak();
});

ipcMain.handle('break-skipped', () => {
    schedulerService.skipBreak();
});

ipcMain.handle('start-timers', () => {
    return schedulerService.startTimers();
});

ipcMain.handle('stop-timers', () => {
    schedulerService.stopTimers();
    return true;
});

ipcMain.handle('get-timer-status', () => {
    return schedulerService.isRunning;
});

// Startup Handlers
ipcMain.handle('get-startup-status', () => {
    return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('toggle-startup', (_, enable: boolean) => {
    app.setLoginItemSettings({
        openAtLogin: enable,
        path: process.execPath,
    });
    return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('overlay-ready', (event) => {
    schedulerService.handleOverlayReady(event);
});

// App lifecycle
app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron');

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
        window.webContents.on('console-message', (_event, _level, message, _line, _sourceId) => {
            console.log(`[Renderer] ${message}`);
        });
    });

    const mainWindow = windowManager.createDashboardWindow();

    // Prevent closing, minimize to tray instead
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
    });

    // Create System Tray
    let trayIcon;
    if (typeof icon === 'string' && icon.startsWith('data:')) {
        trayIcon = nativeImage.createFromDataURL(icon);
    } else {
        trayIcon = nativeImage.createFromPath(icon);
    }

    if (trayIcon.isEmpty()) {
       console.error('Failed to load tray icon from:', icon);
    }
    
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Open Dashboard', 
            click: () => mainWindow.show() 
        },
        { 
            label: 'Quit RefactorMe', 
            click: () => {
                isQuitting = true;
                app.quit();
            } 
        }
    ]);
    tray.setToolTip('RefactorMe - Developer Wellness');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        mainWindow.show();
    });

    schedulerService.startTimers();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) windowManager.createDashboardWindow();
        else mainWindow.show();
    });
    
    app.on('before-quit', () => {
        isQuitting = true;
    });
});

app.on('window-all-closed', () => {
    // Keep app running in background (don't quit) unless explicit quit
    if (process.platform !== 'darwin' && isQuitting) {
        app.quit();
    }
});
