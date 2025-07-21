import React, { useState, useRef, useEffect } from 'react';
import { Message, AppSettings, VoicePlayback } from '../types';
import { Volume2, User, Bot, Pause, Play, MoreVertical, VolumeX, Volume1 } from 'lucide-react';
import { WaveformDisplay } from './WaveformDisplay';

// Utility: Convert plain text lists to HTML lists
function convertPlainTextListsToHtml(text: string) {
  text = text.replace(/(?:^|\n)[*-] (.+)/g, (match) => {
    const items = match.trim().split(/\n[*-] /).map(item => item.replace(/^[*-] /, ''));
    return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
  });
  text = text.replace(/(?:^|\n)\d+\. (.+)/g, (match) => {
    const items = match.trim().split(/\n\d+\. /).map(item => item.replace(/^\d+\. /, ''));
    return '<ol>' + items.map(i => `<li>${i}</li>`).join('') + '</ol>';
  });
  return text;
}
// Utility: Strip HTML tags from text
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}
// Utility: Strip emojis from text
function stripEmojis(text: string): string {
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83D[\uDC00-\uDE4F])/g, '');
}

interface MessageBubbleProps {
  message: Message;
  settings: AppSettings;
  voicePlayback: VoicePlayback;
  currentlyPlayingMessageId: string | null;
  onSpeakMessage: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  settings,
  voicePlayback,
  currentlyPlayingMessageId,
  onSpeakMessage
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioUrls([]);
      setCurrentAudioIndex(0);
    }
  }, [settings.language]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
    }
  };

  const handleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackRate(Number(e.target.value));
  };

  const handleAudioPlay = () => setIsPlaying(true);
  const handleAudioPause = () => setIsPlaying(false);

  const handleAudioEnded = () => {
    if (audioUrls.length > 0 && currentAudioIndex < audioUrls.length - 1) {
      setCurrentAudioIndex((prev) => prev + 1);
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    } else {
      setAudioUrls([]);
      setCurrentAudioIndex(0);
    }
  };

  const backendUrl = 'http://localhost:5000';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageGradient = (isBot: boolean) => {
    if (isBot) {
      const botGradients = {
        default: 'from-purple-100 via-pink-100 to-purple-100',
        ocean: 'from-blue-100 via-cyan-100 to-blue-100',
        forest: 'from-green-100 via-emerald-100 to-green-100',
        sunset: 'from-orange-100 via-pink-100 to-orange-100',
        space: 'from-indigo-100 via-purple-100 to-indigo-100'
      };
      return botGradients[settings.theme] || botGradients.default;
    } else {
      return 'from-blue-500 via-indigo-500 to-purple-500';
    }
  };

  const getAvatarGradient = (isBot: boolean) => {
    if (isBot) {
      return 'from-purple-400 via-pink-400 to-purple-500';
    } else {
      return 'from-blue-400 via-indigo-400 to-blue-500';
    }
  };

  const shouldHighlight = message.id === currentlyPlayingMessageId && voicePlayback.isPlaying;

  const handlePlayTTS = async () => {
    setAudioError(null);
    setIsAudioLoading(true);
    setAudioUrls([]);
    setCurrentAudioIndex(0);
    try {
      const cleanText = stripEmojis(stripHtmlTags(message.text));
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, language: settings.language })
      });
      const data = await response.json();
      if (response.ok && data.audioUrls && data.audioUrls.length > 0) {
        setAudioUrls(data.audioUrls);
        setTimeout(() => {
          setCurrentAudioIndex(0);
          audioRef.current?.play();
        }, 100);
      } else {
        setAudioError(data.error || 'TTS not available for this language.');
      }
    } catch (err) {
      setAudioError('TTS generation failed. Please try again.');
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div 
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-6`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.isBot ? 'order-2' : 'order-1'}`}>
        <div className={`
          flex items-start space-x-3 ${message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}
        `}>
          {/* Avatar */}
          <div className={`
            w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg
            bg-gradient-to-br ${getAvatarGradient(message.isBot)}
            ${settings.reducedMotion ? '' : 'transition-all duration-300 hover:scale-110'}
          `}>
            {message.isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          {/* Message Content */}
          <div className={`
            rounded-3xl px-4 py-2 shadow-lg backdrop-blur-sm border border-white/20
            ${settings.reducedMotion ? '' : 'transition-all duration-300 hover:shadow-xl'}
            ${message.isBot 
              ? `bg-gradient-to-br ${getMessageGradient(true)} text-purple-800` 
              : `bg-gradient-to-br ${getMessageGradient(false)} text-white`
            }
            ${settings.highContrast ? 'border-2 border-gray-800' : ''}
          `}>
            {/* Message Text */}
            {message.isBot ? (
              <div
                className="lingo-answer leading-tight text-[13px]"
                style={{ fontFamily: 'sans-serif' }}
                dangerouslySetInnerHTML={{ __html: convertPlainTextListsToHtml(message.text) }}
              />
            ) : (
              <div className="leading-tight text-[13px]" style={{ fontFamily: 'sans-serif' }}>
                {message.text}
            </div>
            )}
            {/* Voice Indicator */}
            {message.isVoice && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs opacity-70">Voice message</span>
              </div>
            )}
            {/* Image */}
            {message.imageUrl && (
              <div className="mt-4">
                <img 
                  src={message.imageUrl} 
                  alt="Educational illustration" 
                  className="rounded-2xl max-w-full h-auto shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              </div>
            )}
            {/* Waveform Display */}
            {message.isBot && settings.showWaveform && shouldHighlight && (
              <div className="mt-3">
                <WaveformDisplay 
                  waveformData={voicePlayback.waveformData}
                  currentTime={voicePlayback.currentTime}
                  duration={voicePlayback.duration}
                  isPlaying={voicePlayback.isPlaying}
                />
              </div>
            )}
            {/* Footer */}
            <div className={`
              flex items-center justify-between mt-3 text-xs
              ${message.isBot ? 'text-purple-600' : 'text-blue-100'}
            `}>
              <span>{formatTime(message.timestamp)}</span>
              {/* Audio Controls */}
              {message.isBot && settings.voiceEnabled && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayTTS}
                    className={
                      `p-2 rounded-full transition-all duration-200 ${message.isBot ? 'hover:bg-purple-200 text-purple-600' : 'hover:bg-blue-400 text-blue-100'} ${isHovered ? 'scale-110' : ''}`
                    }
                    title="Play audio"
                    aria-label="Play audio"
                    disabled={isAudioLoading}
                  >
                    <Volume2 className={`w-4 h-4 ${isAudioLoading ? 'animate-pulse' : ''}`} />
                  </button>
                  {audioUrls.length > 0 && (
                    <div className="w-full max-w-xs rounded-lg shadow-md border border-purple-200 bg-white/90 p-2 my-2 flex flex-col items-center audio-theme-bar" style={{ fontFamily: 'sans-serif' }}>
                      <audio
                        ref={audioRef}
                        src={backendUrl + audioUrls[currentAudioIndex]}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={handleAudioPlay}
                        onPause={handleAudioPause}
                        onEnded={handleAudioEnded}
                        style={{ display: 'none' }}
                      />
                      <div className="flex items-center w-full justify-between">
                        <button onClick={togglePlay} className="p-1 rounded-full bg-purple-100 hover:bg-purple-200">
                          {isPlaying ? <Pause className="w-5 h-5 text-purple-700" /> : <Play className="w-5 h-5 text-purple-700" />}
                        </button>
                        <span className="text-xs font-mono text-purple-700">
                          {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={duration || 1}
                          step={0.01}
                          value={currentTime}
                          onChange={handleSeek}
                          className="flex-1 mx-2 accent-purple-400"
                          style={{ minWidth: 0 }}
                        />
                        <button onClick={() => setMenuOpen((prev) => !prev)} className="p-1 ml-2 rounded-full bg-purple-100 hover:bg-purple-200">
                          <MoreVertical className="w-5 h-5 text-purple-700" />
                        </button>
                      </div>
                      {menuOpen && (
                        <div className="mt-2 w-full bg-white border border-purple-200 rounded-lg shadow-lg p-2 z-10 flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <button onClick={handleMute} className="p-1 rounded-full bg-purple-50 hover:bg-purple-100">
                              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-purple-700" /> : <Volume1 className="w-5 h-5 text-purple-700" />}
                            </button>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={volume}
                              onChange={handleVolumeChange}
                              className="accent-purple-400"
                              style={{ width: '80px' }}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-purple-700">Speed:</label>
                            <select
                              value={playbackRate}
                              onChange={handlePlaybackRateChange}
                              className="rounded border border-purple-200 px-2 py-1 text-xs"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={1}>1x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2x</option>
                            </select>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(backendUrl + audioUrls[currentAudioIndex]);
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;
                                a.download = 'tts-audio.mp3';
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (err) {
                                alert('Failed to download audio.');
                              }
                            }}
                            className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 text-center"
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {audioError && <span className="text-xs text-red-500 ml-2">{audioError}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};