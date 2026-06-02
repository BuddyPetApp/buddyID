import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';

const PILLARS = [
  { icon: '🏥', title: 'Apoio veterinário', desc: 'Comparticipamos tratamentos para animais em associações parceiras.' },
  { icon: '🍖', title: 'Alimentação garantida', desc: 'Distribuição de rações para canis com dificuldades.' },
  { icon: '💉', title: 'Esterilização & saúde', desc: 'Apoio a campanhas de esterilização e saúde preventiva.' },
  { icon: '🏠', title: 'Educação & adoção', desc: 'Promovemos animais das associações parceiras a tutores verificados.' },
];

const IMPACT_STATS = [
  { value: '150+', label: 'associações parceiras' },
  { value: '2.400+', label: 'animais apoiados' },
  { value: '€180k', label: 'distribuídos' },
];

interface AssocForm {
  name: string;
  assocName: string;
  nif: string;
  email: string;
  city: string;
}

export default function Associations() {
  const [form, setForm] = useState<AssocForm>({
    name: '', assocName: '', nif: '', email: '', city: '',
  });

  function update(key: keyof AssocForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    Alert.alert('Obrigado!', 'A tua candidatura foi recebida.');
  }

  const isValid = form.name.trim().length > 1
    && form.assocName.trim().length > 1
    && form.email.includes('@');

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Logo variant="dark" size="sm" />
          <View style={s.headerSpacer} />
        </View>

        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.heroCard}>
            <View style={s.heroDecor} />
            <Text style={s.fundLabel}>BUDDY FUND</Text>
            <Text style={s.heroTitle}>Juntos pelo bem-estar animal</Text>
            <Text style={s.heroSubtitle}>
              O Buddy Fund apoia associações e canis parceiros com recursos, visibilidade e comunidade.
            </Text>
          </View>

          <View style={s.pillarsGrid}>
            {PILLARS.map((pillar) => (
              <View key={pillar.title} style={s.pillarCard}>
                <Text style={s.pillarIcon}>{pillar.icon}</Text>
                <Text style={s.pillarTitle}>{pillar.title}</Text>
                <Text style={s.pillarDesc}>{pillar.desc}</Text>
              </View>
            ))}
          </View>

          <View style={s.impactRow}>
            {IMPACT_STATS.map((stat, i) => (
              <View key={stat.value} style={[s.impactItem, i < IMPACT_STATS.length - 1 && s.impactItemBorder]}>
                <Text style={s.impactValue}>{stat.value}</Text>
                <Text style={s.impactLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <Text style={s.sectionTitle}>Candidatura ao Buddy Fund</Text>

          <Text style={s.fieldLabel}>Nome do responsável</Text>
          <TextInput
            style={s.input}
            placeholder="Nome completo"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(v) => update('name', v)}
            autoCapitalize="words"
          />

          <Text style={s.fieldLabel}>Nome da associação</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Associação SOS Animal Lisboa"
            placeholderTextColor={colors.textMuted}
            value={form.assocName}
            onChangeText={(v) => update('assocName', v)}
            autoCapitalize="words"
          />

          <Text style={s.fieldLabel}>NIF</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: 501234567"
            placeholderTextColor={colors.textMuted}
            value={form.nif}
            onChangeText={(v) => update('nif', v)}
            keyboardType="number-pad"
          />

          <Text style={s.fieldLabel}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="email@associacao.pt"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={(v) => update('email', v.toLowerCase().trim())}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={s.fieldLabel}>Cidade</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: Lisboa, Porto..."
            placeholderTextColor={colors.textMuted}
            value={form.city}
            onChangeText={(v) => update('city', v)}
            autoCapitalize="words"
          />

          <View style={s.bottomSpacer} />
        </ScrollView>

        <View style={s.footer}>
          <Button
            label="Submeter candidatura"
            onPress={handleSubmit}
            disabled={!isValid}
            variant="primary"
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    height: 68,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.primary, fontFamily: font.regular },
  headerSpacer: { width: 44 },
  scroll: { paddingHorizontal: spacing[5], paddingTop: spacing[5] },
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: spacing[6],
    marginBottom: spacing[6],
    overflow: 'hidden',
    ...shadows.elevated,
  },
  heroDecor: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  fundLabel: {
    fontFamily: font.bold,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: spacing[2],
  },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: '#fff',
    lineHeight: 30,
    marginBottom: spacing[3],
  },
  heroSubtitle: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  pillarCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  pillarIcon: { fontSize: 28, marginBottom: spacing[2] },
  pillarTitle: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing[1],
  },
  pillarDesc: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  impactRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  impactItem: { flex: 1, alignItems: 'center' },
  impactItemBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  impactValue: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing[1],
  },
  impactLabel: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing[4],
  },
  fieldLabel: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: spacing[4],
  },
  bottomSpacer: { height: spacing[8] },
  footer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
