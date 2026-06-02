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

const SERVICE_TYPES = [
  { id: 'passeios', label: 'Passeios', emoji: '🦮' },
  { id: 'treino', label: 'Treino', emoji: '🎓' },
  { id: 'creche', label: 'Creche', emoji: '🏠' },
  { id: 'hotel', label: 'Hotel', emoji: '🛏️' },
  { id: 'pet-sitting', label: 'Pet Sitting', emoji: '🐶' },
  { id: 'transporte', label: 'Transporte', emoji: '🚗' },
  { id: 'grooming', label: 'Grooming', emoji: '✂️' },
  { id: 'veterinario', label: 'Veterinário', emoji: '🩺' },
];

const BENEFITS = [
  'Acesso a clientes qualificados',
  'Perfis verificados',
  'Gestão de agenda integrada',
];

interface ProviderForm {
  name: string;
  email: string;
  phone: string;
  city: string;
  services: string[];
}

export default function Providers() {
  const [form, setForm] = useState<ProviderForm>({
    name: '', email: '', phone: '', city: '', services: [],
  });

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((s) => s !== id)
        : [...prev.services, id],
    }));
  }

  function update(key: keyof Omit<ProviderForm, 'services'>, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    Alert.alert('Obrigado!', 'Entraremos em contacto em breve.');
  }

  const isValid = form.name.trim().length > 1
    && form.email.includes('@')
    && form.city.trim().length > 1
    && form.services.length > 0;

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
            <Text style={s.heroTitle}>Torna-te um prestador Buddy</Text>
            <Text style={s.heroSubtitle}>
              Junta-te à rede de prestadores verificados e chega a tutores com BuddyID perto de ti.
            </Text>
          </View>

          <View style={s.benefitsCard}>
            {BENEFITS.map((benefit) => (
              <View key={benefit} style={s.benefitRow}>
                <View style={s.checkIcon}>
                  <Text style={s.checkIconText}>✓</Text>
                </View>
                <Text style={s.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <Text style={s.sectionTitle}>Candidatura</Text>

          <Text style={s.fieldLabel}>Nome / nome do negócio</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: João Silva ou PetWalker Lisboa"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(v) => update('name', v)}
            autoCapitalize="words"
          />

          <Text style={s.fieldLabel}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="email@exemplo.com"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={(v) => update('email', v.toLowerCase().trim())}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={s.fieldLabel}>Telemóvel</Text>
          <TextInput
            style={s.input}
            placeholder="+351 912 345 678"
            placeholderTextColor={colors.textMuted}
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
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

          <Text style={s.fieldLabel}>Que serviços ofereces?</Text>
          <View style={s.servicesGrid}>
            {SERVICE_TYPES.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                onPress={() => toggleService(svc.id)}
                style={[s.serviceChip, form.services.includes(svc.id) && s.serviceChipSelected]}
                activeOpacity={0.8}
              >
                <Text style={s.serviceEmoji}>{svc.emoji}</Text>
                <Text style={[s.serviceLabel, form.services.includes(svc.id) && s.serviceLabelSelected]}>
                  {svc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.bottomSpacer} />
        </ScrollView>

        <View style={s.footer}>
          <Button
            label="Enviar candidatura"
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
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing[6],
    marginBottom: spacing[6],
    ...shadows.elevated,
  },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: '#fff',
    marginBottom: spacing[3],
    lineHeight: 30,
  },
  heroSubtitle: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing[5],
    marginBottom: spacing[6],
    ...shadows.card,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    flexShrink: 0,
  },
  checkIconText: { color: '#fff', fontSize: fontSize.xs, fontFamily: font.bold },
  benefitText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.text,
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    gap: spacing[1],
  },
  serviceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAccent,
  },
  serviceEmoji: { fontSize: 16 },
  serviceLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  serviceLabelSelected: {
    color: colors.primary,
    fontFamily: font.semiBold,
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
