/** Profile picture: pick one of the game's characters, or a photo (kept on this phone only). */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AVATAR_PRESETS, photoPickerAvailable, pickPhoto, useAvatar } from '@/profile/avatar';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function AvatarScreen() {
  const insets = useSafeAreaInsets();
  const avatar = useAvatar((s) => s.avatar);
  const setAvatar = useAvatar((s) => s.setAvatar);
  const [busy, setBusy] = useState(false);

  const choosePhoto = async () => {
    if (!photoPickerAvailable) {
      Alert.alert('Update the app', 'Photos need the latest version of Kip. Until then, pick one of the characters below.');
      return;
    }
    setBusy(true);
    try {
      const picked = await pickPhoto();
      if (picked) setAvatar(picked);
    } catch (e) {
      Alert.alert('Couldn’t use that photo', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ padding: space(2.5), paddingBottom: insets.bottom + space(4), gap: space(2) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={type.title}>Profile picture</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: colors.ink }}>✕</Text>
        </Pressable>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Avatar size={128} />
      </View>
      <Button testID="avatar-photo" title={busy ? 'Opening photos…' : '📷 Choose a photo'} disabled={busy} onPress={choosePhoto} />
      <Text style={[type.tiny, { textAlign: 'center' }]}>Your photo stays on this phone. It isn’t uploaded or shown to other players.</Text>

      <Text style={type.h2}>Or pick a character</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5), justifyContent: 'space-between' }}>
        {AVATAR_PRESETS.map((p) => {
          const on = avatar?.kind === 'preset' && avatar.id === p.id;
          return (
            <Pressable key={p.id} testID={`avatar-${p.id}`} onPress={() => setAvatar({ kind: 'preset', id: p.id })} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={p.label} style={{ width: '30%', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.kipLight, borderWidth: on ? 4 : 2, borderColor: on ? colors.kip : colors.line, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={p.src} style={{ width: '92%', height: '92%' }} contentFit="contain" accessible={false} />
              </View>
              <Text style={[type.tiny, { fontWeight: on ? '800' : '600', color: on ? colors.kipDark : colors.inkSoft }]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {avatar ? <Button title="Use my initial instead" variant="ghost" onPress={() => setAvatar(null)} /> : null}
    </ScrollView>
  );
}
