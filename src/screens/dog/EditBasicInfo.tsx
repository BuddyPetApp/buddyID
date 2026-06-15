import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  CheckCircleFilled,
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
  const [breedOther, setBreedOther] = useState<string | null>(null);
  const [isSterilized, setIsSterilized] = useState<boolean | null>(null);
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [size, setSize] = useState<DogSize | null>(null);
  const [temperament, setTemperament] = useState<DogTemperament[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [tempPhotoUri, setTempPhotoUri] = useState<string | null>(null);

  const [sheet, setSheet] = useState<SheetKey>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [weightDraft, setWeightDraft] = useState('');
  const [birthdayDraft, setBirthdayDraft] = useState('');

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    const endpoint = isReadOnly ? `/dogs/${id}/public` : `/dogs/${id}`;
    apiClient.get<any>(endpoint)
      .then((data) => {
        if (data) {
          setProfile(data);
          setName(data.name || '');
          setGender(data.gender || null);
          setBreed(data.breed || null);
          setBreedOther(data.breedOther || null);
          setBirthdate(data.birthdate || null);
          setWeightKg(data.weightKg || null);
          setSize(data.size || null);
          setPhotoUrl(data.photoUrl || null);
          setTempPhotoUri(null);

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

  const displayPhoto = tempPhotoUri || photoUrl;

  const handlePhoto = async () => {
    if (isReadOnly) return;
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('common.error') || 'Erro', 'É necessária permissão de acesso à galeria.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets?.[0]) {
      return;
    }

    setTempPhotoUri(pickerResult.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('tutor.editBasicInfo.nameRequired'), t('tutor.editBasicInfo.dogNeedsName'));
      return;
    }
    setSaving(true);

    try {
      let finalPhotoUrl = photoUrl;

      if (tempPhotoUri) {
        const response = await fetch(tempPhotoUri);
        const blob = await response.blob();

        let fileExt = 'jpg';
        if (tempPhotoUri.startsWith('data:')) {
          const mime = tempPhotoUri.split(';')[0].split(':')[1];
          fileExt = mime.split('/')[1] || 'jpg';
        } else {
          const parts = tempPhotoUri.split('.');
          const lastPart = parts[parts.length - 1];
          fileExt = lastPart.split('?')[0] || 'jpg';
        }

        fileExt = fileExt.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
          fileExt = 'jpg';
        }

        const fileName = `${id}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error } = await supabase.storage
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

        finalPhotoUrl = publicUrl;
      }

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
        breedOther: breed === 'other' ? breedOther : null,
        ageRange: ageRange,
        neutered: neutered,
        adopted: profile.adopted,
        photoUrl: finalPhotoUrl || null,
        habitsJson: finalHabitsJson,
        behaviorJson: profile.behaviorJson,
        healthJson: profile.healthJson,
      };

      await apiClient.put(`/dogs/${id}`, payload);
      
      setPhotoUrl(finalPhotoUrl);
      setTempPhotoUri(null);

      Alert.alert('Sucesso', 'Alterações guardadas com sucesso!');
      fetchProfile();
    } catch (err) {
      console.error('Error updating basic info:', err);
      Alert.alert('Erro', 'Não foi possível guardar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const openSheet = (key: Exclude<SheetKey, null>) => {
    if (isReadOnly) return;
    if (key === 'name') setNameDraft(name);
    if (key === 'weight') setWeightDraft(weightKg?.toString() ?? '');
    if (key === 'birthdate') setBirthdayDraft(isoToDisplay(birthdate));
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

  const goBackOrRedirect = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/buddyid/dog/${id}` as any);
    }
  };

  const handleBack = () => {
    if (isReadOnly) {
      router.replace(`/buddyid/public/${id}` as any);
    } else {
      goBackOrRedirect();
    }
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
      onBack={handleBack}
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
            {displayPhoto ? (
              <Image source={{ uri: displayPhoto }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={[styles.photo, styles.photoEmpty]} />
            )}
            {!isReadOnly && (
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>📷</Text>
              </View>
            )}
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
              value={breed === 'other' ? (breedOther ?? 'Outra') : (breed ?? undefined)}
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

            {!(isReadOnly && !weightKg) && (
              <Pressable
                style={({ pressed }) => [styles.row, styles.rowDivider, pressed && !isReadOnly && styles.rowPressed]}
                onPress={isReadOnly ? undefined : () => openSheet('weight')}
              >
                <View style={styles.rowTexts}>
                  <Text style={styles.rowLabel}>{t('tutor.editBasicInfo.weight')}</Text>
                  <Text style={[styles.rowValue, !weightKg && styles.rowValueEmpty, isReadOnly && !weightKg && { color: colors.textSecondary }]}>
                    {!weightKg ? (isReadOnly ? 'Não preenchido' : t('tutor.editBasicInfo.addWeight')) : `${weightKg} kg`}
                  </Text>
                </View>
                {!isReadOnly && <Text style={styles.pencilIcon}>✏️</Text>}
              </Pressable>
            )}

            {!(isReadOnly && !size) && (
              <RowButton
                label={t('tutor.editBasicInfo.size')}
                value={size ? sizeLabels[size] : undefined}
                onPress={() => openSheet('size')}
                isLast
                isReadOnly={isReadOnly}
              />
            )}
          </View>
        </FormSection>

        {!(isReadOnly && (!temperament || temperament.length === 0)) && (
          <FormSection
            title={t('tutor.editBasicInfo.temperament')}
            description={!isReadOnly ? t('tutor.editBasicInfo.temperamentDescription') : undefined}
          >
            <ChipsMultiSelect
              options={Object.values(TEMPERAMENT_LABELS_PT)}
              selected={temperament.map((t) => TEMPERAMENT_LABELS_PT[t])}
              onToggle={handleToggleTemperament}
              disabled={isReadOnly}
            />
            {!temperamentDisplay && !isReadOnly ? (
              <Text style={styles.chipsHint}>{t('tutor.editBasicInfo.optionalComeBackLater')}</Text>
            ) : null}
            {isReadOnly && !temperamentDisplay ? (
              <Text style={styles.chipsHint}>Não preenchido</Text>
            ) : null}
          </FormSection>
        )}
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

      <BreedPickerSheet
        visible={sheet === 'breed'}
        initialBreed={breed}
        initialBreedOther={breedOther}
        onClose={closeSheet}
        onConfirm={(b, bo) => {
          setBreed(b);
          setBreedOther(bo);
          closeSheet();
        }}
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

function BreedPickerSheet({
  visible,
  onClose,
  initialBreed,
  initialBreedOther,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  initialBreed: string | null;
  initialBreedOther: string | null;
  onConfirm: (breed: string | null, breedOther: string | null) => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [customBreed, setCustomBreed] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const translateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 600,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (visible) {
      setSelectedBreed(initialBreed);
      setCustomBreed(initialBreedOther || '');
      setSearch(initialBreed === 'other' ? 'Outra' : (initialBreed || ''));
      setShowSuggestions(false);
    }
  }, [visible, translateY, initialBreed, initialBreedOther]);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = (!query || query === (selectedBreed === 'other' ? 'outra' : selectedBreed?.toLowerCase()))
      ? DOG_BREEDS_PT
      : DOG_BREEDS_PT.filter(b => b.toLowerCase().includes(query));
    return [...filtered, 'Outra'];
  }, [search, selectedBreed]);

  const handleSelect = (breedName: string) => {
    if (breedName === 'Outra') {
      setSelectedBreed('other');
      setSearch('Outra');
    } else {
      setSelectedBreed(breedName);
      setSearch(breedName);
      setCustomBreed('');
    }
    setShowSuggestions(false);
  };

  const handleChangeText = (text: string) => {
    setSearch(text);
    const exactMatch = DOG_BREEDS_PT.find(b => b.toLowerCase() === text.trim().toLowerCase());
    if (exactMatch) {
      setSelectedBreed(exactMatch);
    } else if (text.trim().toLowerCase() === 'outra') {
      setSelectedBreed('other');
    } else {
      setSelectedBreed(null);
    }
    setShowSuggestions(true);
  };

  const handleSave = () => {
    if (selectedBreed === 'other' && !customBreed.trim()) {
      Alert.alert('Erro', 'Por favor, escreve o nome da raça.');
      return;
    }
    if (!selectedBreed) {
      Alert.alert('Erro', 'Por favor, seleciona uma raça da lista ou escolhe "Outra".');
      return;
    }
    onConfirm(selectedBreed, selectedBreed === 'other' ? customBreed.trim() : null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }], maxHeight: '85%' }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.grabber} />
          <Text style={styles.title}>{t('tutor.editBasicInfo.breed')}</Text>

          <View style={styles.search}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: Border Collie, Labrador..."
              placeholderTextColor={DOG_COLORS.label}
              value={search}
              onChangeText={handleChangeText}
              onFocus={() => setShowSuggestions(true)}
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          <View style={{ flex: 1, minHeight: 150 }}>
            {showSuggestions && suggestions.length > 0 ? (
              <ScrollView
                style={[styles.list, { maxHeight: 220 }]}
                contentContainerStyle={{ paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {suggestions.map((item, idx) => {
                  const isSelected =
                    (item === 'Outra' && selectedBreed === 'other') ||
                    (item !== 'Outra' && selectedBreed === item);

                  return (
                    <Pressable
                      key={item + idx}
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.option,
                        idx !== suggestions.length - 1 && styles.optionDivider,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <Text style={[styles.optionLabel, isSelected && styles.optionSelected]}>
                        {item}
                      </Text>
                      {isSelected && <CheckCircleFilled size={22} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}

            {selectedBreed === 'other' && (
              <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <Text style={[DOG_FONT.rowLabel, { marginBottom: 8 }]}>Escreve a raça</Text>
                <View style={styles.fieldRow}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Ex: Dobberman, Pastor Belga Malinois..."
                    placeholderTextColor={DOG_COLORS.label}
                    value={customBreed}
                    onChangeText={setCustomBreed}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={[styles.actions, { marginBottom: 24 }]}>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.confirm,
                pressed && styles.confirmPressed,
              ]}
            >
              <Text style={styles.confirmText}>{t('tutor.dogEditShared.save')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: DOG_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 0,
    maxHeight: '75%',
    minHeight: 260,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DOG_COLORS.divider,
    marginBottom: 12,
  },
  title: {
    fontFamily: font.semiBold,
    fontSize: fontSize.md,
    color: DOG_COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  search: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    height: 44,
    borderRadius: DOG_RADIUS.input,
    backgroundColor: DOG_COLORS.surfaceWarm,
    paddingHorizontal: 14,
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
  list: { flexGrow: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DOG_COLORS.divider,
  },
  optionPressed: { backgroundColor: 'rgba(0,0,0,0.03)' },
  optionLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
  optionSelected: {
    fontFamily: font.semiBold,
    color: DOG_COLORS.primary,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DOG_COLORS.divider,
    borderRadius: DOG_RADIUS.input,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  inputField: {
    flex: 1,
    height: 52,
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: DOG_COLORS.text,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  confirm: {
    height: 52,
    borderRadius: DOG_RADIUS.pill,
    backgroundColor: DOG_COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPressed: { opacity: 0.85 },
  confirmText: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: DOG_COLORS.white,
  },
});

