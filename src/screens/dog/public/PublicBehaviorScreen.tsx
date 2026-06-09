import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../../tokens';
import { apiClient } from '../../../api/client';
import { DOG_COLORS, DOG_RADIUS, DOG_SHADOW, DogScreenShell } from '../_shared';

export default function PublicBehaviorScreen({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [behavior, setBehavior] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}/public`)
      .then((data: any) => {
        if (data && data.behaviorJson) {
          try {
            setBehavior(JSON.parse(data.behaviorJson));
          } catch {}
        }
      })
      .catch((err: any) => {
        console.error('Error fetching behavior:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editBehavioralProfile.behavioralProfile')} onBack={() => router.replace(`/buddyid/public/${id}` as any)}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  const { socialization, leashBehavior, separationAnxiety, likes, fears, tutorNotes, providerNotes } = behavior;

  const hasSocialization = socialization && (socialization.people || socialization.dogs || socialization.children);
  const hasLeash = leashBehavior && leashBehavior.length > 0;
  const hasAnxiety = !!separationAnxiety;
  const hasLikes = likes && likes.length > 0;
  const hasFears = fears && fears.length > 0;
  const hasNotes = tutorNotes || providerNotes;

  const separationAnxietyOptions: Record<string, string> = {
    calm: t('tutor.editBehavioralProfile.separationAnxietyOptions.calm'),
    vocalizes: t('tutor.editBehavioralProfile.separationAnxietyOptions.vocalizes'),
    anxious: t('tutor.editBehavioralProfile.separationAnxietyOptions.anxious'),
    destructive: t('tutor.editBehavioralProfile.separationAnxietyOptions.destructive'),
    never_alone: t('tutor.editBehavioralProfile.separationAnxietyOptions.never_alone'),
    unknown: t('tutor.editBehavioralProfile.separationAnxietyOptions.unknown'),
  };

  return (
    <DogScreenShell
      title={t('tutor.editBehavioralProfile.behavioralProfile')}
      contentBackground={colors.canvas}
      onBack={() => router.replace(`/buddyid/public/${id}` as any)}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        {hasSocialization && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.socialization')}</Text>
            <View style={styles.cardContent}>
              <InfoRow label={t('tutor.editBehavioralProfile.withPeople')} value={socialization.people ? `${socialization.people} / 5` : null} />
              <InfoRow label={t('tutor.editBehavioralProfile.withDogs')} value={socialization.dogs ? `${socialization.dogs} / 5` : null} />
              <InfoRow label={t('tutor.editBehavioralProfile.withChildren')} value={socialization.children ? `${socialization.children} / 5` : null} />
            </View>
          </View>
        )}

        {(hasLeash || hasAnxiety) && (
          <View style={styles.card}>
            {hasLeash && (
              <View style={styles.section}>
                <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.leashBehavior')}</Text>
                <InfoTags tags={leashBehavior} />
              </View>
            )}
            {hasAnxiety && (
              <View style={[styles.section, hasLeash && { marginTop: spacing[4] }]}>
                <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.separationAnxiety')}</Text>
                <Text style={styles.blockText}>{separationAnxietyOptions[separationAnxiety] || separationAnxiety}</Text>
              </View>
            )}
          </View>
        )}

        {(hasLikes || hasFears) && (
          <View style={styles.card}>
            {hasLikes && (
              <View style={styles.section}>
                <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.likes')}</Text>
                <InfoTags tags={likes} />
              </View>
            )}
            {hasFears && (
              <View style={[styles.section, hasLikes && { marginTop: spacing[4] }]}>
                <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.fearsOrTriggers')}</Text>
                <InfoTags tags={fears} variant="danger" />
              </View>
            )}
          </View>
        )}

        {hasNotes && (
          <View style={styles.card}>
            {tutorNotes && (
              <View style={styles.section}>
                <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.tutorNotes')}</Text>
                <Text style={styles.blockText}>{tutorNotes}</Text>
              </View>
            )}
            {providerNotes && (
              <View style={[styles.section, tutorNotes && { marginTop: spacing[4] }]}>
                <Text style={styles.cardTitle}>{t('tutor.editBehavioralProfile.providerNotes')}</Text>
                <Text style={styles.blockText}>{providerNotes}</Text>
              </View>
            )}
          </View>
        )}

        {!hasSocialization && !hasLeash && !hasAnxiety && !hasLikes && !hasFears && !hasNotes && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Não existe perfil comportamental registado para este cão.</Text>
          </View>
        )}

      </ScrollView>
    </DogScreenShell>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function InfoTags({ tags, variant = 'normal' }: { tags: string[], variant?: 'normal' | 'danger' }) {
  if (!tags || tags.length === 0) return null;
  return (
    <View style={styles.tagsContainer}>
      {tags.map((tag) => (
        <View key={tag} style={[styles.tagBadge, variant === 'danger' && styles.tagBadgeDanger]}>
          <Text style={[styles.tagText, variant === 'danger' && styles.tagTextDanger]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing[4], paddingBottom: 60, gap: spacing[4] },
  card: {
    backgroundColor: DOG_COLORS.white,
    borderRadius: DOG_RADIUS.card,
    padding: spacing[5],
    ...DOG_SHADOW,
  },
  cardTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing[3],
  },
  cardContent: {
    gap: spacing[4],
  },
  section: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    paddingBottom: spacing[2],
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
  blockText: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: 22,
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
  tagBadgeDanger: {
    backgroundColor: '#FFE5E5',
  },
  tagText: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  tagTextDanger: {
    color: '#D32F2F',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
