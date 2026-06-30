import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, font, fontSize, radius, shadows, spacing } from '../../src/tokens';
import { WebSheet } from '../../src/components/WebSheet';
import { Logo } from '../../src/components/Logo';
import { LockIcon } from '../../src/components/Icons';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const disabled = password.length < 6;

  async function handleUpdate() {
    if (disabled) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      if (Platform.OS === 'web') window.alert('Sucesso: Palavra-passe alterada com sucesso!');
      else Alert.alert('Sucesso', 'Palavra-passe alterada com sucesso!');
      
      router.replace('/buddyid' as any);
    } catch (err: any) {
      if (Platform.OS === 'web') window.alert('Erro: ' + (err.message || 'Ocorreu um erro.'));
      else Alert.alert('Erro', err.message || 'Ocorreu um erro ao atualizar a palavra-passe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <WebSheet>
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.backBtn} />
        <Logo variant="dark" size="sm" />
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.flex} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={s.card}>
            <Text style={s.title}>Nova palavra-passe</Text>
            <Text style={s.sub}>
              Introduz a tua nova palavra-passe abaixo (mínimo 6 caracteres).
            </Text>

            <View style={s.form}>
              <View style={s.inputWrap}>
                <LockIcon size={18} color={colors.textMuted} strokeWidth={1.75} />
                <TextInput
                  style={s.input} placeholder="Nova palavra-passe" placeholderTextColor={colors.textMuted}
                  value={password} onChangeText={setPassword} secureTextEntry
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.cta, (disabled || loading) && s.ctaDisabled]}
            onPress={handleUpdate} disabled={disabled || loading}
          >
            <Text style={s.ctaText}>{loading ? 'A guardar...' : 'Guardar palavra-passe'}</Text>
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
