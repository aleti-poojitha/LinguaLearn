import React, { useState } from 'react';
import { Star, Atom, Calculator, Globe, BookOpen, Book, Trophy } from 'lucide-react';

const subjects = [
  {
    id: 'explore',
    name: 'Explore',
    description: 'Ask anything!',
    icon: Star,
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discover nature',
    icon: Atom,
    gradient: 'from-blue-400 to-cyan-500',
    topics: ['Plants', 'Animals', 'Physics', 'Chemistry', 'Earth'],
  },
  {
    id: 'math',
    name: 'Math',
    description: 'Numbers & logic',
    icon: Calculator,
    gradient: 'from-green-400 to-emerald-500',
    topics: ['Algebra', 'Geometry', 'Numbers', 'Logic', 'Fractions'],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'World & culture',
    icon: Globe,
    gradient: 'from-orange-400 to-red-500',
    topics: ['History', 'Geography', 'Civics', 'Culture', 'Economics'],
  },
  {
    id: 'english',
    name: 'English',
    description: 'Language skills',
    icon: BookOpen,
    gradient: 'from-pink-400 to-rose-500',
    topics: ['Grammar', 'Vocabulary', 'Reading', 'Writing', 'Comprehension'],
  },
  {
    id: 'stories',
    name: 'Stories',
    description: 'Fun tales',
    icon: Book,
    gradient: 'from-indigo-400 to-purple-500',
    topics: ['Fables', 'Fairy Tales', 'Adventure', 'Moral Stories', 'Folk Tales'],
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Play & learn',
    icon: Trophy,
    gradient: 'from-yellow-400 to-orange-500',
    topics: ['Cricket', 'Football', 'Basketball', 'Athletics', 'Badminton'],
  },
];

interface SubjectSelectorProps {
  selectedSubject?: string;
  onSubjectChange: (subject: string, topic?: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubject, onSubjectChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 text-center">
        What would you like to explore today? ✨
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Choose your adventure and let's learn together!
      </p>
      <div className="w-full max-w-screen-lg mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-x-12 gap-y-12 justify-center">
          {subjects.map((subject) => (
            <div key={subject.id} className="relative">
              <button
                onClick={() => {
                  if (subject.id === 'explore') {
                    onSubjectChange('explore');
                  } else {
                    setOpenDropdown(subject.id === openDropdown ? null : subject.id);
                  }
                }}
                onMouseEnter={() => subject.topics && setOpenDropdown(subject.id)}
                onMouseLeave={() => subject.topics && setOpenDropdown(null)}
                className={
                  `group relative overflow-hidden rounded-3xl p-6 w-36 h-36 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                  flex flex-col items-center justify-center
                  ${selectedSubject === subject.id
                    ? `bg-gradient-to-br ${subject.gradient} text-white shadow-2xl scale-105`
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg border border-white/50'
                  }`
                }
                aria-label={`Select ${subject.name} subject`}
              >
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className={
                    `p-3 rounded-2xl transition-all duration-300
                    ${selectedSubject === subject.id 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : `bg-gradient-to-br ${subject.gradient} text-white group-hover:scale-110`
                    }`
                  }>
                    <subject.icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-base mb-1">{subject.name}</h3>
                    <p className={`text-xs opacity-80 ${selectedSubject === subject.id ? 'text-white' : 'text-gray-600'}`}>{subject.description}</p>
                  </div>
                </div>
                <div className={
                  `absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`
                } />
                {selectedSubject === subject.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse" />
                )}
              </button>
              {/* Dropdown for topics */}
              {subject.topics && openDropdown === subject.id && (
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-40 bg-white border border-purple-200 rounded-xl shadow-lg z-20"
                  onMouseEnter={() => setOpenDropdown(subject.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <ul className="py-2">
                    {subject.topics.map((topic: string) => (
                      <li
                        key={topic}
                        className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm text-gray-700"
                        onClick={() => { onSubjectChange(subject.id, topic); setOpenDropdown(null); }}
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector;