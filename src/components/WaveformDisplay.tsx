import React from 'react';

interface WaveformDisplayProps {
  waveformData: number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  waveformData,
  currentTime,
  duration,
  isPlaying
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full h-12 bg-purple-50 rounded-lg overflow-hidden">
      {/* Progress overlay */}
      <div 
        className="absolute top-0 left-0 h-full bg-purple-200 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
      
      {/* Waveform bars */}
      <div className="relative flex items-center justify-center h-full space-x-1 px-2">
        {waveformData.map((amplitude, index) => (
          <div
            key={index}
            className={`
              bg-purple-400 rounded-full transition-all duration-100
              ${isPlaying ? 'animate-pulse' : ''}
            `}
            style={{
              width: '2px',
              height: `${Math.max(4, amplitude * 40)}px`,
              opacity: (index / waveformData.length) * 100 < progress ? 0.8 : 0.4
            }}
          />
        ))}
      </div>
      
      {/* Current time indicator */}
      <div 
        className="absolute top-0 w-0.5 h-full bg-purple-600 transition-all duration-100"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};