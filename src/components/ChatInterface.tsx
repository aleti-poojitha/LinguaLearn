import React, { useEffect, useRef, useState } from 'react';
import { Message, AppSettings, VoicePlayback } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuizComponent } from './QuizComponent';
import { QuizPrompt } from './QuizPrompt';
import { StoryComponent } from './StoryComponent';
import { ChallengeComponent } from './ChallengeComponent';
import { IllustrationViewer } from './IllustrationViewer';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  settings: AppSettings;
  voicePlayback: VoicePlayback;
  currentlyPlayingMessageId: string | null;
  onSpeakMessage: (text: string, messageId: string) => void;
  onQuizAnswer: (messageId: string, answer: number) => void;
  onChallengeAccept: (challengeId: string) => void;
  onStoryAction: (storyId: string, action: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  settings,
  voicePlayback,
  currentlyPlayingMessageId,
  onSpeakMessage,
  onQuizAnswer,
  onChallengeAccept,
  onStoryAction
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIllustration, setSelectedIllustration] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getThemeGradient = () => {
    const themes = {
      default: 'from-blue-50 via-purple-50 to-pink-50',
      ocean: 'from-blue-100 via-cyan-50 to-teal-50',
      forest: 'from-green-100 via-emerald-50 to-lime-50',
      sunset: 'from-orange-100 via-pink-50 to-purple-50',
      space: 'from-indigo-100 via-purple-50 to-blue-50'
    };
    return themes[settings.theme] || themes.default;
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={`
          bg-gradient-to-br ${getThemeGradient()} 
          backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 
          p-6 min-h-[500px] max-h-[600px] overflow-y-auto
          ${settings.reducedMotion ? '' : 'transition-all duration-500'}
        `}
        style={{ fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px' }}
      >
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <MessageBubble
                message={message}
                settings={settings}
                voicePlayback={voicePlayback}
                currentlyPlayingMessageId={currentlyPlayingMessageId}
                onSpeakMessage={(text) => onSpeakMessage(text, message.id)}
              />
              
              {/* Quiz Prompt */}
              {message.quizPrompt && (
                <QuizPrompt
                  topic={message.quizPrompt.topic}
                  onTakeQuiz={() => onQuizAnswer(message.id, -1)} // -1 indicates take quiz
                  onSkip={() => {}} // Quiz prompt will be hidden after a delay
                />
              )}
              
              {/* Illustrations */}
              {message.illustrations && message.illustrations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-12">
                  {message.illustrations.map((illustration) => (
                    <button
                      key={illustration.id}
                      onClick={() => setSelectedIllustration(illustration.url)}
                      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <img 
                        src={illustration.url} 
                        alt={illustration.description}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-sm font-medium">{illustration.description}</p>
                        <span className="text-xs opacity-80 capitalize">{illustration.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Quiz Component */}
              {message.quiz && (
                <QuizComponent
                  quiz={message.quiz}
                  onAnswer={(answer) => onQuizAnswer(message.id, answer)}
                  settings={settings}
                />
              )}
              
              {/* Story Component */}
              {message.story && (
                <StoryComponent
                  story={message.story}
                  onAction={(action) => onStoryAction(message.story!.id, action)}
                  settings={settings}
                />
              )}
              
              {/* Challenge Component */}
              {message.challenge && (
                <ChallengeComponent
                  challenge={message.challenge}
                  onAccept={() => onChallengeAccept(message.challenge!.id)}
                  settings={settings}
                />
              )}
            </div>
          ))}
          
          {isLoading && <TypingIndicator settings={settings} />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Illustration Viewer Modal */}
      {selectedIllustration && (
        <IllustrationViewer
          imageUrl={selectedIllustration}
          onClose={() => setSelectedIllustration(null)}
        />
      )}
    </div>
  );
};