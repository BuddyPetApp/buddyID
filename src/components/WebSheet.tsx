import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../tokens';

export const DESKTOP_BREAKPOINT = 900;

/**
 * Wraps a screen so that on desktop/web it renders as a centered "sheet"
 * (white card with rounded corners + shadow) floating on a soft page
 * background, instead of stretching full-width. No-op on mobile/native.
 *
 * Usage: wrap the screen's existing root (e.g. its SafeAreaView) in <WebSheet>.
 */
export function WebSheet({
  children,
  maxWidth = 600,
  style,
}: {
  children: ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
}) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  if (!isDesktop) return <>{children}</>;

  return (
    <View style={styles.page}>
      <View style={[styles.sheet, { maxWidth }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surfaceAccent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  sheet: {
    width: '100%',
    height: '100%',
    maxHeight: 900,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.elevated,
  },
});
