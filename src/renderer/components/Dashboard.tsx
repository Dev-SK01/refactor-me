import { useSettingsStore } from '../stores/useSettingsStore';
import { useToastStore } from '../stores/useToastStore';
import { Monitor, Move, Hand, User, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Header } from './layout/Header';
import { TimerCard } from './timer/TimerCard';
import { GlobalPreferencesCard } from './preferences/GlobalPreferencesCard';

export const Dashboard = () => {
  const { settings, updateSettings, isRunning, startTimers, stopTimers } = useSettingsStore();
  const { showToast } = useToastStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isDirty, setIsDirty] = useState(false);

  console.log('Dashboard Render. isRunning:', isRunning);

  // Sync local state with store when settings are loaded/updated from main process
  useEffect(() => {
    if (!isDirty) {
      setLocalSettings(settings);
    }
  }, [settings, isDirty]);

  const handleTimerChange = (key: keyof typeof settings.timers, value: number) => {
    const newSettings = {
      ...localSettings,
      timers: {
        ...localSettings.timers,
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
    setIsDirty(true);
  };

  const handleDurationChange = (key: keyof typeof settings.durations, value: number) => {
    const newSettings = {
      ...localSettings,
      durations: {
        ...localSettings.durations,
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
    setIsDirty(true);
  };

  const handleUpdateGlobal = (key: keyof typeof settings, value: any) => {
      const newSettings = {
          ...localSettings,
          [key]: value
      };
      setLocalSettings(newSettings);
      setIsDirty(true);

      // Handle specific side effects (IPC) if needed
      if (key === 'runOnStartup') {
          // @ts-ignore
          window.ipcRenderer.invoke('toggle-startup', value);
      }
  };


  const saveSettings = () => {
    console.log('Saving settings...', localSettings);
    updateSettings(localSettings);
    setIsDirty(false);
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 flex flex-col">
      <Header isRunning={isRunning} startTimers={startTimers} stopTimers={stopTimers} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-8">
        
        {/* Unified Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <TimerCard
                title="Visual Health"
                icon={Monitor}
                iconColorClass="text-indigo-400 group-hover:text-indigo-300"
                iconBgClass="bg-indigo-500/10 group-hover:bg-indigo-500/20"
                hoverBorderClass="hover:border-indigo-500/30"
                intervalValue={localSettings.timers.visual}
                durationValue={localSettings.durations?.visual ?? 20}
                onIntervalChange={(val) => handleTimerChange('visual', val)}
                onDurationChange={(val) => handleDurationChange('visual', val)}
                description="The 20-20-20 Rule: Look 20ft away for 20s."
            />

            <TimerCard
                title="Back & Knee"
                icon={Move}
                iconColorClass="text-emerald-400 group-hover:text-emerald-300"
                iconBgClass="bg-emerald-500/10 group-hover:bg-emerald-500/20"
                hoverBorderClass="hover:border-emerald-500/30"
                intervalValue={localSettings.timers.lowerBody}
                durationValue={localSettings.durations?.lowerBody ?? 20}
                onIntervalChange={(val) => handleTimerChange('lowerBody', val)}
                onDurationChange={(val) => handleDurationChange('lowerBody', val)}
                description="Movement breaks: Glute bridges & Couch stretch."
            />

            <TimerCard
                title="Wrist & RSI"
                icon={Hand}
                iconColorClass="text-amber-400 group-hover:text-amber-300"
                iconBgClass="bg-amber-500/10 group-hover:bg-amber-500/20"
                hoverBorderClass="hover:border-amber-500/30"
                intervalValue={localSettings.timers.wrist}
                durationValue={localSettings.durations?.wrist ?? 20}
                onIntervalChange={(val) => handleTimerChange('wrist', val)}
                onDurationChange={(val) => handleDurationChange('wrist', val)}
                description="Stretches: Prayer & Reverse Wrist Pull."
            />

            <TimerCard
                title="Posture"
                icon={User}
                iconColorClass="text-rose-400 group-hover:text-rose-300"
                iconBgClass="bg-rose-500/10 group-hover:bg-rose-500/20"
                hoverBorderClass="hover:border-rose-500/30"
                intervalValue={localSettings.timers.posture}
                durationValue={localSettings.durations?.posture ?? 20}
                onIntervalChange={(val) => handleTimerChange('posture', val)}
                onDurationChange={(val) => handleDurationChange('posture', val)}
                description="Ergonomic Check: Eyes level, elbows 90°."
            />

            <GlobalPreferencesCard 
                settings={localSettings} 
                onUpdate={handleUpdateGlobal} 
            />

        </div>
      </main>

      {isDirty && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
             <button
                onClick={saveSettings}
                className="flex items-center gap-2 bg-indigo-600! hover:bg-indigo-500 text-white px-6 py-3 rounded-full shadow-lg shadow-indigo-500/20 font-medium transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
             >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
             </button>
        </div>
      )}
    </div>
  );
};
