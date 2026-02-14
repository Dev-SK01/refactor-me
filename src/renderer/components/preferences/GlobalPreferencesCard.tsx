import { Settings, Lock, Monitor } from 'lucide-react';
import { Settings as SettingsType } from '../../stores/useSettingsStore';

interface GlobalPreferencesCardProps {
  settings: SettingsType;
  onUpdate: (key: keyof SettingsType, value: any) => void;
}

export const GlobalPreferencesCard = ({ settings, onUpdate }: GlobalPreferencesCardProps) => {
  
  const toggleStrictMode = () => {
    onUpdate('strictMode', !settings.strictMode);
  };

  const toggleStartup = () => {
    const newValue = !settings.runOnStartup;
    // We expect the parent to handle the IPC call if needed, or we can do it here. 
    // To keep it pure, we should probably just call onUpdate, but IPC is side effect.
    // Let's passed a dedicated handler or just assume onUpdate handles state.
    // Actually, checking Dashboard.tsx, the IPC call happens inline. 
    // I'll accept checking the window.ipcRenderer here for now or pass a prop.
    // Let's pass specific handlers for clarity in the Dashboard.
    onUpdate('runOnStartup', newValue);
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all group flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-4 mb-6 text-zinc-400 group-hover:text-zinc-300 transition-colors ">
           <div className="p-3 rounded-xl bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors"><Settings className="w-6 h-6" /></div>
           <h2 className="text-lg font-semibold text-zinc-200">Global Preferences</h2>
        </div>
        
        <div className="space-y-6">
            {/* Strict Mode Item */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 pr-2 rounded-xl border border-zinc-800/50 shadow-sm">
                <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg transition-colors ${settings.strictMode ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800/50 text-zinc-600'}`}>
                        <Lock className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-zinc-200">Strict Mode</h3>
                        <p className="text-xs text-zinc-500">Block interaction.</p>
                    </div>
                </div>
                <button
                    onClick={toggleStrictMode}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.strictMode ? 'bg-violet-600!' : 'bg-zinc-700'
                    }`}
                >
                    <span
                    className={`${
                        settings.strictMode ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>

            {/* Auto-Launch Item */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 pr-2 rounded-xl border border-zinc-800/50 shadow-sm">
                 <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg transition-colors ${settings.runOnStartup ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800/50 text-zinc-600'}`}>
                        <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-zinc-200">Auto-Launch</h3>
                        <p className="text-xs text-zinc-500">Start on login.</p>
                    </div>
                </div>
                <button
                    onClick={toggleStartup}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.runOnStartup ? 'bg-cyan-600!' : 'bg-zinc-700'
                    }`}
                >
                    <span
                    className={`${
                        settings.runOnStartup ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>
        </div>
    </div>
  );
};
