import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useRouter } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { WebSheet } from '../components/WebSheet';
import { Logo } from '../components/Logo';
import { NavBar } from '../components/NavBar';
import { ChevronRightIcon } from '../components/Icons';

export default function AboutUs() {
  const router = useRouter();

  return (
    <WebSheet>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 72 }} />
        <Logo variant="dark" size="sm" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Hero heading */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeading}>Dois irmãos,</Text>
          <Text style={styles.heroHeadingAccent}>uma missão:</Text>
        </View>

        {/* Mission box */}
        <View style={styles.missionBox}>
          <View style={styles.missionBoxGlow} />
          <Text style={styles.missionText}>
            {'A Buddy é onde encontras '}
            <Text style={styles.missionHighlight}>os melhores serviços para o teu cão</Text>
            {', em cada fase da vida. E cada cão tem o seu '}
            <Text style={styles.missionHighlight}>BuddyID</Text>
            {': o perfil que sabe quem ele é, como vive e do que precisa. É assim que ajudamos a escolher '}
            <Text style={styles.missionHighlight}>o serviço certo, no momento certo</Text>
            {'.'}
          </Text>
          <View style={styles.missionDivider} />
          <Text style={styles.missionNote}>
            {'A Buddy é incubada na '}
            <Text style={styles.missionNoteHighlight}>BSC AI Factory</Text>
            {', com acesso a infraestrutura de supercomputação. Quantos mais cães conhecermos, melhor podemos cuidar deles.'}
          </Text>
        </View>

        {/* Buddy Fund block */}
        <TouchableOpacity
          style={styles.fundBlock}
          onPress={() => router.navigate('/buddyid/buddy-fund' as any)}
          activeOpacity={0.82}
        >
          <View style={styles.fundBlockLeft}>
            <Text style={styles.fundBlockTitle}>Buddy Fund</Text>
            <Text style={styles.fundBlockSub}>
              {'Por cada cão pré-registado e com um serviço ativado, doamos '}
              <Text style={styles.fundBlockHighlight}>1€</Text>
              {' a associações de animais em Portugal.'}
            </Text>
          </View>
          <ChevronRightIcon size={20} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>

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

        {/* Partners */}
        <View style={styles.partnersSection}>
          <Text style={styles.sectionTitle}>Parceiros institucionais</Text>
          <View style={styles.partnersGrid}>
            {PARTNERS.map((p, i) => (
              <PartnerCard key={i} {...p} />
            ))}
          </View>
        </View>

        {/* Advisor Section */}
        <View style={styles.advisorSection}>
          <Text style={styles.sectionTitle}>Advisor Científico</Text>
          <View style={styles.advisorCard}>
            <View style={styles.partnerGlow} />
            <View style={styles.partnerAccent} />
            <View style={styles.advisorInner}>
              <View style={styles.advisorHeader}>
                <Image
                  source={require('../../assets/advisor-francisco.jpg')}
                  style={styles.advisorPhoto}
                />
                <View style={styles.advisorTitleContainer}>
                  <Text style={styles.advisorName}>Francisco Campos</Text>
                  <Text style={styles.advisorRole}>Treinador e Desportista Canino</Text>
                </View>
              </View>
              <Text style={styles.advisorDesc}>
                <Text style={styles.advisorDescHighlight}>Francisco Campos</Text>
                {' - Treinador e desportista canino, compete em IGP ao mais alto nível e já representou Portugal no Campeonato do Mundo. Na Buddy, ajuda-nos a perceber o que realmente importa no comportamento de um cão: que perguntas fazer no '}
                <Text style={styles.advisorDescHighlight}>BuddyID</Text>
                {' e o que observar para perceber cada cão.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Join Us / Contact Team CTA */}
        <View style={styles.joinSection}>
          <Text style={styles.joinText}>
            Estamos à procura de mais pessoas que possam contribuir para este projeto.
          </Text>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => router.navigate('/buddyid/contact' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Falar com a equipa</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Patinhas d’Açafrão Lda</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => Alert.alert('Termos e Condições', 'Em breve.')}>
              <Text style={styles.footerLinkText}>Termos e Condições</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>·</Text>
            <TouchableOpacity onPress={() => Alert.alert('Políticas de Privacidade', 'Em breve.')}>
              <Text style={styles.footerLinkText}>Políticas de Privacidade</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
      <NavBar />
    </SafeAreaView>
    </WebSheet>
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

type Segment = { t: string; h?: true };

const PARTNERS: {
  source: ReturnType<typeof require>;
  logoScale: number;
  category: string;
  desc: Segment[];
}[] = [
  {
    source: require('../../assets/partner-bsc-aif.png'),
    logoScale: 1.3,
    category: 'Aceleração',
    desc: [
      { t: 'Acelera a Buddy com acesso ao ' },
      { t: 'MareNostrum 5+', h: true },
      { t: ', mentoria técnica em ' },
      { t: 'IA generativa', h: true },
      { t: ', formação e rede de investidores europeus.' },
    ],
  },
  {
    source: require('../../assets/partner-deucalion-correct.png'),
    logoScale: 2.0,
    category: 'Infraestrutura GPU',
    desc: [
      { t: 'Pela incubação na ' },
      { t: 'BSC AI Factory', h: true },
      { t: ', temos acesso ao ' },
      { t: 'Deucalion', h: true },
      { t: ', o supercomputador mais potente de Portugal, em Guimarães. É onde vamos treinar os modelos da Buddy. O ' },
      { t: 'motor português', h: true },
      { t: ' por trás do produto.' },
    ],
  },
  {
    source: require('../../assets/partner-cnca-correct.png'),
    logoScale: 1.43,
    category: 'Mentoria técnica',
    desc: [
      { t: 'Mentora e instrui a equipa Buddy na utilização do ' },
      { t: 'Deucalion', h: true },
      { t: '. Supervisiona o acesso, apoia as ' },
      { t: 'pipelines de treino', h: true },
      { t: ' e mantém o ambiente operacional.' },
    ],
  },
  {
    source: require('../../assets/partner-fct-correct.png'),
    logoScale: 1.24,
    category: 'Apoio institucional',
    desc: [
      { t: 'Abre a porta institucional à Buddy. Organiza os concursos da ' },
      { t: 'RNCA', h: true },
      { t: ' através dos quais a Buddy obtém ' },
      { t: 'horas de computação', h: true },
      { t: ' e financia a infraestrutura onde corre.' },
    ],
  },
];

function PartnerCard({
  source,
  logoScale,
  category,
  desc,
}: {
  source: ReturnType<typeof require>;
  logoScale: number;
  category: string;
  desc: Segment[];
}) {
  return (
    <View style={styles.partnerCard}>
      {/* decorative glow echoing Hero ellipse */}
      <View style={styles.partnerGlow} />
      {/* accent stripe — single View, overflow hidden on parent clips the corners */}
      <View style={styles.partnerAccent} />
      <View style={styles.partnerInner}>
        {/* white logo plate */}
        <View style={styles.partnerLogoPlate}>
          <Image
            source={source}
            style={[styles.partnerLogo, { transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
        </View>
        {/* category pill */}
        <View style={styles.partnerPill}>
          <Text style={styles.partnerPillText}>{category}</Text>
        </View>
        {/* body text with highlights */}
        <Text style={styles.partnerDesc}>
          {desc.map((seg, i) =>
            seg.h ? (
              <Text key={i} style={styles.partnerDescHighlight}>{seg.t}</Text>
            ) : (
              seg.t
            )
          )}
        </Text>
      </View>
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
  headerSpacer: {
    minWidth: 72,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },

  // Hero title
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: spacing[8],
    paddingBottom: spacing[2],
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
  },

  // Mission box
  missionBox: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#F1EEFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0d9f5',
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#6B5EBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  missionBoxGlow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(107,94,191,0.10)',
  },
  missionText: {
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
  },
  missionHighlight: {
    fontFamily: font.bold,
    color: colors.primary,
  },
  missionDivider: {
    height: 1,
    backgroundColor: '#e0d9f5',
    marginVertical: 20,
  },
  missionNote: {
    fontFamily: font.regular,
    fontSize: 13,
    color: '#8c84a0',
    textAlign: 'left',
    lineHeight: 20,
  },
  missionNoteHighlight: {
    fontFamily: font.bold,
    color: colors.primary,
  },

  // Buddy Fund block
  fundBlock: {
    marginHorizontal: 24,
    marginBottom: spacing[6],
    backgroundColor: '#F1EEFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0d9f5',
    padding: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  fundBlockLeft: { flex: 1 },
  fundBlockTitle: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text, marginBottom: spacing[1] },
  fundBlockSub: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  fundBlockHighlight: { fontFamily: font.bold, color: colors.primary },
  fundBlockChevron: { fontSize: 24, color: colors.primary, opacity: 0.5, fontFamily: font.regular },

  // Founders
  foundersSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
    paddingHorizontal: 24,
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

  // Partners
  partnersSection: {
    paddingHorizontal: spacing[5],
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
    gap: 16,
  },
  partnerCard: {
    backgroundColor: '#F7F5FC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
    shadowColor: '#6B5EBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  partnerGlow: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(107,94,191,0.06)',
  },
  partnerAccent: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primary,
  },
  partnerInner: {
    padding: 20,
  },
  partnerLogoPlate: {
    width: '100%',
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 14,
  },
  partnerLogo: {
    width: '90%',
    height: 80,
  },
  partnerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#6B5EBF14',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  partnerPillText: {
    fontFamily: font.semiBold,
    fontSize: 11,
    color: colors.primary,
  },
  partnerDesc: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 22,
  },
  partnerDescHighlight: {
    fontFamily: font.semiBold,
    color: colors.primary,
  },
  advisorSection: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  advisorCard: {
    backgroundColor: '#F7F5FC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
    shadowColor: '#6B5EBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  advisorInner: {
    padding: 20,
  },
  advisorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  advisorPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'rgba(107, 94, 191, 0.15)',
  },
  advisorTitleContainer: {
    flex: 1,
  },
  advisorName: {
    fontFamily: font.semiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  advisorRole: {
    fontFamily: font.medium,
    fontSize: 12,
    color: colors.primary,
  },
  advisorDesc: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  advisorDescHighlight: {
    fontFamily: font.semiBold,
    color: colors.primary,
  },
  joinSection: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: spacing[6],
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#6B5EBF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  joinText: {
    fontFamily: font.medium,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButtonText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    marginTop: spacing[8],
  },
  footerText: {
    fontSize: 12,
    fontFamily: font.medium,
    color: colors.textMuted,
    marginBottom: spacing[2],
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  footerLinkText: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  footerDivider: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
