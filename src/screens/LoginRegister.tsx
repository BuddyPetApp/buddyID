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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { SectionLabel } from './shared';

export default function LoginRegister() {
  const params = useLocalSearchParams();
  const isLoginOnly = params.mode === 'login_only';

  const [isLogin, setIsLogin] = useState(isLoginOnly ? true : false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password || (!isLogin && !phone)) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              phone, // Stores phone in user_metadata, will sync to public.users via trigger
            }
          }
        });
        if (error) throw error;
      }
      
      if (isLoginOnly) {
        router.replace('/buddyid' as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      } else {
        router.replace('/buddyid/loading' as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Ocorreu um erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/buddyid' as any); // fallback
    }
  }

  const isContinueDisabled = isLogin 
    ? !email.includes('@') || password.length < 6
    : !email.includes('@') || password.length < 6 || phone.length < 7;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12} style={s.backBtn}>
          <Text style={s.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!isLoginOnly && (
            <View style={s.tabs}>
              <TouchableOpacity 
                style={[s.tab, !isLogin && s.tabActive]} 
                onPress={() => setIsLogin(false)}
              >
                <Text style={[s.tabText, !isLogin && s.tabTextActive]}>Criar Conta</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.tab, isLogin && s.tabActive]} 
                onPress={() => setIsLogin(true)}
              >
                <Text style={[s.tabText, isLogin && s.tabTextActive]}>Login</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[s.question, isLoginOnly && { marginTop: spacing[4] }]}>
            {isLogin ? 'Bem-vindo de volta!' : 'Cria a tua conta Buddy'}
          </Text>
          <Text style={s.sub}>
            {isLogin 
              ? (isLoginOnly ? 'Faz login para acederes ao teu dashboard.' : 'Faz login para acederes à tua conta e guardarmos o(s) perfil(is)!')
              : 'Cria uma conta para guardarmos o perfil do teu cão.'}
          </Text>

          <View style={s.form}>
            <SectionLabel>Email</SectionLabel>
            <TextInput
              style={s.input}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {!isLogin && (
              <>
                <SectionLabel>Telemóvel</SectionLabel>
                <TextInput
                  style={s.input}
                  placeholder="+351 912 345 678"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </>
            )}

            <SectionLabel>Palavra-passe</SectionLabel>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.continueBtn, (isContinueDisabled || loading) && s.continueBtnDisabled]}
            onPress={handleAuth}
            disabled={isContinueDisabled || loading}
          >
            <Text style={s.continueBtnText}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta e Continuar'}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: spacing[6],
    height: 68,
  },
  backBtn: { width: 32 },
  backArrow: { fontSize: 22, color: colors.primary, fontFamily: font.bold },
  scrollContent: { padding: spacing[6], paddingBottom: spacing[10] },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing[6],
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
    fontFamily: font.semiBold,
  },
  question: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing[2], lineHeight: 34 },
  sub: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing[6] },
  form: { marginTop: spacing[2] },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  footer: { padding: spacing[4], backgroundColor: colors.canvas },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: spacing[4], alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnText: { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
});
