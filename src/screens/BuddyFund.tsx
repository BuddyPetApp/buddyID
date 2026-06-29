import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { NavBar } from '../components/NavBar';
import { ChevronLeftIcon } from '../components/Icons';

export default function BuddyFund() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <ChevronLeftIcon size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Caixa cheia */}
        <View style={s.heroCard}>
          <View style={s.heroGlow} />
          <View style={s.heroPill}>
            <Text style={s.heroPillText}>Buddy Fund</Text>
          </View>
          <Text style={s.heroTitle}>Um cão com família ajuda um que ainda não tem</Text>
          <View style={s.heroStrip}>
            <Text style={s.heroStripText}>
              {'Por cada cão da First Pack que ative o perfil com o primeiro serviço, doamos '}
              <Text style={s.heroStripBold}>1€</Text>
              {' a uma associação parceira. A First Pack é o grupo de tutores que se regista antes do lançamento.'}
            </Text>
          </View>
        </View>

        {/* Mensagem dos fundadores */}
        <View style={s.messageBlock}>
          <Text style={s.messageLabel}>Uma palavra nossa</Text>
          <Text style={s.messageBody}>
            {'A Buddy nasceu para cuidar de cães. '}
            <Text style={s.messageBold}>De todos</Text>
            {', incluindo os que ainda esperam por uma casa. '}
            <Text style={s.messageBold}>Não somos uma instituição de caridade.</Text>
            {' Somos um negócio com uma missão: '}
            <Text style={s.messageBold}>construir um Portugal que trata melhor os seus cães</Text>
            {', mais consciente, onde menos animais ficam para trás. O '}
            <Text style={s.messageFund}>Buddy Fund</Text>
            {' é a forma como pomos isso em prática '}
            <Text style={s.messageBold}>desde o primeiro dia</Text>
            {'. Queremos fazer este caminho com as associações que já vivem esta missão no terreno.'}
          </Text>
          <Text style={s.messageSignature}>Guilherme e Afonso, fundadores da Buddy</Text>
        </View>

        {/* Candidatura */}
        <View style={s.applyCard}>
          <Text style={s.applyTitle}>Representas uma associação?</Text>
          <Text style={s.applyBody}>
            Estamos a formar a rede de associações parceiras da Buddy. Conta-nos sobre o vosso trabalho.
          </Text>
          <TouchableOpacity
            style={s.applyBtn}
            onPress={() => router.navigate('/buddyid/associations' as any)}
            activeOpacity={0.85}
          >
            <Text style={s.applyBtnText}>Candidatar a minha associação</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], height: 60,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[10] },

  // Caixa cheia
  heroCard: {
    backgroundColor: colors.primary, borderRadius: 20, padding: 24,
    marginBottom: spacing[7], overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', right: -24, top: -24,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroPill: {
    alignSelf: 'flex-start', backgroundColor: '#FFFFFF',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: spacing[3],
  },
  heroPillText: { fontFamily: font.semiBold, fontSize: 11, color: colors.primary },
  heroTitle: { fontFamily: font.bold, fontSize: 20, color: '#fff', marginBottom: spacing[3], lineHeight: 28 },
  heroStrip: {
    backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  heroStripText: { fontFamily: font.regular, fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  heroStripBold: { fontFamily: font.bold, color: '#fff' },

  // Mensagem dos fundadores
  messageBlock: {
    marginBottom: spacing[7],
  },
  messageLabel: {
    fontFamily: font.semiBold, fontSize: 13,
    color: colors.primary, marginBottom: spacing[3],
  },
  messageBody: {
    fontFamily: font.regular, fontSize: 15,
    color: colors.textSecondary, lineHeight: 26,
    marginBottom: spacing[3],
  },
  messageBold: {
    fontFamily: font.bold, color: colors.text,
  },
  messageFund: {
    fontFamily: font.bold, color: colors.primary,
  },
  messageSignature: {
    fontFamily: font.regular, fontSize: 12,
    color: '#8c84a0',
    fontStyle: 'italic',
  },

  // Candidatura
  applyCard: {
    backgroundColor: '#F1EEFA', borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderSoft, padding: 20,
  },
  applyTitle: { fontFamily: font.bold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing[2] },
  applyBody: {
    fontFamily: font.regular, fontSize: fontSize.base,
    color: colors.textSecondary, lineHeight: 22, marginBottom: spacing[5],
  },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontFamily: font.semiBold, fontSize: 15, color: '#fff' },
});
