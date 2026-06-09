import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { supabase } from '../lib/supabase';
import { colors, font, fontSize, radius, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { ChevronLeftIcon, CheckIcon, CameraIcon } from '../components/Icons';
import Svg, { Polyline } from 'react-native-svg';
import { DOG_BREEDS_PT } from '../types/dog';
import { ChoiceRow, MultiChoiceList, SectionHint, SectionLabel } from './shared';
import {
  type BuddyIDFormData,
  type DogSize,
  type Gender,
  type NeuteredStatus,
  type EnergyLevel,
  type StrangerBehavior,
  type HomePeopleBehavior,
  type Obedience,
  type Attachment,
  type TouchSensitivity,
  type NewSituations,
  type Housing,
  type SleepingPlace,
  type ExerciseDuration,
  type DogOrigin,
  type SeparationAnxiety,
  INITIAL_FORM_DATA,
} from './types';

const TOTAL_QUESTIONS = 12;
const BUDDYID_FORM_KEY = 'buddyid_pending_form';

const STEPS = ['q1','q2','q3','q4','q5','q6','q7b','q8','qLocation','q12','q13','q14','q15','consent'] as const;
type StepKey = typeof STEPS[number];

const ChevronDownIcon = ({ size = 20, color = colors.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

export default function Flow() {
  const { t, i18n } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<BuddyIDFormData>(INITIAL_FORM_DATA);
  const scrollRef = useRef<ScrollView>(null);

  const currentStep = STEPS[stepIndex];
  const questionNumber = stepIndex < TOTAL_QUESTIONS ? stepIndex + 1 : null;
  const progress = (stepIndex + 1) / STEPS.length;

  function update<K extends keyof BuddyIDFormData>(key: K, value: BuddyIDFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key: 'leashBehavior' | 'housemates' | 'fears' | 'services' | 'goals' | 'separationAnxiety', value: string) {
    setForm((prev) => {
      const list = prev[key] as string[];
      return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  }

  async function goBack() {
    if (stepIndex === 0) {
      const raw = await AsyncStorage.getItem('buddyid_pending_dogs');
      const dogs = raw ? JSON.parse(raw) : [];
      if (dogs.length > 0) {
        router.replace('/buddyid/loading' as any);
      } else {
        router.replace('/buddyid' as any);
      }
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
    const raw = await AsyncStorage.getItem('buddyid_pending_dogs');
    const dogs = raw ? JSON.parse(raw) : [];
    dogs.push(form);
    await AsyncStorage.setItem('buddyid_pending_dogs', JSON.stringify(dogs));
    await AsyncStorage.removeItem(BUDDYID_FORM_KEY);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/buddyid/auth' as any);
    } else {
      const hasAnotherDog = dogs.length > 0 && dogs[0].housemates?.includes('Outro cão');
      if (dogs.length >= 2 || !hasAnotherDog) {
        router.replace('/buddyid/loading' as any);
      } else {
        router.replace('/buddyid/second-dog' as any);
      }
    }
  }

  async function pickPhoto() {
    if (Platform.OS === 'web') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) update('photoUri', result.assets[0].uri);
      return;
    }

    Alert.alert(
      'Adicionar foto',
      'Como queres adicionar a foto do teu cão?',
      [
        {
          text: 'Tirar Foto',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Aviso', 'Precisamos de acesso à câmara para tirar uma foto.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) update('photoUri', result.assets[0].uri);
          },
        },
        {
          text: 'Escolher da Galeria',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) update('photoUri', result.assets[0].uri);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }

  function isContinueDisabled(): boolean {
    switch (currentStep) {
      case 'q1': return form.name.trim().length < 1;
      case 'q2': return !DOG_BREEDS_PT.includes(form.breed) || !form.size;
      case 'q3': return form.age.trim().length < 1 || !form.gender || !form.neutered;
      case 'q4': 
        return !form.energy || !form.withStrangers || !form.withHomePeople || 
               !form.obedience || !form.attachment || !form.touchSensitivity || 
               !form.newSituations;
      case 'q5': return !form.leashBehavior || form.leashBehavior.length === 0;
      case 'q6': return !form.housing || !form.sleepingPlace || !form.exerciseDuration;
      case 'q7b': return !form.origin;
      case 'q8': return !form.separationAnxiety || form.separationAnxiety.length === 0;
      case 'qLocation': return form.city.trim().length < 2;
      case 'q12': 
        if (!form.fears || form.fears.length === 0) return true;
        if (form.fears.includes('Outro') && (form.customFear || '').trim().length === 0) return true;
        return false;
      case 'q13': 
        if (!form.services || form.services.length === 0) return true;
        if (form.services.includes('Outro')) return (form.customService || '').trim().length === 0;
        return false;
      case 'q14': return !form.goals || form.goals.length === 0;
      case 'q15': return !form.hasConcerns || (form.hasConcerns === 'Sim' && (form.concernsText || '').trim().length === 0);
      case 'consent': return !form.consentMarketing || !form.consentDataUse;
      default: return false;
    }
  }

  const continueLabel = currentStep === 'consent'
    ? form.name.trim()
      ? form.gender === 'Fêmea'
        ? t('buddyId.flow.ctaCreateFemale', { name: form.name })
        : t('buddyId.flow.ctaCreateMale', { name: form.name })
      : form.gender === 'Fêmea'
        ? t('buddyId.flow.ctaCreateDefaultFemale')
        : t('buddyId.flow.ctaCreateDefaultMale')
    : t('buddyId.flow.continue');

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12} style={s.backBtn}>
          <ChevronLeftIcon size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Logo variant="dark" size="sm" />
        {questionNumber != null
          ? <Text style={s.counter}>{questionNumber} de {TOTAL_QUESTIONS}</Text>
          : <View style={{ width: 60 }} />}
      </View>

      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepContent step={currentStep} form={form} update={update} toggleMulti={toggleMulti} pickPhoto={pickPhoto} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.continueBtn, isContinueDisabled() && s.continueBtnDisabled]}
            onPress={goNext}
            disabled={isContinueDisabled()}
          >
            <Text style={s.continueBtnText}>{continueLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface StepProps {
  step: StepKey;
  form: BuddyIDFormData;
  update: <K extends keyof BuddyIDFormData>(key: K, value: BuddyIDFormData[K]) => void;
  toggleMulti: (key: 'leashBehavior' | 'housemates' | 'fears' | 'services' | 'goals' | 'separationAnxiety', value: string) => void;
  pickPhoto: () => void;
}

function StepContent({ step, form, update, toggleMulti, pickPhoto }: StepProps) {
  switch (step) {
    case 'q1': return <Q1 form={form} update={update} pickPhoto={pickPhoto} />;
    case 'q2': return <Q2 form={form} update={update} />;
    case 'q3': return <Q3 form={form} update={update} />;
    case 'q4': return <Q4 form={form} update={update} />;
    case 'q5': return <Q5 form={form} toggleMulti={toggleMulti} />;
    case 'q6': return <Q6 form={form} update={update} toggleMulti={toggleMulti} />;
    case 'q7b': return <Q7b form={form} update={update} />;
    case 'q8': return <Q8 form={form} toggleMulti={toggleMulti} />;
    case 'qLocation': return <QLocation form={form} update={update} />;
    case 'q12': return <Q12 form={form} update={update} toggleMulti={toggleMulti} />;
    case 'q13': return <Q13 form={form} update={update} toggleMulti={toggleMulti} />;
    case 'q14': return <Q14 form={form} toggleMulti={toggleMulti} />;
    case 'q15': return <Q15 form={form} update={update} />;
    case 'consent': return <Consent form={form} update={update} />;
  }
}

function Q1({ form, update, pickPhoto }: Pick<StepProps, 'form' | 'update' | 'pickPhoto'>) {
  return (
    <View>
      <Text style={s.question}>Como se chama o teu cão?</Text>
      <View style={s.photoContainer}>
        <TouchableOpacity style={s.photoCircle} onPress={pickPhoto}>
          {form.photoUri
            ? <Image source={{ uri: form.photoUri }} style={s.photoImg} />
            : <View style={s.photoPlaceholder} />}
        </TouchableOpacity>
        <TouchableOpacity style={s.photoPlusBadge} onPress={pickPhoto}>
          <CameraIcon size={14} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <Text style={s.photoLabel}>Foto</Text>
      <SectionLabel>Nome do cão</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="Ex: Theo"
        placeholderTextColor={colors.textMuted}
        value={form.name}
        onChangeText={(v) => update('name', v)}
      />
    </View>
  );
}

function Q2({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const sizes: { value: DogSize; label: string }[] = [
    { value: 'XS', label: isEn ? '(up to 5 kg)' : '(até 5 kg)' },
    { value: 'S', label: '(5–10 kg)' },
    { value: 'M', label: '(10–25 kg)' },
    { value: 'L', label: '(25–40 kg)' },
    { value: 'XL', label: isEn ? '(over 40 kg)' : '(mais de 40 kg)' },
  ];

  const [search, setSearch] = useState(form.breed);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || query === form.breed.toLowerCase()) return DOG_BREEDS_PT;
    return DOG_BREEDS_PT.filter(b => b.toLowerCase().includes(query));
  }, [search, form.breed]);

  function handleSelect(breedName: string) {
    update('breed', breedName);
    setSearch(breedName);
    setShowSuggestions(false);
  }

  function handleChangeText(text: string) {
    setSearch(text);
    const exactMatch = DOG_BREEDS_PT.find(b => b.toLowerCase() === text.trim().toLowerCase());
    if (exactMatch) {
      update('breed', exactMatch);
    } else {
      update('breed', '');
    }
    setShowSuggestions(true);
  }

  return (
    <View style={{ zIndex: 10 }}>
      <Text style={s.question}>Qual é a raça do teu cão?</Text>
      <SectionLabel>Raça</SectionLabel>
      <View style={[s.inputContainer, { zIndex: 20 }]}>
        <TextInput
          style={s.inputInside}
          placeholder="Ex: Border Collie, Labrador..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={handleChangeText}
          onFocus={() => setShowSuggestions(true)}
        />
        <TouchableOpacity style={s.dropdownArrow} onPress={() => setShowSuggestions(!showSuggestions)}>
          <ChevronDownIcon size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={{ zIndex: 100, elevation: 10 }}>
        {showSuggestions && suggestions.length > 0 && (
          <View style={[s.suggestionsContainer, { position: 'absolute', top: -spacing[3], left: 0, right: 0 }]}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {suggestions.map((item) => (
                <TouchableOpacity key={item} style={s.suggestionItem} onPress={() => handleSelect(item)}>
                  <Text style={s.suggestionItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      <SectionLabel>Tamanho</SectionLabel>
      <View style={s.sizeCol}>
        {sizes.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[s.sizeBtnCol, form.size === item.value && s.sizeBtnOn]}
            onPress={() => update('size', item.value)}
          >
            <Text style={[s.sizeBtnTextCol, form.size === item.value && s.sizeBtnTextOn]}>
              <Text style={[s.sizeBtnLetter, form.size === item.value && { color: colors.primary }]}>{item.value}</Text> {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function Q3({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Idade, género e condição</Text>
      <SectionLabel>Idade</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="Ex: 3 anos ou 6 meses"
        placeholderTextColor={colors.textMuted}
        value={form.age}
        onChangeText={(v) => update('age', v)}
      />
      <View style={s.divider} />
      <SectionLabel>Género</SectionLabel>
      <ChoiceRow options={['Macho', 'Fêmea']} selected={form.gender} onSelect={(v) => update('gender', v as Gender)} columns={2} />
      <View style={s.divider} />
      <SectionLabel>Castrado / Esterilizado</SectionLabel>
      <ChoiceRow options={['Sim', 'Não', 'Não sei']} selected={form.neutered} onSelect={(v) => update('neutered', v as NeuteredStatus)} />
    </View>
  );
}

function Q4({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Como se comporta o teu cão?</Text>
      <SectionHint>Uma opção por linha.</SectionHint>
      <SectionLabel>Energia</SectionLabel>
      <SectionHint>Excitabilidade geral</SectionHint>
      <ChoiceRow options={['Calmo', 'Moderado', 'Muito ativo']} selected={form.energy} onSelect={(v) => update('energy', v as EnergyLevel)} />
      <View style={s.divider} />
      <SectionLabel>Com estranhos</SectionLabel>
      <SectionHint>Sociabilidade / reatividade</SectionHint>
      <ChoiceRow options={['Amigável', 'Reservado', 'Reativo']} selected={form.withStrangers} onSelect={(v) => update('withStrangers', v as StrangerBehavior)} />
      <View style={s.divider} />
      <SectionLabel>Com pessoas de casa</SectionLabel>
      <SectionHint>Agressividade dirigida</SectionHint>
      <ChoiceRow options={['Nunca', 'Raramente', 'Por vezes']} selected={form.withHomePeople} onSelect={(v) => update('withHomePeople', v as HomePeopleBehavior)} />
      <View style={s.divider} />
      <SectionLabel>Obediência</SectionLabel>
      <SectionHint>Treino e atenção</SectionHint>
      <ChoiceRow options={['Aprende rápido', 'Seletivo', 'Difícil']} selected={form.obedience} onSelect={(v) => update('obedience', v as Obedience)} />
      <View style={s.divider} />
      <SectionLabel>Apego</SectionLabel>
      <SectionHint>Dependência do tutor</SectionHint>
      <ChoiceRow options={['Independente', 'Equilibrado', 'Colado']} selected={form.attachment} onSelect={(v) => update('attachment', v as Attachment)} />
      <View style={s.divider} />
      <SectionLabel>Ao toque</SectionLabel>
      <SectionHint>Sensibilidade / manipulação</SectionHint>
      <ChoiceRow options={['Tranquilo', 'Tolerante', 'Sensível']} selected={form.touchSensitivity} onSelect={(v) => update('touchSensitivity', v as TouchSensitivity)} />
      <View style={s.divider} />
      <SectionLabel>Situações novas</SectionLabel>
      <SectionHint>Medo / curiosidade</SectionHint>
      <ChoiceRow options={['Curioso', 'Cauteloso', 'Assustado']} selected={form.newSituations} onSelect={(v) => update('newSituations', v as NewSituations)} />
    </View>
  );
}

function Q5({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  const options = ['Anda calmo ao meu lado','Puxa muito','É reativo a outros cães','É reativo a pessoas','É reativo a bicicletas ou carros','Depende do dia'];
  return (
    <View>
      <Text style={s.question}>Na trela, o teu cão...</Text>
      <MultiChoiceList options={options} selected={form.leashBehavior} onToggle={(v) => toggleMulti('leashBehavior', v)} />
    </View>
  );
}

function Q6({ form, update, toggleMulti }: Pick<StepProps, 'form' | 'update' | 'toggleMulti'>) {
  const housingOpts: Housing[] = ['Apartamento', 'Casa sem jardim', 'Casa com jardim', 'Quinta / rural'];
  const sleepOpts: SleepingPlace[] = ['Na cama', 'No sofá', 'Cama própria', 'No exterior'];
  const exerciseOpts: ExerciseDuration[] = ['< 30 min', '30–60 min', '> 60 min'];
  return (
    <View>
      <Text style={s.question}>Onde vivem juntos?</Text>
      <ChoiceRow options={housingOpts} selected={form.housing} onSelect={(v) => update('housing', v as Housing)} columns={2} />
      <View style={s.divider} />
      <SectionLabel>Quem mais vive em casa?</SectionLabel>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList options={['Outro cão','Gato(s)','Criança','Adolescente','Idoso','Ninguém','Outras pessoas']} selected={form.housemates} onToggle={(v) => toggleMulti('housemates', v)} />
      <View style={s.divider} />
      <SectionLabel>Onde dorme?</SectionLabel>
      <ChoiceRow options={sleepOpts} selected={form.sleepingPlace} onSelect={(v) => update('sleepingPlace', v as SleepingPlace)} columns={2} />
      <View style={s.divider} />
      <SectionLabel>Exercício diário</SectionLabel>
      <ChoiceRow options={exerciseOpts} selected={form.exerciseDuration} onSelect={(v) => update('exerciseDuration', v as ExerciseDuration)} />
    </View>
  );
}

function Q7b({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  const origins: DogOrigin[] = ['Adotei de um canil ou associação','Comprei de um criador','Resgatei da rua','Recebi de alguém','Outra forma'];
  return (
    <View>
      <Text style={s.question}>Como se encontraram?</Text>
      <MultiChoiceList options={origins} selected={form.origin ? [form.origin] : []} onToggle={(v) => update('origin', v as DogOrigin)} />
      <View style={s.divider} />
      <SectionLabel>Alguma história traumática?</SectionLabel>
      <SectionHint>Opcional — ajuda-nos a ser mais cuidadosos.</SectionHint>
      <TextInput
        style={[s.input, s.inputMultiline]}
        placeholder="Ex: Teve um acidente, foi maltratado, tem medo de homens..."
        placeholderTextColor={colors.textMuted}
        value={form.traumaHistory || ''}
        onChangeText={(v) => update('traumaHistory', v)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
}

function Q8({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  const options: SeparationAnxiety[] = ['Fica calmo e tranquilo','Ladra ou range um pouco','Fica muito ansioso','Destrói coisas quando fico fora','Nunca o deixo sozinho','Não sei'];
  return (
    <View>
      <Text style={s.question}>Como fica quando ficas fora?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList options={options} selected={form.separationAnxiety || []} onToggle={(v) => toggleMulti('separationAnxiety', v)} />
    </View>
  );
}

function QEmail({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Qual é o teu email?</Text>
      <TextInput
        style={[s.input, { marginTop: spacing[8] }]}
        placeholder="email@exemplo.com"
        placeholderTextColor={colors.textMuted}
        value={form.email}
        onChangeText={(v) => update('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={s.hint}>Os teus dados são privados e nunca partilhados.</Text>
    </View>
  );
}

function QPhone({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Qual é o teu telemóvel?</Text>
      <TextInput
        style={[s.input, { marginTop: spacing[8] }]}
        placeholder="+351 912 345 678"
        placeholderTextColor={colors.textMuted}
        value={form.phone}
        onChangeText={(v) => update('phone', v)}
        keyboardType="phone-pad"
      />
      <Text style={s.hint}>Só para confirmação de reservas.</Text>
    </View>
  );
}

function QLocation({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Onde moras?</Text>
      <SectionLabel>Cidade</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="ex: Lisboa, Porto, Braga..."
        placeholderTextColor={colors.textMuted}
        value={form.city}
        onChangeText={(v) => update('city', v)}
      />
      <View style={s.optionalRow}>
        <SectionLabel>Código postal</SectionLabel>
        <Text style={s.optional}>opcional</Text>
      </View>
      <TextInput
        style={s.input}
        placeholder="ex: 1050-012"
        placeholderTextColor={colors.textMuted}
        value={form.postalCode || ''}
        onChangeText={(v) => update('postalCode', v)}
        keyboardType="numbers-and-punctuation"
      />
      <Text style={s.hint}>Usamos a tua localização para encontrar prestadores perto de ti.</Text>
    </View>
  );
}

function Q12({ form, update, toggleMulti }: Pick<StepProps, 'form' | 'update' | 'toggleMulti'>) {
  const options = ['Trovões e relâmpagos','Fogos de artifício','Outros cães','Pessoas estranhas','Carros e motas','Não tem medos conhecidos','Outro'];
  return (
    <View>
      <Text style={s.question}>O teu cão tem medos ou fobias?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList options={options} selected={form.fears} onToggle={(v) => toggleMulti('fears', v)} />
      {form.fears.includes('Outro') && (
        <>
          <SectionLabel>Qual medo / fobia?</SectionLabel>
          <TextInput
            style={s.input}
            placeholder="Ex: Aspirador, andar de elevador..."
            placeholderTextColor={colors.textMuted}
            value={form.customFear || ''}
            onChangeText={(v) => update('customFear', v)}
            maxLength={80}
          />
        </>
      )}
    </View>
  );
}

function Q13({ form, update, toggleMulti }: Pick<StepProps, 'form' | 'update' | 'toggleMulti'>) {
  const options = ['Veterinário','Passeios','Treino','Creche','Hospedagem em casa','Pet sitting','Transporte','Grooming','Nenhum','Outro'];
  return (
    <View>
      <Text style={s.question}>Que serviços normalmente usas?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList options={options} selected={form.services} onToggle={(v) => toggleMulti('services', v)} />
      {form.services.includes('Outro') && (
        <>
          <SectionLabel>Qual serviço?</SectionLabel>
          <TextInput
            style={s.input}
            placeholder="Descreve o serviço que procuras..."
            placeholderTextColor={colors.textMuted}
            value={form.customService || ''}
            onChangeText={(v) => update('customService', v)}
          />
        </>
      )}
    </View>
  );
}

function Q14({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  const options = ['Mais socialização com outros cães','Melhor saúde e bem-estar','Mais exercício e atividade','Encontrar cuidadores de confiança','Aprender mais sobre o meu cão'];
  return (
    <View>
      <Text style={s.question}>O que mais queres para o teu cão?</Text>
      <MultiChoiceList options={options} selected={form.goals} onToggle={(v) => toggleMulti('goals', v)} />
    </View>
  );
}

function Consent({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Antes de terminar.</Text>
      <Text style={s.consentSub}>Duas confirmações simples.</Text>
      <ConsentRow checked={form.consentMarketing} onToggle={() => update('consentMarketing', !form.consentMarketing)} label="Aceito receber comunicações da Buddy sobre o lançamento." />
      <ConsentRow checked={form.consentDataUse} onToggle={() => update('consentDataUse', !form.consentDataUse)} label="Aceito que a Buddy use estes dados de forma anónima para melhorar os serviços." />
    </View>
  );
}

function Q15({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  const hasConcerns = form.hasConcerns === 'Sim';
  return (
    <View>
      <Text style={s.question}>Há alguma coisa que te preocupe no teu cão?</Text>
      <View style={s.sizeCol}>
        <Pressable
          style={[s.sizeBtnCol, form.hasConcerns === 'Não' && s.sizeBtnOn]}
          onPress={() => { update('hasConcerns', 'Não'); update('concernsText', ''); }}
        >
          <Text style={[s.sizeBtnTextCol, form.hasConcerns === 'Não' && s.sizeBtnTextOn]}>Não</Text>
        </Pressable>
        <Pressable
          style={[s.sizeBtnCol, form.hasConcerns === 'Sim' && s.sizeBtnOn]}
          onPress={() => update('hasConcerns', 'Sim')}
        >
          <Text style={[s.sizeBtnTextCol, form.hasConcerns === 'Sim' && s.sizeBtnTextOn]}>Sim</Text>
        </Pressable>
      </View>
      {hasConcerns && (
        <>
          <Text style={s.hint}>Se sim, o quê?</Text>
          <TextInput
            style={[s.input, s.inputMultiline]}
            multiline
            placeholder="Descreve as tuas preocupações..."
            placeholderTextColor={colors.textMuted}
            value={form.concernsText || ''}
            onChangeText={(v) => update('concernsText', v)}
          />
        </>
      )}
    </View>
  );
}

function ConsentRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable style={s.consentRow} onPress={onToggle}>
      <View style={[s.checkbox, checked && s.checkboxOn]}>
        {checked && <CheckIcon size={13} color="#fff" strokeWidth={2.5} />}
      </View>
      <Text style={s.consentLabel}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[6],
    height: 68,
  },
  backBtn: { width: 32 },
  counter: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, width: 60, textAlign: 'right' },
  progressTrack: { height: 3, backgroundColor: colors.borderSoft },
  progressFill: { height: 3, backgroundColor: colors.primary },
  scrollContent: { padding: spacing[6], paddingBottom: spacing[10] },
  question: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing[4], lineHeight: 34 },
  photoContainer: { alignSelf: 'center', marginTop: spacing[4] },
  photoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  photoPlaceholder: { flex: 1, backgroundColor: colors.surfaceMuted },
  photoImg: { width: 100, height: 100 },
  photoPlusBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface },
  photoPlusText: { color: '#fff', fontSize: 20, fontFamily: font.semiBold, marginTop: -2 },
  photoLabel: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing[2], marginBottom: spacing[5] },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  inputInside: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
  },
  dropdownArrow: {
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    marginTop: -spacing[3],
    marginBottom: spacing[4],
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 100,
  },
  suggestionItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  suggestionItemText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.text,
  },
  inputMultiline: { height: 100, paddingTop: spacing[3] },
  sizeRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2], marginBottom: spacing[4] },
  sizeBtn: { flex: 1, borderWidth: 1.5, borderColor: colors.borderSoft, borderRadius: 10, paddingVertical: spacing[3], alignItems: 'center', backgroundColor: colors.surface },
  sizeCol: { flexDirection: 'column', gap: spacing[2], marginTop: spacing[2], marginBottom: spacing[4] },
  sizeBtnCol: { borderWidth: 1.5, borderColor: colors.borderSoft, borderRadius: 12, paddingVertical: spacing[4], paddingHorizontal: spacing[4], backgroundColor: colors.surface },
  sizeBtnOn: { borderColor: colors.primary, backgroundColor: colors.surfaceAccent },
  sizeBtnText: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  sizeBtnTextCol: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.textSecondary },
  sizeBtnLetter: { fontFamily: font.bold, color: colors.text },
  sizeBtnTextOn: { color: colors.primary, fontFamily: font.semiBold },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing[4] },
  hint: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing[1], marginBottom: spacing[3] },
  optionalRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2], marginTop: spacing[3] },
  optional: { fontFamily: font.regular, fontSize: fontSize.xs, color: colors.textMuted },
  footer: { padding: spacing[4], backgroundColor: colors.canvas },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: spacing[4], alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnText: { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
  consentSub: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing[6] },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing[4],
    marginBottom: spacing[3],
    gap: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  consentLabel: { flex: 1, fontFamily: font.regular, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
});
