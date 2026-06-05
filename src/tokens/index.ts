export const colors = {
  // Purple scale
  primary:       '#7C6FCD',
  primaryDark:   '#4B3FA0',
  primaryDeep:   '#2E1F5E',
  primaryLight:  '#A89BE0',
  primaryLilac:  '#C4B8F0',
  primarySurface:'#F0EBFF',
  primaryTint:   'rgba(124,111,205,0.10)',
  primaryBorder: 'rgba(124,111,205,0.20)',

  // Neutrals
  canvas:        '#FAFAFA',
  surface:       '#FFFFFF',
  surfaceMuted:  '#F6F4FF',
  surfaceAccent: '#EDE9FF',

  // Text
  text:          '#1A1228',
  textSecondary: '#5B5380',
  textMuted:     '#9B95B8',

  // Borders
  border:        'rgba(124,111,205,0.12)',
  borderSoft:    'rgba(26,18,40,0.06)',

  // Semantic
  success:       '#10B981',
  error:         '#EF4444',
  warning:       '#F59E0B',
  accent:        '#7C6FCD',

  // Card fills
  cardPurple:    '#7C6FCD',
  cardLilac:     '#A89BE0',
  cardDeep:      '#4B3FA0',
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
  14: 56,
  16: 64,
} as const;

export const font = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  32,
  hero: 40,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#2E1F5E',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#2E1F5E',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  purple: {
    shadowColor: '#7C6FCD',
    shadowOpacity: 0.30,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
