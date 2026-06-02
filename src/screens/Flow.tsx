import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, shadows, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { ChoiceButton, ChoiceRow, Divider, MultiChoiceList, SectionHint, SectionLabel } from './shared';
import {
  INITIAL_FORM_DATA,
  type Attachment,
  type BuddyIDFormData,
  type DogOrigin,
  type DogSize,
  type EnergyLevel,
  type ExerciseDuration,
  type Gender,
  type HomePeopleBehavior,
  type Housing,
  type NewSituations,
  type NeuteredStatus,
  type Obedience,
  type SeparationAnxiety,
  type SleepingPlace,
  type StrangerBehavior,
  type TouchSensitivity,
} from './types';

const TOTAL_QUESTIONS = 14;
const BUDDYID_FORM_KEY = 'buddyid_pending_form';

const STEPS = [
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7',
  'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14',
  'consent',
] as const;
type StepKey = typeof STEPS[number];

export default function Flow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<BuddyIDFormData>(INITIAL_FORM_DATA);
  const scrollRef = useRef<ScrollView>(null);

  const currentStep = STEPS[stepIndex];
  const questionNumber = stepIndex < TOTAL_QUESTIONS ? stepIndex + 1 : null;
  const progress = (stepIndex + 1) / STEPS.length;

  function update<K extends keyof BuddyIDFormData>(key: K, value: BuddyIDFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key: 'leashBehavior' | 'housemates' | 'fears' | 'services' | 'goals', value: string) {
    setForm((prev) => {
      const list = prev[key] as string[];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }

  function goBack() {
    if (stepIndex === 0) {
      router.back();
    } else {
      setStepIndex((s) => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }

  function goNext() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    await AsyncStorage.setItem(BUDDYID_FORM_KEY, JSON.stringify(form));
    router.replace('/buddyid/loading' as any);
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      update('photoUri', result.assets[0].uri);
    }
  }

  function isContinueDisabled(): boolean {
    switch (currentStep) {
      case 'q1': return form.name.trim().length < 1;
      case 'q2': return form.breed.trim().length < 1 || !form.size;
      case 'q3': return form.age.trim().length < 1 || !form.gender || !form.neutered;
      case 'q9': return !form.email.includes('@');
      case 'q10': return form.phone.trim().length < 7;
      case 'q11': return form.city.trim().length < 2;
      case 'consent': return !form.consentDataUse;
      default: return false;
    }
  }

  const continueLabel = currentStep === 'consent'
    ? `Criar o BuddyID do ${form.name || 'meu cão'}`
    : 'Continuar';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        {questionNumber != null ? (
          <Text style={styles.stepCounter}>{questionNumber} de {TOTAL_QUESTIONS}</Text>
        ) : (
          <View style={styles.stepCounterPlaceholder} />
        )}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepContent
            step={currentStep}
            form={form}
            update={update}
            toggleMulti={toggleMulti}
            pickPhoto={pickPhoto}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={continueLabel}
            onPress={goNext}
            disabled={isContinueDisabled()}
            variant="primary"
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface StepProps {
  step: StepKey;
  form: BuddyIDFormData;
  update: <K extends keyof BuddyIDFormData>(key: K, value: BuddyIDFormData[K]) => void;
  toggleMulti: (key: 'leashBehavior' | 'housemates' | 'fears' | 'services' | 'goals', value: string) => void;
  pickPhoto: () => void;
}

function StepContent({ step, form, update, toggleMulti, pickPhoto }: StepProps) {
  switch (step) {
    case 'q1': return <Q1 form={form} update={update} pickPhoto={pickPhoto} />;
    case 'q2': return <Q2 form={form} update={update} />;
    case 'q3': return <Q3 form={form} update={update} />;
    case 'q4': return <Q4 form={form} update={update} />;
    case 'q5': return <Q5 form={form} toggleMulti={toggleMulti} />;
    case 'q6': return <Q6 form={form} update={update} />;
    case 'q7': return <Q7 form={form} update={update} />;
    case 'q8': return <Q8 form={form} update={update} />;
    case 'q9': return <Q9 form={form} update={update} />;
    case 'q10': return <Q10 form={form} update={update} />;
    case 'q11': return <Q11 form={form} update={update} />;
    case 'q12': return <Q12 form={form} toggleMulti={toggleMulti} />;
    case 'q13': return <Q13 form={form} update={update} />;
    case 'q14': return <Q14 form={form} toggleMulti={toggleMulti} />;
    case 'consent': return <Consent form={form} update={update} />;
  }
}

function Q1({ form, update, pickPhoto }: Pick<StepProps, 'form' | 'update' | 'pickPhoto'>) {
  return (
    <View>
      <Text style={s.title}>Como se chama o teu cão?</Text>
      <TouchableOpacity onPress={pickPhoto} style={s.photoBox} activeOpacity={0.8}>
        {form.photoUri ? (
          <Image source={{ uri: form.photoUri }} style={s.photoImage} />
        ) : (
          <View style={s.photoPlaceholder}>
            <Text style={s.photoIcon}>📷</Text>
            <Text style={s.photoHint}>Adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>
      <SectionLabel>Nome do cão</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="Ex: Theo"
        placeholderTextColor={colors.textMuted}
        value={form.name}
        onChangeText={(v) => update('name', v)}
        autoFocus
        autoCapitalize="words"
        returnKeyType="done"
      />
    </View>
  );
}

const DOG_SIZES: DogSize[] = ['XS', 'S', 'M', 'L', 'XL'];

function Q2({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Qual é a raça do teu cão?</Text>
      <SectionLabel>Raça</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="Ex: Border Collie, Labrador..."
        placeholderTextColor={colors.textMuted}
        value={form.breed}
        onChangeText={(v) => update('breed', v)}
        autoFocus
        autoCapitalize="words"
        returnKeyType="done"
      />
      <Divider />
      <SectionLabel>Tamanho</SectionLabel>
      <View style={s.sizeRow}>
        {DOG_SIZES.map((size) => (
          <ChoiceButton
            key={size}
            label={size}
            selected={form.size === size}
            onPress={() => update('size', size)}
            style={s.sizeBtn}
          />
        ))}
      </View>
    </View>
  );
}

function Q3({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Idade, género e condição</Text>
      <SectionLabel>Idade</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="Ex: 3 anos ou 6 meses"
        placeholderTextColor={colors.textMuted}
        value={form.age}
        onChangeText={(v) => update('age', v)}
        returnKeyType="done"
      />
      <Divider />
      <SectionLabel>Género</SectionLabel>
      <ChoiceRow
        options={['Macho', 'Fêmea']}
        selected={form.gender}
        onSelect={(v) => update('gender', v as Gender)}
        columns={2}
      />
      <Divider />
      <SectionLabel>Castrado / Esterilizado</SectionLabel>
      <ChoiceRow
        options={['Sim', 'Não', 'Não sei']}
        selected={form.neutered}
        onSelect={(v) => update('neutered', v as NeuteredStatus)}
      />
    </View>
  );
}

function Q4({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Nível de energia</Text>
      <SectionHint>Escolhe a que melhor descreve o teu cão.</SectionHint>
      <ChoiceRow
        options={['Calmo', 'Moderado', 'Muito ativo']}
        selected={form.energy}
        onSelect={(v) => update('energy', v as EnergyLevel)}
      />
      <Divider />
      <SectionLabel>Com estranhos</SectionLabel>
      <ChoiceRow
        options={['Amigável', 'Reservado', 'Reativo']}
        selected={form.withStrangers}
        onSelect={(v) => update('withStrangers', v as StrangerBehavior)}
      />
      <Divider />
      <SectionLabel>Com pessoas de casa</SectionLabel>
      <ChoiceRow
        options={['Nunca', 'Raramente', 'Por vezes']}
        selected={form.withHomePeople}
        onSelect={(v) => update('withHomePeople', v as HomePeopleBehavior)}
      />
    </View>
  );
}

const LEASH_OPTIONS = [
  'Puxa muito',
  'Puxa moderadamente',
  'Anda bem',
  'Reage a outros cães',
  'Reage a pessoas',
  'Reage a veículos',
];

function Q5({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  return (
    <View>
      <Text style={s.title}>Comportamento na trela</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList
        options={LEASH_OPTIONS}
        selected={form.leashBehavior}
        onToggle={(v) => toggleMulti('leashBehavior', v)}
      />
    </View>
  );
}

function Q6({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Comportamento com estranhos e em casa</Text>
      <SectionLabel>Com estranhos</SectionLabel>
      <ChoiceRow
        options={['Amigável', 'Reservado', 'Assustado', 'Protetor', 'Agressivo']}
        selected={form.withStrangers}
        onSelect={(v) => update('withStrangers', v as StrangerBehavior)}
      />
      <Divider />
      <SectionLabel>Com pessoas de casa</SectionLabel>
      <ChoiceRow
        options={['Nunca', 'Raramente', 'Por vezes']}
        selected={form.withHomePeople}
        onSelect={(v) => update('withHomePeople', v as HomePeopleBehavior)}
      />
    </View>
  );
}

function Q7({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Obediência</Text>
      <ChoiceRow
        options={['Aprende rápido', 'Seletivo', 'Difícil']}
        selected={form.obedience}
        onSelect={(v) => update('obedience', v as Obedience)}
      />
    </View>
  );
}

function Q8({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Nível de apego</Text>
      <ChoiceRow
        options={['Independente', 'Equilibrado', 'Colado']}
        selected={form.attachment}
        onSelect={(v) => update('attachment', v as Attachment)}
      />
    </View>
  );
}

function Q9({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Qual é o teu email?</Text>
      <TextInput
        style={s.input}
        placeholder="email@exemplo.com"
        placeholderTextColor={colors.textMuted}
        value={form.email}
        onChangeText={(v) => update('email', v.toLowerCase().trim())}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
        returnKeyType="done"
      />
      <Text style={s.fieldHint}>Os teus dados são privados e nunca partilhados.</Text>
    </View>
  );
}

function Q10({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Qual é o teu telemóvel?</Text>
      <TextInput
        style={s.input}
        placeholder="+351 912 345 678"
        placeholderTextColor={colors.textMuted}
        value={form.phone}
        onChangeText={(v) => update('phone', v)}
        keyboardType="phone-pad"
        autoFocus
        returnKeyType="done"
      />
      <Text style={s.fieldHint}>Só para confirmação de reservas.</Text>
    </View>
  );
}

function Q11({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Onde moras?</Text>
      <SectionLabel>Cidade</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="ex: Lisboa, Porto, Braga..."
        placeholderTextColor={colors.textMuted}
        value={form.city}
        onChangeText={(v) => update('city', v)}
        autoFocus
        autoCapitalize="words"
        returnKeyType="done"
      />
    </View>
  );
}

const HOUSING_OPTIONS: Housing[] = ['Apartamento', 'Casa sem jardim', 'Casa com jardim', 'Quinta / rural'];

function Q12({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  return (
    <View>
      <Text style={s.title}>Onde vivem juntos?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList
        options={HOUSING_OPTIONS}
        selected={form.housemates}
        onToggle={(v) => toggleMulti('housemates', v)}
      />
    </View>
  );
}

const SLEEP_OPTIONS: SleepingPlace[] = ['Na cama', 'No sofá', 'Cama própria', 'No exterior'];
const SEPARATION_OPTIONS: SeparationAnxiety[] = [
  'Fica calmo e tranquilo',
  'Ladra ou range um pouco',
  'Fica muito ansioso',
  'Destrói coisas quando fico fora',
  'Nunca o deixo sozinho',
  'Não sei',
];

function Q13({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Rotina e ansiedade</Text>
      <SectionLabel>Onde dorme?</SectionLabel>
      <ChoiceRow
        options={SLEEP_OPTIONS}
        selected={form.sleepingPlace}
        onSelect={(v) => update('sleepingPlace', v as SleepingPlace)}
        columns={2}
      />
      <Divider />
      <SectionLabel>Quando ficas fora de casa, o teu cão...</SectionLabel>
      {SEPARATION_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => update('separationAnxiety', opt as SeparationAnxiety)}
          style={[s.listRow, form.separationAnxiety === opt && s.listRowSelected]}
          activeOpacity={0.8}
        >
          <Text style={[s.listRowText, form.separationAnxiety === opt && s.listRowTextSelected]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const GOAL_OPTIONS = [
  'Encontrar serviços',
  'Acompanhar saúde',
  'Partilhar perfil',
  'Participar na comunidade',
];

function Q14({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  return (
    <View>
      <Text style={s.title}>O que mais queres para o teu cão?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList
        options={GOAL_OPTIONS}
        selected={form.goals}
        onToggle={(v) => toggleMulti('goals', v)}
      />
    </View>
  );
}

function Consent({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.title}>Antes de terminar</Text>
      <Text style={s.consentSubtitle}>Duas confirmações simples.</Text>

      <TouchableOpacity
        onPress={() => update('consentMarketing', !form.consentMarketing)}
        style={[s.consentRow, form.consentMarketing && s.consentRowSelected]}
        activeOpacity={0.8}
      >
        <View style={[s.checkbox, form.consentMarketing && s.checkboxChecked]}>
          {form.consentMarketing && <Text style={s.checkMark}>✓</Text>}
        </View>
        <Text style={s.consentText}>
          Aceito que os dados do meu cão sejam utilizados para melhorar as recomendações
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => update('consentDataUse', !form.consentDataUse)}
        style={[s.consentRow, form.consentDataUse && s.consentRowSelected]}
        activeOpacity={0.8}
      >
        <View style={[s.checkbox, form.consentDataUse && s.checkboxChecked]}>
          {form.consentDataUse && <Text style={s.checkMark}>✓</Text>}
        </View>
        <Text style={s.consentText}>
          Aceito os Termos e Condições
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    height: 68,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.primary, fontFamily: font.regular },
  stepCounter: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 60,
    textAlign: 'right',
  },
  stepCounterPlaceholder: { width: 60 },
  progressTrack: { height: 3, backgroundColor: colors.border },
  progressFill: { height: 3, backgroundColor: colors.primary },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

const s = StyleSheet.create({
  title: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 28,
    marginBottom: spacing[5],
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: spacing[4],
  },
  fieldHint: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: -spacing[2],
    marginBottom: spacing[4],
  },
  photoBox: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing[5],
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { fontSize: 28 },
  photoHint: {
    fontFamily: font.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  photoImage: { width: '100%', height: '100%' },
  sizeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  sizeBtn: { flex: 1, margin: 0 },
  listRow: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[2],
  },
  listRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAccent,
  },
  listRowText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  listRowTextSelected: {
    color: colors.primary,
    fontFamily: font.semiBold,
  },
  consentSubtitle: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: -spacing[3],
    marginBottom: spacing[6],
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  consentRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAccent,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    marginRight: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontFamily: font.bold,
  },
  consentText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
