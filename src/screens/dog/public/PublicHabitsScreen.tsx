import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../../tokens';
import { apiClient } from '../../../api/client';
import { DOG_COLORS, DOG_RADIUS, DOG_SHADOW, DogScreenShell } from '../_shared';
import { FOOD_TYPE_LABELS_PT, ACTIVITY_LEVEL_LABELS_PT } from '../../../types/dog';

export default function PublicHabitsScreen({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}/public`)
      .then((data: any) => {
        if (data && data.habitsJson) {
          try {
            setHabits(JSON.parse(data.habitsJson));
          } catch {}
        }
      })
      .catch((err: any) => {
        console.error('Error fetching habits:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editHabits.habits')} onBack={() => router.replace(`/buddyid/public/${id}` as any)}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  const { food, activity, lifestyle, goals, services, housemates, separationAnxiety } = habits;

  const hasFood = food && (food.type || food.mealsPerDay || food.brand || food.restrictionsNotes);
  const hasActivity = activity && (activity.level || activity.walksPerDay || activity.avgDuration);
  const hasLifestyle = lifestyle && (lifestyle.housing || lifestyle.sleepingPlace || lifestyle.exerciseDuration);
  const hasPreferences = (goals && goals.length > 0) || (services && services.length > 0) || (housemates && housemates.length > 0) || separationAnxiety;

  return (
    <DogScreenShell
      title={t('tutor.editHabits.habits')}
      contentBackground={colors.canvas}
      onBack={() => router.replace(`/buddyid/public/${id}` as any)}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {hasFood && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHabits.food')}</Text>
            <View style={styles.cardContent}>
              <InfoRow label={t('tutor.editHabits.typeOfFood')} value={food.type ? FOOD_TYPE_LABELS_PT[food.type as keyof typeof FOOD_TYPE_LABELS_PT] : null} />
              <InfoRow label={t('tutor.editHabits.mealsPerDay')} value={food.mealsPerDay ? `${food.mealsPerDay}` : null} />
              <InfoRow label={t('tutor.editHabits.favoriteBrand')} value={food.brand} />
              <InfoBlock label={t('tutor.editHabits.restrictionsOrNotes')} text={food.restrictionsNotes} />
            </View>
          </View>
        )}

        {hasActivity && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHabits.activity')}</Text>
            <View style={styles.cardContent}>
              <InfoRow label={t('tutor.editHabits.activityLevel')} value={activity.level ? ACTIVITY_LEVEL_LABELS_PT[activity.level as keyof typeof ACTIVITY_LEVEL_LABELS_PT] : null} />
              <InfoRow label={t('tutor.editHabits.walksPerDay')} value={activity.walksPerDay ? `${activity.walksPerDay}` : null} />
              <InfoRow label={t('tutor.editHabits.avgWalkDuration')} value={activity.avgDuration ? `${activity.avgDuration} min` : null} />
            </View>
          </View>
        )}

        {hasLifestyle && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHabits.routineAndLifestyle')}</Text>
            <View style={styles.cardContent}>
              <InfoRow label={t('tutor.editHabits.housing')} value={lifestyle.housing} />
              <InfoRow label={t('tutor.editHabits.sleepingPlace')} value={lifestyle.sleepingPlace} />
              <InfoRow label={t('tutor.editHabits.dailyExerciseTime')} value={lifestyle.exerciseDuration} />
            </View>
          </View>
        )}

        {hasPreferences && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHabits.preferencesAndServices')}</Text>
            <View style={styles.cardContent}>
              {goals && goals.length > 0 && <InfoTags label="Objetivos" tags={goals} />}
              {services && services.length > 0 && <InfoTags label="Serviços Procurados" tags={services} />}
              {housemates && housemates.length > 0 && <InfoTags label="Partilha casa com" tags={housemates} />}
              {separationAnxiety && <InfoRow label="Ansiedade de separação" value={separationAnxiety} />}
            </View>
          </View>
        )}

        {!hasFood && !hasActivity && !hasLifestyle && !hasPreferences && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Não existem hábitos registados para este cão.</Text>
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

function InfoBlock({ label, text }: { label: string; text?: string | null }) {
  if (!text) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.blockText}>{text}</Text>
    </View>
  );
}

function InfoTags({ label, tags }: { label: string; tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <View style={styles.block}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
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
    marginBottom: spacing[4],
  },
  cardContent: {
    gap: spacing[4],
  },
  row: {
    flexDirection: 'column',
    gap: spacing[1],
  },
  rowLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  block: {
    flexDirection: 'column',
    gap: spacing[2],
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
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: DOG_RADIUS.pill,
  },
  tagText: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.text,
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
