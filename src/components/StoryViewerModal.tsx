import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Contact } from '../types';

interface StoryViewerModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ contact, isOpen, onClose }) => {
  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([
    { emoji: '🌈', count: 14 },
    { emoji: '💖', count: 28 },
    { emoji: '✨', count: 9 },
    { emoji: '🔥', count: 19 },
    { emoji: '🫂', count: 7 }
  ]);
  const [reactedEmoji, setReactedEmoji] = useState<string | null>(null);

  if (!isOpen || !contact || contact.stories.length === 0) return null;

  const currentStory = contact.stories[0];

  const handleReact = (emoji: string) => {
    setReactedEmoji(emoji);
    setReactions(prev =>
      prev.map(r => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
    );

    // Trigger gentle celebratory burst
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ec4899', '#a855f7', '#06b6d4', '#eab308']
    });

    setTimeout(() => setReactedEmoji(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-[88vh] max-h-[720px] rounded-3xl overflow-hidden bg-slate-950 flex flex-col justify-between border border-slate-800 shadow-2xl">
        {/* Story Background / Image */}
        <img
          src={currentStory.mediaUrl}
          alt={contact.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85" />

        {/* Top Header */}
        <div className="relative z-10 p-4">
          {/* Progress bar */}
          <div className="w-full bg-white/20 h-1 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-white rounded-full w-full animate-pulse" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-full border-2 border-pink-400 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white leading-tight">{contact.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-pink-300 font-medium">{contact.pronouns}</span>
                  <span className="text-[11px] text-slate-400">• {currentStory.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Caption (Middle/Bottom) */}
        <div className="relative z-10 px-5 mb-3 text-center">
          <p className="inline-block px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white font-medium text-sm border border-white/10 shadow-lg">
            {currentStory.caption}
          </p>
        </div>

        {/* Bottom Reaction Bar (Zero DMs rule enforced) */}
        <div className="relative z-10 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Notice explaining zero DM rule */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mb-3 bg-slate-900/80 backdrop-blur-md py-1.5 px-3 rounded-xl border border-slate-800">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>Reacciona con amor. En Burbuja cuidamos tu privacidad sin DMs.</span>
          </div>

          {/* Quick Emoji Reaction Buttons */}
          <div className="flex items-center justify-between gap-1.5">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReact(r.emoji)}
                className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 backdrop-blur-md transition-all border border-white/10"
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-[10px] font-bold text-slate-300 mt-0.5">{r.count}</span>
              </button>
            ))}
          </div>

          {reactedEmoji && (
            <div className="text-center mt-2 text-xs font-semibold text-pink-300 animate-bounce">
              ¡Reaccionaste con {reactedEmoji}!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
