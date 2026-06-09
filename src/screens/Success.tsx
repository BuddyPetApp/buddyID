import { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, radius, spacing } from '../tokens';
import { CheckIcon, ShareIcon, ChevronRightIcon, StarIcon, EyeIcon } from '../components/Icons';

const BUDDYID_RESULT_KEY = 'buddyid_result';
interface Result { dogName: string; breed: string; age: string; buddyId: string; completionPercent: number; gender?: string; }

export default function Success() {
  const { t } = useTranslation();
  const [results,       setResults]       = useState<Result[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(BUDDYID_RESULT_KEY).then((raw) => {
      if (raw) { const p = JSON.parse(raw); setResults(Array.isArray(p) ? p : [p]); }
    });
  }, []);

  async function handleShare() {
    const r = results[selectedIndex];
    if (!r) return;
    const baseWebUrl = process.env.EXPO_PUBLIC_FORM_WEB_URL || 'http://localhost:8081';
    const link = `${baseWebUrl}/buddyid/public/${r.buddyId}`;
    
    const isFemale = r.gender === 'Fêmea';
    const message = isFemale 
      ? t('buddyId.flow.successShareMessageFemale', { name: r.dogName, buddyId: r.buddyId })
      : t('buddyId.flow.successShareMessageMale', { name: r.dogName, buddyId: r.buddyId });
      
    await Share.share({ message, url: link });
  }

  const current = results[selectedIndex];
  const pct     = current?.completionPercent ?? 65;
  
  const allFemale = results.every(r => r.gender === 'Fêmea');

  let title = '...';
  if (current && results.length === 1) {
    title = current.gender === 'Fêmea'
      ? t('buddyId.flow.successTitleFemale', { name: results[0].dogName })
      : t('buddyId.flow.successTitleMale', { name: results[0].dogName });
  } else if (current && results.length > 1) {
    const names = results.map(r => r.dogName).join(', ');
    title = allFemale 
      ? t('buddyId.flow.successTitlePluralFemale', { names })
      : t('buddyId.flow.successTitlePluralMale', { names });
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>{title}</Text>

        {results.length > 1 && (
          <View style={s.selector}>
            {results.map((r, i) => (
              <TouchableOpacity key={r.buddyId} style={[s.selectorItem, i === selectedIndex && s.selectorItemActive]} onPress={() => setSelectedIndex(i)}>
                <Text style={[s.selectorLetter, i === selectedIndex && s.selectorLetterActive]}>{r.dogName[0].toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={s.card} activeOpacity={0.88} onPress={() => current?.buddyId && router.push(`/buddyid/dog/${current.buddyId}` as any)}>
          <View style={s.avatar}><Text style={s.avatarLetter}>{current?.dogName?.[0]?.toUpperCase() ?? '?'}</Text></View>
          <View style={s.cardInfo}>
            <Text style={s.cardName}>{current?.dogName ?? '...'}</Text>
            <Text style={s.cardBreed}>{current?.breed}{current?.age ? ` · ${current.age}` : ''}</Text>
            <Text style={s.cardId}>{current?.buddyId}</Text>
            <View style={s.founderBadge}>
              <StarIcon size={11} color="#92400E" strokeWidth={2} />
              <Text style={s.founderBadgeText}>{t('buddyId.flow.successFounder')}</Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <View style={s.progressBlock}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>{t('buddyId.flow.successProfileComplete')}</Text>
            <Text style={s.progressPct}>{pct}%</Text>
          </View>
          <View style={s.progressTrack}><View style={[s.progressFill, { width: `${pct}%` as any }]} /></View>
          <Text style={s.progressHint}>{t('buddyId.flow.successProfileHint')}</Text>
        </View>

        <TouchableOpacity style={s.ctaPrimary} onPress={() => current?.buddyId && router.push(`/buddyid/dog/${current.buddyId}` as any)}>
          <CheckIcon size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.ctaPrimaryText}>{t('buddyId.flow.successCompleteProfile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ctaSecondary} onPress={() => current?.buddyId && router.push(`/buddyid/public/${current.buddyId}` as any)}>
          <EyeIcon size={18} color={colors.primary} />
          <Text style={s.ctaSecondaryText}>{t('buddyId.flow.successPublicBuddyId')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ctaSecondary} onPress={handleShare}>
          <ShareIcon size={18} color={colors.primary} />
          <Text style={s.ctaSecondaryText}>
            {current?.gender === 'Fêmea' 
              ? t('buddyId.flow.successShareBtnFemale', { name: current.dogName }) 
              : t('buddyId.flow.successShareBtnMale', { name: current?.dogName ?? '...' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ctaGhost} onPress={() => router.replace('/buddyid' as any)}>
          <Text style={s.ctaGhostText}>{t('buddyId.flow.successGoHome')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[10], paddingBottom: spacing[10] },
  title:   { fontFamily: font.bold, fontSize: fontSize.xxl, color: '#fff', textAlign: 'center', lineHeight: 42, marginBottom: spacing[6] },

  selector:             { flexDirection: 'row', justifyContent: 'center', gap: spacing[3], marginBottom: spacing[6] },
  selectorItem:         { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  selectorItemActive:   { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.3)' },
  selectorLetter:       { fontFamily: font.bold, fontSize: fontSize.md, color: 'rgba(255,255,255,0.7)' },
  selectorLetterActive: { color: '#fff' },

  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radius.xl, padding: spacing[4], gap: spacing[3], marginBottom: spacing[5] },
  avatar:      { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarLetter:{ fontFamily: font.bold, fontSize: fontSize.xl, color: '#fff' },
  cardInfo:    { flex: 1 },
  cardName:    { fontFamily: font.semiBold, fontSize: fontSize.md, color: '#fff' },
  cardBreed:   { fontFamily: font.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  cardId:      { fontFamily: font.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.45)', marginTop: 2, marginBottom: spacing[2] },
  founderBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#FEF3C7', borderRadius: radius.full, paddingVertical: 3, paddingHorizontal: 8 },
  founderBadgeText:{ fontFamily: font.semiBold, fontSize: fontSize.xs, color: '#92400E' },

  progressBlock: { marginBottom: spacing[6] },
  progressRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
  progressLabel: { fontFamily: font.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  progressPct:   { fontFamily: font.bold, fontSize: fontSize.sm, color: '#fff' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: spacing[2] },
  progressFill:  { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  progressHint:  { fontFamily: font.regular, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.5)' },

  ctaPrimary:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: colors.primaryDark, borderRadius: radius.lg, height: 52, marginBottom: spacing[3] },
  ctaPrimaryText:  { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
  ctaSecondary:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: '#fff', borderRadius: radius.lg, height: 52, marginBottom: spacing[3] },
  ctaSecondaryText:{ fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.primary },
  ctaGhost:        { alignItems: 'center', paddingVertical: spacing[3] },
  ctaGhostText:    { fontFamily: font.medium, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)' },
});
