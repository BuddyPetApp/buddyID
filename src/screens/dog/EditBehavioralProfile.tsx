import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../tokens';
import { apiClient } from '../../api/client';
import {
  ChipsMultiSelect,
  ConfirmButton,
  DOG_COLORS,
  DOG_FONT,
  DOG_RADIUS,
  DOG_SHADOW,
  DogScreenShell,
  FormSection,
  PawSquare,
  ScaleSelector,
  RowButton,
  PickerSheet,
} from './_shared';
import {
  FEARS_OPTIONS_PT,
  LIKES_OPTIONS_PT,
  type DogBehavior,
} from '../../types/dog';

const MAX_NOTES = 500;

export default function EditBehavioralProfile({ id, isReadOnly = false }: { id?: string; isReadOnly?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [behavior, setBehavior] = useState<DogBehavior>({});
  const [notesDraft, setNotesDraft] = useState('');
  const [separationSheetOpen, setSeparationSheetOpen] = useState(false);

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}`)
      .then((data) => {
        if (data) {
          setProfile(data);
          const parsedBehavior = data.behaviorJson ? JSON.parse(data.behaviorJson) : {};
          setBehavior(parsedBehavior);
          setNotesDraft(parsedBehavior.tutorNotes ?? '');
        }
      })
      .catch((err) => {
        console.error('Error fetching dog behavior:', err);
        Alert.alert(t('common.error') || 'Erro', 'Não foi possível carregar o perfil comportamental do cão.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const updateBehavior = (patch: Partial<DogBehavior>) => {
    setBehavior((prev) => {
      const nextSocialization = patch.socialization ? { ...prev.socialization, ...patch.socialization } : prev.socialization;
      return {
        ...prev,
        ...patch,
        socialization: nextSocialization,
      };
    });
  };

  const leashOptions = [
    t('tutor.editBehavioralProfile.leashOptions.loose_leash'),
    t('tutor.editBehavioralProfile.leashOptions.pulls'),
    t('tutor.editBehavioralProfile.leashOptions.reactive_dogs'),
    t('tutor.editBehavioralProfile.leashOptions.reactive_people'),
    t('tutor.editBehavioralProfile.leashOptions.reactive_objects'),
    t('tutor.editBehavioralProfile.leashOptions.depends'),
  ];

  const separationAnxietyOptions = [
    { value: 'calm', label: t('tutor.editBehavioralProfile.separationAnxietyOptions.calm') },
    { value: 'vocalizes', label: t('tutor.editBehavioralProfile.separationAnxietyOptions.vocalizes') },
    { value: 'anxious', label: t('tutor.editBehavioralProfile.separationAnxietyOptions.anxious') },
    { value: 'destructive', label: t('tutor.editBehavioralProfile.separationAnxietyOptions.destructive') },
    { value: 'never_alone', label: t('tutor.editBehavioralProfile.separationAnxietyOptions.never_alone') },
    { value: 'unknown', label: t('tutor.editBehavioralProfile.separationAnxietyOptions.unknown') },
  ];

  const goalsOptions = [
    t('tutor.editBehavioralProfile.goalsOptions.socialization'),
    t('tutor.editBehavioralProfile.goalsOptions.health'),
    t('tutor.editBehavioralProfile.goalsOptions.exercise'),
    t('tutor.editBehavioralProfile.goalsOptions.trustworthy_providers'),
    t('tutor.editBehavioralProfile.goalsOptions.understanding'),
  ];

  const toggleLeash = (label: string) => {
    const current = behavior.leashBehavior ?? [];
    const next = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    updateBehavior({ leashBehavior: next });
  };

  const toggleGoal = (label: string) => {
    const current = behavior.goals ?? [];
    const next = current.includes(label)
      ? current.filter((g) => g !== label)
      : [...current, label];
    updateBehavior({ goals: next });
  };

  const setScale = (key: 'people' | 'dogs' | 'children', v: number) => {
    updateBehavior({
      socialization: {
        [key]: v,
      },
    });
  };

  const toggleLike = (label: string) => {
    const current = behavior.likes ?? [];
    const next = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    updateBehavior({ likes: next });
  };

  const toggleFear = (label: string) => {
    const current = behavior.fears ?? [];
    const next = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    updateBehavior({ fears: next });
  };

  const markNoFears = () => {
    updateBehavior({ fears: [] });
  };

  const handleNotesBlur = () => {
    const text = notesDraft.trim();
    updateBehavior({ tutorNotes: text || undefined });
  };

  const handleSave = async () => {
    const finalNotes = notesDraft.trim();
    setSaving(true);
    const payload = {
      dogId: id,
      name: profile.name,
      gender: profile.gender,
      birthdate: profile.birthdate,
      weightKg: profile.weightKg,
      size: profile.size,
      breed: profile.breed,
      breedOther: profile.breedOther,
      ageRange: profile.ageRange,
      neutered: profile.neutered,
      adopted: profile.adopted,
      photoUrl: profile.photoUrl,
      habitsJson: profile.habitsJson,
      behaviorJson: JSON.stringify({
        ...behavior,
        tutorNotes: finalNotes || undefined,
      }),
      healthJson: profile.healthJson,
    };

    apiClient.put(`/dogs/${id}`, payload)
      .then(() => {
        router.back();
      })
      .catch((err) => {
        console.error('Error saving behavior:', err);
        Alert.alert('Erro', 'Não foi possível guardar as alterações comportamentais.');
      })
      .finally(() => setSaving(false));
  };

  const hasNoFearsMarked =
    Array.isArray(behavior.fears) && behavior.fears.length === 0;

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editBehavioralProfile.behavioralProfile')}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  return (
    <DogScreenShell
      title={t('tutor.editBehavioralProfile.behavioralProfile')}
      contentBackground={DOG_COLORS.white}
      bottomBar={
        !isReadOnly ? (
          <ConfirmButton
            onPress={handleSave}
            disabled={saving}
            label={saving ? 'A guardar...' : undefined}
          />
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{t('tutor.editBehavioralProfile.whatIsLike', { name: profile.name })}</Text>
          <Text style={styles.introCopy}>
            {t('tutor.editBehavioralProfile.profileDescription')}
          </Text>
        </View>

        <FormSection
          title={t('tutor.editBehavioralProfile.socialization')}
          description={t('tutor.editBehavioralProfile.socializationDescription')}
        >
          <View style={styles.scaleGroup}>
            <ScaleBlock
              label={t('tutor.editBehavioralProfile.withPeople')}
              value={behavior.socialization?.people}
              onChange={(v) => { if (!isReadOnly) setScale('people', v); }}
              disabled={isReadOnly}
            />
            <ScaleBlock
              label={t('tutor.editBehavioralProfile.withOtherDogs')}
              value={behavior.socialization?.dogs}
              onChange={(v) => { if (!isReadOnly) setScale('dogs', v); }}
              disabled={isReadOnly}
            />
            <ScaleBlock
              label={t('tutor.editBehavioralProfile.withChildren')}
              value={behavior.socialization?.children}
              onChange={(v) => { if (!isReadOnly) setScale('children', v); }}
              disabled={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.leashBehavior')}
          description={t('tutor.editBehavioralProfile.leashBehaviorDescription')}
        >
          <ChipsMultiSelect
            options={leashOptions}
            selected={behavior.leashBehavior ?? []}
            onToggle={(v) => { if (!isReadOnly) toggleLeash(v); }}
            disabled={isReadOnly}
          />
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.separationAnxiety')}
          description={t('tutor.editBehavioralProfile.separationAnxietyDescription')}
        >
          <View style={styles.cardSelect}>
            <RowButton
              label={t('tutor.editBehavioralProfile.separationAnxiety')}
              value={behavior.separationAnxiety ? t(`tutor.editBehavioralProfile.separationAnxietyOptions.${behavior.separationAnxiety}`) : undefined}
              onPress={() => { if (!isReadOnly) setSeparationSheetOpen(true); }}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.likes')}
          description={t('tutor.editBehavioralProfile.chooseAllThatApply')}
        >
          <ChipsMultiSelect
            options={LIKES_OPTIONS_PT}
            selected={behavior.likes ?? []}
            onToggle={(v) => { if (!isReadOnly) toggleLike(v); }}
            disabled={isReadOnly}
          />
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.fearsOrTriggers')}
          description={t('tutor.editBehavioralProfile.situationsUncomfortable')}
        >
          <ChipsMultiSelect
            options={FEARS_OPTIONS_PT}
            selected={behavior.fears ?? []}
            onToggle={(v) => { if (!isReadOnly) toggleFear(v); }}
            variant="amber"
            disabled={isReadOnly}
          />
          {!isReadOnly && !hasNoFearsMarked && (behavior.fears?.length ?? 0) === 0 ? (
            <Text style={styles.noFearsHint} onPress={markNoFears}>
              {t('tutor.editBehavioralProfile.noKnownFears')}
            </Text>
          ) : null}
          {hasNoFearsMarked ? (
            <View style={styles.noFearsBadge}>
              <Text style={styles.noFearsBadgeText}>
                {t('tutor.editBehavioralProfile.markedNoFears')}
              </Text>
            </View>
          ) : null}
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.goals')}
          description={t('tutor.editBehavioralProfile.goalsDescription')}
        >
          <ChipsMultiSelect
            options={goalsOptions}
            selected={behavior.goals ?? []}
            onToggle={(v) => { if (!isReadOnly) toggleGoal(v); }}
            disabled={isReadOnly}
          />
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.tutorNotes')}
          description={t('tutor.editBehavioralProfile.tutorNotesDescription')}
        >
          <View style={styles.notesWrap}>
            <TextInput
              value={notesDraft}
              onChangeText={(t) => setNotesDraft(t.slice(0, MAX_NOTES))}
              onBlur={handleNotesBlur}
              multiline
              placeholder={isReadOnly ? 'Sem notas.' : t('tutor.editBehavioralProfile.tutorNotesPlaceholder')}
              placeholderTextColor={DOG_COLORS.label}
              style={[styles.notesInput, isReadOnly && { color: colors.textSecondary }]}
              textAlignVertical="top"
              editable={!isReadOnly}
            />
            <Text style={styles.notesCount}>
              {notesDraft.length}/{MAX_NOTES}
            </Text>
          </View>
        </FormSection>

        <FormSection
          title={t('tutor.editBehavioralProfile.providerNotes')}
          description={t('tutor.editBehavioralProfile.providerNotesDescription')}
        >
          <View style={styles.providerCard}>
            <PawSquare size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.providerTitle}>{t('tutor.editBehavioralProfile.underConstruction')}</Text>
              <Text style={styles.providerCopy}>
                {t('tutor.editBehavioralProfile.providerNotesComingSoon')}
              </Text>
            </View>
          </View>
        </FormSection>
      </ScrollView>

      <PickerSheet<string>
        visible={separationSheetOpen}
        title={t('tutor.editBehavioralProfile.separationAnxiety')}
        options={separationAnxietyOptions}
        selectedValue={behavior.separationAnxiety}
        onSelect={(v) => {
          updateBehavior({ separationAnxiety: v });
          setSeparationSheetOpen(false);
        }}
        onClose={() => setSeparationSheetOpen(false)}
      />
    </DogScreenShell>
  );
}

function ScaleBlock({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={scaleBlockStyles.wrap}>
      <Text style={scaleBlockStyles.label}>{label}</Text>
      <ScaleSelector value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

const scaleBlockStyles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontFamily: font.medium, fontSize: fontSize.base, color: DOG_COLORS.text },
});

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing[6] },
  cardSelect: { backgroundColor: '#fff', borderRadius: DOG_RADIUS.card, borderWidth: 1, borderColor: colors.borderSoft, overflow: 'hidden', ...DOG_SHADOW },
  intro: { paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[1] },
  introTitle: { fontFamily: font.semiBold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing[1] },
  introCopy: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  scaleGroup: { gap: 20 },
  noFearsHint: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: colors.primary, marginTop: 14, textDecorationLine: 'underline' },
  noFearsBadge: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 14, borderRadius: DOG_RADIUS.input, backgroundColor: DOG_COLORS.primaryLight, alignSelf: 'flex-start' },
  noFearsBadgeText: { fontFamily: font.medium, fontSize: fontSize.xs, color: colors.primary },
  notesWrap: { borderWidth: 1, borderColor: colors.borderSoft, borderRadius: DOG_RADIUS.input, backgroundColor: '#fff' },
  notesInput: { minHeight: 96, padding: 14, fontFamily: font.regular, fontSize: fontSize.base, color: colors.text, lineHeight: 22 },
  notesCount: { alignSelf: 'flex-end', fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textMuted, paddingRight: 10, paddingBottom: 8 },
  providerCard: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: DOG_RADIUS.card, backgroundColor: colors.canvas, alignItems: 'flex-start' },
  providerTitle: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text, marginBottom: 4 },
  providerCopy: DOG_FONT.caption,
});
