import React, { useState } from 'react';
import {
  Alert,
  Linking,
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
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { Logo } from '../components/Logo';
import { NavBar } from '../components/NavBar';
import { colors, font, fontSize, spacing } from '../tokens';
import { apiClient } from '../api/client';

const ICON_EMAIL = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="5" width="20" height="14" rx="3" stroke="#6B5EBF" stroke-width="1.8"/>
  <path d="M2 8l10 6 10-6" stroke="#6B5EBF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" rx="6" stroke="#6B5EBF" stroke-width="1.8"/>
  <circle cx="12" cy="12" r="4" stroke="#6B5EBF" stroke-width="1.8"/>
  <circle cx="17.5" cy="6.5" r="1" fill="#6B5EBF"/>
</svg>`;

const ICON_LINKEDIN = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20" rx="4" stroke="#6B5EBF" stroke-width="1.8"/>
  <path d="M7 10v7" stroke="#6B5EBF" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="7" cy="7.5" r="1" fill="#6B5EBF"/>
  <path d="M11 17v-4a2 2 0 0 1 4 0v4" stroke="#6B5EBF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11 10v7" stroke="#6B5EBF" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

const FAQ_ITEMS = [
  {
    q: 'Quando lança a Buddy?',
    a: 'Estamos a preparar o lançamento em Portugal. Cria o teu BuddyID para seres o primeiro a saber.',
  },
  {
    q: 'A Buddy é gratuita para tutores?',
    a: 'Sim. Criar o BuddyID e pesquisar prestadores é gratuito para tutores.',
  },
  {
    q: 'Como me torno prestador Buddy?',
    a: 'Regista-te na secção Juntar-me e entramos em contacto para a validação do perfil.',
  },
];

export default function Contacto() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const emailValid = email.trim().length > 0 && email.includes('@');
    if (name.trim().length > 0 && emailValid) {
      setSubmitting(true);
      try {
        await apiClient.post('/contacts', {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        });
        Alert.alert('Mensagem enviada! 🐾', 'Obrigado pelo contacto. Respondemos em breve.');
        setName('');
        setEmail('');
        setMessage('');
      } catch (err: any) {
        Alert.alert('Erro ao enviar', err.message || 'Ocorreu um erro ao enviar a mensagem. Por favor, tenta novamente.');
      } finally {
        setSubmitting(false);
      }
    } else {
      Alert.alert('Campos inválidos', 'Por favor preenche o nome e um email válido.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSide}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Logo variant="dark" size="sm" />
        </View>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Fala connosco</Text>
          <Text style={styles.heroSubtitle}>Estamos aqui para ajudar.</Text>
        </View>

        {/* Contact cards */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.75}
            onPress={() => Linking.openURL('mailto:hello@buddy.pet')}
          >
            <View style={styles.contactIconWrap}>
              <SvgXml xml={ICON_EMAIL} width={24} height={24} />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>hello@buddy.pet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.75}
            onPress={() => Linking.openURL('https://instagram.com/buddypetapp')}
          >
            <View style={styles.contactIconWrap}>
              <SvgXml xml={ICON_INSTAGRAM} width={24} height={24} />
            </View>
            <Text style={styles.contactLabel}>Instagram</Text>
            <Text style={styles.contactValue}>@buddypetapp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.75}
            onPress={() => Linking.openURL('https://www.linkedin.com/company/108814622')}
          >
            <View style={styles.contactIconWrap}>
              <SvgXml xml={ICON_LINKEDIN} width={24} height={24} />
            </View>
            <Text style={styles.contactLabel}>LinkedIn</Text>
            <Text style={styles.contactValue}>buddy-pet</Text>
          </TouchableOpacity>
        </View>

        {/* Contact form */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formWrapper}
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Envia-nos uma mensagem</Text>

            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="O teu nome"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Mensagem</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Conta-nos como podemos ajudar..."
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
              activeOpacity={0.85} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitText}>
                {submitting ? 'A enviar...' : 'Enviar mensagem'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Perguntas frequentes</Text>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Text style={styles.faqAnswer}>{item.a}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Buddy · Portugal</Text>
        </View>
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontFamily: font.medium,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[12],
  },

  // Hero
  hero: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  heroSubtitle: {
    fontFamily: font.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Contact cards
  contactRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  contactLabel: {
    fontSize: fontSize.xs,
    fontFamily: font.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  contactValue: {
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.primary,
    textAlign: 'center',
  },

  // Form
  formWrapper: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[8],
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing[6],
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontFamily: font.bold,
    color: colors.text,
    marginBottom: spacing[5],
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontFamily: font.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    fontFamily: font.regular,
    color: colors.text,
    marginBottom: spacing[4],
  },
  textArea: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    fontFamily: font.regular,
    color: colors.text,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: spacing[4],
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: fontSize.base,
    fontFamily: font.semiBold,
    color: colors.surface,
  },

  // FAQ
  faqSection: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[8],
  },
  faqTitle: {
    fontSize: fontSize.xl,
    fontFamily: font.bold,
    color: colors.text,
    marginBottom: spacing[4],
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing[5],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  faqQuestion: {
    fontSize: fontSize.base,
    fontFamily: font.bold,
    color: colors.text,
    marginBottom: spacing[2],
  },
  faqAnswer: {
    fontSize: fontSize.sm,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: spacing[4],
  },
  footerText: {
    fontSize: fontSize.sm,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
});
