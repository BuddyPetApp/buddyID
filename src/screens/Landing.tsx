import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';

const HOW_IT_WORKS = [
  '1. Responde às perguntas sobre o teu cão',
  '2. Geramos o perfil único do teu cão',
  '3. Acede a recomendações e serviços',
];

export default function Landing() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Logo variant="dark" size="sm" />
        </View>

        <View style={s.heroCard}>
          <View style={s.heroDecor} />
          <Text style={s.heroTitle}>O perfil inteligente do teu cão</Text>
          <Text style={s.heroSubtitle}>
            Cria o BuddyID em 5 minutos e acede a recomendações personalizadas
          </Text>
        </View>

        <View style={s.stepsCard}>
          <Text style={s.stepsHeading}>Como funciona</Text>
          {HOW_IT_WORKS.map((step) => (
            <View key={step} style={s.stepRow}>
              <View style={s.stepDot} />
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Criar BuddyID gratuito"
          onPress={() => router.push('/buddyid/flow' as any)}
          variant="primary"
          size="lg"
        />

        <TouchableOpacity
          style={s.linkRow}
          onPress={() => router.push('/buddyid/providers' as any)}
          activeOpacity={0.7}
        >
          <Text style={s.linkText}>Para prestadores de serviços →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.linkRow}
          onPress={() => router.push('/buddyid/associations' as any)}
          activeOpacity={0.7}
        >
          <Text style={s.linkText}>Para associações →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[10] },
  header: { paddingTop: spacing[4], paddingBottom: spacing[6] },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing[6],
    marginBottom: spacing[6],
    overflow: 'hidden',
    ...shadows.elevated,
  },
  heroDecor: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: '#FFFFFF',
    marginBottom: spacing[3],
    lineHeight: 32,
  },
  heroSubtitle: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing[5],
    marginBottom: spacing[6],
    ...shadows.card,
  },
  stepsHeading: {
    fontFamily: font.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing[4],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing[3],
    flexShrink: 0,
  },
  stepText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  linkRow: { alignItems: 'center', paddingVertical: spacing[3] },
  linkText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.primary,
  },
});
