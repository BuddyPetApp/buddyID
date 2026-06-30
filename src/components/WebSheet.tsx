import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { colors } from '../tokens';

export const DESKTOP_BREAKPOINT = 900;
// Single, consistent content width across all screens on desktop
export const CONTENT_MAX_WIDTH = 800;

/**
 * Wraps a screen so that on desktop/web its content is centered at a fixed max
 * width instead of stretching full-width. No card chrome — just a centered
 * column on a seamless background, so every screen keeps the same margin.
 * No-op on mobile/native.
 *
 * Usage: wrap the screen's existing root (e.g. its SafeAreaView) in <WebSheet>.
 */
export function WebSheet({
  children,
  maxWidth = CONTENT_MAX_WIDTH,
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
      <View style={[styles.content, { maxWidth }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
