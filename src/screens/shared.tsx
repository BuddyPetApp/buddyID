import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, font, fontSize, spacing } from '../tokens';
import { CheckIcon } from '../components/Icons';

export function ChoiceButton({ label, selected, onPress, style }: {
  label: string; selected: boolean; onPress: () => void; style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={[s.choiceBtn, selected && s.choiceBtnSelected, style]}>
      <Text style={[s.choiceBtnText, selected && s.choiceBtnTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceRow({ options, selected, onSelect, columns = 3 }: {
  options: string[]; selected: string | undefined;
  onSelect: (v: string) => void; columns?: 2 | 3;
}) {
  return (
    <View style={s.choiceRow}>
      {options.map((opt) => (
        <ChoiceButton
          key={opt} label={opt} selected={selected === opt} onPress={() => onSelect(opt)}
          style={columns === 2 ? { width: '48%' } : { flex: 1 }}
        />
      ))}
    </View>
  );
}

export function MultiChoiceList({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <View>
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <Pressable key={opt} onPress={() => onToggle(opt)} style={[s.multiRow, on && s.multiRowOn]}>
            <View style={[s.checkbox, on && s.checkboxOn]}>
              {on && <CheckIcon size={13} color="#fff" strokeWidth={2.5} />}
            </View>
            <Text style={[s.multiRowText, on && s.multiRowTextOn]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[s.divider, style]} />;
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

export function SectionHint({ children }: { children: string }) {
  return <Text style={s.sectionHint}>{children}</Text>;
}

const s = StyleSheet.create({
  choiceBtn: {
    borderWidth: 1.5, borderColor: colors.borderSoft, borderRadius: 12,
    paddingVertical: spacing[3], paddingHorizontal: spacing[3],
    alignItems: 'center', backgroundColor: colors.surface, margin: spacing[1],
  },
  choiceBtnSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceAccent },
  choiceBtnText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  choiceBtnTextSelected: { color: colors.primary, fontFamily: font.semiBold },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing[1] },
  multiRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.borderSoft, borderRadius: 12,
    paddingHorizontal: spacing[4], paddingVertical: spacing[4], marginBottom: spacing[2],
  },
  multiRowOn: { borderColor: colors.primary, backgroundColor: colors.surfaceAccent },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#D1D5DB', marginRight: spacing[3],
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  multiRowText: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.textSecondary, flex: 1 },
  multiRowTextOn: { color: colors.primary, fontFamily: font.semiBold },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing[5] },
  sectionLabel: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing[1] },
  sectionHint: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing[2] },
});
