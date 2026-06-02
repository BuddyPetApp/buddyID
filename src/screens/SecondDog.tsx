import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';

const BENEFITS = [
  'Perfil personalizado para cada cão',
  'Recomendações independentes',
  'Dois BuddyIDs, uma conta',
];

interface Props {
  firstDogName?: string;
}

export default function SecondDog({ firstDogName = 'o teu cão' }: Props) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Logo variant="dark" size="sm" />
      </View>

      <View style={s.content}>
        <View style={s.dogsRow}>
          <View style={s.dogCard}>
            <View style={[s.avatar, s.avatarFilled]}>
              <Text style={s.avatarText}>{firstDogName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={s.dogName}>{firstDogName}</Text>
            <Text style={s.dogStatus}>BuddyID criado ✓</Text>
          </View>

          <View style={s.plusWrap}>
            <Text style={s.plusText}>+</Text>
          </View>

          <View style={s.dogCard}>
            <View style={[s.avatar, s.avatarEmpty]}>
              <Text style={s.avatarEmptyText}>?</Text>
            </View>
            <Text style={s.dogName}>Novo cão</Text>
            <Text style={s.dogStatusPending}>Por criar</Text>
          </View>
        </View>

        <Text style={s.title}>O teu outro cão merece um BuddyID!</Text>
        <Text style={s.desc}>
          Cria o perfil do segundo cão — é igualmente gratuito e leva apenas 5 minutos.
        </Text>

        <View style={s.divider} />

        {BENEFITS.map((benefit) => (
          <View key={benefit} style={s.benefitRow}>
            <View style={s.bullet} />
            <Text style={s.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={s.footer}>
        <Button
          label="Criar BuddyID para segundo cão"
          onPress={() => router.push('/buddyid/flow' as any)}
          variant="primary"
          size="lg"
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backLink}
          activeOpacity={0.7}
        >
          <Text style={s.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
  },
  dogsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  dogCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  avatarFilled: { backgroundColor: colors.primaryLight },
  avatarEmpty: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarText: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: '#fff',
  },
  avatarEmptyText: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  dogName: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  dogStatus: {
    fontFamily: font.medium,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  dogStatusPending: {
    fontFamily: font.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  plusWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAccent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  plusText: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  title: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing[3],
  },
  desc: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing[4],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing[3],
    flexShrink: 0,
  },
  benefitText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing[3],
  },
  backLink: { alignItems: 'center', paddingVertical: spacing[2] },
  backLinkText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
});
