import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, font, fontSize, radius, shadows, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { ChevronLeftIcon, LockIcon, MailIcon, CheckIcon } from '../components/Icons';

export default function LoginRegister() {
  const params      = useLocalSearchParams();
  const isLoginOnly = params.mode === 'login_only';

  const [isLogin,           setIsLogin]           = useState(isLoginOnly);
  const [email,             setEmail]             = useState('');
  const [password,          setPassword]          = useState('');
  const [phone,             setPhone]             = useState('');
  const [loading,           setLoading]           = useState(false);
  const [verificationSent,  setVerificationSent]  = useState(false);

  async function handleAuth() {
    if (!email || !password || (!isLogin && !phone)) return;
    setLoading(true);
    setVerificationSent(false);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { phone }, emailRedirectTo: 'https://buddy.pet' },
        });
        if (error) throw error;
        if (!data.session) { setVerificationSent(true); setIsLogin(true); return; }
      }
      if (isLoginOnly) {
        router.replace('/buddyid' as any);
      } else {
        router.replace('/buddyid/loading' as any);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') window.alert('Erro: ' + (err.message || 'Ocorreu um erro.'));
      else Alert.alert('Erro', err.message || 'Ocorreu um erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/buddyid' as any);
  }

  const disabled = isLogin
    ? !email.includes('@') || password.length < 6
    : !email.includes('@') || password.length < 6 || phone.length < 7;

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

          {/* Card */}
          <View style={s.card}>
            {!isLoginOnly && (
              <View style={s.tabs}>
                <TouchableOpacity style={[s.tab, !isLogin && s.tabActive]} onPress={() => setIsLogin(false)}>
                  <Text style={[s.tabText, !isLogin && s.tabTextActive]}>Criar Conta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.tab, isLogin && s.tabActive]} onPress={() => setIsLogin(true)}>
                  <Text style={[s.tabText, isLogin && s.tabTextActive]}>Entrar</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={s.title}>{isLogin ? 'Bem-vindo de volta' : 'Cria a tua conta Buddy'}</Text>
            <Text style={s.sub}>
              {isLogin
                ? (isLoginOnly ? 'Faz login para acederes ao teu dashboard.' : 'Faz login para guardares o BuddyID.')
                : 'Cria uma conta para guardares o BuddyID.'}
            </Text>

            {verificationSent && (
              <View style={s.successBanner}>
                <CheckIcon size={18} color={colors.success} />
                <View style={s.successText}>
                  <Text style={s.successTitle}>Verifica o teu email</Text>
                  <Text style={s.successBody}>Enviámos um link de verificação para a tua caixa de entrada.</Text>
                </View>
              </View>
            )}

            <View style={s.form}>
              <View style={s.inputWrap}>
                <MailIcon size={18} color={colors.textMuted} strokeWidth={1.75} />
                <TextInput
                  style={s.input} placeholder="Email" placeholderTextColor={colors.textMuted}
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                />
              </View>

              {!isLogin && (
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>+</Text>
                  <TextInput
                    style={s.input} placeholder="Telemóvel" placeholderTextColor={colors.textMuted}
                    value={phone} onChangeText={setPhone}
                    keyboardType="phone-pad" autoComplete="tel"
                  />
                </View>
              )}

              <View style={s.inputWrap}>
                <LockIcon size={18} color={colors.textMuted} strokeWidth={1.75} />
                <TextInput
                  style={s.input} placeholder="Palavra-passe" placeholderTextColor={colors.textMuted}
                  value={password} onChangeText={setPassword} secureTextEntry
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.cta, (disabled || loading) && s.ctaDisabled]}
            onPress={handleAuth} disabled={disabled || loading}
          >
            <Text style={s.ctaText}>{loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta e continuar'}</Text>
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
  tabs:        { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, padding: 4, marginBottom: spacing[6] },
  tab:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
  tabActive:   { backgroundColor: colors.primary },
  tabText:     { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  tabTextActive: { color: '#fff', fontFamily: font.semiBold },

  title:       { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing[2] },
  sub:         { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing[5], lineHeight: 20 },

  successBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7', borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  successText:  { flex: 1 },
  successTitle: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: '#065F46', marginBottom: 2 },
  successBody:  { fontFamily: font.regular, fontSize: fontSize.xs, color: '#047857', lineHeight: 17 },

  form:        { gap: spacing[3] },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing[4], height: 52, gap: spacing[3] },
  inputIcon:   { fontFamily: font.bold, fontSize: fontSize.md, color: colors.textMuted, width: 18, textAlign: 'center' },
  input:       { flex: 1, fontFamily: font.regular, fontSize: fontSize.base, color: colors.text },

  footer:      { padding: spacing[5], backgroundColor: colors.canvas },
  cta:         { backgroundColor: colors.primary, borderRadius: radius.lg, height: 52, alignItems: 'center', justifyContent: 'center', ...shadows.purple },
  ctaDisabled: { opacity: 0.45 },
  ctaText:     { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
});
