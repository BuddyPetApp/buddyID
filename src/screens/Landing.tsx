import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { NavBar } from '../components/NavBar';
import { supabase } from '../lib/supabase';
import { apiClient } from '../api/client';

const HOW_IT_WORKS = [
  { n: '1', title: 'Raça e perfil genético', sub: 'Quem o teu cão é por dentro' },
  { n: '2', title: 'Condição física e saúde', sub: 'Como vive, dorme e se mexe' },
  { n: '3', title: 'Vida do tutor', sub: 'O vosso contexto e rotina juntos' },
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
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Logo variant="dark" size="md" />
          <Text style={s.headerSub}>O passaporte digital do teu cão</Text>
        </View>

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
            <View style={s.introSection}>
              <Text style={s.introTitle}>Encontra os melhores serviços para o teu cão</Text>
              <Text style={s.introDesc}>
                A Buddy liga-te aos melhores prestadores de serviços de Passeio, Pet Sitting, Treino e Banho/Corte. Ao mesmo tempo, o BuddyID analisa o comportamento, saúde e rotinas do teu cão para garantir um acompanhamento totalmente personalizado.
              </Text>
            </View>

            <View style={s.heroCard}>
              <View style={s.heroDecoration} />
              <Text style={s.heroTitle}>Cria o BuddyID do teu cão</Text>
              <Text style={s.heroSub}>O passaporte digital em 5 minutos.{'\n'}Ajuda-nos a conhecê-lo melhor.</Text>
              <View style={s.heroCtaRow}>
                <TouchableOpacity style={s.heroCta} onPress={() => router.push('/buddyid/flow' as any)}>
                  <Text style={s.heroCtaText}>Começar agora →</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={s.heroLoginBtn} onPress={() => router.push('/buddyid/auth?mode=login_only' as any)}>
                  <Text style={s.heroLoginText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>

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
          </>
        )}
      </ScrollView>

      <NavBar />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing[4] },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
    backgroundColor: colors.surface,
  },
  headerSub: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  introSection: {
    paddingHorizontal: spacing[6],
    marginTop: spacing[5],
    marginBottom: spacing[1],
  },
  introTitle: {
    fontFamily: font.bold,
    fontSize: 22,
    color: colors.text,
    lineHeight: 28,
  },
  introDesc: {
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing[2],
  },
  heroCard: {
    marginHorizontal: spacing[6],
    marginTop: spacing[4],
    marginBottom: spacing[2],
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing[5],
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
  heroTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: '#fff',
    width: 220,
    marginBottom: spacing[2],
  },
  heroSub: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing[6],
    lineHeight: 20,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  heroCta: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  heroCtaText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.primary,
  },
  heroLoginBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  heroLoginText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: '#fff',
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  stepTitle: { fontFamily: font.bold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing[1] },
  stepSub: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  
  // Dashboard Styles
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
