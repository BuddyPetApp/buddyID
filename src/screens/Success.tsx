import { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { Button } from '../components/Button';

const BUDDYID_RESULT_KEY = 'buddyid_result';

interface BuddyIDResult {
  dogName: string;
  breed: string;
  age: string;
  size?: string;
  buddyId: string;
  completionPercent: number;
}

export default function Success() {
  const [result, setResult] = useState<BuddyIDResult | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(BUDDYID_RESULT_KEY).then((raw) => {
      if (raw) setResult(JSON.parse(raw));
    });
  }, []);

  async function handleShare() {
    if (!result) return;
    await Share.share({
      message: `O BuddyID do meu cão é ${result.buddyId}!`,
    });
  }

  if (!result) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.flex} />
      </SafeAreaView>
    );
  }

  const initial = result.dogName.charAt(0).toUpperCase();
  const breedAge = [result.breed, result.age].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.celebRow}>
          <Text style={s.celebEmoji}>🎉</Text>
        </View>

        <Text style={s.headline}>BuddyID criado com sucesso!</Text>

        <View style={s.card}>
          <View style={s.avatarRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initial}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.dogName}>{result.dogName}</Text>
              {!!breedAge && <Text style={s.breedAge}>{breedAge}</Text>}
              <Text style={s.buddyId}>{result.buddyId}</Text>
            </View>
          </View>

          <View style={s.completionSection}>
            <View style={s.completionLabelRow}>
              <Text style={s.completionLabel}>Perfil completo</Text>
              <View style={s.completionBadge}>
                <Text style={s.completionBadgeText}>{result.completionPercent}%</Text>
              </View>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${result.completionPercent}%` as any }]} />
            </View>
          </View>
        </View>

        <Button
          label={`Partilhar o BuddyID do ${result.dogName}`}
          onPress={handleShare}
          variant="primary"
          size="lg"
        />

        <View style={s.gap} />

        <TouchableOpacity
          style={s.secondDogLink}
          onPress={() => router.push('/buddyid/second-dog' as any)}
          activeOpacity={0.7}
        >
          <Text style={s.secondDogText}>Adicionar segundo cão</Text>
        </TouchableOpacity>

        <View style={s.gap} />

        <Button
          label="Explorar marketplace"
          onPress={() => router.push('/buddyid/providers' as any)}
          variant="outline"
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[10] },
  celebRow: { alignItems: 'center', paddingTop: spacing[8], marginBottom: spacing[4] },
  celebEmoji: { fontSize: 56 },
  headline: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[6],
    ...shadows.elevated,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: '#fff',
  },
  cardInfo: { flex: 1 },
  dogName: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing[1],
  },
  breedAge: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  buddyId: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  completionSection: {},
  completionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  completionLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  completionBadge: {
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  completionBadgeText: {
    fontFamily: font.bold,
    fontSize: fontSize.xs,
    color: '#fff',
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  gap: { height: spacing[3] },
  secondDogLink: { alignItems: 'center', paddingVertical: spacing[3] },
  secondDogText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.primary,
  },
});
