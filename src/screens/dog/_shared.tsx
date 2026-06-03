import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../tokens';

// ─── Tokens ────────────────

export const DOG_COLORS = {
  primary: colors.primary,
  primaryLight: 'rgba(107,94,191,0.08)',
  progressTrack: 'rgba(107,94,191,0.12)',
  progressFill: colors.primary,
  surfaceWarm: colors.canvas,
  surfaceMuted: colors.surfaceMuted,
  surfaceAccent: 'rgba(107, 94, 191, 0.08)',
  accentAmber: colors.accent,
  accentAmberSoft: 'rgba(245, 166, 35, 0.10)',
  text: colors.text,
  label: colors.textSecondary,
  muted: colors.textMuted,
  divider: colors.borderSoft,
  white: '#FFFFFF',
  black: '#1A1A2E',
  danger: colors.error,
  successBg: 'rgba(16, 185, 129, 0.1)',
  successText: colors.success,
} as const;

export const DOG_SHADOW: ViewStyle = {
  shadowColor: '#2E1F5E',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 12,
  elevation: 2,
};

export const DOG_RADIUS = {
  card: 16,
  input: 12,
  pill: 28,
} as const;

export const DOG_FONT = {
  heroTitle: { fontFamily: font.bold, fontSize: fontSize.xl, lineHeight: 34 },
  sectionTitle: { fontFamily: font.semiBold, fontSize: fontSize.lg, lineHeight: 24 },
  rowLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: DOG_COLORS.label,
    letterSpacing: 0.3,
  } as const,
  rowValue: { fontFamily: font.semiBold, fontSize: fontSize.base, color: DOG_COLORS.text } as const,
  body: { fontFamily: font.regular, fontSize: fontSize.base, color: DOG_COLORS.text, lineHeight: 20 },
  caption: { fontFamily: font.regular, fontSize: fontSize.xs, color: DOG_COLORS.muted, lineHeight: 18 },
} as const;

// ─── Ícones ────────────────

export function BackIcon({ color = DOG_COLORS.text, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m14 6-6 6 6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRight({ color = DOG_COLORS.label, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9 5 7 7-7 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CheckCircleFilled({ color = DOG_COLORS.primary, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z"
        fill={color}
      />
    </Svg>
  );
}

export function CheckCircleOutline({ color = DOG_COLORS.label, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        fill={color}
      />
    </Svg>
  );
}

export function PawSquare({ size = 40, color = DOG_COLORS.primary }: { size?: number; color?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: DOG_COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.5 7c-1.1 0-2 1-2 2.5S7.4 12 8.5 12s2-1.1 2-2.5S9.6 7 8.5 7Zm7 0c-1.1 0-2 1-2 2.5s.9 2.5 2 2.5 2-1.1 2-2.5S16.6 7 15.5 7ZM5 13.5c-.9 0-1.6.9-1.6 2s.7 2 1.6 2 1.6-.9 1.6-2-.7-2-1.6-2Zm14 0c-.9 0-1.6.9-1.6 2s.7 2 1.6 2 1.6-.9 1.6-2-.7-2-1.6-2ZM12 13c-2.5 0-4.5 2-4.5 4.5 0 1.4 1.1 2.5 2.5 2.5h4c1.4 0 2.5-1.1 2.5-2.5 0-2.5-2-4.5-4.5-4.5Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

// ─── Shell ────────────────

export function DogScreenShell({
  title,
  children,
  bottomBar,
  contentBackground = colors.canvas,
  onBack,
}: {
  title: string;
  children: ReactNode;
  bottomBar?: ReactNode;
  contentBackground?: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <SafeAreaView style={[shellStyles.safe, { backgroundColor: contentBackground }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={shellStyles.header}>
        <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} style={shellStyles.backBtn}>
          <Text style={shellStyles.backArrow}>←</Text>
        </Pressable>
        <Text style={shellStyles.headerTitle}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Bottom Bar */}
      {bottomBar ? <View style={shellStyles.bottomBar}>{bottomBar}</View> : null}
    </SafeAreaView>
  );
}

const shellStyles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: font.bold,
  },
  headerTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  bottomBar: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: '#fff',
  },
});

// ─── Confirmar CTA ────────────────

export function ConfirmButton({
  onPress,
  disabled = false,
  label,
}: {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        ctaStyles.button,
        disabled && ctaStyles.buttonDisabled,
        pressed && !disabled && ctaStyles.buttonPressed,
      ]}
    >
      <Text style={ctaStyles.label}>{label ?? t('tutor.dogEditShared.confirm')}</Text>
    </Pressable>
  );
}

const ctaStyles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: DOG_RADIUS.pill,
    backgroundColor: DOG_COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonPressed: { opacity: 0.85 },
  label: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: DOG_COLORS.white,
    letterSpacing: 0.3,
  },
});

// ─── Row (label topo / valor em baixo / chevron) ────────────────

export function RowButton({
  label,
  value,
  placeholder,
  onPress,
  isLast = false,
  rightIcon,
}: {
  label: string;
  value?: string | null;
  placeholder?: string;
  onPress: () => void;
  isLast?: boolean;
  rightIcon?: ReactNode;
}) {
  const { t } = useTranslation();
  const isEmpty = !value;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowStyles.row,
        !isLast && rowStyles.rowDivider,
        pressed && rowStyles.rowPressed,
      ]}
    >
      <View style={rowStyles.rowTexts}>
        <Text style={rowStyles.rowLabel}>{label}</Text>
        <Text
          style={[rowStyles.rowValue, isEmpty && rowStyles.rowValueEmpty]}
          numberOfLines={2}
        >
          {isEmpty ? (placeholder ?? t('tutor.dogEditShared.add')) : value}
        </Text>
      </View>
      {rightIcon ?? <ChevronRight />}
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DOG_COLORS.divider,
  },
  rowPressed: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  rowTexts: { flex: 1, gap: 4 },
  rowLabel: DOG_FONT.rowLabel,
  rowValue: DOG_FONT.rowValue,
  rowValueEmpty: {
    color: colors.accent,
    fontFamily: font.semiBold,
  },
});

// ─── Card (secção agrupada) ────────────────

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[cardStyles.card, DOG_SHADOW, style]}>{children}</View>;
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: DOG_COLORS.white,
    borderRadius: DOG_RADIUS.card,
    overflow: 'hidden',
  },
});

// ─── PickerSheet (modal bottom-sheet animado) ────────────────

export type PickerOption<T extends string | number | boolean> = {
  value: T;
  label: string;
  hint?: string;
};

export function PickerSheet<T extends string | number | boolean>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  searchable = false,
  search,
  onSearchChange,
}: {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  searchable?: boolean;
  search?: string;
  onSearchChange?: (text: string) => void;
}) {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 600,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  const filtered = useMemo(() => {
    if (!searchable || !search) return options;
    const q = search.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search, searchable]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={sheetStyles.backdrop} onPress={onClose}>
        <Animated.View
          style={[sheetStyles.sheet, { transform: [{ translateY }] }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={sheetStyles.grabber} />
          <Text style={sheetStyles.title}>{title}</Text>
          {searchable ? (
            <SearchInput value={search ?? ''} onChangeText={onSearchChange ?? (() => {})} />
          ) : null}
          <ScrollView
            style={sheetStyles.list}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.map((opt, idx) => {
              const selected = selectedValue === opt.value;
              return (
                <Pressable
                  key={String(opt.value) + idx}
                  onPress={() => onSelect(opt.value)}
                  style={({ pressed }) => [
                    sheetStyles.option,
                    idx !== filtered.length - 1 && sheetStyles.optionDivider,
                    pressed && sheetStyles.optionPressed,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[sheetStyles.optionLabel, selected && sheetStyles.optionSelected]}>
                      {opt.label}
                    </Text>
                    {opt.hint ? <Text style={sheetStyles.optionHint}>{opt.hint}</Text> : null}
                  </View>
                  {selected ? <CheckCircleFilled size={22} /> : null}
                </Pressable>
              );
            })}
            {filtered.length === 0 ? (
              <Text style={sheetStyles.empty}>{t('tutor.dogEditShared.noResults')}</Text>
            ) : null}
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function SearchInput({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  const { t } = useTranslation();
  return (
    <View style={sheetStyles.search}>
      <TextInput
        style={sheetStyles.searchInput}
        placeholder={t('tutor.dogEditShared.search')}
        placeholderTextColor={DOG_COLORS.label}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: DOG_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 0,
    maxHeight: '75%',
    minHeight: 260,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DOG_COLORS.divider,
    marginBottom: 12,
  },
  title: {
    fontFamily: font.semiBold,
    fontSize: fontSize.md,
    color: DOG_COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DOG_COLORS.divider,
  },
  optionPressed: { backgroundColor: 'rgba(0,0,0,0.03)' },
  optionLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
  optionSelected: {
    fontFamily: font.semiBold,
    color: DOG_COLORS.primary,
  },
  optionHint: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: DOG_COLORS.muted,
    marginTop: 2,
  },
  empty: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: DOG_COLORS.muted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  search: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    height: 44,
    borderRadius: DOG_RADIUS.input,
    backgroundColor: DOG_COLORS.surfaceWarm,
    paddingHorizontal: 14,
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
});

// ─── InputSheet (bottom-sheet com TextInput único) ────────────────

export function InputSheet({
  visible,
  title,
  initialValue,
  onConfirm,
  onClose,
  placeholder,
  keyboardType,
  autoCapitalize,
  maxLength,
  suffix,
  helper,
  multiline = false,
  autoFormat,
}: {
  visible: boolean;
  title: string;
  initialValue: string;
  onConfirm: (val: string) => void;
  onClose: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  suffix?: string;
  helper?: string;
  multiline?: boolean;
  autoFormat?: 'date';
}) {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(600)).current;
  const inputRef = useRef<TextInput | null>(null);
  const [internalValue, setInternalValue] = useState(initialValue);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 600,
      duration: 220,
      useNativeDriver: true,
    }).start();
    if (visible) {
      setInternalValue(initialValue);
      const id = setTimeout(() => inputRef.current?.focus(), 260);
      return () => clearTimeout(id);
    }
  }, [visible, translateY, initialValue]);

  const formatValue = (raw: string): string => {
    if (autoFormat !== 'date') return raw;
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={sheetStyles.backdrop} onPress={onClose}>
        <Animated.View
          style={[inputSheetStyles.sheet, { transform: [{ translateY }] }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={sheetStyles.grabber} />
          <Text style={sheetStyles.title}>{title}</Text>
          <View style={inputSheetStyles.fieldRow}>
            <TextInput
              ref={inputRef}
              style={[inputSheetStyles.input, multiline && inputSheetStyles.inputMultiline]}
              value={internalValue}
              onChangeText={(t) => setInternalValue(formatValue(t))}
              placeholder={placeholder}
              placeholderTextColor={DOG_COLORS.label}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              maxLength={maxLength}
              multiline={multiline}
              returnKeyType={multiline ? 'default' : 'done'}
              onSubmitEditing={multiline ? undefined : () => onConfirm(internalValue)}
            />
            {suffix ? <Text style={inputSheetStyles.suffix}>{suffix}</Text> : null}
          </View>
          {helper ? <Text style={inputSheetStyles.helper}>{helper}</Text> : null}
          <View style={inputSheetStyles.actions}>
            <Pressable
              onPress={() => onConfirm(internalValue)}
              style={({ pressed }) => [
                inputSheetStyles.confirm,
                pressed && inputSheetStyles.confirmPressed,
              ]}
            >
              <Text style={inputSheetStyles.confirmText}>{t('tutor.dogEditShared.save')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const inputSheetStyles = StyleSheet.create({
  sheet: {
    backgroundColor: DOG_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DOG_COLORS.divider,
    borderRadius: DOG_RADIUS.input,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 52,
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
  inputMultiline: {
    minHeight: 96,
    maxHeight: 140,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  suffix: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.muted,
    marginLeft: 8,
  },
  helper: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: DOG_COLORS.muted,
    marginHorizontal: 20,
    marginBottom: 8,
    lineHeight: 16,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  confirm: {
    height: 52,
    borderRadius: DOG_RADIUS.pill,
    backgroundColor: DOG_COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPressed: { opacity: 0.85 },
  confirmText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: DOG_COLORS.white,
  },
});

// ─── ChipsMultiSelect ────────────────

export function ChipsMultiSelect({
  options,
  selected,
  onToggle,
  variant = 'primary',
}: {
  options: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  variant?: 'primary' | 'amber';
}) {
  return (
    <View style={chipStyles.wrap}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            style={({ pressed }) => [
              chipStyles.chip,
              isSelected && (variant === 'primary' ? chipStyles.chipSelectedPrimary : chipStyles.chipSelectedAmber),
              pressed && chipStyles.chipPressed,
            ]}
          >
            <Text
              style={[
                chipStyles.chipLabel,
                isSelected &&
                  (variant === 'primary' ? chipStyles.chipLabelSelectedPrimary : chipStyles.chipLabelSelectedAmber),
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: DOG_RADIUS.pill,
    borderWidth: 1,
    borderColor: DOG_COLORS.divider,
    backgroundColor: DOG_COLORS.white,
  },
  chipPressed: { opacity: 0.75 },
  chipSelectedPrimary: {
    backgroundColor: DOG_COLORS.primaryLight,
    borderColor: DOG_COLORS.primary,
  },
  chipSelectedAmber: {
    backgroundColor: DOG_COLORS.accentAmberSoft,
    borderColor: DOG_COLORS.accentAmber,
  },
  chipLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
  chipLabelSelectedPrimary: {
    color: DOG_COLORS.primary,
    fontFamily: font.semiBold,
  },
  chipLabelSelectedAmber: {
    color: DOG_COLORS.accentAmber,
    fontFamily: font.semiBold,
  },
});

// ─── ScaleSelector (1–5 com emojis) ────────────────

const SCALE_EMOJIS = ['😰', '😟', '😐', '🙂', '😍'];

export function ScaleSelector({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={scaleStyles.wrap}>
      {SCALE_EMOJIS.map((emoji, idx) => {
        const n = idx + 1;
        const selected = value === n;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={({ pressed }) => [
              scaleStyles.pill,
              selected && scaleStyles.pillSelected,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Nível ${n} de 5`}
            accessibilityState={{ selected }}
          >
            <Text style={scaleStyles.emoji}>{emoji}</Text>
            <Text style={[scaleStyles.number, selected && scaleStyles.numberSelected]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const scaleStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    minHeight: 64,
    borderRadius: DOG_RADIUS.input,
    borderWidth: 1.5,
    borderColor: DOG_COLORS.divider,
    backgroundColor: DOG_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  pillSelected: {
    borderColor: DOG_COLORS.primary,
    backgroundColor: DOG_COLORS.primaryLight,
  },
  emoji: { fontSize: 20, lineHeight: 24 },
  number: {
    fontFamily: font.semiBold,
    fontSize: fontSize.xs,
    color: DOG_COLORS.label,
  },
  numberSelected: { color: DOG_COLORS.primary },
});

// ─── Secção com título ────────────────

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.title}>{title}</Text>
      {description ? <Text style={sectionStyles.desc}>{description}</Text> : null}
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 24 },
  title: DOG_FONT.sectionTitle,
  desc: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: DOG_COLORS.muted,
    lineHeight: 18,
    marginTop: 4,
  },
});
