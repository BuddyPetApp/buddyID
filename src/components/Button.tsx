import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { colors, font, fontSize, spacing } from '../tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        s.base,
        size === 'lg' && s.lg,
        variant === 'primary' && s.primary,
        variant === 'outline' && s.outline,
        variant === 'ghost' && s.ghost,
        isDisabled && s.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
        : <Text style={[s.label, variant === 'primary' && s.labelPrimary, variant === 'outline' && s.labelOutline]}>
            {label}
          </Text>
      }
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { paddingVertical: spacing[4] + 2 },
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
  label: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  labelPrimary: { color: '#fff' },
  labelOutline: { color: colors.primary },
});
