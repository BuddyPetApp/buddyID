import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { colors, font, fontSize, spacing } from '../tokens';

const PARTNERS = [
  {
    key: 'bsc',
    logo: require('../../assets/partner-bsc.png'),
    name: 'Barcelona Supercomputing Center',
    description: 'Infraestrutura de IA e processamento de dados',
  },
  {
    key: 'fct',
    logo: require('../../assets/partner-fct.png'),
    name: 'FCT — Fundação para a Ciência e a Tecnologia',
    description: 'Apoio à investigação',
  },
  {
    key: 'cnca',
    logo: require('../../assets/partner-cnca.png'),
    name: 'CNCA',
    description: 'Confederação Nacional de Canicultura',
  },
  {
    key: 'deucalion',
    logo: require('../../assets/partner-deucalion.png'),
    name: 'Deucalion',
    description: 'Parceiro tecnológico',
  },
];

const BENEFITS = [
  'Perfil verificado e de confiança',
  'Acesso a tutores com BuddyID (cão bem caracterizado)',
  'Gestão de agenda integrada',
  'Pagamentos seguros via Buddy',
];

export default function Parceiros() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Logo />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1 — Para prestadores de serviços */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Para prestadores</Text>
          </View>
          <Text style={styles.sectionTitle}>Faz parte do marketplace Buddy</Text>
          <Text style={styles.sectionSubtitle}>
            Acede a tutores qualificados, gere o teu calendário e cresce o teu negócio.
          </Text>

          <View style={styles.benefitsList}>
            {BENEFITS.map((benefit) => (
              <View key={benefit} style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <Button
            label="Pré-registar como prestador"
            onPress={() => router.push('/buddyid/providers' as any)}
            variant="primary"
            size="lg"
          />
        </View>

        {/* Section 2 — Parceiros institucionais */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>Parceiros institucionais</Text>
          </View>
          <Text style={styles.sectionTitle}>Parceiros que nos apoiam</Text>
          <Text style={styles.sectionSubtitle}>
            Investigação e tecnologia ao serviço do bem-estar animal.
          </Text>

          <View style={styles.partnersGrid}>
            {PARTNERS.map((partner) => (
              <View key={partner.key} style={styles.partnerCard}>
                <View style={styles.partnerLogoContainer}>
                  <Image
                    source={partner.logo}
                    style={styles.partnerLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerDescription}>{partner.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 3 — Buddy Fund */}
        <View style={styles.fundSection}>
          <View style={styles.fundInner}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>Buddy Fund</Text>
            </View>
            <Text style={styles.sectionTitle}>
              Buddy Fund — juntos pelo bem-estar animal
            </Text>
            <Text style={styles.sectionSubtitle}>
              Uma parte de cada transacção apoia associações de animais em Portugal.
            </Text>
            <Button
              label="Saber mais"
              onPress={() => router.push('/buddyid/associations' as any)}
              variant="outline"
              size="md"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  backIcon: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontFamily: font.medium,
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAccent,
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    marginBottom: spacing[3],
  },
  sectionBadgeText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing[2],
    lineHeight: 30,
  },
  sectionSubtitle: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing[5],
  },
  benefitsList: {
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },
  benefitText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  partnerCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  partnerLogoContainer: {
    width: 120,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  partnerLogo: {
    width: 120,
    height: 40,
  },
  partnerName: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[1],
    lineHeight: 18,
  },
  partnerDescription: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  fundSection: {
    marginBottom: spacing[8],
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fundInner: {
    padding: spacing[6],
  },
  bottomPadding: {
    height: spacing[8],
  },
});
