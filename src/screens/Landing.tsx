import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { router, usePathname } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { NavBar } from '../components/NavBar';
import { supabase } from '../lib/supabase';
import { apiClient } from '../api/client';

// ── design tokens (node 2:16) ──────────────────────────────────────
const T = {
  bg: '#faf8f5',
  cardBg: '#FFFFFF',
  cardBorder: '#e8e0f5',
  cardRadius: 10,
  titleColor: '#1d1a2a',
  subColor: '#70678c',
  sectionTitle: '#1a1a1a',
  aux: '#999999',
  accent: '#6B5EBF',
  accentTint: 'rgba(107,94,191,0.08)',
  accentTintMid: '#F3F0FB',
  accentBorder: '#e8e0f5',
} as const;

// ── inline SVG icons (24×24, stroke 1.75, no fill) ─────────────────
const ICO_HEART = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21C12 21 3 14 3 8a4 4 0 0 1 6.93-2.75L12 7l2.07-1.75A4 4 0 0 1 21 8c0 6-9 13-9 13z" stroke="#6B5EBF" stroke-width="1.75" stroke-linejoin="round"/>
  <path d="M9 12l1.5 1.5L14 10" stroke="#6B5EBF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ICO = {
  badgeCheck: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l2.4 1.6 2.8-.4 1.2 2.6 2.6 1.2-.4 2.8L22 12l-1.4 2.2.4 2.8-2.6 1.2-1.2 2.6-2.8-.4L12 22l-2.2-1.4-2.8.4-1.2-2.6L3.2 17l.4-2.8L2 12l1.6-2.4-.4-2.8 2.6-1.2 1.2-2.6 2.8.4z" stroke="#6B5EBF" stroke-width="1.75" stroke-linejoin="round"/>
    <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="#6B5EBF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  store: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9l1-6h16l1 6" stroke="#6B5EBF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" stroke="#6B5EBF" stroke-width="1.75" stroke-linecap="round"/>
    <path d="M5 21V9M19 9v12H9V9" stroke="#6B5EBF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="9" y="15" width="4" height="6" rx="0.5" stroke="#6B5EBF" stroke-width="1.75"/>
  </svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3l1.5 5H19l-4.5 3.5 1.5 5L12 14l-4 2.5 1.5-5L5 8h5.5z" stroke="#6B5EBF" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M5 3l.5 2H8L6 6.5l.5 2L5 7l-1.5 1.5.5-2L2 5h2.5z" stroke="#6B5EBF" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`,
} as const;

const HOW_IT_WORKS = [
  { n: '1', title: 'Raça e perfil genético', sub: 'Quem o teu cão é por dentro' },
  { n: '2', title: 'Condição física e saúde', sub: 'Como vive, dorme e se mexe' },
  { n: '3', title: 'Vida do tutor', sub: 'O vosso contexto e rotina juntos' },
];

const VISION_CARDS = [
  {
    icon: ICO.badgeCheck,
    title: 'Os profissionais conhecem-no à chegada',
    sub: 'Antes, durante e depois de cada serviço, quem o recebe consulta o BuddyID e sabe exatamente como cuidar dele.',
    badge: null,
  },
  {
    icon: ICO.store,
    title: 'O marketplace abre este verão',
    sub: 'Todos os serviços para o teu cão num só lugar. Regista-te agora e a conta fica pronta para o primeiro dia.',
    badge: null,
  },
  {
    icon: ICO.sparkles,
    title: 'Recomendações à medida',
    sub: 'Cada perfil ajuda-nos a perceber que serviços fazem sentido para cada cão. Quanto mais o conhecermos, mais certeiras serão.',
    badge: 'Em desenvolvimento',
  },
];

export default function Landing() {
  const pathname = usePathname();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [tutorName, setTutorName] = useState('');
  const [dogs, setDogs] = useState<any[]>([]);
  const [activeDogId, setActiveDogId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true);
        apiClient.get<any>('/tutors/me')
          .then((data) => {
            if (data) {
              setTutorName(data.firstName || data.email?.split('@')[0] || '');
              if (data.dogs && data.dogs.length > 0) {
                setDogs(data.dogs);
                setActiveDogId(data.dogs[0].id);
              }
            }
          })
          .catch(console.error)
          .finally(() => setSessionLoading(false));
      } else {
        setHasSession(false);
        setSessionLoading(false);
      }
    });
  }, []);

  const activeDog = dogs.find(d => d.id === activeDogId) || dogs[0];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Logo variant="dark" size="md" />
        <Text style={s.headerSub}>O passaporte digital do teu cão</Text> 
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {sessionLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : hasSession && dogs.length > 0 ? (
          <View style={s.dashboard}>
            <Text style={s.welcomeText}>Olá, {tutorName}</Text>
            <Text style={s.dashboardTitle}>O teu BuddyID</Text>

            {/* Switcher de Bolinhas */}
            {dogs.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={s.switcher}
                contentContainerStyle={s.switcherContent}
              >
                {dogs.map((d) => {
                  const isActive = d.id === activeDogId;
                  return (
                    <TouchableOpacity 
                      key={d.id} 
                      onPress={() => setActiveDogId(d.id)}
                      style={s.switcherItem}
                    >
                      <View style={[s.switcherAvatarWrap, isActive && s.switcherAvatarActive]}>
                        {d.photoUrl ? (
                          <Image source={{ uri: d.photoUrl }} style={s.switcherAvatar} resizeMode="cover" />
                        ) : (
                          <View style={[s.switcherAvatar, s.avatarFallback]}>
                            <Text style={s.avatarFallbackText}>{d.name.charAt(0).toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[s.switcherName, isActive && s.switcherNameActive]} numberOfLines={1}>
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Cartão do Cão */}
            {activeDog && (
              <View style={s.dogCard}>
                {activeDog.photoUrl ? (
                  <Image source={{ uri: activeDog.photoUrl }} style={s.dogPhoto} resizeMode="cover" />
                ) : (
                  <View style={[s.dogPhoto, s.dogPhotoFallback]}>
                    <Text style={s.dogPhotoFallbackText}>{activeDog.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={s.dogInfo}>
                  <Text style={s.dogName}>{activeDog.name}</Text>
                  <Text style={s.dogMeta}>
                    {[activeDog.breed, activeDog.gender === 'male' ? 'Macho' : 'Fêmea'].filter(Boolean).join(' · ')}
                  </Text>
                  <TouchableOpacity style={s.buddyIdBtn} onPress={() => router.push(`/buddyid/dog/${activeDog.id}` as any)}>
                    <Text style={s.buddyIdBtnText}>Ver BuddyID</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={s.addDogBtn} onPress={() => router.push('/buddyid/flow' as any)}>
              <Text style={s.addDogText}>+ Adicionar cão</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Hero Card ── */}
            <View style={s.heroCard}>
              <View style={s.heroDecoration} />
              <View style={s.heroPill}>
                <Text style={s.heroPillText}>First Pack</Text>
              </View>
              <Text style={s.heroTitle}>Cria o BuddyID do teu cão</Text>
              <Text style={s.heroSub}>
                O passaporte digital que o liga a tudo na cidade. Ajuda-nos a conhecê-lo melhor.
              </Text>
              <View style={s.heroDonationStrip}>
                <Text style={s.heroDonationText}>
                  Por cada perfil concluído doamos <Text style={s.heroDonationHighlight}>1€</Text>
                </Text>
              </View>
              <TouchableOpacity style={s.heroCta} onPress={() => router.push('/buddyid/flow' as any)} activeOpacity={0.88}>
                <Text style={s.heroCtaText}>Começar agora</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push('/buddyid/auth?mode=login_only' as any)} style={{ marginTop: 12, alignSelf: 'center' }}>
                <Text style={{ fontFamily: font.medium, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Já tens conta? Iniciar sessão</Text>
              </TouchableOpacity>
            </View>

            {/* ── Como funciona ── */}
            <Text style={s.sectionTitle}>Como funciona</Text>
            {HOW_IT_WORKS.map((item) => (
              <View key={item.n} style={s.stepRow}>
                <View style={s.stepBadge}>
                  <Text style={s.stepNum}>{item.n}</Text>
                </View>
                <View style={s.stepCard}>
                  <Text style={s.stepTitle}>{item.title}</Text>
                  <Text style={s.stepSub}>{item.sub}</Text>
                </View>
              </View>
            ))}

            {/* ── Secção 1: Visão ── */}
            <Text style={s.sectionTitle}>A nossa visão</Text>
            <Text style={s.sectionIntro}>
              Ao criar o perfil detalhado do teu cão, passas a fazer parte do ecossistema Buddy que será lançado em Lisboa.
            </Text>

            {VISION_CARDS.map((card) => (
              <View key={card.title} style={s.visionCard}>
                <View style={s.visionIconWrap}>
                  <SvgXml xml={card.icon} width={20} height={20} />
                </View>
                <View style={s.visionContent}>
                  <View style={s.visionTitleRow}>
                    <Text style={s.visionTitle}>{card.title}</Text>
                    {card.badge && (
                      <View style={s.pill}>
                        <Text style={s.pillText}>{card.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.visionSub}>{card.sub}</Text>
                </View>
              </View>
            ))}

            {/* ── Buddy Fund entry card ── */}
            <TouchableOpacity
              style={s.fundCard}
              onPress={() => router.push('/buddyid/buddy-fund' as any)}
              activeOpacity={0.88}
            >
              <View style={s.fundGlow} />
              <View style={s.fundPill}><Text style={s.fundPillText}>Buddy Fund</Text></View>
              <View style={s.fundRow}>
                <Text style={s.fundTitle}>Um cão com família ajuda um que ainda não tem</Text>
                <Text style={s.fundChevron}>{'›'}</Text>
              </View>
              <Text style={s.fundSub}>Cada serviço na Buddy apoia quem ainda espera por uma casa.</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Reusing existing NavBar Component since we extracted it out */}
      <NavBar />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing[8] },

  // ── Header ──
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.cardBorder,
  },
  headerSub: {
    fontFamily: font.regular,
    fontSize: 11,
    color: T.aux,
    marginTop: 3,
  },

  // ── Hero Card ──
  heroCard: {
    marginHorizontal: spacing[6],
    marginTop: spacing[4],
    marginBottom: spacing[2],
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  heroDecoration: {
    position: 'absolute',
    right: -20,
    top: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing[3],
  },
  heroPillText: {
    fontFamily: font.semiBold,
    fontSize: 11,
    color: colors.primary,
  },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: 20,
    color: '#fff',
    marginBottom: spacing[2],
    lineHeight: 26,
  },
  heroSub: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing[3],
    lineHeight: 20,
  },
  heroDonationStrip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing[4],
  },
  heroDonationText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  heroDonationHighlight: {
    fontFamily: font.bold,
    color: '#FFFFFF',
  },
  heroCta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaText: {
    fontFamily: font.semiBold,
    fontSize: 15,
    color: colors.primary,
  },

  // ── Como funciona ──
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: T.sectionTitle,
    marginTop: spacing[6],
    marginBottom: spacing[3],
    marginHorizontal: spacing[6],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[6],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { fontFamily: font.bold, fontSize: fontSize.base, color: '#fff' },
  stepCard: {
    flex: 1,
    backgroundColor: T.cardBg,
    borderRadius: T.cardRadius,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: T.cardBorder,
  },
  stepTitle: {
    fontFamily: font.semiBold,
    fontSize: 13,
    color: T.titleColor,
  },
  stepSub: {
    fontFamily: font.regular,
    fontSize: 12,
    color: T.subColor,
    marginTop: 2,
    lineHeight: 17,
  },

  // ── Secção 1: Visão ──
  sectionIntro: {
    fontFamily: font.regular,
    fontSize: 12,
    color: T.subColor,
    marginHorizontal: spacing[6],
    marginTop: -spacing[1],
    marginBottom: spacing[3],
    lineHeight: 18,
  },
  visionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing[6],
    marginBottom: spacing[2],
    backgroundColor: T.cardBg,
    borderRadius: T.cardRadius,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: spacing[3],
    gap: spacing[3],
    shadowColor: '#6B5EBF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  visionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  visionContent: { flex: 1 },
  visionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  visionTitle: {
    fontFamily: font.semiBold,
    fontSize: 13,
    color: T.titleColor,
    flexShrink: 1,
  },
  visionSub: {
    fontFamily: font.regular,
    fontSize: 12,
    color: T.subColor,
    lineHeight: 17,
  },

  // ── Pill badge (ghost, node 21:48 style) ──
  pill: {
    backgroundColor: T.accentTint,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: font.semiBold,
    fontSize: 10,
    color: T.accent,
  },

  // ── Buddy Fund card ──
  fundCard: {
    marginHorizontal: spacing[6],
    marginTop: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  fundGlow: {
    position: 'absolute', right: -20, top: -20,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fundPill: {
    alignSelf: 'flex-start', backgroundColor: '#FFFFFF',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: spacing[3],
  },
  fundPillText: { fontFamily: font.semiBold, fontSize: 11, color: colors.primary },
  fundRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2], marginBottom: spacing[2] },
  fundTitle: { fontFamily: font.bold, fontSize: 17, color: '#fff', flex: 1, lineHeight: 24 },
  fundSub: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },
  fundChevron: { fontSize: 24, color: 'rgba(255,255,255,0.6)', fontFamily: font.regular, lineHeight: 28 },

  // ── Dashboard Styles ──
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  dashboard: { paddingHorizontal: spacing[6], paddingTop: spacing[5], paddingBottom: spacing[8] },
  welcomeText: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing[1] },
  dashboardTitle: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing[6] },
  
  switcher: { marginBottom: spacing[5] },
  switcherContent: { gap: spacing[3] },
  switcherItem: { alignItems: 'center', width: 72 },
  switcherAvatarWrap: { 
    width: 60, height: 60, borderRadius: 30, padding: 2, borderWidth: 2, 
    borderColor: 'transparent', marginBottom: spacing[2], opacity: 0.6 
  },
  switcherAvatarActive: { borderColor: colors.primary, opacity: 1 },
  switcherAvatar: { width: '100%', height: '100%', borderRadius: 28 },
  avatarFallback: { 
    backgroundColor: 'rgba(107,94,191,0.08)', alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: 'rgba(107,94,191,0.15)' 
  },
  avatarFallbackText: { fontSize: 24, fontFamily: font.bold, color: colors.primary },
  switcherName: { fontSize: fontSize.xs, color: colors.textSecondary, fontFamily: font.medium, textAlign: 'center' },
  switcherNameActive: { color: colors.primary, fontFamily: font.semiBold },
  
  dogCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: spacing[4], elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  dogPhoto: { width: '100%', height: 180 },
  dogPhotoFallback: { 
    backgroundColor: 'rgba(107,94,191,0.05)', alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: 'rgba(107,94,191,0.1)' 
  },
  dogPhotoFallbackText: { fontSize: 60, fontFamily: font.bold, color: colors.primary },
  dogInfo: { padding: spacing[4] },
  dogName: { fontSize: fontSize.lg, fontFamily: font.bold, color: colors.text, marginBottom: spacing[1] },
  dogMeta: { fontSize: fontSize.sm, fontFamily: font.regular, color: colors.textSecondary, marginBottom: spacing[4] },
  buddyIdBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  buddyIdBtnText: { color: '#fff', fontFamily: font.semiBold, fontSize: fontSize.base },
  
  addDogBtn: { 
    marginTop: spacing[2], height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', backgroundColor: 'transparent' 
  },
  addDogText: { color: colors.primary, fontFamily: font.semiBold, fontSize: fontSize.base },
});
