import Store from 'electron-store';

export interface AppSchema {
  settings: {
    strictMode: boolean;
    runOnStartup: boolean;
    timers: {
      visual: number; // minutes
      posture: number; // minutes
      wrist: number; // minutes
      lowerBody: number; // minutes
    };
    durations: {
      visual: number; // seconds
      posture: number; // seconds
      wrist: number; // seconds
      lowerBody: number; // seconds
    };
  };
  stats: {
    totalBreaks: number;
    skippedBreaks: number;
  };
}

const schema = {
  settings: {
    type: 'object',
    properties: {
      strictMode: { type: 'boolean', default: false },
      timers: {
        type: 'object',
        properties: {
          visual: { type: 'number', default: 20 },
          posture: { type: 'number', default: 120 },
          wrist: { type: 'number', default: 60 },
          lowerBody: { type: 'number', default: 60 },
        },
        default: {},
      },
      durations: {
        type: 'object',
        properties: {
          visual: { type: 'number', default: 20 },
          posture: { type: 'number', default: 20 },
          wrist: { type: 'number', default: 20 },
          lowerBody: { type: 'number', default: 20 },
        },
        default: {},
      },
    },
    default: {},
  },
  stats: {
    type: 'object',
    properties: {
      totalBreaks: { type: 'number', default: 0 },
      skippedBreaks: { type: 'number', default: 0 },
    },
    default: {},
  },
} as const;

export class StoreService {
  private store: Store<AppSchema>;

  constructor() {
    this.store = new Store<AppSchema>({ schema } as any);
  }

  getSettings(): AppSchema['settings'] {
    const defaults = {
      strictMode: false,
      runOnStartup: false,
      timers: {
        visual: 20,
        posture: 120,
        wrist: 60,
        lowerBody: 60,
      },
      durations: {
        visual: 20, // seconds
        posture: 20,
        wrist: 20,
        lowerBody: 20,
      },
    };
    const current = this.store.get('settings') || {};
    return {
      ...defaults,
      ...current,
      timers: {
        ...defaults.timers,
        ...(current.timers || {}),
      },
      durations: {
        ...defaults.durations,
        ...(current.durations || {}),
      },
    } as AppSchema['settings'];
  }

  setSettings(settings: AppSchema['settings']) {
    this.store.set('settings', settings);
  }

  updateStats(type: 'total' | 'skipped') {
    if (type === 'total') {
      this.store.set('stats.totalBreaks', this.store.get('stats.totalBreaks') + 1);
    } else {
      this.store.set('stats.skippedBreaks', this.store.get('stats.skippedBreaks') + 1);
    }
  }

  get<K extends keyof AppSchema>(key: K): AppSchema[K] {
    return this.store.get(key);
  }

  set<K extends keyof AppSchema>(key: K, value: AppSchema[K]) {
    this.store.set(key, value);
  }
}

export const storeService = new StoreService();
