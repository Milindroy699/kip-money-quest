/** Speech bubble with a typewriter reveal. Tap to finish the line instantly. */
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, radius, shadow, type } from '../ui/theme';

export function SpeechBubble({ text, speaker, onTyped }: { text: string; speaker?: string; onTyped?: () => void }) {
  const [typed, setTyped] = useState({ text, shown: 0 });
  // Restart the typewriter when the line changes (state adjusted during render, not in an effect).
  if (typed.text !== text) setTyped({ text, shown: 0 });
  const shown = typed.text === text ? typed.shown : 0;
  const done = shown >= text.length;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setTyped((t) => ({ ...t, shown: Math.min(t.shown + 2, t.text.length) })), 18);
    return () => clearInterval(id);
  }, [done, text]);

  useEffect(() => {
    if (done) onTyped?.();
  }, [done, onTyped]);

  return (
    <Pressable onPress={() => setTyped({ text, shown: text.length })} accessibilityRole="text" accessibilityLabel={`${speaker ?? ''} says: ${text}`}>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, borderWidth: 2, borderColor: colors.line, ...shadow }}>
        {speaker ? <Text style={[type.tiny, { marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }]}>{speaker}</Text> : null}
        <Text style={[type.body, { fontSize: 19, lineHeight: 27 }]}>
          {text.slice(0, shown)}
          <Text style={{ color: 'transparent' }}>{text.slice(shown)}</Text>
        </Text>
      </View>
      <View style={{ position: 'absolute', bottom: -10, left: 40, width: 20, height: 20, backgroundColor: colors.surface, transform: [{ rotate: '45deg' }], borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.line }} />
    </Pressable>
  );
}
