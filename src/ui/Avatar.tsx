/** The player's round profile picture (or their initial), with an optional edit badge. */
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { avatarSource, useAvatar } from '../profile/avatar';
import { useGame } from '../state/game';
import { colors } from './theme';

export function Avatar({ size = 64, editBadge = false }: { size?: number; editBadge?: boolean }) {
  const avatar = useAvatar((s) => s.avatar);
  const name = useGame((s) => s.profile.name);
  const src = avatarSource(avatar);
  const [failed, setFailed] = useState<unknown>(null);
  const show = src && failed !== src;
  const isPhoto = avatar?.kind === 'photo';
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: show && !isPhoto ? colors.kipLight : colors.kip, borderWidth: Math.max(2, size / 22), borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        {show ? (
          <Image source={src} style={{ width: isPhoto ? '100%' : '92%', height: isPhoto ? '100%' : '92%' }} contentFit={isPhoto ? 'cover' : 'contain'} onError={() => setFailed(src)} accessible={false} />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: size * 0.42 }}>{(name || 'K').charAt(0).toUpperCase()}</Text>
        )}
      </View>
      {editBadge ? (
        <View style={{ position: 'absolute', right: -2, bottom: -2, width: size * 0.36, height: size * 0.36, borderRadius: size, backgroundColor: colors.ink, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.16 }}>✏️</Text>
        </View>
      ) : null}
    </View>
  );
}
