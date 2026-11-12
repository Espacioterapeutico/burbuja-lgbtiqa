import React from 'react';
import { Radio } from 'lucide-react';
import type { Contact, UserProfile } from '../../types';

interface StoriesFeedBarProps {
  currentUser: UserProfile;
  contactsWithStories: Contact[];
  myStories: {
    id: string;
    mediaUrl: string;
    caption: string;
    timestamp: string;
    reactions: { emoji: string; count: number }[];
  }[];
  onViewMyStory: () => void;
  onOpenCreateStory: () => void;
  onViewStory: (contact: Contact) => void;
}

export const StoriesFeedBar: React.FC<StoriesFeedBarProps> = ({
  currentUser,
  contactsWithStories,
  myStories,
  onViewMyStory,
  onOpenCreateStory,
  onViewStory
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Historias (24h)</span>
        </div>
        <span className="text-[10px] text-slate-500">Solo reacciones • Cero DMs</span>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {/* User's Own Story Bubble: "Mis historias" */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative">
            <button
              onClick={() => {
                if (myStories.length > 0) {
                  onViewMyStory();
                } else {
                  onOpenCreateStory();
                }
              }}
              className={`p-0.5 rounded-full transition-transform hover:scale-105 active:scale-95 ${
                myStories.length > 0
                  ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-md shadow-pink-900/30'
                  : 'border-2 border-dashed border-pink-500/70 p-0.5'
              }`}
            >
              <div className="p-0.5 bg-slate-950 rounded-full">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-13 h-13 rounded-full object-cover"
                />
              </div>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenCreateStory(); }}
              className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-pink-600 hover:bg-pink-500 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-md border-2 border-slate-950 transition-transform active:scale-90"
              title="Subir historia a Mis historias"
            >
              +
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-200 max-w-[68px] truncate">
            Mis historias
          </span>
        </div>

        {/* Contacts Stories */}
        {contactsWithStories.map((c) => (
          <button
            key={c.id}
            onClick={() => onViewStory(c)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 group-hover:scale-105 transition-transform shadow-md">
              <div className="p-0.5 bg-slate-950 rounded-full">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-13 h-13 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-300 max-w-[64px] truncate group-hover:text-pink-300">
              {c.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
