/**
 * Sound effects and run music (synthesised by scripts/make_sounds.py, apart from Kip's "Hii!").
 * Respects the phone's silent switch, mixes with the player's own music, and follows the
 * Sound / Music settings in You.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SFX = {
  coin: require('../../assets/sounds/coin.wav'),
  bank: require('../../assets/sounds/bank.wav'),
  hit: require('../../assets/sounds/hit.wav'),
  melt: require('../../assets/sounds/melt.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  shield: require('../../assets/sounds/shield.wav'),
  celebrate: require('../../assets/sounds/celebrate.wav'),
  /** Kip's "Hii!" and a chime, cut from his Veo clip (design/source-art/characters/kip/kip_hi_1.mp4). */
  kipHi: require('../../assets/sounds/kip_hi.wav'),
};
const MUSIC = require('../../assets/sounds/music_run.wav');

export type SfxName = keyof typeof SFX;

/** How many overlapping copies each effect can play (coins come in quick bursts). */
const POOL: Partial<Record<SfxName, number>> = { coin: 3 };
/** Minimum gap between repeats, so bursts don't turn into noise. */
const MIN_GAP_MS: Partial<Record<SfxName, number>> = { coin: 70, melt: 1200, hit: 120 };

let settings = { sound: true, music: true };
let initialised = false;
const pools: Partial<Record<SfxName, { players: AudioPlayer[]; next: number }>> = {};
const lastPlayed: Partial<Record<SfxName, number>> = {};
let music: AudioPlayer | null = null;

function init() {
  if (initialised) return;
  initialised = true;
  // Silent switch on = silence; never stop the player's own music.
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
}

export function configureSound(next: { sound: boolean; music: boolean }) {
  settings = next;
  if (!next.music) stopMusic();
}

export function playSfx(name: SfxName, volume = 1) {
  if (!settings.sound) return;
  init();
  const now = Date.now();
  if (now - (lastPlayed[name] ?? 0) < (MIN_GAP_MS[name] ?? 0)) return;
  lastPlayed[name] = now;
  try {
    let pool = pools[name];
    if (!pool) {
      pool = { players: Array.from({ length: POOL[name] ?? 1 }, () => createAudioPlayer(SFX[name])), next: 0 };
      pools[name] = pool;
    }
    const player = pool.players[pool.next];
    pool.next = (pool.next + 1) % pool.players.length;
    player.volume = volume;
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Audio is a nice-to-have: never let it break the game.
  }
}

export function startMusic() {
  if (!settings.music) return;
  init();
  try {
    if (!music) {
      music = createAudioPlayer(MUSIC);
      music.loop = true;
      music.volume = 0.5;
    }
    music.seekTo(0).catch(() => {});
    music.play();
  } catch {
    music = null;
  }
}

export function stopMusic() {
  try {
    music?.pause();
  } catch {
    // ignore
  }
}
