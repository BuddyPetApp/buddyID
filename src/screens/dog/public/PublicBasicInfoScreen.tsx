import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../../tokens';
import { apiClient } from '../../../api/client';
import { DOG_COLORS, DOG_RADIUS, DogScreenShell } from '../_shared';
import { GENDER_LABELS_PT, SIZE_LABELS_PT, TEMPERAMENT_LABELS_PT, ageFromBirthdate } from '../../../types/dog';

function isoToDisplay(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export default function PublicBasicInfoScreen({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}/public`)
      .then((data: any) => {
        setProfile(data);
      })
      .catch((err: any) => {
        console.error('Error fetching dog:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !profile) {
    return (
      <DogScreenShell title={t('tutor.editBasicInfo.basicInformation')} onBack={() => router.replace(`/buddyid/public/${id}` as any)}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  const age = profile.birthdate ? ageFromBirthdate(profile.birthdate) : null;
  const isSterilizedStr = profile.neutered === 'yes' ? t('tutor.editBasicInfo.yes') : profile.neutered === 'no' ? t('tutor.editBasicInfo.no') : null;
  let temperament: string[] = [];
  try {
    const habits = profile.habitsJson ? JSON.parse(profile.habitsJson) : {};
    temperament = habits.temperament || [];
  } catch {}

  return (
    <DogScreenShell
      title={t('tutor.editBasicInfo.basicInformation')}
      contentBackground={DOG_COLORS.white}
      onBack={() => router.replace(`/buddyid/public/${id}` as any)}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerArea}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoEmpty]} />
          )}
          <Text style={styles.dogName}>{profile.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label={t('tutor.editBasicInfo.gender')} value={profile.gender ? GENDER_LABELS_PT[profile.gender as keyof typeof GENDER_LABELS_PT] : null} />
          <InfoRow label={t('tutor.editBasicInfo.breed')} value={profile.breed} />
          <InfoRow label={t('tutor.editBasicInfo.sterilization')} value={isSterilizedStr} />
          <InfoRow label={t('tutor.editBasicInfo.dateOfBirth')} value={isoToDisplay(profile.birthdate) + (age ? ` (${age})` : '')} />
          <InfoRow label={t('tutor.editBasicInfo.weight')} value={profile.weightKg ? `${profile.weightKg} kg` : null} />
          <InfoRow label={t('tutor.editBasicInfo.size')} value={profile.size ? SIZE_LABELS_PT[profile.size as keyof typeof SIZE_LABELS_PT] : null} isLast />
        </View>

        {temperament.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tutor.editBasicInfo.temperament')}</Text>
            <View style={styles.tagsContainer}>
              {temperament.map((tKey) => (
                <View key={tKey} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{TEMPERAMENT_LABELS_PT[tKey as keyof typeof TEMPERAMENT_LABELS_PT]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </DogScreenShell>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value?: string | null; isLast?: boolean }) {
  if (!value) return null;
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 60 },
  headerArea: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
  },
  photoEmpty: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  dogName: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    marginTop: spacing[4],
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: DOG_RADIUS.card,
    marginHorizontal: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  rowValue: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  section: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing[3],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagBadge: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: DOG_RADIUS.pill,
  },
  tagText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
