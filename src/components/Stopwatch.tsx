import React, { useState, useEffect, useRef } from 'react';

interface Lap {
  id: number;
  lapTime: number;
  overallTime: number;
}

export function Stopwatch() {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - previousTimeRef.current;

      const updateTimer = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTimeRef.current;
        setTime(elapsed);
        previousTimeRef.current = elapsed;
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    previousTimeRef.current = 0;
  };

  const handleLap = () => {
    if (!isRunning && time === 0) return;

    const lastLapOverall = laps.length > 0 ? laps[0].overallTime : 0;
    const currentLapTime = time - lastLapOverall;

    const newLap: Lap = {
      id: laps.length + 1,
      lapTime: currentLapTime,
      overallTime: time,
    };

    setLaps([newLap, ...laps]);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
  };

  let fastestLapId: number | null = null;
  let slowestLapId: number | null = null;

  if (laps.length > 1) {
    let minTime = Infinity;
    let maxTime = -1;

    laps.forEach((lap) => {
      if (lap.lapTime < minTime) {
        minTime = lap.lapTime;
        fastestLapId = lap.id;
      }
      if (lap.lapTime > maxTime) {
        maxTime = lap.lapTime;
        slowestLapId = lap.id;
      }
    });
  }

  const currentLapElapsed = laps.length > 0 ? time - laps[0].overallTime : time;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl font-bold tracking-wide text-slate-100">Stopwatch</h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
            {isRunning ? 'RUNNING' : time > 0 ? 'PAUSED' : 'READY'}
          </span>
        </div>

        {/* Main Display Dial */}
        <div className="relative flex flex-col items-center justify-center w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-indigo-500/20 bg-slate-950/60 shadow-inner my-2">
          <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isRunning ? 'opacity-100 animate-pulse' : 'opacity-30'}`} style={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)' }} />

          <div className="text-xs font-mono text-slate-400 mb-1">
            Lap {laps.length + 1}: <span className="text-indigo-400 font-semibold">{formatTime(currentLapElapsed)}</span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-wider text-white drop-shadow">
            {formatTime(time)}
          </div>

          <div className="text-xs text-slate-500 mt-2 tracking-widest uppercase">
            {time > 3600000 ? 'HH : MM : SS . MS' : 'MM : SS . MS'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 w-full">
          <button
            onClick={handleReset}
            disabled={time === 0 && !isRunning}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50"
          >
            Reset
          </button>

          <button
            onClick={handleStartPause}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? 'Pause' : time > 0 ? 'Resume' : 'Start'}
          </button>

          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-slate-800 hover:bg-slate-700 active:scale-95 text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50"
          >
            Lap
          </button>
        </div>

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="w-full mt-2 border-t border-slate-800 pt-4 flex flex-col gap-2 max-h-56 overflow-y-auto">
            <div className="flex justify-between text-xs font-semibold text-slate-400 px-3 pb-1">
              <span>Lap</span>
              <span>Lap Time</span>
              <span>Overall</span>
            </div>
            {laps.map((lap) => {
              const isFastest = lap.id === fastestLapId;
              const isSlowest = lap.id === slowestLapId;

              let badgeStyle = 'text-slate-300';
              if (isFastest) badgeStyle = 'text-emerald-400 font-semibold';
              if (isSlowest) badgeStyle = 'text-rose-400 font-semibold';

              return (
                <div
                  key={lap.id}
                  className="flex justify-between items-center bg-slate-950/40 px-3 py-2 rounded-lg text-sm font-mono border border-slate-800/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">#{lap.id}</span>
                    {isFastest && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Fastest
                      </span>
                    )}
                    {isSlowest && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Slowest
                      </span>
                    )}
                  </span>
                  <span className={badgeStyle}>{formatTime(lap.lapTime)}</span>
                  <span className="text-slate-400 text-xs">{formatTime(lap.overallTime)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
