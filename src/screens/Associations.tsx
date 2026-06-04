import { useState } from 'react';
import {
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
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { SectionLabel } from './shared';

interface AssocForm {
  name: string;
  assocName: string;
  nif: string;
  email: string;
  city: string;
}

const INITIAL: AssocForm = {
  name: '',
  assocName: '',
  nif: '',
  email: '',
  city: '',
};

type Step = 1 | 2 | 3 | 4 | 5 | 'success';

export default function Associations() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<AssocForm>(INITIAL);

  function update<K extends keyof AssocForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goBack() {
    if (step === 'success') {
      router.replace('/buddyid' as any);
      return;
    }
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => (prev as number) - 1 as Step);
  }

  function goNext() {
    if (step === 5) {
      handleSubmit();
      return;
    }
    setStep((prev) => (prev as number) + 1 as Step);
  }

  function handleSubmit() {
    // In production, we'd post to API. Since this is an MVP front, we move to success state.
    setStep('success');
  }

  function isDisabled(): boolean {
    switch (step) {
      case 1:
        return form.name.trim().length < 2;
      case 2:
        return form.assocName.trim().length < 2;
      case 3:
        return form.nif.trim().length !== 9 || isNaN(Number(form.nif));
      case 4:
        return form.city.trim().length < 2;
      case 5:
        return !form.email.includes('@') || form.email.trim().length < 5;
      default:
        return false;
    }
  }

  const currentStep = step === 'success' ? 5 : step;
  const progress = currentStep / 5;
  const showProgress = step !== 'success';
  const showFooterBtn = step !== 'success';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12} style={s.backBtn}>
          <Text style={s.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        {step !== 'success' ? (
          <Text style={s.counter}>{step} de 5</Text>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Progress bar */}
      {showProgress && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={s.questionWrap}>
              <Text style={s.questionTitle}>Qual é o teu nome?</Text>
              <Text style={s.questionSub}>
                Como responsável pela candidatura, queremos saber quem és.
              </Text>
              <SectionLabel>Nome do responsável</SectionLabel>
              <TextInput
                style={s.input}
                value={form.name}
                onChangeText={(v) => update('name', v)}
                placeholder="Ex: Ana Ferreira"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          )}

          {step === 2 && (
            <View style={s.questionWrap}>
              <Text style={s.questionTitle}>Qual é o nome da associação?</Text>
              <Text style={s.questionSub}>
                O nome oficial pelo qual a associação é conhecida.
              </Text>
              <SectionLabel>Nome da associação</SectionLabel>
              <TextInput
                style={s.input}
                value={form.assocName}
                onChangeText={(v) => update('assocName', v)}
                placeholder="Ex: Associação SOS Animal"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          )}

          {step === 3 && (
            <View style={s.questionWrap}>
              <Text style={s.questionTitle}>Qual é o NIF da associação?</Text>
              <Text style={s.questionSub}>
                O Número de Identificação Fiscal de pessoa coletiva da associação (9 dígitos).
              </Text>
              <SectionLabel>NIF</SectionLabel>
              <TextInput
                style={s.input}
                value={form.nif}
                onChangeText={(v) => update('nif', v)}
                placeholder="Ex: 501234567"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          )}

          {step === 4 && (
            <View style={s.questionWrap}>
              <Text style={s.questionTitle}>Onde fica sediada a associação?</Text>
              <Text style={s.questionSub}>
                A cidade ou distrito onde a vossa sede se localiza.
              </Text>
              <SectionLabel>Cidade / Distrito</SectionLabel>
              <TextInput
                style={s.input}
                value={form.city}
                onChangeText={(v) => update('city', v)}
                placeholder="Ex: Lisboa, Porto, Braga..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          )}

          {step === 5 && (
            <View style={s.questionWrap}>
              <Text style={s.questionTitle}>Qual é o email de contacto?</Text>
              <Text style={s.questionSub}>
                Para onde devemos enviar as novidades e validação da candidatura.
              </Text>
              <SectionLabel>Email de contacto</SectionLabel>
              <TextInput
                style={s.input}
                value={form.email}
                onChangeText={(v) => update('email', v.toLowerCase().trim())}
                placeholder="email@associacao.pt"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {step === 'success' && (
            <View style={s.successCard}>
              <View style={s.successGlow} />
              <View style={s.successIconWrap}>
                <Text style={s.successIcon}>🎉</Text>
              </View>
              <Text style={s.successTitle}>Candidatura enviada!</Text>
              <Text style={s.successSub}>
                Obrigado pelo teu interesse em fazer parte do Buddy Fund. Analisamos todas as candidaturas manualmente e entraremos em contacto muito em breve.
              </Text>
              <TouchableOpacity
                style={s.successBtn}
                onPress={() => router.replace('/buddyid' as any)}
                activeOpacity={0.88}
              >
                <Text style={s.successBtnText}>Voltar ao início</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {showFooterBtn && (
          <View style={s.footer}>
            <TouchableOpacity
              style={[s.continueBtn, isDisabled() && s.continueBtnDisabled]}
              onPress={goNext}
              disabled={isDisabled()}
            >
              <Text style={s.continueBtnText}>
                {step === 5 ? 'Submeter candidatura' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 60, alignItems: 'flex-start', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.primary, fontFamily: font.regular },
  counter: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 60,
    textAlign: 'right',
  },

  progressTrack: { height: 3, backgroundColor: colors.borderSoft },
  progressFill: { height: 3, backgroundColor: colors.primary },

  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },
  questionWrap: {},
  questionTitle: {
    fontFamily: font.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing[2],
    lineHeight: 32,
  },
  questionSub: {
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing[5],
    lineHeight: 22,
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
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },

  // ── Footer button ──
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnText: { fontFamily: font.semiBold, fontSize: 15, color: '#fff' },

  // ── Success Card ──
  successCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginTop: spacing[4],
    overflow: 'hidden',
  },
  successGlow: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successIcon: { fontSize: 36 },
  successTitle: {
    fontFamily: font.bold,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  successSub: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  successBtnText: {
    fontFamily: font.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
});
