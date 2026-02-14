import { create } from 'zustand';

export interface Settings {
  strictMode: boolean;
  runOnStartup: boolean;
  timers: {
    visual: number;
    posture: number;
    wrist: number;
    lowerBody: number;
  };
  durations: {
    visual: number;
    posture: number;
    wrist: number;
    lowerBody: number;
  };
}

interface SettingsState {
  settings: Settings;
  isRunning: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Settings) => Promise<void>;
  startTimers: () => Promise<void>;
  stopTimers: () => Promise<void>;
  checkTimerStatus: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    strictMode: false,
    runOnStartup: false,
    timers: {
      visual: 20,
      posture: 120,
      wrist: 60,
      lowerBody: 60,
    },
    durations: {
      visual: 20,
      posture: 20,
      wrist: 20,
      lowerBody: 20,
    },
  },
  isRunning: false,
  fetchSettings: async () => {
    // Invoke IPC to get settings
    // @ts-ignore
    const settings = await window.ipcRenderer.invoke('get-settings');
    // @ts-ignore
    const isRunning = await window.ipcRenderer.invoke('get-timer-status');
    if (settings) {
      set({ settings, isRunning });
    }
  },
  updateSettings: async (newSettings) => {
    // Invoke IPC to set settings
    // @ts-ignore
    await window.ipcRenderer.invoke('set-settings', newSettings);
    set({ settings: newSettings });
  },
  startTimers: async () => {
    console.log('Store: startTimers called');
    try {
        // @ts-ignore
        const success = await window.ipcRenderer.invoke('start-timers');
        console.log('Store: IPC start-timers result:', success);
        if (success) {
            set({ isRunning: true });
        } else {
            console.error('Store: Failed to start timers (IPC returned false)');
            set({ isRunning: false });
        }
    } catch (error) {
        console.error('Store: Error invoking start-timers:', error);
        set({ isRunning: false });
    }
  },
  stopTimers: async () => {
    console.log('Store: stopTimers called');
    try {
        // @ts-ignore
        await window.ipcRenderer.invoke('stop-timers');
        console.log('Store: IPC stop-timers success');
        set({ isRunning: false });
    } catch (error) {
        console.error('Store: Error invoking stop-timers:', error);
    }
  },
  checkTimerStatus: async () => {
    // @ts-ignore
    const isRunning = await window.ipcRenderer.invoke('get-timer-status');
    set({ isRunning });
  },
}));
