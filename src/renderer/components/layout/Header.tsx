import { useToastStore } from '../../stores/useToastStore';

// @ts-ignore
import logoUrl from '../../../assets/logo.png';

interface HeaderProps {
  isRunning: boolean;
  startTimers: () => void;
  stopTimers: () => void;
}

export const Header = ({ isRunning, startTimers, stopTimers }: HeaderProps) => {
  const { showToast } = useToastStore();

  const handleToggle = () => {
    if (isRunning) {
      stopTimers();
      showToast('Timers paused', 'info');
    } else {
      startTimers();
      showToast('Timers started successfully', 'success');
    }
  };

  return (
    <header className="titlebar-drag-region pt-8 px-6 pb-2 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40 border-b border-white/5 mx-4 mt-2 rounded-md">
      <div className="flex items-center gap-4">
         {/* Logo */}
         <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-white/10">
            <img src={logoUrl} alt="Refactor Me Logo" className="w-full h-full object-cover" />
         </div>
         <div>
            <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Refactor Me
            </h1>
            <p className="text-xs text-zinc-500 font-medium">Focusing on Developer Wellness❤️‍🩹</p>
         </div>
      </div>

      <div className="titlebar-no-drag flex items-center gap-4">
          <div className="flex items-center gap-3 bg-zinc-900/80 p-1.5 pr-2 rounded-full border border-zinc-800/50 shadow-sm">
             <span className={`text-xs font-semibold px-2 uppercase tracking-wider ${isRunning ? 'text-emerald-400' : 'text-zinc-500'}`}>
               {isRunning ? 'Running' : 'Paused'}
             </span>
             <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                isRunning ? 'bg-emerald-500!' : 'bg-zinc-700!'
              }`}
            >
              <span
                className={`${
                  isRunning ? 'translate-x-4' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div className="h-8 w-px bg-zinc-800 hidden md:block"></div>
          <div className="text-xs text-zinc-600 font-mono hidden md:block select-none">v1.0.0</div>
      </div>
    </header>
  );
};
