import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { colors, font, fontSize, shadows, spacing, radius } from '../tokens';
import { WebSheet } from '../components/WebSheet';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import {
  ChevronLeftIcon,
  CheckIcon,
  WalkIcon,
  AwardIcon,
  HomeHeartIcon,
  HomeIcon,
  PawIcon,
  TruckIcon,
  ScissorsIcon,
  ShieldCheckIcon,
} from '../components/Icons';

const SERVICE_TYPES: { id: string; label: string; Icon: React.FC<{ color: string }> }[] = [
  { id: 'passeios',    label: 'Passeios',    Icon: ({ color }) => <WalkIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'treino',      label: 'Treino',      Icon: ({ color }) => <AwardIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'creche',      label: 'Creche',      Icon: ({ color }) => <HomeHeartIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'hotel',       label: 'Hotel',       Icon: ({ color }) => <HomeIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'pet-sitting', label: 'Pet Sitting', Icon: ({ color }) => <PawIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'transporte',  label: 'Transporte',  Icon: ({ color }) => <TruckIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'grooming',    label: 'Grooming',    Icon: ({ color }) => <ScissorsIcon size={16} color={color} strokeWidth={2} /> },
  { id: 'veterinário', label: 'Veterinário', Icon: ({ color }) => <ShieldCheckIcon size={16} color={color} strokeWidth={2} /> },
];

const BENEFITS = [
  { title: 'Clientes com perfil completo', sub: 'Acedes ao BuddyID do animal antes de cada serviço.' },
  { title: '0% de comissão no arranque', sub: 'Nos primeiros 6 meses para quem entrar no pré-lançamento.' },
  { title: 'Agenda e pagamentos integrados', sub: 'Tudo numa só plataforma, sem apps extra.' },
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
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    Alert.alert('Candidatura enviada', 'Entraremos em contacto em breve para conhecer o teu trabalho.');
  }

  const isValid =
    form.name.trim().length > 1 &&
    form.email.includes('@') &&
    form.city.trim().length > 1 &&
    form.services.length > 0;

  return (
    <WebSheet>
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
            <ChevronLeftIcon size={24} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
          <Logo variant="dark" size="sm" />
          <View style={s.headerSpacer} />
        </View>

        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {/* Hero */}
          <View style={s.hero}>
            <View style={s.heroGlow} />
            <View style={s.heroBadge}>
              <Text style={s.heroBadgeText}>Para prestadores</Text>
            </View>
            <Text style={s.heroTitle}>
              Os primeiros clientes{'\n'}já têm BuddyID
            </Text>
            <Text style={s.heroSub}>
              Chega a tutores verificados em Lisboa antes do lançamento. Zero fricção, clientes qualificados.
            </Text>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>0%</Text>
              <Text style={s.heroStatLabel}>comissão nos primeiros 6 meses</Text>
            </View>
          </View>

          {/* Benefits */}
          <View style={s.benefitsCard}>
            <Text style={s.benefitsTitle}>O que ganhas</Text>
            {BENEFITS.map((b) => (
              <View key={b.title} style={s.benefitRow}>
                <View style={s.checkCircle}>
                  <CheckIcon size={13} color="#fff" strokeWidth={2.5} />
                </View>
                <View style={s.benefitText}>
                  <Text style={s.benefitTitle}>{b.title}</Text>
                  <Text style={s.benefitSub}>{b.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Form */}
          <Text style={s.sectionTitle}>Candidatura rápida</Text>
          <Text style={s.sectionSub}>Preenche em menos de 2 minutos. Entramos em contacto antes do lançamento.</Text>

          <Text style={s.fieldLabel}>Nome ou nome do negócio</Text>
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
            {SERVICE_TYPES.map((svc) => {
              const active = form.services.includes(svc.id);
              return (
                <TouchableOpacity
                  key={svc.id}
                  onPress={() => toggleService(svc.id)}
                  style={[s.serviceChip, active && s.serviceChipSelected]}
                  activeOpacity={0.8}
                >
                  <svc.Icon color={active ? colors.primary : colors.textMuted} />
                  <Text style={[s.serviceLabel, active && s.serviceLabelSelected]}>
                    {svc.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    </WebSheet>
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
  headerSpacer: { width: 44 },

  scroll: { paddingBottom: spacing[10] },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing[5],
    marginTop: spacing[5],
    marginBottom: spacing[5],
    borderRadius: 24,
    padding: spacing[6],
    overflow: 'hidden',
    ...shadows.purple,
  },
  heroGlow: {
    position: 'absolute', right: -40, top: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: spacing[4],
  },
  heroBadgeText: { fontFamily: font.semiBold, fontSize: fontSize.xs, color: '#fff' },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: '#fff',
    lineHeight: 30,
    marginBottom: spacing[3],
  },
  heroSub: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 21,
    marginBottom: spacing[5],
  },
  heroStat: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    alignSelf: 'flex-start',
  },
  heroStatNum: { fontFamily: font.bold, fontSize: 28, color: '#fff' },
  heroStatLabel: { fontFamily: font.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.85)', flexShrink: 1 },

  // Benefits
  benefitsCard: {
    marginHorizontal: spacing[5],
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[6],
    ...shadows.card,
  },
  benefitsTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing[4],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  benefitText: { flex: 1 },
  benefitTitle: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  benefitSub: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 17 },

  // Form
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.text,
    marginHorizontal: spacing[5],
    marginBottom: spacing[1],
  },
  sectionSub: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
    lineHeight: 20,
  },
  fieldLabel: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginHorizontal: spacing[5],
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
    marginHorizontal: spacing[5],
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[5],
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
    gap: spacing[2],
  },
  serviceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAccent,
  },
  serviceLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  serviceLabelSelected: {
    color: colors.primary,
    fontFamily: font.semiBold,
  },

  bottomSpacer: { height: spacing[4] },
  footer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
