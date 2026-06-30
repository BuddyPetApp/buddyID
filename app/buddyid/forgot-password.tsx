import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, font, fontSize, radius, shadows, spacing } from '../../src/tokens';
import { WebSheet } from '../../src/components/WebSheet';
import { Logo } from '../../src/components/Logo';
import { ChevronLeftIcon, MailIcon } from '../../src/components/Icons';

export default function ForgotPassword() {
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === 'string' ? params.email : '';
  
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  const disabled = !email.includes('@');

  async function handleSubmit() {
    if (disabled) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      
      router.navigate({
        pathname: '/buddyid/verify-otp',
        params: { email: email.trim(), type: 'recovery' }
      } as any);
    } catch (err: any) {
      if (Platform.OS === 'web') window.alert('Erro: ' + (err.message || 'Ocorreu um erro.'));
      else Alert.alert('Erro', err.message || 'Ocorreu um erro ao enviar email.');
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/buddyid/auth' as any);
  }

  return (
    <WebSheet>
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} style={s.backBtn} hitSlop={12}>
          <ChevronLeftIcon size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={s.card}>
            <Text style={s.title}>Esqueci-me da palavra-passe</Text>
            <Text style={s.sub}>
              Introduz o teu email abaixo e enviaremos um código para redefinir a tua palavra-passe.
            </Text>

            <View style={s.form}>
              <View style={s.inputWrap}>
                <MailIcon size={18} color={colors.textMuted} strokeWidth={1.75} />
                <TextInput
                  style={s.input} placeholder="Email" placeholderTextColor={colors.textMuted}
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.cta, (disabled || loading) && s.ctaDisabled]}
            onPress={handleSubmit} disabled={disabled || loading}
          >
            <Text style={s.ctaText}>{loading ? 'A enviar...' : 'Recuperar palavra-passe'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </WebSheet>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.canvas },
  flex:        { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, paddingHorizontal: spacing[5], height: 64, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn:     { width: 32, alignItems: 'flex-start' },
  scrollContent: { padding: spacing[5], paddingBottom: spacing[10] },

  card:        { backgroundColor: colors.surface, borderRadius: radius.xxl, padding: spacing[6], ...shadows.card },
  title:       { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing[2] },
  sub:         { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing[5], lineHeight: 20 },

  form:        { gap: spacing[3] },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing[4], height: 52, gap: spacing[3] },
  input:       { flex: 1, fontFamily: font.regular, fontSize: fontSize.base, color: colors.text },

  footer:      { padding: spacing[5], backgroundColor: colors.canvas },
  cta:         { backgroundColor: colors.primary, borderRadius: radius.lg, height: 52, alignItems: 'center', justifyContent: 'center', ...shadows.purple },
  ctaDisabled: { opacity: 0.45 },
  ctaText:     { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
});
