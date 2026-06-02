import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { Logo } from '../components/Logo';

export default function SobreNos() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero heading */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeading}>Dois irmãos,</Text>
          <Text style={styles.heroHeadingAccent}>uma missão:</Text>
          <Text style={styles.missionText}>
            A Buddy nasceu da convicção de que cada cão merece ser compreendido.
            Construímos o passaporte digital do teu melhor amigo.
          </Text>
        </View>

        {/* Founders */}
        <View style={styles.foundersSection}>
          <FounderCard
            name="Guilherme Castro Mendes"
            photo={require('../../assets/founder-guilherme.png')}
          />
          <FounderCard
            name="Afonso Castro Mendes"
            photo={require('../../assets/founder-afonso.png')}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <StatItem value="27" label="ecrãs desenhados" />
          <View style={styles.statDivider} />
          <StatItem value="2" label="fundadores" />
          <View style={styles.statDivider} />
          <StatItem value="1" label="missão" />
        </View>

        {/* Partners */}
        <View style={styles.partnersSection}>
          <Text style={styles.sectionTitle}>Parceiros</Text>
          <View style={styles.partnersGrid}>
            <PartnerLogo source={require('../../assets/partner-bsc.png')} label="BSC" />
            <PartnerLogo source={require('../../assets/partner-fct.png')} label="FCT" />
            <PartnerLogo source={require('../../assets/partner-cnca.png')} label="CNCA" />
            <PartnerLogo source={require('../../assets/partner-deucalion.png')} label="Deucalion" />
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyText}>
            🔒 Os dados do teu cão são processados em infraestrutura do{' '}
            <Text style={styles.privacyBold}>Barcelona Supercomputing Center (BSC)</Text>,
            conformidade total com o RGPD.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FounderCard({
  name,
  photo,
}: {
  name: string;
  photo: ReturnType<typeof require>;
}) {
  return (
    <View style={styles.founderCard}>
      <Image source={photo} style={styles.founderPhoto} />
      <Text style={styles.founderName}>{name}</Text>
      <Text style={styles.founderRole}>Co-fundador</Text>
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PartnerLogo({
  source,
  label,
}: {
  source: ReturnType<typeof require>;
  label: string;
}) {
  return (
    <View style={styles.partnerLogoWrapper}>
      <Image source={source} style={styles.partnerLogo} resizeMode="contain" />
      <Text style={styles.partnerLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backBtn: {
    paddingVertical: spacing[1],
    paddingRight: spacing[2],
    minWidth: 72,
  },
  backText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.primary,
  },
  headerSpacer: {
    minWidth: 72,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },

  // Hero
  heroSection: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  heroHeading: {
    fontFamily: font.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40,
  },
  heroHeadingAccent: {
    fontFamily: font.bold,
    fontSize: fontSize.xxl,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing[4],
  },
  missionText: {
    fontFamily: font.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },

  // Founders
  foundersSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  founderCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[3],
    ...shadows.card,
  },
  founderPhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing[3],
    backgroundColor: colors.surfaceMuted,
  },
  founderName: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  founderRole: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Stats
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAccent,
    marginHorizontal: spacing[6],
    borderRadius: 20,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[8],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: colors.primary,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  // Partners
  partnersSection: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontFamily: font.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[3],
  },
  partnerLogoWrapper: {
    width: '44%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    ...shadows.card,
  },
  partnerLogo: {
    width: 100,
    height: 44,
    marginBottom: spacing[2],
  },
  partnerLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  // Privacy
  privacyCard: {
    marginHorizontal: spacing[6],
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyText: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  privacyBold: {
    fontFamily: font.semiBold,
    color: colors.text,
  },
});
