/**
 * The player's profile picture: one of the game's characters, or a photo they pick. Kept on the phone
 * only (its own store, outside the cloud backup), so a photo never leaves the device.
 */
import { File, Paths } from 'expo-file-system';
import { requireOptionalNativeModule } from 'expo';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DASH, KIP, MELT, MENTORS } from '../art';
import { mmkvStorage } from '../state/storage';

export const AVATAR_PRESETS = [
  { id: 'kip', label: 'Kip', src: KIP.happy },
  { id: 'kipCheer', label: 'Cheering Kip', src: KIP.cheer },
  { id: 'dash', label: 'Dash', src: DASH.excited },
  { id: 'melt', label: 'The Melt', src: MELT.drifting },
  { id: 'bondi', label: 'Bondi', src: MENTORS.govBond },
  { id: 'goldie', label: 'Goldie', src: MENTORS.gold },
  { id: 'rita', label: 'Rita', src: MENTORS.reit },
  { id: 'vee', label: 'Vee', src: MENTORS.peVc },
  { id: 'fizz', label: 'Fizz', src: MENTORS.derivative },
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]['id'];
export type Avatar = { kind: 'preset'; id: AvatarPresetId } | { kind: 'photo'; uri: string };

interface AvatarStore {
  avatar: Avatar | null;
  setAvatar: (a: Avatar | null) => void;
}

export const useAvatar = create<AvatarStore>()(
  persist(
    (set, get) => ({
      avatar: null,
      setAvatar: (a) => {
        const old = get().avatar;
        // Tidy up the previous photo copy when it's replaced.
        if (old?.kind === 'photo' && (a?.kind !== 'photo' || a.uri !== old.uri)) {
          try {
            const f = new File(old.uri);
            if (f.exists) f.delete();
          } catch {
            // Already gone.
          }
        }
        set({ avatar: a });
      },
    }),
    { name: 'kip-avatar', storage: createJSONStorage(() => mmkvStorage), version: 1 },
  ),
);

/** The image to show for an avatar, or null to show the player's initial. A missing photo falls back too. */
export function avatarSource(a: Avatar | null): number | { uri: string } | null {
  if (!a) return null;
  if (a.kind === 'preset') return AVATAR_PRESETS.find((p) => p.id === a.id)?.src ?? null;
  return { uri: a.uri };
}

/** Whether this build includes the photo picker (older installs need an app update). */
export const photoPickerAvailable = requireOptionalNativeModule('ExponentImagePicker') !== null;

/**
 * Lets the player pick a photo, square-cropped, and keeps a copy in the app's documents so it
 * survives cache clean-ups. Returns null if they cancel.
 */
export async function pickPhoto(): Promise<Avatar | null> {
  const ImagePicker = await import('expo-image-picker');
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
  if (result.canceled || !result.assets?.length) return null;
  const source = new File(result.assets[0].uri);
  const ext = source.name.includes('.') ? source.name.slice(source.name.lastIndexOf('.')) : '.jpg';
  const dest = new File(Paths.document, `avatar-${Date.now()}${ext}`);
  await source.copy(dest);
  return { kind: 'photo', uri: dest.uri };
}
