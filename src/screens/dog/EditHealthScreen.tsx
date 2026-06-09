import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
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
  InputSheet,
  RowButton,
} from './_shared';
import {
  ALLERGY_OPTIONS_PT,
  type DogHealth,
  type DogVaccine,
} from '../../types/dog';

type ActiveSheet =
  | 'chip'
  | 'vaccine_name'
  | 'vaccine_date'
  | 'deworm_in_date'
  | 'deworm_in_product'
  | 'deworm_ex_date'
  | 'deworm_ex_product'
  | 'allergy_other'
  | 'medication'
  | 'vet_name'
  | 'vet_clinic'
  | 'vet_phone'
  | null;

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
  return `${yyyy}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isoToDisplay(iso: string | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

function isValidChip(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 15;
}

function TrashIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke={colors.error}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function EditHealthScreen({ id, isReadOnly = false }: { id?: string; isReadOnly?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [chipNumber, setChipNumber] = useState<string | undefined>(undefined);
  const [vaccines, setVaccines] = useState<DogVaccine[]>([]);
  const [internalDate, setInternalDate] = useState<string | undefined>(undefined);
  const [internalProduct, setInternalProduct] = useState<string | undefined>(undefined);
  const [externalDate, setExternalDate] = useState<string | undefined>(undefined);
  const [externalProduct, setExternalProduct] = useState<string | undefined>(undefined);
  const [allergyTags, setAllergyTags] = useState<string[]>([]);
  const [allergyOther, setAllergyOther] = useState<string | undefined>(undefined);
  const [medication, setMedication] = useState<string | undefined>(undefined);
  const [vetName, setVetName] = useState<string | undefined>(undefined);
  const [vetClinic, setVetClinic] = useState<string | undefined>(undefined);
  const [vetPhone, setVetPhone] = useState<string | undefined>(undefined);

  const [sheet, setSheet] = useState<ActiveSheet>(null);
  const [tempText, setTempText] = useState('');
  const [draftVaccineName, setDraftVaccineName] = useState('');

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    const endpoint = isReadOnly ? `/dogs/${id}/public` : `/dogs/${id}`;
    apiClient.get<any>(endpoint)
      .then((data) => {
        if (data) {
          setProfile(data);
          const initial: DogHealth = data.healthJson ? JSON.parse(data.healthJson) : {};
          
          setChipNumber(initial.chipNumber);
          setVaccines(initial.vaccines ?? []);
          setInternalDate(initial.deworming?.internal?.lastDate);
          setInternalProduct(initial.deworming?.internal?.product);
          setExternalDate(initial.deworming?.external?.lastDate);
          setExternalProduct(initial.deworming?.external?.product);
          setAllergyTags(initial.allergies?.tags ?? []);
          setAllergyOther(initial.allergies?.other);
          setMedication(initial.medication);
          setVetName(initial.vet?.name);
          setVetClinic(initial.vet?.clinic);
          setVetPhone(initial.vet?.phone);
        }
      })
      .catch((err) => {
        console.error('Error fetching dog health:', err);
        Alert.alert(t('common.error') || 'Erro', 'Não foi possível carregar os dados de saúde do cão.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const openSheet = (which: ActiveSheet, seed = '') => {
    if (isReadOnly) return;
    setTempText(seed);
    setSheet(which);
  };
  const closeSheet = () => {
    setSheet(null);
    setTempText('');
  };

  const toggleAllergy = (tag: string) => {
    if (isReadOnly) return;
    setAllergyTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const removeVaccine = (idx: number) => {
    setVaccines((prev) => prev.filter((_, i) => i !== idx));
  };

  const startAddVaccine = () => {
    setDraftVaccineName('');
    openSheet('vaccine_name', '');
  };

  const handleSave = () => {
    if (chipNumber && !isValidChip(chipNumber)) {
      Alert.alert(t('tutor.editHealth.invalidChip'), t('tutor.editHealth.invalidChipMsg'));
      return;
    }
    
    setSaving(true);

    const next: DogHealth = {};
    if (chipNumber) next.chipNumber = chipNumber;
    if (vaccines.length > 0) next.vaccines = vaccines;
    if (internalDate || externalDate) {
      next.deworming = {};
      if (internalDate) {
        next.deworming.internal = { lastDate: internalDate, product: internalProduct };
      }
      if (externalDate) {
        next.deworming.external = { lastDate: externalDate, product: externalProduct };
      }
    }
    if (allergyTags.length > 0 || allergyOther) {
      next.allergies = { tags: allergyTags, other: allergyOther };
    }
    if (medication) next.medication = medication;
    if (vetName || vetClinic || vetPhone) {
      next.vet = { name: vetName, clinic: vetClinic, phone: vetPhone };
    }

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
      behaviorJson: profile.behaviorJson,
      healthJson: JSON.stringify(next),
    };

    apiClient.put(`/dogs/${id}`, payload)
      .then(() => {
        router.back();
      })
      .catch((err) => {
        console.error('Error saving health profile:', err);
        Alert.alert('Erro', 'Não foi possível guardar os dados de saúde.');
      })
      .finally(() => setSaving(false));
  };

  const handleBack = () => {
    if (isReadOnly) {
      router.replace(`/buddyid/public/${id}` as any);
    } else {
      router.back();
    }
  };

  const sortedVaccines = useMemo(
    () => [...vaccines].sort((a, b) => b.date.localeCompare(a.date)),
    [vaccines],
  );

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editHealthScreen.healthAndVets')} onBack={handleBack}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  return (
    <DogScreenShell
      title={t('tutor.editHealthScreen.healthAndVets')}
      contentBackground={DOG_COLORS.white}
      onBack={handleBack}
      bottomBar={!isReadOnly ? <ConfirmButton label={t('tutor.dogEditShared.save')} onPress={handleSave} disabled={saving} /> : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introWrap}>
          <Text style={styles.introBody}>
            {t('tutor.editHealth.optionalDataInfo', { name: profile.name })}
          </Text>
        </View>

        <FormSection title={t('tutor.editHealth.identification')}>
          <View style={styles.card}>
            <RowButton
              label={t('tutor.editHealth.chipNumber')}
              value={chipNumber ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('chip', chipNumber ?? '')}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection title={t('tutor.editHealth.vaccines')}>
          <View style={styles.card}>
            {sortedVaccines.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>{t('tutor.editHealth.noVaccines')}</Text>
              </View>
            ) : (
              sortedVaccines.map((v, idx) => (
                <View
                  key={`${v.name}-${v.date}-${idx}`}
                  style={[styles.vaccineRow, idx !== sortedVaccines.length - 1 && styles.rowDivider]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vaccineName}>{v.name}</Text>
                    <Text style={styles.vaccineDate}>{isoToDisplay(v.date)}</Text>
                  </View>
                  {!isReadOnly && (
                    <Pressable
                      hitSlop={10}
                      onPress={() => {
                        const original = vaccines.findIndex(
                          (x) => x.name === v.name && x.date === v.date,
                        );
                        if (original >= 0) removeVaccine(original);
                      }}
                      accessibilityLabel={t('tutor.editHealth.removeVaccine', { name: v.name })}
                    >
                      <TrashIcon />
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </View>
          {!isReadOnly && (
            <Pressable
              onPress={startAddVaccine}
              style={({ pressed }) => [styles.addRow, pressed && { opacity: 0.7 }]}
            >
              <View style={{ width: 18, height: 18, marginRight: 8, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold', lineHeight: 18 }}>+</Text>
              </View>
              <Text style={styles.addLabel}>{t('tutor.editHealth.addVaccine')}</Text>
            </Pressable>
          )}
        </FormSection>

        <FormSection title={t('tutor.editHealth.deworming')}>
          <View style={styles.card}>
            <RowButton
              label={t('tutor.editHealth.internalLastDate')}
              value={isoToDisplay(internalDate) || null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('deworm_in_date', isoToDisplay(internalDate))}
              isReadOnly={isReadOnly}
            />
            <RowButton
              label={t('tutor.editHealth.internalProduct')}
              value={internalProduct ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('deworm_in_product', internalProduct ?? '')}
              isReadOnly={isReadOnly}
            />
            <RowButton
              label={t('tutor.editHealth.externalLastDate')}
              value={isoToDisplay(externalDate) || null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('deworm_ex_date', isoToDisplay(externalDate))}
              isReadOnly={isReadOnly}
            />
            <RowButton
              label={t('tutor.editHealth.externalProduct')}
              value={externalProduct ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('deworm_ex_product', externalProduct ?? '')}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection title={t('tutor.editHealth.allergies')}>
          <ChipsMultiSelect
            options={ALLERGY_OPTIONS_PT}
            selected={allergyTags}
            onToggle={toggleAllergy}
            disabled={isReadOnly}
          />
          <View style={[styles.card, { marginTop: 12 }]}>
            <RowButton
              label={t('tutor.editHealth.otherAllergies')}
              value={allergyOther ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('allergy_other', allergyOther ?? '')}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection title={t('tutor.editHealth.currentMedication')}>
          <View style={styles.card}>
            <RowButton
              label={t('tutor.editHealth.medication')}
              value={medication ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('medication', medication ?? '')}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>

        <FormSection title={t('tutor.editHealth.usualVeterinarian')}>
          <View style={styles.card}>
            <RowButton
              label={t('tutor.editHealth.vetName')}
              value={vetName ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('vet_name', vetName ?? '')}
              isReadOnly={isReadOnly}
            />
            <RowButton
              label={t('tutor.editHealth.clinic')}
              value={vetClinic ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('vet_clinic', vetClinic ?? '')}
              isReadOnly={isReadOnly}
            />
            <RowButton
              label={t('tutor.editHealth.contact')}
              value={vetPhone ?? null}
              placeholder={t('tutor.editHealth.optional')}
              onPress={() => openSheet('vet_phone', vetPhone ?? '')}
              isLast
              isReadOnly={isReadOnly}
            />
          </View>
        </FormSection>
      </ScrollView>

      {/* Sheets */}
      <InputSheet
        visible={sheet === 'chip'}
        title={t('tutor.editHealth.chipNumber')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          const text = val.replace(/\D/g, '').slice(0, 15);
          if (!text) {
            setChipNumber(undefined);
            closeSheet();
            return;
          }
          if (!isValidChip(text)) {
            Alert.alert(t('tutor.editHealth.invalidChip'), t('tutor.editHealth.invalidChipMsg'));
            return;
          }
          setChipNumber(text);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.digits15')}
        keyboardType="number-pad"
        maxLength={15}
        helper={t('tutor.editHealth.siacNumber')}
      />

      <InputSheet
        visible={sheet === 'vaccine_name'}
        title={t('tutor.editHealth.vaccineName')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          const trimmed = val.trim();
          if (!trimmed) {
            closeSheet();
            return;
          }
          setDraftVaccineName(trimmed);
          setTempText('');
          setSheet('vaccine_date');
        }}
        placeholder={t('tutor.editHealth.vaccineExample')}
        autoCapitalize="sentences"
        maxLength={50}
      />

      <InputSheet
        visible={sheet === 'vaccine_date'}
        title={t('tutor.editHealth.vaccineDate')}
        initialValue={tempText}
        onClose={() => {
          setDraftVaccineName('');
          closeSheet();
        }}
        onConfirm={(val) => {
          const iso = displayToIso(val);
          if (!iso) {
            Alert.alert(t('tutor.editHealth.invalidDate'), t('tutor.editHealth.invalidDateMsg'));
            return;
          }
          setVaccines((prev) => [...prev, { name: draftVaccineName, date: iso }]);
          setDraftVaccineName('');
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.dateFormat')}
        keyboardType="number-pad"
        maxLength={10}
        autoFormat="date"
        helper={t('tutor.editHealth.dateFormatHelper')}
      />

      <InputSheet
        visible={sheet === 'deworm_in_date'}
        title={t('tutor.editHealth.internalDewormingDate')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          if (!val) {
            setInternalDate(undefined);
            closeSheet();
            return;
          }
          const iso = displayToIso(val);
          if (!iso) {
            Alert.alert(t('tutor.editHealth.invalidDate'), t('tutor.editHealth.invalidDateMsg'));
            return;
          }
          setInternalDate(iso);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.dateFormat')}
        keyboardType="number-pad"
        maxLength={10}
        autoFormat="date"
      />

      <InputSheet
        visible={sheet === 'deworm_in_product'}
        title={t('tutor.editHealth.productBrand')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setInternalProduct(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.internalDewormingExample')}
        maxLength={40}
      />

      <InputSheet
        visible={sheet === 'deworm_ex_date'}
        title={t('tutor.editHealth.externalDewormingDate')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          if (!val) {
            setExternalDate(undefined);
            closeSheet();
            return;
          }
          const iso = displayToIso(val);
          if (!iso) {
            Alert.alert(t('tutor.editHealth.invalidDate'), t('tutor.editHealth.invalidDateMsg'));
            return;
          }
          setExternalDate(iso);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.dateFormat')}
        keyboardType="number-pad"
        maxLength={10}
        autoFormat="date"
      />

      <InputSheet
        visible={sheet === 'deworm_ex_product'}
        title={t('tutor.editHealth.productBrand')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setExternalProduct(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.externalDewormingExample')}
        maxLength={40}
      />

      <InputSheet
        visible={sheet === 'allergy_other'}
        title={t('tutor.editHealth.otherAllergies')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setAllergyOther(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.briefDescription')}
        maxLength={120}
        multiline
      />

      <InputSheet
        visible={sheet === 'medication'}
        title={t('tutor.editHealth.currentMedication')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setMedication(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.medicationPlaceholder')}
        maxLength={300}
        multiline
      />

      <InputSheet
        visible={sheet === 'vet_name'}
        title={t('tutor.editHealth.vetName')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setVetName(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.vetNameExample')}
        autoCapitalize="words"
        maxLength={60}
      />

      <InputSheet
        visible={sheet === 'vet_clinic'}
        title={t('tutor.editHealth.clinic')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setVetClinic(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.clinicName')}
        autoCapitalize="words"
        maxLength={80}
      />

      <InputSheet
        visible={sheet === 'vet_phone'}
        title={t('tutor.editHealth.contact')}
        initialValue={tempText}
        onClose={closeSheet}
        onConfirm={(val) => {
          setVetPhone(val.trim() || undefined);
          closeSheet();
        }}
        placeholder={t('tutor.editHealth.phone')}
        keyboardType="number-pad"
        maxLength={20}
      />
    </DogScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing[6] },
  introWrap: { paddingHorizontal: 16, paddingTop: 16 },
  introBody: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18 },
  card: { backgroundColor: '#fff', borderRadius: DOG_RADIUS.card, borderWidth: 1, borderColor: colors.borderSoft, overflow: 'hidden', ...DOG_SHADOW },
  vaccineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  vaccineName: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text },
  vaccineDate: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  emptyRow: { paddingVertical: 16, paddingHorizontal: 16 },
  emptyText: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textMuted },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, alignSelf: 'flex-start' },
  addLabel: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: colors.primary },
});
