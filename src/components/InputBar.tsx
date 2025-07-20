import React, { useState, useRef } from 'react';
import { Send, Mic, Camera, Smile } from 'lucide-react';
import { AppSettings, Language } from '../types';
import Tesseract from 'tesseract.js';

interface InputBarProps {
  onSendMessage: (text: string, isVoice?: boolean) => void;
  settings: AppSettings;
  isLoading: boolean;
}

const emojis = ['😊', '🤔', '😍', '🎉', '👍', '❤️', '🌟', '🚀', '🎯', '💡', '🔥', '✨'];
const getLanguageCode = (lang: Language) => {
  const langMap = {
    en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', gu: 'gu-IN', bn: 'bn-IN'
  };
  return langMap[lang] || 'en-US';
};

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  settings,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, false);
      setInputText('');
      setShowEmojis(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojis(false);
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLanguageCode(settings.language);
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onSendMessage(transcript, true);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsOcrLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        try {
          const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
          if (text && text.trim().length > 0) {
            onSendMessage(`(From photo): ${text.trim()}`, false);
          } else {
            onSendMessage("No readable text detected in the photo.", false);
          }
        } catch (err) {
          onSendMessage("Error reading text from the photo.", false);
        } finally {
          setIsOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center items-end pb-6">
      <div className="backdrop-blur-xl bg-white/60 rounded-full shadow-xl flex items-center gap-2 px-4 py-2 max-w-2xl w-full mx-4 border border-white/40">
        <button
          className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors flex items-center justify-center"
          title="Add emoji"
          aria-label="Add emoji"
          onClick={() => setShowEmojis(!showEmojis)}
        >
          <Smile className="w-5 h-5" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center justify-center"
          title="Upload image"
          aria-label="Upload image"
          disabled={isOcrLoading}
        >
          <Camera className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything about your studies... 🤔"
          maxLength={500}
          className="flex-1 resize-none rounded-full border-none bg-transparent px-4 py-2 text-base focus:outline-none focus:ring-0 min-h-[40px] max-h-[80px] placeholder-gray-500"
          rows={1}
          disabled={isLoading || isOcrLoading}
        />
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full ${isRecording ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600 hover:bg-green-200'} transition-colors flex items-center justify-center`}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          disabled={isOcrLoading}
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors flex items-center justify-center ml-2"
          title="Send"
          aria-label="Send"
          disabled={isLoading || inputText.trim().length === 0}
        >
          <Send className="w-5 h-5" />
        </button>
        <div className="text-xs text-gray-400 select-none pointer-events-none ml-2">
          {inputText.length}/500
        </div>
      </div>
    </div>
  );
};
