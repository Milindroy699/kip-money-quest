/**
 * Which campus spots the player has visited, so newly opened ones show "New!" until tapped.
 * Kept on the phone only (not backed up): on a new phone, open spots simply show "New!" once.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '../state/storage';

interface CampusSeen {
  seen: string[];
  markSeen: (id: string) => void;
  /** The player has walked Kip to a building at least once, so the "tap a building" hint can go. */
  walked: boolean;
  markWalked: () => void;
}

export const useCampusSeen = create<CampusSeen>()(
  persist(
    (set) => ({
      seen: [],
      markSeen: (id) => set((s) => (s.seen.includes(id) ? s : { seen: [...s.seen, id] })),
      walked: false,
      markWalked: () => set((s) => (s.walked ? s : { walked: true })),
    }),
    { name: 'kip-campus', storage: createJSONStorage(() => mmkvStorage), version: 1 },
  ),
);
