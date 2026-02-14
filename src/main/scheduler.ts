
import { storeService } from './store';
import { windowManager } from './window-manager';

const BREAK_DETAILS: Record<string, { title: string; description: string }> = {
  visual: {
    title: 'Visual Health Break',
    description: 'The 20-20-20 Rule: Look 20ft away for 20s.',
  },
  posture: {
    title: 'Posture Check',
    description: 'Ergonomic Check: Eyes level, elbows 90°.',
  },
  wrist: {
    title: 'Wrist & RSI Relief',
    description: 'Stretches: Prayer & Reverse Wrist Pull.',
  },
  lowerBody: {
    title: 'Back & Knee Movement',
    description: 'Movement breaks: Glute bridges & Couch stretch.',
  },
};

export class SchedulerService {
  private timers: NodeJS.Timeout[] = [];
  private isBreakActive: boolean = false;
  private currentBreakType: string | null = null;
  private currentBreakSettings: { strictMode: boolean, duration: number } | null = null;
  public isRunning: boolean = false;

  constructor() {
    // this.startTimers(); // Moved to app.whenReady()
    // Optional: Monitor system idle time to pause/reset timers
    // setInterval(() => this.checkIdleState(), 1000 * 60);
  }

  startTimers(): boolean {
    this.stopTimers();
    this.isRunning = true;

    const settings = storeService.getSettings();
    if (!settings || !settings.timers) {
      console.error('Failed to start timers: Invalid settings', settings);
      this.isRunning = false;
      return false;
    }

    // Visual Health Timer
    this.scheduleTimer('visual', settings.timers.visual * 60 * 1000);
    
    // Posture Timer
    this.scheduleTimer('posture', settings.timers.posture * 60 * 1000);

    // Wrist Timer
    this.scheduleTimer('wrist', settings.timers.wrist * 60 * 1000);

    // Lower Body Timer
    this.scheduleTimer('lowerBody', settings.timers.lowerBody * 60 * 1000);
    
    return true;
  }

  stopTimers() {
    this.isRunning = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  scheduleTimer(type: string, duration: number) {
    const timer = setTimeout(() => {
      this.triggerBreak(type);
      // Reschedule after break (handled by break completion/dismissal)
    }, duration);
    this.timers.push(timer);
  }

  triggerBreak(type: string) {
    if (this.isBreakActive) return; // Don't interrupt existing break? Or queue?

    this.isBreakActive = true;
    this.currentBreakType = type;
    const settings = storeService.getSettings();
    
    // Default break duration 20s for visual, maybe more for others? 
    // Let's default to 20s for now as per the "20-20-20 rule" in the UI.
    // Get configured duration or default to 20s
    // @ts-ignore
    const breakDuration = settings.durations?.[type] ?? 20;
    
    this.currentBreakSettings = {
        strictMode: settings.strictMode,
        duration: breakDuration
    };

    // Notify Renderer to show content for specific type
    const overlay = windowManager.createOverlayWindow(settings.strictMode);
    
    // For strict mode, we might want to ensure focus
    if (settings.strictMode) {
      overlay.setAlwaysOnTop(true, 'screen-saver');
      overlay.focus();
    }
    
    // We wait for 'overlay-ready' event from renderer before sending data
    // This prevents the race condition where we send data before the listener is set up
    console.log(`Scheduler: Triggered break '${type}', waiting for overlay ready...`);
  }

  handleOverlayReady(event: Electron.IpcMainEvent) {
      console.log('Scheduler: Overlay reported ready');
       if (this.isBreakActive && this.currentBreakType && this.currentBreakSettings) {
          console.log(`Scheduler: Sending break data to overlay: ${this.currentBreakType}`);
          const details = BREAK_DETAILS[this.currentBreakType] || { title: 'Break Time', description: 'Take a moment to relax.' };
          
          event.reply('break-trigger', { 
              type: this.currentBreakType, 
              strictMode: this.currentBreakSettings.strictMode, 
              duration: this.currentBreakSettings.duration,
              title: details.title,
              description: details.description
          });
      }
  }

  completeBreak() {
    this.isBreakActive = false;
    this.currentBreakType = null;
    this.currentBreakSettings = null;
    windowManager.closeOverlay();
    this.startTimers(); // Restart timers
    storeService.updateStats('total');
  }

  skipBreak() {
    this.isBreakActive = false;
    this.currentBreakType = null;
    this.currentBreakSettings = null;
    windowManager.closeOverlay();
    this.startTimers(); // Restart timers
    storeService.updateStats('skipped');
  }
}

export const schedulerService = new SchedulerService();
