import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ArrowRight
} from 'lucide-react';
import type { CommunityPost } from '../../types';

interface CommunityPostLivePreviewProps {
  posts: CommunityPost[];
  theme: 'dark' | 'light';
  onOpenConversation?: (post: CommunityPost) => void;
}

export const CommunityPostLivePreview: React.FC<CommunityPostLivePreviewProps> = ({
  posts,
  theme,
  onOpenConversation
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activePost = posts[0];

  // Enforce 15-second preview loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video || activePost?.type !== 'video') return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setVideoTime(Math.min(15, Math.floor(current)));
      setVideoProgress((current / 15) * 100);

      // Loop after 15 seconds
      if (current >= 15) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activePost]);

  const toggleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
  };

  const toggleVideoMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isVideoMuted;
    videoRef.current.muted = nextMuted;
    setIsVideoMuted(nextMuted);
  };

  if (!activePost) return null;

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenConversation) {
      onOpenConversation(activePost);
    }
  };

  return (
    <div className="space-y-2 mt-1">
      {/* CASO A: TWEET / TEXTO DISIDENTE */}
      {activePost.type === 'text' && (
        <div className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-950/90 border-slate-800 shadow-md'
        }`}>
          {/* 1. Tweet / Texto */}
          {activePost.title && (
            <h5 className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {activePost.title}
            </h5>
          )}

          <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
            {activePost.content}
          </p>

          {/* 2. Usuario que colocó el post (Nombre y Apellido) */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/40">
            <img
              src={activePost.creatorAvatar}
              alt={activePost.creatorName}
              className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 truncate">
              <span className={`font-bold text-xs truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {activePost.creatorName}
              </span>
            </div>
          </div>

          {/* 3. Likes - Comentarios - Conversación */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-rose-500 font-bold">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{activePost.likes}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold">
                <MessageCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>{activePost.commentsCount}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleCommentsClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-950/50 hover:bg-pink-900/60 text-pink-300 font-bold text-xs border border-pink-800/50 transition-all active:scale-95"
            >
              <span>Ver conversación</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* CASO B: FOTO REAL */}
      {activePost.type === 'image' && activePost.mediaUrl && (
        <div className={`rounded-2xl overflow-hidden border transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-950/90 border-slate-800 shadow-md'
        }`}>
          {/* 1. Foto */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 group/img">
            <img
              src={activePost.mediaUrl}
              alt={activePost.title || 'Foto de la comunidad'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

            {activePost.title && (
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <p className="font-bold text-xs drop-shadow-md">{activePost.title}</p>
              </div>
            )}
          </div>

          <div className="p-3 space-y-2">
            {/* 2. Usuario que colocó la foto (Nombre y Apellido) */}
            <div className="flex items-center gap-2">
              <img
                src={activePost.creatorAvatar}
                alt={activePost.creatorName}
                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 truncate">
                <span className={`font-bold text-xs truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {activePost.creatorName}
                </span>
              </div>
            </div>

            {/* 3. Likes - Comentarios - Conversación */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-rose-500 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{activePost.likes}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400 font-semibold">
                  <MessageCircle className="w-3.5 h-3.5 text-pink-400" />
                  <span>{activePost.commentsCount}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCommentsClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-950/50 hover:bg-pink-900/60 text-pink-300 font-bold text-xs border border-pink-800/50 transition-all active:scale-95"
              >
                <span>Ver conversación</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASO C: VIDEO 15 SEGUNDOS */}
      {activePost.type === 'video' && (
        <div className={`rounded-2xl overflow-hidden border transition-all ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-950/90 border-slate-800 shadow-md'
        }`}>
          {/* 1. Video con bucle 15 segundos */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
            {activePost.videoUrl ? (
              <video
                ref={videoRef}
                src={activePost.videoUrl}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <Play className="w-12 h-12 text-pink-400 animate-pulse" />
              </div>
            )}

            {/* Floating Quick Video Controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={toggleVideoMute}
                className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                title={isVideoMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isVideoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-pink-400" />}
              </button>
              <button
                type="button"
                onClick={toggleVideoPlay}
                className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
                title={isVideoPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isVideoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
              </button>
            </div>

            {/* Timer Badge */}
            <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-200 bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-md">
              0:{videoTime.toString().padStart(2, '0')} / 0:15s
            </span>

            {/* 15s Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80">
              <div 
                className="h-full bg-pink-500 transition-all duration-200"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          </div>

          <div className="p-3 space-y-2">
            {/* 2. Usuario que colocó el video (Nombre y Apellido) */}
            <div className="flex items-center gap-2">
              <img
                src={activePost.creatorAvatar}
                alt={activePost.creatorName}
                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 truncate">
                <span className={`font-bold text-xs truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {activePost.creatorName}
                </span>
              </div>
            </div>

            {/* 3. Likes - Comentarios - Conversación */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-rose-500 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{activePost.likes}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400 font-semibold">
                  <MessageCircle className="w-3.5 h-3.5 text-pink-400" />
                  <span>{activePost.commentsCount}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCommentsClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-950/50 hover:bg-pink-900/60 text-pink-300 font-bold text-xs border border-pink-800/50 transition-all active:scale-95"
              >
                <span>Ver conversación</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
