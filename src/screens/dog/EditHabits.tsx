import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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
  InputSheet,
  PickerSheet,
  RowButton,
  type PickerOption,
} from './_shared';
import {
  ACTIVITY_LEVEL_LABELS_PT,
  FOOD_TYPE_LABELS_PT,
  HOUSING_LABELS_PT,
  type ActivityLevel,
  type FoodType,
  type HousingType,
  type DogHabits,
} from '../../types/dog';

type SubSheet = null | 'food' | 'activity' | 'lifestyle' | 'preferences';
type FieldSheet = null | 'foodType' | 'mealsPerDay' | 'brand' | 'restrictionsNotes' | 'activityLevel' | 'walksPerDay' | 'avgDuration' | 'housing' | 'sleepingPlace' | 'exerciseDuration' | 'origin' | 'traumaHistory' | 'customService';

export default function EditHabits({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [habits, setHabits] = useState<DogHabits>({});

  const [subSheet, setSubSheet] = useState<SubSheet>(null);
  const [fieldSheet, setFieldSheet] = useState<FieldSheet>(null);
  const [brandDraft, setBrandDraft] = useState('');
  const [restrictionsDraft, setRestrictionsDraft] = useState('');
  const [traumaDraft, setTraumaDraft] = useState('');
  const [customServiceDraft, setCustomServiceDraft] = useState('');

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}`)
      .then((data) => {
        if (data) {
          setProfile(data);
          const parsedHabits = data.habitsJson ? JSON.parse(data.habitsJson) : {};
          setHabits(parsedHabits);
          
          setBrandDraft(parsedHabits.food?.brand ?? '');
          setRestrictionsDraft(parsedHabits.food?.restrictionsNotes ?? '');
          setTraumaDraft(parsedHabits.traumaHistory ?? '');
          setCustomServiceDraft(parsedHabits.customService ?? '');
        }
      })
      .catch((err) => {
        console.error('Error fetching dog habits:', err);
        Alert.alert(t('common.error') || 'Erro', 'Não foi possível carregar os hábitos do cão.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const updateHabits = (patch: Partial<DogHabits>) => {
    setHabits((prev) => {
      const nextFood = patch.food ? { ...prev.food, ...patch.food } : prev.food;
      const nextActivity = patch.activity ? { ...prev.activity, ...patch.activity } : prev.activity;
      const nextLifestyle = patch.lifestyle ? { ...prev.lifestyle, ...patch.lifestyle } : prev.lifestyle;
      return {
        ...prev,
        ...patch,
        food: nextFood,
        activity: nextActivity,
        lifestyle: nextLifestyle,
      };
    });
  };

  const foodTypeOptions: PickerOption<FoodType>[] = (
    ['dry', 'wet', 'mixed', 'homemade'] as FoodType[]
  ).map((v) => ({ value: v, label: FOOD_TYPE_LABELS_PT[v] }));

  const mealsOptions: PickerOption<number>[] = [1, 2, 3, 4].map((n) => ({
    value: n,
    label: `${n} ${n === 1 ? t('tutor.editHabits.meal') : t('tutor.editHabits.meals')} ${t('tutor.editHabits.perDay')}`,
  }));

  const activityLevelOptions: PickerOption<ActivityLevel>[] = (
    ['low', 'moderate', 'high'] as ActivityLevel[]
  ).map((v) => ({ value: v, label: ACTIVITY_LEVEL_LABELS_PT[v] }));

  const walksOptions: PickerOption<number>[] = [1, 2, 3, 4, 5].map((n) => ({
    value: n,
    label: `${n}${n === 5 ? '+' : ''} ${t('tutor.editHabits.perDay')}`,
  }));

  const durationOptions: PickerOption<number>[] = [15, 30, 45, 60, 90, 120].map((n) => ({
    value: n,
    label: `${n} ${t('tutor.editHabits.minutes')}`,
  }));

  const housingOptions: PickerOption<HousingType>[] = (
    ['apartment', 'house_with_garden', 'countryside'] as HousingType[]
  ).map((v) => ({ value: v, label: HOUSING_LABELS_PT[v] }));

  const sleepingPlaceOptions: PickerOption<string>[] = [
    { value: 'bed', label: t('tutor.editHabits.sleepingPlaceOptions.bed') },
    { value: 'sofa', label: t('tutor.editHabits.sleepingPlaceOptions.sofa') },
    { value: 'own_bed', label: t('tutor.editHabits.sleepingPlaceOptions.own_bed') },
    { value: 'outside', label: t('tutor.editHabits.sleepingPlaceOptions.outside') },
  ];

  const exerciseDurationOptions: PickerOption<string>[] = [
    { value: 'less_30', label: t('tutor.editHabits.exerciseDurationOptions.less_30') },
    { value: '30_60', label: t('tutor.editHabits.exerciseDurationOptions.30_60') },
    { value: 'more_60', label: t('tutor.editHabits.exerciseDurationOptions.more_60') },
  ];

  const originOptions: PickerOption<string>[] = [
    { value: 'shelter', label: t('tutor.editHabits.originOptions.shelter') },
    { value: 'breeder', label: t('tutor.editHabits.originOptions.breeder') },
    { value: 'street', label: t('tutor.editHabits.originOptions.street') },
    { value: 'gift', label: t('tutor.editHabits.originOptions.gift') },
    { value: 'other', label: t('tutor.editHabits.originOptions.other') },
  ];

  const preferredServicesOptions = [
    t('tutor.editHabits.preferredServicesOptions.walking'),
    t('tutor.editHabits.preferredServicesOptions.sitting'),
    t('tutor.editHabits.preferredServicesOptions.daycare'),
    t('tutor.editHabits.preferredServicesOptions.boarding'),
    t('tutor.editHabits.preferredServicesOptions.training'),
    t('tutor.editHabits.preferredServicesOptions.grooming'),
    t('tutor.editHabits.preferredServicesOptions.transport'),
    t('tutor.editHabits.preferredServicesOptions.vet'),
    t('tutor.editHabits.preferredServicesOptions.other'),
  ];

  const foodSummary = summarizeFood(habits.food, t);
  const activitySummary = summarizeActivity(habits.activity, t);
  const lifestyleSummary = summarizeLifestyle(habits.lifestyle, t);
  const preferencesSummary = summarizePreferences(habits, t);

  const closeSubSheet = () => setSubSheet(null);
  const closeFieldSheet = () => setFieldSheet(null);

  const commitBrand = (val: string) => {
    updateHabits({ food: { brand: val.trim() || undefined } });
    closeFieldSheet();
  };

  const commitRestrictions = (val: string) => {
    const text = val.trim();
    updateHabits({
      food: {
        restrictionsNotes: text || undefined,
        hasRestrictions: !!text,
      },
    });
    closeFieldSheet();
  };

  const handleSave = async () => {
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
      habitsJson: JSON.stringify(habits),
      behaviorJson: profile.behaviorJson,
      healthJson: profile.healthJson,
    };

    apiClient.put(`/dogs/${id}`, payload)
      .then(() => {
        router.back();
      })
      .catch((err) => {
        console.error('Error saving habits:', err);
        Alert.alert('Erro', 'Não foi possível guardar os hábitos.');
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editHabits.habits')}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  return (
    <DogScreenShell
      title={t('tutor.editHabits.habits')}
      contentBackground={DOG_COLORS.white}
      bottomBar={<ConfirmButton onPress={handleSave} disabled={saving} label={saving ? 'A guardar...' : undefined} />}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{t('tutor.editHabits.routineOf', { name: profile.name })}</Text>
          <Text style={styles.introCopy}>
            {t('tutor.editHabits.routineDescription')}
          </Text>
        </View>

        <View style={styles.card}>
          <RowButton
            label={t('tutor.editHabits.food')}
            value={foodSummary}
            onPress={() => setSubSheet('food')}
          />
          <RowButton
            label={t('tutor.editHabits.activity')}
            value={activitySummary}
            onPress={() => setSubSheet('activity')}
          />
          <RowButton
            label={t('tutor.editHabits.lifestyle')}
            value={lifestyleSummary}
            onPress={() => setSubSheet('lifestyle')}
          />
          <RowButton
            label={t('tutor.editHabits.preferences')}
            value={preferencesSummary}
            onPress={() => setSubSheet('preferences')}
            isLast
          />
        </View>
      </ScrollView>

      {/* Sub-sheet Alimentação */}
      <SubSheet
        visible={subSheet === 'food'}
        title={t('tutor.editHabits.food')}
        onClose={closeSubSheet}
      >
        <RowButton
          label={t('tutor.editHabits.type')}
          value={habits.food?.type ? FOOD_TYPE_LABELS_PT[habits.food.type] : undefined}
          onPress={() => setFieldSheet('foodType')}
        />
        <RowButton
          label={t('tutor.editHabits.mealsPerDay')}
          value={
            typeof habits.food?.mealsPerDay === 'number'
              ? `${habits.food.mealsPerDay}`
              : undefined
          }
          onPress={() => setFieldSheet('mealsPerDay')}
        />
        <RowButton
          label={t('tutor.editHabits.usualBrand')}
          value={habits.food?.brand ?? undefined}
          onPress={() => setFieldSheet('brand')}
        />
        <View style={styles.switchRow}>
          <View style={styles.rowTexts}>
            <Text style={styles.rowLabel}>{t('tutor.editHabits.hasDietaryRestrictions')}</Text>
            <Text style={styles.rowValueSoft}>
              {habits.food?.hasRestrictions ? t('tutor.editBasicInfo.yes') : t('tutor.editBasicInfo.no')}
            </Text>
          </View>
          <Switch
            value={!!habits.food?.hasRestrictions}
            onValueChange={(v) =>
              updateHabits({
                food: {
                  hasRestrictions: v,
                  restrictionsNotes: v ? habits.food?.restrictionsNotes : undefined,
                },
              })
            }
            trackColor={{ true: colors.primary, false: colors.borderSoft }}
            thumbColor={DOG_COLORS.white}
          />
        </View>
        {habits.food?.hasRestrictions ? (
          <RowButton
            label={t('tutor.editHabits.notesOnRestrictions')}
            value={habits.food.restrictionsNotes ?? undefined}
            onPress={() => {
              setRestrictionsDraft(habits.food?.restrictionsNotes ?? '');
              setFieldSheet('restrictionsNotes');
            }}
            isLast
          />
        ) : null}
      </SubSheet>

      {/* Sub-sheet Atividade */}
      <SubSheet
        visible={subSheet === 'activity'}
        title={t('tutor.editHabits.activity')}
        onClose={closeSubSheet}
      >
        <RowButton
          label={t('tutor.editHabits.exerciseLevel')}
          value={
            habits.activity?.level
              ? ACTIVITY_LEVEL_LABELS_PT[habits.activity.level]
              : undefined
          }
          onPress={() => setFieldSheet('activityLevel')}
        />
        <RowButton
          label={t('tutor.editHabits.walksPerDay')}
          value={
            typeof habits.activity?.walksPerDay === 'number'
              ? `${habits.activity.walksPerDay}${habits.activity.walksPerDay === 5 ? '+' : ''}`
              : undefined
          }
          onPress={() => setFieldSheet('walksPerDay')}
        />
        <RowButton
          label={t('tutor.editHabits.averageDuration')}
          value={
            typeof habits.activity?.avgDurationMin === 'number'
              ? `${habits.activity.avgDurationMin} min`
              : undefined
          }
          onPress={() => setFieldSheet('avgDuration')}
          isLast
        />
      </SubSheet>

      {/* Sub-sheet Estilo de vida */}
      <SubSheet
        visible={subSheet === 'lifestyle'}
        title={t('tutor.editHabits.lifestyle')}
        onClose={closeSubSheet}
      >
        <RowButton
          label={t('tutor.editHabits.housingType')}
          value={habits.lifestyle?.housing ? HOUSING_LABELS_PT[habits.lifestyle.housing] : undefined}
          onPress={() => setFieldSheet('housing')}
        />
        <View style={[styles.switchRow, styles.rowDivider]}>
          <Text style={styles.rowValue}>{t('tutor.editHabits.livesWithOtherDogs')}</Text>
          <Switch
            value={!!habits.lifestyle?.livesWithDogs}
            onValueChange={(v) =>
              updateHabits({ lifestyle: { livesWithDogs: v } })
            }
            trackColor={{ true: colors.primary, false: colors.borderSoft }}
            thumbColor={DOG_COLORS.white}
          />
        </View>
        <View style={[styles.switchRow, styles.rowDivider]}>
          <Text style={styles.rowValue}>{t('tutor.editHabits.livesWithChildren')}</Text>
          <Switch
            value={!!habits.lifestyle?.livesWithChildren}
            onValueChange={(v) =>
              updateHabits({ lifestyle: { livesWithChildren: v } })
            }
            trackColor={{ true: colors.primary, false: colors.borderSoft }}
            thumbColor={DOG_COLORS.white}
          />
        </View>
        <View style={[styles.switchRow, styles.rowDivider]}>
          <Text style={styles.rowValue}>{t('tutor.editHabits.livesWithCats')}</Text>
          <Switch
            value={!!habits.lifestyle?.livesWithCats}
            onValueChange={(v) =>
              updateHabits({ lifestyle: { livesWithCats: v } })
            }
            trackColor={{ true: colors.primary, false: colors.borderSoft }}
            thumbColor={DOG_COLORS.white}
          />
        </View>
        <View style={[styles.switchRow, styles.rowDivider]}>
          <Text style={styles.rowValue}>{t('tutor.editHabits.livesWithTeenagers')}</Text>
          <Switch
            value={!!habits.lifestyle?.livesWithTeenagers}
            onValueChange={(v) =>
              updateHabits({ lifestyle: { livesWithTeenagers: v } })
            }
            trackColor={{ true: colors.primary, false: colors.borderSoft }}
            thumbColor={DOG_COLORS.white}
          />
        </View>
        <View style={[styles.switchRow, styles.rowDivider]}>
          <Text style={styles.rowValue}>{t('tutor.editHabits.livesWithElderly')}</Text>
          <Switch
            value={!!habits.lifestyle?.livesWithElderly}
            onValueChange={(v) =>
              updateHabits({ lifestyle: { livesWithElderly: v } })
            }
            trackColor={{ true: colors.primary, false: colors.borderSoft }}
            thumbColor={DOG_COLORS.white}
          />
        </View>
        <RowButton
          label={t('tutor.editHabits.sleepingPlace')}
          value={habits.lifestyle?.sleepingPlace ? t(`tutor.editHabits.sleepingPlaceOptions.${habits.lifestyle.sleepingPlace}`) : undefined}
          onPress={() => setFieldSheet('sleepingPlace')}
        />
        <RowButton
          label={t('tutor.editHabits.exerciseDuration')}
          value={habits.lifestyle?.exerciseDuration ? t(`tutor.editHabits.exerciseDurationOptions.${habits.lifestyle.exerciseDuration}`) : undefined}
          onPress={() => setFieldSheet('exerciseDuration')}
          isLast
        />
      </SubSheet>

      {/* Sub-sheet História & Preferências */}
      <SubSheet
        visible={subSheet === 'preferences'}
        title={t('tutor.editHabits.preferences')}
        onClose={closeSubSheet}
      >
        <RowButton
          label={t('tutor.editHabits.origin')}
          value={habits.origin ? t(`tutor.editHabits.originOptions.${habits.origin}`) : undefined}
          onPress={() => setFieldSheet('origin')}
        />
        <RowButton
          label={t('tutor.editHabits.traumaHistory')}
          value={habits.traumaHistory ?? undefined}
          onPress={() => {
            setTraumaDraft(habits.traumaHistory ?? '');
            setFieldSheet('traumaHistory');
          }}
        />
        <View style={styles.switchRow}>
          <View style={styles.rowTexts}>
            <Text style={styles.rowLabel}>{t('tutor.editHabits.preferredServices')}</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <ChipsMultiSelect
            options={preferredServicesOptions}
            selected={habits.preferredServices ?? []}
            onToggle={(opt) => {
              const current = habits.preferredServices ?? [];
              const next = current.includes(opt)
                ? current.filter((v) => v !== opt)
                : [...current, opt];
              updateHabits({ preferredServices: next });
            }}
          />
        </View>
        {habits.preferredServices?.includes(t('tutor.editHabits.preferredServicesOptions.other')) ? (
          <RowButton
            label={t('tutor.editHabits.customService')}
            value={habits.customService ?? undefined}
            onPress={() => {
              setCustomServiceDraft(habits.customService ?? '');
              setFieldSheet('customService');
            }}
            isLast
          />
        ) : null}
      </SubSheet>

      {/* Field Pickers */}
      <PickerSheet<FoodType>
        visible={fieldSheet === 'foodType'}
        title={t('tutor.editHabits.foodType')}
        options={foodTypeOptions}
        selectedValue={habits.food?.type}
        onSelect={(v) => {
          updateHabits({ food: { type: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<number>
        visible={fieldSheet === 'mealsPerDay'}
        title={t('tutor.editHabits.mealsPerDay')}
        options={mealsOptions}
        selectedValue={habits.food?.mealsPerDay}
        onSelect={(v) => {
          updateHabits({ food: { mealsPerDay: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <InputSheet
        visible={fieldSheet === 'brand'}
        title={t('tutor.editHabits.usualBrand')}
        placeholder={t('tutor.editHabits.brandPlaceholder')}
        initialValue={brandDraft}
        onConfirm={commitBrand}
        onClose={closeFieldSheet}
        autoCapitalize="words"
      />

      <InputSheet
        visible={fieldSheet === 'restrictionsNotes'}
        title={t('tutor.editHabits.notesOnRestrictions')}
        placeholder={t('tutor.editHabits.restrictionsPlaceholder')}
        initialValue={restrictionsDraft}
        onConfirm={commitRestrictions}
        onClose={closeFieldSheet}
        multiline
        maxLength={200}
      />

      <PickerSheet<ActivityLevel>
        visible={fieldSheet === 'activityLevel'}
        title={t('tutor.editHabits.exerciseLevel')}
        options={activityLevelOptions}
        selectedValue={habits.activity?.level}
        onSelect={(v) => {
          updateHabits({ activity: { level: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<number>
        visible={fieldSheet === 'walksPerDay'}
        title={t('tutor.editHabits.walksPerDay')}
        options={walksOptions}
        selectedValue={habits.activity?.walksPerDay}
        onSelect={(v) => {
          updateHabits({ activity: { walksPerDay: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<number>
        visible={fieldSheet === 'avgDuration'}
        title={t('tutor.editHabits.averageDuration')}
        options={durationOptions}
        selectedValue={habits.activity?.avgDurationMin}
        onSelect={(v) => {
          updateHabits({ activity: { avgDurationMin: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<HousingType>
        visible={fieldSheet === 'housing'}
        title={t('tutor.editHabits.housingType')}
        options={housingOptions}
        selectedValue={habits.lifestyle?.housing}
        onSelect={(v) => {
          updateHabits({ lifestyle: { housing: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<string>
        visible={fieldSheet === 'sleepingPlace'}
        title={t('tutor.editHabits.sleepingPlace')}
        options={sleepingPlaceOptions}
        selectedValue={habits.lifestyle?.sleepingPlace}
        onSelect={(v) => {
          updateHabits({ lifestyle: { sleepingPlace: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<string>
        visible={fieldSheet === 'exerciseDuration'}
        title={t('tutor.editHabits.exerciseDuration')}
        options={exerciseDurationOptions}
        selectedValue={habits.lifestyle?.exerciseDuration}
        onSelect={(v) => {
          updateHabits({ lifestyle: { exerciseDuration: v } });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <PickerSheet<string>
        visible={fieldSheet === 'origin'}
        title={t('tutor.editHabits.origin')}
        options={originOptions}
        selectedValue={habits.origin}
        onSelect={(v) => {
          updateHabits({ origin: v });
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />

      <InputSheet
        visible={fieldSheet === 'traumaHistory'}
        title={t('tutor.editHabits.traumaHistory')}
        placeholder={t('tutor.editHabits.traumaPlaceholder')}
        initialValue={traumaDraft}
        onConfirm={(val) => {
          const trimmed = val.trim();
          updateHabits({ traumaHistory: trimmed || undefined });
          setTraumaDraft(trimmed);
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
        multiline
        maxLength={300}
      />

      <InputSheet
        visible={fieldSheet === 'customService'}
        title={t('tutor.editHabits.customService')}
        placeholder={t('tutor.editHabits.customServicePlaceholder')}
        initialValue={customServiceDraft}
        onConfirm={(val) => {
          const trimmed = val.trim();
          updateHabits({ customService: trimmed || undefined });
          setCustomServiceDraft(trimmed);
          closeFieldSheet();
        }}
        onClose={closeFieldSheet}
      />
    </DogScreenShell>
  );
}

function summarizeFood(f: any, t: any): string | undefined {
  if (!f?.type) return undefined;
  const parts: string[] = [FOOD_TYPE_LABELS_PT[f.type as FoodType]];
  if (typeof f.mealsPerDay === 'number') {
    parts.push(`${f.mealsPerDay}${t('tutor.editHabits.timesPerDay')}`);
  }
  return parts.join(' · ');
}

function summarizeActivity(a: any, t: any): string | undefined {
  if (!a?.level) return undefined;
  const parts: string[] = [ACTIVITY_LEVEL_LABELS_PT[a.level as ActivityLevel]];
  if (typeof a.walksPerDay === 'number') {
    parts.push(`${a.walksPerDay}${a.walksPerDay === 5 ? '+' : ''} ${t('tutor.editHabits.walks')}`);
  }
  return parts.join(' · ');
}

function summarizeLifestyle(l: any, t: any): string | undefined {
  if (!l?.housing) return undefined;
  const parts: string[] = [HOUSING_LABELS_PT[l.housing as HousingType]];
  if (l.sleepingPlace) {
    parts.push(t(`tutor.editHabits.sleepingPlaceOptions.${l.sleepingPlace}`));
  }
  return parts.join(' · ');
}

function summarizePreferences(h: DogHabits, t: any): string | undefined {
  if (!h?.origin) return undefined;
  const originLabel = t(`tutor.editHabits.originOptions.${h.origin}`);
  const servicesCount = h.preferredServices?.length ?? 0;
  if (servicesCount > 0) {
    return `${originLabel} · ${servicesCount} ${servicesCount === 1 ? 'serviço' : 'serviços'}`;
  }
  return originLabel;
}

function SubSheet({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={subSheetStyles.wrap}>
        <View style={subSheetStyles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={({ pressed }) => [subSheetStyles.closeHit, pressed && { opacity: 0.6 }]}
          >
            <Text style={subSheetStyles.closeText}>Fechar</Text>
          </Pressable>
          <Text style={subSheetStyles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 72 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
          <View style={subSheetStyles.card}>{children}</View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const subSheetStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  closeHit: { minWidth: 72 },
  closeText: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.primary },
  title: { flex: 1, fontFamily: font.semiBold, fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  card: {
    marginHorizontal: 16, marginTop: 16, borderRadius: DOG_RADIUS.card,
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderSoft, overflow: 'hidden'
  },
});

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing[6], paddingHorizontal: spacing[4], paddingTop: spacing[2] },
  intro: { marginBottom: spacing[4] },
  introTitle: { fontFamily: font.semiBold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing[1] },
  introCopy: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: DOG_RADIUS.card, borderWidth: 1, borderColor: colors.borderSoft, overflow: 'hidden', ...DOG_SHADOW },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  rowTexts: { flex: 1, gap: 4 },
  rowLabel: DOG_FONT.rowLabel,
  rowValue: DOG_FONT.rowValue,
  rowValueSoft: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textSecondary },
});
