import { LucideIcon } from 'lucide-react';


interface TimerCardProps {
  title: string;
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  hoverBorderClass: string;
  intervalValue: number;
  durationValue: number;
  onIntervalChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  description: string;
  borderColorClass?: string; // Optional override
}

export const TimerCard = ({
  title,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  hoverBorderClass,
  intervalValue,
  durationValue,
  onIntervalChange,
  onDurationChange,
  description
}: TimerCardProps) => {
  return (
    <div className={`bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 hover:bg-zinc-900/60 ${hoverBorderClass} transition-all group flex flex-col justify-between h-full`}>
      <div className={`flex items-center gap-4 mb-4 ${iconColorClass} transition-colors`}>
        <div className={`p-3 rounded-xl ${iconBgClass} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-200">{title}</h2>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500 font-medium">Interval</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={intervalValue}
              onChange={(e) => onIntervalChange(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 w-20 text-center text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <span className="text-zinc-600">min</span>
          </div>
        </div>
         <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500 font-medium">Duration</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={durationValue}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 w-20 text-center text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <span className="text-zinc-600">sec</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50 leading-relaxed">
          {description}
      </p>
    </div>
  );
};
