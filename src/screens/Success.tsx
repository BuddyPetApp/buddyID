import { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';

const BUDDYID_RESULT_KEY = 'buddyid_result';

interface BuddyIDResult {
  dogName: string;
  breed: string;
  age: string;
  size?: string;
  buddyId: string;
  completionPercent: number;
}

const CONFETTI = [
  { x: 35, y: 70, w: 13, h: 10, color: '#FF6B6B', r: -15 },
  { x: 85, y: 40, w: 9, h: 15, color: '#4ECDC4', r: 10 },
  { x: 145, y: 25, w: 15, h: 11, color: '#FFE66D', r: -5 },
  { x: 215, y: 55, w: 9, h: 9, color: '#A29BFE', r: 20 },
  { x: 285, y: 35, w: 9, h: 17, color: '#FD79A8', r: -10 },
  { x: 340, y: 80, w: 12, h: 9, color: '#6C5CE7', r: 5 },
  { x: 368, y: 130, w: 11, h: 11, color: '#00B894', r: -20 },
  { x: 55, y: 165, w: 11, h: 14, color: '#E17055', r: 15 },
  { x: 315, y: 170, w: 11, h: 7, color: '#74B9FF', r: -8 },
  { x: 175, y: 95, w: 17, h: 9, color: '#55EFC4', r: 12 },
  { x: 108, y: 125, w: 10, h: 10, color: '#FDCB6E', r: -18 },
  { x: 258, y: 105, w: 6, h: 12, color: '#FF7675', r: 8 },
  { x: 18, y: 115, w: 9, h: 9, color: '#81ECEC', r: -12 },
  { x: 378, y: 55, w: 9, h: 13, color: '#DFE6E9', r: 18 },
  { x: 130, y: 65, w: 8, h: 8, color: '#BADC58', r: -6 },
  { x: 240, y: 80, w: 7, h: 7, color: '#F9CA24', r: 22 },
];

export default function Success() {
  const [results, setResults] = useState<BuddyIDResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(BUDDYID_RESULT_KEY).then((raw) => {
      if (raw) {
        const parsed = JSON.parse(raw);
        setResults(Array.isArray(parsed) ? parsed : [parsed]);
      }
    });
  }, []);

  async function handleShare() {
    const current = results[selectedIndex];
    if (!current) return;
    await Share.share({ message: `O BuddyID do ${current.dogName} é ${current.buddyId}! Cria o teu em buddy.pet 🐾` });
  }

  const current = results[selectedIndex];
  const initial = current?.dogName?.[0]?.toUpperCase() ?? '?';
  const pct = current?.completionPercent ?? 65;

  let titleText = '...';
  if (results.length === 1) {
    titleText = `O ${results[0].dogName} está\nregistado!`;
  } else if (results.length > 1) {
    const names = results.map(r => r.dogName);
    const last = names.pop();
    titleText = `O ${names.join(', ')} e o ${last} estão\nregistados!`;
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Confetti */}
        <View style={s.confettiArea} pointerEvents="none">
          {CONFETTI.map((c, i) => (
            <View
              key={i}
              style={[s.confettiPiece, {
                left: c.x,
                top: c.y,
                width: c.w,
                height: c.h,
                backgroundColor: c.color,
                transform: [{ rotate: `${c.r}deg` }],
              }]}
            />
          ))}
        </View>

        <Text style={s.title}>{titleText}</Text>

        {/* Dog Selector */}
        {results.length > 1 && (
          <View style={s.selector}>
            {results.map((r, i) => {
              const isSelected = i === selectedIndex;
              return (
                <TouchableOpacity
                  key={r.buddyId}
                  style={[s.selectorAvatar, isSelected && s.selectorAvatarActive]}
                  onPress={() => setSelectedIndex(i)}
                >
                  <Text style={[s.selectorAvatarText, isSelected && s.selectorAvatarTextActive]}>
                    {r.dogName[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Profile card */}
        <TouchableOpacity
          style={s.card}
          onPress={() => current?.buddyId && router.push(`/buddyid/dog/${current.buddyId}` as any)}
        >
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={s.cardInfo}>
            <Text style={s.cardName}>{current?.dogName ?? '...'}</Text>
            <Text style={s.cardBreed}>{current?.breed}{current?.age ? ` · ${current.age}` : ''}</Text>
            <Text style={s.cardId}>{current?.buddyId}</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>⭐ Membro Fundador</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Completion */}
        <Text style={s.pctLabel}>Perfil {pct}% completo</Text>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={s.pctHint}>Quanto mais completo, melhores as recomendações.</Text>

        {/* CTAs */}
        <TouchableOpacity
          style={s.btnComplete}
          onPress={() => current?.buddyId && router.push(`/buddyid/dog/${current.buddyId}` as any)}
        >
          <Text style={s.btnCompleteText}>Completar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btnShare} onPress={handleShare}>
          <Text style={s.btnShareText}>Partilhar o BuddyID do {current?.dogName ?? '...'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline} onPress={() => router.replace('/buddyid' as any)}>
          <Text style={s.btnOutlineText}>Ir para o Início</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
  confettiArea: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  confettiPiece: { position: 'absolute', borderRadius: 2 },
  title: {
    fontFamily: font.bold,
    fontSize: fontSize.xxl,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
    marginTop: 200,
    marginBottom: spacing[5],
  },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  selector: { flexDirection: 'row', justifyContent: 'center', gap: spacing[3], marginBottom: spacing[6] },
  selectorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectorAvatarActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  selectorAvatarText: { fontFamily: font.bold, fontSize: fontSize.md, color: 'rgba(255,255,255,0.8)' },
  selectorAvatarTextActive: { color: '#fff' },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(107,94,191,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.primary },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: font.semiBold, fontSize: fontSize.md, color: colors.text },
  cardBreed: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  cardId: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: spacing[2],
    marginTop: spacing[2],
  },
  badgeText: { fontFamily: font.medium, fontSize: fontSize.xs, color: '#92400E' },
  pctLabel: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing[2],
  },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, marginBottom: spacing[2] },
  progressFill: { height: 5, backgroundColor: '#fff', borderRadius: 3 },
  pctHint: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: spacing[5],
  },
  btnComplete: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  btnCompleteText: { fontFamily: font.bold, fontSize: fontSize.base, color: '#fff' },
  btnShare: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  btnShareText: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.primary },
  btnOutline: {
    borderRadius: 14,
    paddingVertical: spacing[4],
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnOutlineText: { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
});
