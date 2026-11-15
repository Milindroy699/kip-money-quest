import { Platform, type TextStyle } from 'react-native';

export const colors = {
  cream: '#FFF8EC',
  surface: '#FFFFFF',
  ink: '#1E2A3A',
  inkSoft: '#5B6474',
  inkMuted: '#8A93A3',
  line: '#EADFCB',
  kip: '#2DBE7E',
  kipDark: '#1F9A63',
  kipLight: '#DFF6EA',
  shell: '#F2B544',
  shellDark: '#C98A1A',
  coin: '#FFC83D',
  melt: '#8B5CF6',
  meltDark: '#6D3FD6',
  meltLight: '#EFE8FF',
  dash: '#FF8A3D',
  dashDark: '#D9661C',
  dashLight: '#FFEBDD',
  error: '#E5484D',
  errorLight: '#FDE8E8',
  sky: '#DCEFFF',
  rarity: { common: '#9AA3B2', rare: '#3B82F6', epic: '#8B5CF6', legendary: '#F2B544' },
} as const;

export const radius = { sm: 10, md: 16, lg: 20, xl: 28, pill: 999 } as const;
export const space = (n: number) => n * 8;

const rounded = Platform.select({ ios: 'ui-rounded', default: undefined });

export const type = {
  hero: { fontFamily: rounded, fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  title: { fontFamily: rounded, fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  h2: { fontFamily: rounded, fontSize: 20, fontWeight: '800', color: colors.ink },
  body: { fontFamily: rounded, fontSize: 17, fontWeight: '500', color: colors.ink, lineHeight: 24 },
  bodyBold: { fontFamily: rounded, fontSize: 17, fontWeight: '700', color: colors.ink, lineHeight: 24 },
  small: { fontFamily: rounded, fontSize: 14, fontWeight: '600', color: colors.inkSoft },
  tiny: { fontFamily: rounded, fontSize: 12, fontWeight: '600', color: colors.inkMuted },
  number: { fontFamily: rounded, fontSize: 18, fontWeight: '800', color: colors.ink, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export const shadow = {
  shadowColor: '#1E2A3A',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

/** ₹ formatting in the Indian system (lakh / crore). */
export function formatINR(value: number): string {
  const v = Math.round(value);
  if (v < 0) return `−${formatINR(-v)}`;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(v >= 1e8 ? 0 : 2)} crore`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)} lakh`;
  return `₹${v.toLocaleString('en-IN')}`;
}

/** A change in rupees, always signed: +₹500 or −₹500. */
export const formatINRChange = (value: number) => `${Math.round(value) > 0 ? '+' : ''}${formatINR(value)}`;
