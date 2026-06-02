import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo, Logomark } from '../components/Logo';

const HOW_IT_WORKS = [
  { n: '1', title: 'Raça e perfil genético', sub: 'Quem o teu cão é por dentro' },
  { n: '2', title: 'Condição física e saúde', sub: 'Como vive, dorme e se mexe' },
  { n: '3', title: 'Vida do tutor', sub: 'O vosso contexto e rotina juntos' },
];

const NAV_ITEMS = [
  { label: 'BuddyID', route: '/buddyid' },
  { label: 'Sobre nós', route: '/buddyid/sobre-nos' },
  { label: 'Parceiros', route: '/buddyid/parceiros' },
  { label: 'Contacto', route: '/buddyid/contacto' },
];

export default function Landing() {
  const pathname = usePathname();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Logo variant="dark" size="md" />
          <Text style={s.headerSub}>O passaporte digital do teu cão</Text>
        </View>

        <View style={s.heroCard}>
          <View style={s.heroDecoration} />
          <Text style={s.heroTitle}>Cria o BuddyID do teu cão</Text>
          <Text style={s.heroSub}>O passaporte digital em 5 minutos.{'\n'}Ajuda-nos a conhecê-lo melhor.</Text>
          <TouchableOpacity style={s.heroCta} onPress={() => router.push('/buddyid/flow' as any)}>
            <Text style={s.heroCtaText}>Começar agora →</Text>
          </TouchableOpacity>
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
      </ScrollView>

      <View style={s.nav}>
        {NAV_ITEMS.map((item, i) => {
          const active = pathname === item.route || (i === 0 && pathname === '/buddyid');
          return (
            <TouchableOpacity key={item.label} style={s.navItem} onPress={() => router.push(item.route as any)}>
              {i === 0
                ? <Logomark color={active ? '#fff' : 'rgba(255,255,255,0.5)'} size={22} />
                : <View style={[s.navIcon, active && s.navIconActive]} />}
              <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  heroCta: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.primary,
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
  stepTitle: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text },
  stepSub: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingBottom: spacing[2],
    paddingTop: spacing[2],
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: spacing[2] },
  navIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navIconActive: { backgroundColor: 'transparent' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  navLabel: { fontFamily: font.medium, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  navLabelActive: { color: '#fff', fontFamily: font.semiBold },
});
