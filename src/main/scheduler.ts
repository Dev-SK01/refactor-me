
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
  private timers = new Map<string, NodeJS.Timeout>();
  private timerStartTimes = new Map<string, number>();
  private timerDurations = new Map<string, number>();
  private breakQueue: string[] = [];

  private isBreakActive: boolean = false;
  private currentBreakType: string | null = null;
  private currentBreakSettings: { strictMode: boolean, duration: number } | null = null;
  public isRunning: boolean = false;

  constructor() {
    // this.startTimers(); // Moved to app.whenReady()
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

    console.log('[Scheduler] Starting timers with settings:', settings.timers);

    // Schedule all enabled timers
    // We use the full duration from settings for initial start
    this.scheduleTimer('visual', settings.timers.visual * 60 * 1000);
    this.scheduleTimer('posture', settings.timers.posture * 60 * 1000);
    this.scheduleTimer('wrist', settings.timers.wrist * 60 * 1000);
    this.scheduleTimer('lowerBody', settings.timers.lowerBody * 60 * 1000);
    
    return true;
  }

  stopTimers() {
    console.log('[Scheduler] Stopping all timers');
    this.isRunning = false;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.timerStartTimes.clear();
    this.timerDurations.clear();
    this.breakQueue = [];
  }

  scheduleTimer(type: string, duration: number) {
    if (this.timers.has(type)) {
      clearTimeout(this.timers.get(type)!);
    }

    console.log(`[Scheduler] Scheduling timer '${type}' for ${(duration / 60000).toFixed(2)} mins (${duration}ms)`);

    this.timerStartTimes.set(type, Date.now());
    this.timerDurations.set(type, duration);

    const timer = setTimeout(() => {
      this.triggerBreak(type);
    }, duration);
    
    this.timers.set(type, timer);
  }

  pauseAllTimers() {
    console.log('[Scheduler] Pausing all timers');
    // Pause all currently running timers (except the one that might be triggering, though this is usually called after clearing)
    // We iterate over the map keys to correctly capture state
    for (const [type, timer] of this.timers.entries()) {
      clearTimeout(timer);
      const startTime = this.timerStartTimes.get(type) || Date.now();
      const scheduledDuration = this.timerDurations.get(type) || 0;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, scheduledDuration - elapsed);

      // Store remaining time to resume later
      this.timerDurations.set(type, remaining);
    }
    this.timers.clear();
    // Start times are no longer relevant until resumed
    this.timerStartTimes.clear();
  }

  resumeAllTimers() {
     console.log('[Scheduler] Resuming all timers');
     // Resume timers based on their stored 'remaining' duration
     for (const [type, remaining] of this.timerDurations.entries()) {
       if (remaining > 0) {
         this.scheduleTimer(type, remaining);
       }
     }
  }

  triggerBreak(type: string) {
    console.log(`[Scheduler] Triggering break: ${type}`);
    // If a break is already active, queue this one
    if (this.isBreakActive) {
      // Don't queue if already in queue
      if (!this.breakQueue.includes(type)) {
          this.breakQueue.push(type);
          console.log(`[Scheduler] Break active, queueing ${type}. Queue: ${this.breakQueue}`);
      }
      return; 
    }

    // Remove the triggered timer from tracking so we don't try to pause/resume it as "running"
    if (this.timers.has(type)) {
        this.timers.delete(type);
    }
    
    // Prepare for break
    this.isBreakActive = true;
    this.currentBreakType = type;
    
    const settings = storeService.getSettings();
    // @ts-ignore
    const breakDuration = settings.durations?.[type] ?? 20;

    this.currentBreakSettings = {
        strictMode: settings.strictMode,
        duration: breakDuration
    };

    // STRICT MODE LOGIC:
    // If strict mode is ON, we pause all other timers so "work time" doesn't pass during break.
    // If OFF, we let them run. If another triggers, it enters the queue.
    if (settings.strictMode) {
        this.pauseAllTimers();
    }

    // Notify Renderer
    const overlay = windowManager.createOverlayWindow(settings.strictMode);
    
    if (settings.strictMode) {
      overlay.setAlwaysOnTop(true, 'screen-saver');
      overlay.focus();
    }
    
    console.log(`[Scheduler] Break '${type}' started. Duration: ${breakDuration}s. Strict: ${settings.strictMode}`);
  }

  handleOverlayReady(event: Electron.IpcMainEvent) {
      // Same as before
      console.log('[Scheduler] Overlay reported ready');
       if (this.isBreakActive && this.currentBreakType && this.currentBreakSettings) {
          console.log(`[Scheduler] Sending break data to overlay: ${this.currentBreakType}`);
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

  closeBreak(finished: boolean) {
      console.log(`[Scheduler] Closing break. Finished: ${finished}`);
      const settings = storeService.getSettings(); // Get FRESH settings in case they changed, though mostly we care about what mode we STARTED in or current state.
      // Actually, we should respect the mode we were IN.
      // But for simplicity, let's assume we use the cached settings or look at current. 
      // If we paused timers (strict mode), we must resume them.
      // If we didn't pause (non-strict), we leave them be.
      
      const wasStrictMode = this.currentBreakSettings?.strictMode ?? false;

      this.isBreakActive = false;
      console.log('[Scheduler] Calling windowManager.closeOverlay()');
      windowManager.closeOverlay();
      
      const completedType = this.currentBreakType;
      this.currentBreakType = null;
      this.currentBreakSettings = null;

      // 1. Resume others if needed
      if (wasStrictMode) {
          this.resumeAllTimers();
      }

      // 2. Restart the completed timer (Fresh cycle)
      if (completedType && settings.timers && (settings.timers as any)[completedType]) {
          const fullDuration = (settings.timers as any)[completedType] * 60 * 1000;
          this.scheduleTimer(completedType, fullDuration);
      }

      // 3. Update Stats
      storeService.updateStats(finished ? 'total' : 'skipped');

      // 4. Process Queue
      if (this.breakQueue.length > 0) {
          const nextType = this.breakQueue.shift();
          if (nextType) {
              // Trigger next break immediately
              // We use setTimeout to allow run loop to clear/UI to update if needed, but immediate is usually fine
              console.log(`[Scheduler] Processing queued break: ${nextType}`);
              setTimeout(() => this.triggerBreak(nextType), 500);
          }
      }
  }

  completeBreak() {
      console.log('[Scheduler] completeBreak called');
      this.closeBreak(true);
  }

  skipBreak() {
      console.log('[Scheduler] skipBreak called');
      this.closeBreak(false);
  }
}

export const schedulerService = new SchedulerService();
