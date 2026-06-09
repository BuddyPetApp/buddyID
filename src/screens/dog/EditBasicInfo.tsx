import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../tokens';
import { supabase } from '../../lib/supabase';
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
  InputSheet,
  PickerSheet,
  RowButton,
  type PickerOption,
} from './_shared';
import {
  DOG_BREEDS_PT,
  GENDER_LABELS_PT,
  SIZE_LABELS_PT,
  SIZE_LABELS_EN,
  TEMPERAMENT_LABELS_PT,
  ageFromBirthdate,
  type DogGender,
  type DogSize,
  type DogTemperament,
} from '../../types/dog';

type SheetKey = null | 'gender' | 'breed' | 'sterilized' | 'size' | 'birthdate' | 'weight' | 'name';

function isoToDisplay(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function displayToIso(display: string): string | null {
  const m = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(d.getTime())) return null;
  if (
    d.getFullYear() !== Number(yyyy) ||
    d.getMonth() !== Number(mm) - 1 ||
    d.getDate() !== Number(dd)
  ) {
    return null;
  }
  if (d > new Date()) return null;
  return d.toISOString().slice(0, 10);
}

export default function EditBasicInfo({ id, isReadOnly = false }: { id?: string; isReadOnly?: boolean }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<DogGender | null>(null);
  const [breed, setBreed] = useState<string | null>(null);
  const [isSterilized, setIsSterilized] = useState<boolean | null>(null);
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [size, setSize] = useState<DogSize | null>(null);
  const [temperament, setTemperament] = useState<DogTemperament[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [sheet, setSheet] = useState<SheetKey>(null);
  const [breedSearch, setBreedSearch] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [weightDraft, setWeightDraft] = useState('');
  const [birthdayDraft, setBirthdayDraft] = useState('');

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}`)
      .then((data) => {
        if (data) {
          setProfile(data);
          setName(data.name || '');
          setGender(data.gender || null);
          setBreed(data.breed || null);
          setBirthdate(data.birthdate || null);
          setWeightKg(data.weightKg || null);
          setSize(data.size || null);
          setPhotoUrl(data.photoUrl || null);

          if (data.neutered === 'yes') setIsSterilized(true);
          else if (data.neutered === 'no') setIsSterilized(false);
          else setIsSterilized(null);

          // Attempt to parse temperament from habits/behavior if desired, or defaults
          try {
            const habits = data.habitsJson ? JSON.parse(data.habitsJson) : {};
            setTemperament(habits.temperament || []);
          } catch {
            setTemperament([]);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching dog:', err);
        Alert.alert(t('common.error') || 'Erro', 'Não foi possível carregar os dados do cão.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const genderOptions: PickerOption<DogGender>[] = [
    { value: 'male', label: GENDER_LABELS_PT.male },
    { value: 'female', label: GENDER_LABELS_PT.female },
  ];

  const breedOptions: PickerOption<string>[] = useMemo(
    () => DOG_BREEDS_PT.map((b) => ({ value: b, label: b })),
    [],
  );

  const sterilizedOptions: PickerOption<string>[] = [
    { value: 'yes', label: t('tutor.editBasicInfo.yes') },
    { value: 'no', label: t('tutor.editBasicInfo.no') },
    { value: 'unknown', label: t('tutor.editBasicInfo.preferNotToSay') },
  ];

  const isEn = i18n.language?.startsWith('en');
  const sizeLabels = isEn ? SIZE_LABELS_EN : SIZE_LABELS_PT;

  const sizeOptions: PickerOption<DogSize>[] = (
    ['xs', 'sm', 'md', 'lg', 'xl'] as DogSize[]
  ).map((v) => ({ value: v, label: sizeLabels[v] }));

  const age = ageFromBirthdate(birthdate || undefined);
  const birthdateDisplay = birthdate
    ? `${isoToDisplay(birthdate)}${age !== null ? ` · ${age} ${age === 1 ? t('tutor.editBasicInfo.year') : t('tutor.editBasicInfo.years')}` : ''}`
    : undefined;

  const sterilizedDisplay =
    isSterilized === true
      ? t('tutor.editBasicInfo.yes')
      : isSterilized === false
      ? t('tutor.editBasicInfo.no')
      : isSterilized === null
      ? t('tutor.editBasicInfo.preferNotToSay')
      : undefined;

  const temperamentDisplay =
    temperament && temperament.length
      ? temperament.map((t) => TEMPERAMENT_LABELS_PT[t]).join(', ')
      : undefined;

  const handlePhoto = async () => {
    if (isReadOnly) return;
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('common.error') || 'Erro', 'É necessária permissão de acesso à galeria.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets?.[0]) {
      return;
    }

    const uri = pickerResult.assets[0].uri;

    setSaving(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      let fileExt = 'jpg';
      if (uri.startsWith('data:')) {
        const mime = uri.split(';')[0].split(':')[1];
        fileExt = mime.split('/')[1] || 'jpg';
      } else {
        const parts = uri.split('.');
        const lastPart = parts[parts.length - 1];
        fileExt = lastPart.split('?')[0] || 'jpg';
      }

      fileExt = fileExt.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        fileExt = 'jpg';
      }

      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dogs')
        .upload(filePath, blob, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('dogs')
        .getPublicUrl(filePath);

      setPhotoUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('tutor.editBasicInfo.nameRequired'), t('tutor.editBasicInfo.dogNeedsName'));
      return;
    }

    setSaving(true);

    let neutered: string | null = null;
    if (isSterilized === true) neutered = 'yes';
    else if (isSterilized === false) neutered = 'no';
    else neutered = 'unknown';

    let ageRange: string = 'unknown';
    if (birthdate) {
      const ageY = ageFromBirthdate(birthdate);
      if (ageY !== null) {
        if (ageY < 1) ageRange = 'puppy';
        else if (ageY >= 1 && ageY <= 3) ageRange = '1_to_3';
        else if (ageY >= 4 && ageY <= 7) ageRange = '4_to_7';
        else if (ageY >= 8) ageRange = 'over_8';
      }
    }

    // Merge temperament into habitsJson so we preserve it
    let finalHabitsJson = profile.habitsJson;
    try {
      const habits = profile.habitsJson ? JSON.parse(profile.habitsJson) : {};
      habits.temperament = temperament;
      finalHabitsJson = JSON.stringify(habits);
    } catch {
      finalHabitsJson = JSON.stringify({ temperament });
    }

    const payload = {
      dogId: id,
      name: name,
      gender: gender || null,
      birthdate: birthdate || null,
      weightKg: weightKg || null,
      size: size || null,
      breed: breed || null,
      breedOther: null,
      ageRange: ageRange,
      neutered: neutered,
      adopted: profile.adopted,
      photoUrl: photoUrl || null,
      habitsJson: finalHabitsJson,
      behaviorJson: profile.behaviorJson,
      healthJson: profile.healthJson,
    };

    apiClient.put(`/dogs/${id}`, payload)
      .then(() => {
        router.back();
      })
      .catch((err) => {
        console.error('Error updating basic info:', err);
        Alert.alert('Erro', 'Não foi possível guardar as alterações.');
      })
      .finally(() => setSaving(false));
  };

  const openSheet = (key: Exclude<SheetKey, null>) => {
    if (isReadOnly) return;
    if (key === 'name') setNameDraft(name);
    if (key === 'weight') setWeightDraft(weightKg?.toString() ?? '');
    if (key === 'birthdate') setBirthdayDraft(isoToDisplay(birthdate));
    if (key === 'breed') setBreedSearch('');
    setSheet(key);
  };

  const closeSheet = () => setSheet(null);

  const handleToggleTemperament = (label: string) => {
    if (isReadOnly) return;
    const entries = Object.entries(TEMPERAMENT_LABELS_PT) as [DogTemperament, string][];
    const pair = entries.find(([, l]) => l === label);
    if (!pair) return;
    const key = pair[0];
    setTemperament((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const commitName = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      Alert.alert(t('tutor.editBasicInfo.nameRequired'), t('tutor.editBasicInfo.dogNeedsName'));
      return;
    }
    setName(trimmed);
    closeSheet();
  };

  const commitWeight = (val: string) => {
    const normalized = val.replace(',', '.').trim();
    if (!normalized) {
      setWeightKg(null);
      closeSheet();
      return;
    }
    const num = Number(normalized);
    if (!Number.isFinite(num) || num <= 0 || num > 120) {
      Alert.alert(t('tutor.editBasicInfo.invalidWeight'), t('tutor.editBasicInfo.invalidWeightMsg'));
      return;
    }
    setWeightKg(Math.round(num * 10) / 10);
    closeSheet();
  };

  const commitBirthdate = (val: string) => {
    if (!val.trim()) {
      setBirthdate(null);
      closeSheet();
      return;
    }
    const iso = displayToIso(val);
    if (!iso) {
      Alert.alert(t('tutor.editBasicInfo.invalidDate'), t('tutor.editBasicInfo.invalidDateMsg'));
      return;
    }
    setBirthdate(iso);
    closeSheet();
  };

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editBasicInfo.basicInformation')}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  return (
    <DogScreenShell
      title={t('tutor.editBasicInfo.basicInformation')}
      contentBackground={DOG_COLORS.white}
      bottomBar={
        !isReadOnly ? (
          <ConfirmButton onPress={handleSave} disabled={saving} label={saving ? 'A guardar...' : undefined} />
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Photo Picker */}
        <View style={styles.photoWrap}>
          <Pressable onPress={handlePhoto} style={styles.photoHit}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={[styles.photo, styles.photoEmpty]} />
            )}
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>📷</Text>
            </View>
          </Pressable>
        </View>

        <FormSection title={t('tutor.editBasicInfo.aboutYourDog')}>
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.row, styles.rowDivider, pressed && !isReadOnly && styles.rowPressed]}
              onPress={() => openSheet('name')}
            >
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>{t('tutor.editBasicInfo.name')}</Text>
                <Text style={styles.rowValue}>{name}</Text>
              </View>
              {!isReadOnly && <Text style={styles.pencilIcon}>✏️</Text>}
            </Pressable>

            <RowButton
              label={t('tutor.editBasicInfo.gender')}
              value={gender ? GENDER_LABELS_PT[gender] : undefined}
              onPress={() => openSheet('gender')}
              isReadOnly={isReadOnly}
            />

            <RowButton
              label={t('tutor.editBasicInfo.breed')}
              value={breed ?? undefined}
              onPress={() => openSheet('breed')}
              isReadOnly={isReadOnly}
            />

            <RowButton
              label={t('tutor.editBasicInfo.sterilization')}
              value={sterilizedDisplay}
              onPress={() => openSheet('sterilized')}
              isReadOnly={isReadOnly}
            />

            <RowButton
              label={t('tutor.editBasicInfo.dateOfBirth')}
              value={birthdateDisplay}
              onPress={() => openSheet('birthdate')}
              isReadOnly={isReadOnly}
            />

            <Pressable
              style={({ pressed }) => [styles.row, styles.rowDivider, pressed && !isReadOnly && styles.rowPressed]}
              onPress={() => openSheet('weight')}
            >
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>{t('tutor.editBasicInfo.weight')}</Text>
                <Text style={[styles.rowValue, !weightKg && styles.rowValueEmpty, isReadOnly && !weightKg && { color: colors.textSecondary }]}>
                  {weightKg !== null ? `${weightKg} kg` : (isReadOnly ? 'Não preenchido' : 'adicionar')}
                </Text>
              </View>
              {!isReadOnly && <Text style={styles.pencilIcon}>✏️</Text>}
            </Pressable>

            <RowButton
              label={t('tutor.editBasicInfo.size')}
              value={size ? sizeLabels[size] : undefined}
              onPress={() => openSheet('size')}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection
          title={t('tutor.editBasicInfo.temperament')}
          description={t('tutor.editBasicInfo.temperamentDescription')}
        >
          <ChipsMultiSelect
            options={Object.values(TEMPERAMENT_LABELS_PT)}
            selected={temperament.map((t) => TEMPERAMENT_LABELS_PT[t])}
            onToggle={handleToggleTemperament}
            disabled={isReadOnly}
          />
          {!temperamentDisplay ? (
            <Text style={styles.chipsHint}>{isReadOnly ? 'Não preenchido' : t('tutor.editBasicInfo.optionalComeBackLater')}</Text>
          ) : null}
        </FormSection>
      </ScrollView>

      {/* Sheets */}
      <PickerSheet<DogGender>
        visible={sheet === 'gender'}
        title={t('tutor.editBasicInfo.gender')}
        options={genderOptions}
        selectedValue={gender || undefined}
        onSelect={(v) => {
          setGender(v);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PickerSheet<string>
        visible={sheet === 'breed'}
        title={t('tutor.editBasicInfo.breed')}
        options={breedOptions}
        selectedValue={breed || undefined}
        onSelect={(v) => {
          setBreed(v);
          closeSheet();
        }}
        onClose={closeSheet}
        searchable
        search={breedSearch}
        onSearchChange={setBreedSearch}
      />

      <PickerSheet<string>
        visible={sheet === 'sterilized'}
        title={t('tutor.editBasicInfo.sterilization')}
        options={sterilizedOptions}
        selectedValue={
          isSterilized === true
            ? 'yes'
            : isSterilized === false
            ? 'no'
            : isSterilized === null
            ? 'unknown'
            : undefined
        }
        onSelect={(v) => {
          setIsSterilized(v === 'yes' ? true : v === 'no' ? false : null);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PickerSheet<DogSize>
        visible={sheet === 'size'}
        title={t('tutor.editBasicInfo.size')}
        options={sizeOptions}
        selectedValue={size || undefined}
        onSelect={(v) => {
          setSize(v);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <InputSheet
        visible={sheet === 'name'}
        title={t('tutor.editBasicInfo.name')}
        placeholder="Ex: Theo"
        initialValue={nameDraft}
        onConfirm={commitName}
        onClose={closeSheet}
        autoCapitalize="words"
      />

      <InputSheet
        visible={sheet === 'weight'}
        title={t('tutor.editBasicInfo.weight')}
        placeholder="Ex: 22"
        initialValue={weightDraft}
        onConfirm={commitWeight}
        onClose={closeSheet}
        keyboardType="decimal-pad"
        suffix="kg"
      />

      <InputSheet
        visible={sheet === 'birthdate'}
        title={t('tutor.editBasicInfo.dateOfBirth')}
        placeholder={t('tutor.editBasicInfo.dateFormat')}
        initialValue={birthdayDraft}
        onConfirm={commitBirthdate}
        onClose={closeSheet}
        keyboardType="number-pad"
        maxLength={10}
        autoFormat="date"
      />
    </DogScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing[6] },
  photoWrap: { alignItems: 'center', paddingTop: spacing[2], paddingBottom: spacing[4] },
  photoHit: { width: 128, height: 128, borderRadius: 64, position: 'relative' },
  photo: { width: 128, height: 128, borderRadius: 64 },
  photoEmpty: { backgroundColor: colors.canvas },
  photoBadge: {
    position: 'absolute', right: 0, bottom: 4, width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff'
  },
  photoBadgeText: { fontSize: 16 },
  card: {
    marginHorizontal: 0, backgroundColor: '#fff', borderRadius: DOG_RADIUS.card,
    borderWidth: 1, borderColor: DOG_COLORS.divider, overflow: 'hidden', ...DOG_SHADOW
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: DOG_COLORS.divider },
  rowPressed: { backgroundColor: 'rgba(0,0,0,0.02)' },
  rowTexts: { flex: 1, gap: 4 },
  rowLabel: DOG_FONT.rowLabel,
  rowValue: DOG_FONT.rowValue,
  rowValueEmpty: { color: colors.accent, fontFamily: font.semiBold },
  pencilIcon: { fontSize: 16, color: colors.textSecondary },
  chipsHint: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 12 },
});
