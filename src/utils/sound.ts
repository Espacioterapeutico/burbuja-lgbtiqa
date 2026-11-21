/**
 * Web Audio API synthesizer for retro MSN Messenger sounds:
 * 1. Zump / Nudge
 * 2. Contact Online chime
 * 3. Alarma / Alerta de reporte
 */
export function playZumpSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    createChirp(ctx, now, 180, 440, 0.12);
    createChirp(ctx, now + 0.14, 220, 520, 0.18);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function playMsnOnlineChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Iconic ascending two-tone chime
    playTone(ctx, 587.33, now, 0.15);        // D5
    playTone(ctx, 880.00, now + 0.12, 0.25);  // A5
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Efecto de sonido nítido de burbuja de jabón que baja y explota (Bubble Pop)
 */
export function playBubblePopSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 1. Barrido de frecuencia característico de burbuja (pop rápido)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1150, now + 0.07);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);

    // 2. Micro-eco suave de agua
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.06);
    gain2.gain.setValueAtTime(0.15, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.02);
    osc2.stop(now + 0.06);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function playAlarmSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    playTone(ctx, 440, now, 0.1);
    playTone(ctx, 330, now + 0.12, 0.1);
    playTone(ctx, 440, now + 0.24, 0.15);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.3, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function createChirp(ctx: AudioContext, startTime: number, freqStart: number, freqEnd: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freqStart, startTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);

  gain.gain.setValueAtTime(0.4, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Simula la reproducción de una nota de voz con notas armónicas agradables
 */
let activeVoiceOscillators: { stop: () => void }[] = [];

export function stopVoiceNoteAudio() {
  activeVoiceOscillators.forEach(o => {
    try { o.stop(); } catch {}
  });
  activeVoiceOscillators = [];
}

export function playVoiceNoteAudio(durationSeconds: number = 4, onEnded?: () => void) {
  stopVoiceNoteAudio();
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      setTimeout(() => onEnded?.(), durationSeconds * 1000);
      return;
    }
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const notes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // E4, G4, A4, C5, D5, E5

    const stepDuration = 0.28;
    const totalSteps = Math.min(Math.floor(durationSeconds / stepDuration), 24);

    for (let i = 0; i < totalSteps; i++) {
      const freq = notes[i % notes.length];
      const startT = now + i * stepDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.08, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + stepDuration * 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + stepDuration);

      activeVoiceOscillators.push(osc);
    }

    setTimeout(() => {
      onEnded?.();
    }, durationSeconds * 1000);
  } catch {
    setTimeout(() => onEnded?.(), durationSeconds * 1000);
  }
}
