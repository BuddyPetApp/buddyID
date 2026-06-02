import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, font, fontSize } from '../tokens';

interface Props {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const sizes = { sm: 18, md: 22, lg: 28 } as const;
const paw = { sm: 18, md: 22, lg: 28 } as const;

export function Logo({ variant = 'dark', size = 'md', style }: Props) {
  const color = variant === 'light' ? '#fff' : colors.primary;
  const fs = sizes[size];
  const pawSize = paw[size];
  return (
    <View style={[s.row, style]}>
      <Text style={[s.paw, { fontSize: pawSize, color }]}>🐾</Text>
      <Text style={[s.text, { fontSize: fs, color }]}>buddy</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paw: {},
  text: { fontFamily: font.bold },
});
