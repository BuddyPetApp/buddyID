import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, radius, spacing } from '../tokens';
import { Logo } from './Logo';
import { DESKTOP_BREAKPOINT } from './WebSheet';

/**
 * Desktop-only split-screen frame: a purple brand panel on the left and the
 * screen's content shown as a centered card on the right. Mirrors the desktop
 * layout of the onboarding flow so the result/transition screens match it.
 * No-op on mobile/native — renders children unchanged.
 */
export function DesktopSplit({
  children,
  cardMaxWidth = 480,
}: {
  children: ReactNode;
  cardMaxWidth?: number;
}) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  if (!isDesktop) return <>{children}</>;

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <Logo variant="light" size="lg" />
      </View>
      <View style={styles.right}>
        <View style={[styles.card, { maxWidth: cardMaxWidth }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.canvas },
  left: {
    width: '42%',
    maxWidth: 560,
    backgroundColor: colors.primaryDeep,
    padding: spacing[10],
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  card: {
    width: '100%',
    height: '90%',
    maxHeight: 780,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
});
