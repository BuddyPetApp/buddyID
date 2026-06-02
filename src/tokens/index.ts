export const colors = {
  primary: '#6B5EBF',
  primaryLight: '#8B7FD4',
  primaryDark: '#4F4491',
  accent: '#F5A623',
  canvas: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EEFF',
  surfaceAccent: 'rgba(107, 94, 191, 0.08)',
  text: '#1A1A2E',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: 'rgba(107, 94, 191, 0.08)',
  borderSoft: 'rgba(26, 26, 26, 0.06)',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const shadows = {
  card: {
    shadowColor: '#2E1F5E',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#2E1F5E',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
