/**
 * Public handles: everyone appears in leagues and duels under a friendly pseudonym, never their
 * real name (most players are minors). Same account, same handle.
 */
import { hashSeed } from '../sim/rng';

const ADJECTIVES = ['Calm', 'Brave', 'Steady', 'Clever', 'Patient', 'Bright', 'Swift', 'Wise', 'Bold', 'Kind', 'Sunny', 'Lucky'];
const ANIMALS = ['Tortoise', 'Owl', 'Elephant', 'Fox', 'Beaver', 'Magpie', 'Octopus', 'Panda', 'Otter', 'Falcon', 'Tiger', 'Dolphin'];

export function handleFor(uid: string): string {
  const h = hashSeed(uid);
  return `${ADJECTIVES[h % ADJECTIVES.length]} ${ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length]} ${10 + (Math.floor(h / 144) % 90)}`;
}
