import { FC, HTMLAttributes, useEffect, useState } from 'react';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress: number;
  goal: number;
  deadline?: Date;
  variant?: 'extended' | 'tiny';
}

const ProgressBar: FC<ProgressBarProps> = ({
  progress,
  goal,
  deadline,
  variant = 'extended',
  ...props
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  const getWidth = (value: number) => (value >= 5 ? (value >= 100 ? 100 : value) : variant === 'tiny' ? 12 : 10);

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = Math.max(new Date(deadline || 0).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(difference / (24 * 60 * 60 * 1000)),
        hours: Math.floor((difference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
        minutes: Math.floor((difference % (60 * 60 * 1000)) / (60 * 1000)),
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div {...props}>
      <div
        className={`w-full rounded-r-xl rounded-tl-xl overflow-hidden relative ${variant === 'tiny' ? 'h-[30px]' : 'h-[35px]'}`}
      >

        <div className='w-full h-full bg-grey-tertiary rounded-full'>
        <div
          className={`h-full flex justify-center items-center text-white font-mono bg-[length:200%_200%] bg-[0%_0%] 
            bg-primary-gradient font-bold rounded-full ${variant === 'tiny' ? 'text-base' : 'text-lg'} text-lg py-0.5`}
          style={{ width: `${getWidth(((progress / goal) * 100))}%` }}
        >
            <div>{((progress / goal) * 100).toFixed(0)}%</div>
        </div>
      </div>
      </div>
      <div
        className={`rounded-2xl w-full pb-2 ${variant === 'tiny' ? '-mt-6 pt-10' : '-mt-8 pt-12'}`}
      >
        <div className={`grid grid-cols-[1fr_1fr_2fr] ${variant === 'tiny' ? 'grid-cols-[1fr_1fr_2fr]' : 'grid-cols-[1fr_1fr_1fr]'}  divide-x divide-zinc-400 text-white border-gradient`}>
          <div className={`flex flex-col ${variant === 'tiny' ? 'px-3 py-1' : 'px-5 py-1.5'}`}>
            <h4 className={`font-semibold ${variant === 'tiny' ? 'text-sm' : ''}`}>
              Raised
            </h4>
            <span className={`flex gap-1 ${variant === 'tiny' ? 'text-sm' : ''}`}>
              <span>$</span>
              <span>{Number(progress).toLocaleString('uk')}</span>
            </span>
          </div>
          <div className={`flex flex-col ${variant === 'tiny' ? 'px-3 py-1' : 'px-5 py-1.5'}`}>
            <h4 className={`font-semibold ${variant === 'tiny' ? 'text-sm' : ''}`}>
              Goal
            </h4>
            <span className={`flex gap-1 ${variant === 'tiny' ? 'text-sm' : ''}`}>
              <span>$</span>
              <span>{Number(goal).toLocaleString('uk')}</span>
            </span>
          </div>
          <div
            className={`flex flex-col items-end ${variant === 'tiny' ? 'px-3 py-1' : 'px-5 py-1.5'}`}
          >
            <h4 className={`font-semibold ${variant === 'tiny' ? 'text-sm' : ''}`}>
              Time left
            </h4>
            <span className={`flex gap-1 ${variant === 'tiny' ? 'text-sm' : ''}`}>
              {timeLeft.days < 10 && '0'}
              {timeLeft.days}d • {timeLeft.hours < 10 && '0'}
              {timeLeft.hours}h • {timeLeft.minutes < 10 && '0'}
              {timeLeft.minutes}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
