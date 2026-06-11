import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/lib/supabase';
import { colors, font, fontSize, radius, shadows, spacing } from '../../src/tokens';
import { Logo } from '../../src/components/Logo';
import { ChevronLeftIcon, LockIcon } from '../../src/components/Icons';

export default function VerifyOtp() {
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const type = (typeof params.type === 'string' ? params.type : 'signup') as 'signup' | 'recovery';
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      let error;
      if (type === 'signup') {
        const res = await supabase.auth.resend({ type: 'signup', email: email.trim() });
        error = res.error;
      } else {
        const res = await supabase.auth.resetPasswordForEmail(email.trim());
        error = res.error;
      }
      if (error) throw error;
      
      setResendTimer(60);
      if (Platform.OS === 'web') window.alert('Sucesso: Código reenviado com sucesso!');
      else Alert.alert('Sucesso', 'Código reenviado com sucesso!');
    } catch (err: any) {
      if (Platform.OS === 'web') window.alert('Erro: ' + (err.message || 'Erro ao reenviar.'));
      else Alert.alert('Erro', err.message || 'Erro ao reenviar.');
    } finally {
      setLoading(false);
    }
  }

  const disabled = code.length < 6;

  async function handleVerify() {
    if (disabled) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type,
      });
      if (error) throw error;
      
      if (type === 'recovery') {
        router.replace('/buddyid/reset-password' as any);
      } else {
        // Complete signup flow
        const raw = await AsyncStorage.getItem('buddyid_pending_dogs');
        const dogs = raw ? JSON.parse(raw) : [];
        const hasAnotherDog = dogs.length > 0 && dogs[0].housemates?.includes('Outro cão');
        if (dogs.length >= 2 || !hasAnotherDog) {
          router.replace('/buddyid/loading' as any);
        } else {
          router.replace('/buddyid/second-dog' as any);
        }
      }
    } catch (err: any) {
      if (Platform.OS === 'web') window.alert('Erro: ' + (err.message || 'Código inválido.'));
      else Alert.alert('Erro', err.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/buddyid/auth' as any);
  }

  return (
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
            <Text style={s.title}>Código de Verificação</Text>
            <Text style={s.sub}>
              Enviámos um código de 6 dígitos para <Text style={{ fontFamily: font.bold, color: colors.text }}>{email}</Text>. Introduz abaixo para verificar.
            </Text>

            <View style={s.form}>
              <View style={s.inputWrap}>
                <LockIcon size={18} color={colors.textMuted} strokeWidth={1.75} />
                <TextInput
                  style={s.input} placeholder="000000" placeholderTextColor={colors.textMuted}
                  value={code} onChangeText={setCode}
                  keyboardType="number-pad" autoCapitalize="none"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={s.resendWrap}>
              <Text style={s.resendText}>Não recebeste o código?</Text>
              <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || loading}>
                <Text style={[s.resendBtnText, (resendTimer > 0 || loading) && s.resendBtnDisabled]}>
                  {resendTimer > 0 ? `Reenviar (${resendTimer}s)` : 'Reenviar código'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.cta, (disabled || loading) && s.ctaDisabled]}
            onPress={handleVerify} disabled={disabled || loading}
          >
            <Text style={s.ctaText}>{loading ? 'A verificar...' : 'Verificar código'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  input:       { flex: 1, fontFamily: font.regular, fontSize: fontSize.xl, color: colors.text, letterSpacing: 4 },

  resendWrap:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing[6], gap: spacing[2] },
  resendText:  { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  resendBtnText: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: colors.primary },
  resendBtnDisabled: { opacity: 0.5 },

  footer:      { padding: spacing[5], backgroundColor: colors.canvas },
  cta:         { backgroundColor: colors.primary, borderRadius: radius.lg, height: 52, alignItems: 'center', justifyContent: 'center', ...shadows.purple },
  ctaDisabled: { opacity: 0.45 },
  ctaText:     { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
});
