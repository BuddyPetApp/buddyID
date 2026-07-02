import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, font, fontSize, radius, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { ChevronLeftIcon, CheckIcon, CameraIcon } from '../components/Icons';
import Svg, { Polyline } from 'react-native-svg';
import { DOG_BREEDS_PT } from '../types/dog';
import { ChoiceRow, MultiChoiceList, RadioChoiceList, SectionHint, SectionLabel } from './shared';
import { ScaleSelector } from './dog/_shared';
import { QuestionBackground } from '../components/QuestionBackground';
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BUDDYID_FORM_KEY = 'buddyid_pending_form';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_MAX_HEIGHT = SCREEN_HEIGHT * 0.72;
// How far the form card can be dragged down (mobile) to peek the photo behind it
const MAX_CARD_DRAG = SCREEN_HEIGHT * 0.55;
// Keep at least this much of the card (incl. the grab handle) on screen when lowered
const CARD_PEEK = 96;

const STEPS = [
  'q1',
  'q2',
  'q3',
  'q4',
  'qOwner',
  'q5',
  'q6',
  'q7b',
  'q8',
  'qLocation',
  'q12',
  'q13',
  'q14',
  'qConcern',
  'consent'
] as const;
type StepKey = typeof STEPS[number];

const ChevronDownIcon = ({ size = 20, color = colors.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

async function compressImageIfNeeded(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  let isTooLarge = false;

  if (asset.fileSize && asset.fileSize > 1500000) {
    isTooLarge = true;
  } else if (Platform.OS === 'web' && asset.uri.length > 2000000) {
    isTooLarge = true;
  } else if (asset.width > 1200 || asset.height > 1200) {
    isTooLarge = true;
  }

  if (!isTooLarge) {
    return asset.uri;
  }

  const actions = asset.width > 800 || asset.height > 800 ? [{ resize: { width: 800 } }] : [];
  const manipResult = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
}

export default function Flow() {
  const { t, i18n } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<BuddyIDFormData>(INITIAL_FORM_DATA);
  const [steps, setSteps] = useState<readonly StepKey[]>(STEPS);
  const scrollRef = useRef<ScrollView>(null);

  // Postal code, household and data-use consent are tutor/household-level — the
  // same regardless of which dog. When adding another dog (already logged in, or
  // a second dog in the same onboarding), skip those steps and carry the previous
  // dog's household answers forward so the new record stays consistent. Housing
  // (q6) also carries over, but its step stays because food is per-dog.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const raw = await AsyncStorage.getItem('buddyid_pending_dogs');
      const pendingDogs: Partial<BuddyIDFormData>[] = raw ? JSON.parse(raw) : [];
      const isAdditionalDog = !!session || pendingDogs.length > 0;
      if (cancelled || !isAdditionalDog) return;

      setSteps(STEPS.filter((step) => step !== 'qLocation' && step !== 'consent' && step !== 'q7b'));
      const prev = pendingDogs[0];
      setForm((f) => ({
        ...f,
        consentDataUse: true,
        postalCode: prev?.postalCode || f.postalCode,
        housemates: prev?.housemates?.length ? prev.housemates : f.housemates,
        housing: prev?.housing || f.housing,
      }));
    })();
    return () => { cancelled = true; };
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const insets = useSafeAreaInsets();

  // Draggable form card (mobile): drag the handle down to lower the card and reveal the
  // photo behind it; drag or tap the handle to bring it back. The lowered distance is
  // clamped to the card's measured height so the handle never slides off-screen.
  const cardDragY = useRef(new Animated.Value(0)).current;
  const cardDragBase = useRef(0);
  const cardHeightRef = useRef(0);
  const maxDrag = () => Math.max(0, Math.min(MAX_CARD_DRAG, cardHeightRef.current - CARD_PEEK));
  const springCard = (to: number) => {
    cardDragBase.current = to;
    Animated.spring(cardDragY, { toValue: to, useNativeDriver: false, friction: 9, tension: 70 }).start();
  };
  const settleCard = (g: { dy: number; vy: number }) => {
    const max = maxDrag();
    const isTap = Math.abs(g.dy) < 6 && Math.abs(g.vy) < 0.3;
    if (isTap) return springCard(cardDragBase.current > max / 2 ? 0 : max); // tap toggles
    if (g.vy > 0.4) return springCard(max); // flick down
    if (g.vy < -0.4) return springCard(0); // flick up
    const next = Math.max(0, Math.min(max, cardDragBase.current + g.dy));
    springCard(next > max / 2 ? max : 0);
  };
  const cardPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        cardDragY.setValue(Math.max(0, Math.min(maxDrag(), cardDragBase.current + g.dy)));
      },
      onPanResponderRelease: (_, g) => settleCard(g),
      onPanResponderTerminate: (_, g) => settleCard(g ?? { dy: 0, vy: 0 }),
    })
  ).current;

  // Pop the card back up whenever the question changes — also prevents a lowered card
  // from getting stuck when the next step's card is shorter.
  useEffect(() => {
    cardDragBase.current = 0;
    Animated.spring(cardDragY, { toValue: 0, useNativeDriver: false, friction: 9, tension: 70 }).start();
  }, [stepIndex]);

  const currentStep = steps[stepIndex];
  const totalQuestions = steps.filter((step) => step !== 'consent').length;
  const questionNumber = currentStep === 'consent' ? null : stepIndex + 1;
  const progress = (stepIndex + 1) / steps.length;

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
      LayoutAnimation.configureNext({
        duration: 350,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
      setStepIndex((s) => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }

  function getValidationMessage(): string {
    switch (currentStep) {
      case 'q1': return 'Por favor, preenche o nome do cão.';
      case 'q2': return 'Por favor, seleciona a raça, o tamanho e a cor do pelo.';
      case 'q3': return 'Por favor, indica a idade e o género.';
      case 'qConcern': return 'Por favor, descreve as tuas preocupações.';
      case 'q4': return '';
      case 'qOwner': return '';
      case 'q5': return 'Por favor, seleciona pelo menos uma opção sobre o comportamento na trela.';
      case 'q6': return 'Por favor, seleciona a habitação.';
      case 'q7b': return 'Por favor, seleciona quem vive em casa.';
      case 'q8': return 'Por favor, preenche o local de descanso, exercício e origem.';
      case 'qLocation': return 'Por favor, insere um código postal válido no formato XXXX-XXX.';
      case 'q12': return 'Por favor, indica se tem medos e preenche o campo "Outro" se selecionado.';
      case 'q13': return 'Por favor, indica que serviços procuras e preenche o campo "Outro" se selecionado.';
      case 'q14': return 'Por favor, seleciona pelo menos um objetivo.';
      case 'consent': return 'Por favor, aceita o uso de dados anónimo para poderes continuar.';
      default: return 'Por favor, preenche todos os campos obrigatórios.';
    }
  }

  function goNext() {
    if (isContinueDisabled()) {
      if (Platform.OS === 'web') {
        window.alert(getValidationMessage());
      } else {
        Alert.alert('Atenção', getValidationMessage());
      }
      return;
    }

    if (stepIndex < steps.length - 1) {
      LayoutAnimation.configureNext({
        duration: 350,
        update: { type: LayoutAnimation.Types.easeInEaseOut },
      });
      setStepIndex((s) => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit() {
    try {
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
    } catch (err: any) {
      console.error('Submit error:', err);
      if (Platform.OS === 'web') {
        window.alert('Ocorreu um erro ao guardar os dados. A foto poderá ser demasiado grande. Tenta continuar sem foto ou com uma foto mais pequena.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao guardar os dados. A foto poderá ser demasiado grande.');
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
      if (!result.canceled && result.assets[0]) {
        const optimizedUri = await compressImageIfNeeded(result.assets[0]);
        update('photoUri', optimizedUri);
      }
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
            if (!result.canceled && result.assets[0]) {
              const optimizedUri = await compressImageIfNeeded(result.assets[0]);
              update('photoUri', optimizedUri);
            }
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
            if (!result.canceled && result.assets[0]) {
              const optimizedUri = await compressImageIfNeeded(result.assets[0]);
              update('photoUri', optimizedUri);
            }
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
      case 'q2': {
        if (!form.size) return true;
        if (form.breed === 'other' && (form.breedOther ?? '').trim().length < 1) return true;
        if (!form.breed) return true;
        if (!form.coatColor) return true;
        if (form.coatColor === 'Outra' && (form.coatColorOther ?? '').trim().length < 1) return true;
        return false;
      }
      case 'q3': return !form.ageValue || form.ageValue.trim().length === 0 || !form.gender;
      case 'qConcern': return form.concern === true && (form.concernNote || '').trim().length < 3;
      case 'q4': return false;
      case 'qOwner': return false;
      case 'q5': return !form.leashBehavior || form.leashBehavior.length === 0;
      case 'q6': return !form.housing;
      case 'q7b': return !form.housemates || form.housemates.length === 0;
      case 'q8': return !form.sleepingPlace || !form.exerciseDuration || !form.origin;
      case 'qLocation': return !form.postalCode || !/^\d{4}-\d{3}$/.test(form.postalCode);
      case 'q12': 
        if (!form.fears || form.fears.length === 0) return true;
        if (form.fears.includes('Outro') && (form.customFear || '').trim().length === 0) return true;
        return false;
      case 'q13': 
        if (!form.services || form.services.length === 0) return true;
        if (form.services.includes('Outro') && (form.customService || '').trim().length === 0) return true;
        return false;
      case 'q14': return !form.goals || form.goals.length === 0;
      case 'consent': return !form.consentDataUse;
      default: return false;
    }
  }

  const isLastStep = stepIndex === steps.length - 1;
  const continueLabel = isLastStep
    ? form.name.trim()
      ? form.gender === 'Fêmea'
        ? t('buddyId.flow.ctaCreateFemale', { name: form.name })
        : t('buddyId.flow.ctaCreateMale', { name: form.name })
      : form.gender === 'Fêmea'
        ? t('buddyId.flow.ctaCreateDefaultFemale')
        : t('buddyId.flow.ctaCreateDefaultMale')
    : t('buddyId.flow.continue');

  const backButton = (
    <TouchableOpacity onPress={goBack} hitSlop={12} style={s.backBtn}>
      <ChevronLeftIcon size={24} color="#ffffff" strokeWidth={2} />
    </TouchableOpacity>
  );

  const counter = questionNumber != null
    ? <Text style={s.counter}>{questionNumber} de {totalQuestions}</Text>
    : null;

  // Segmented Progress Bar (Instagram-story style)
  const progressBar = (
    <View style={s.progressRow}>
      {steps.map((step, idx) => {
        const isCompleted = idx <= stepIndex;
        return (
          <View
            key={step}
            style={[
              s.progressSegment,
              isCompleted ? s.progressSegmentActive : s.progressSegmentInactive
            ]}
          />
        );
      })}
    </View>
  );

  // Scrollable question content + continue button — shared by both layouts
  const cardInner = (
    <>
      <ScrollView
        ref={scrollRef}
        style={{ flexShrink: 1 }}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <StepContent step={currentStep} form={form} update={update} toggleMulti={toggleMulti} pickPhoto={pickPhoto} />
      </ScrollView>

      <View style={[s.footer, { paddingBottom: spacing[4] + insets.bottom }]}>
        <TouchableOpacity
          style={[s.continueBtn, isContinueDisabled() && s.continueBtnDisabled]}
          onPress={goNext}
        >
          <Text style={s.continueBtnText}>{continueLabel}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Desktop (web, wide viewport): split-screen — brand panel left, form right
  if (isDesktop) {
    return (
      <View style={s.desktopRoot}>
        <View style={s.desktopLeft}>
          <QuestionBackground step={currentStep} />
          <View style={s.desktopLeftInner}>
            <View style={s.desktopLeftTop}>
              {backButton}
              {counter}
            </View>
            <View style={s.desktopLeftCenter}>
              <Logo variant="light" size="lg" />
            </View>
            {progressBar}
          </View>
        </View>

        <View style={s.desktopRight}>
          <View style={s.desktopCard}>{cardInner}</View>
        </View>
      </View>
    );
  }

  // Mobile / native: stacked card anchored to the bottom over the watermark
  return (
    <View style={s.outerBg}>
    {/* Full-bleed background photo per question (extends under safe-area insets) */}
    <QuestionBackground step={currentStep} />
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        {backButton}
        <Logo variant="light" size="sm" />
        {counter ?? <View style={{ width: 60 }} />}
      </View>

      {progressBar}

      {/* KeyboardAvoidingView keeps card visible when keyboard opens */}
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {/* Flexible spacer pushes card to the bottom (Zeely-style) */}
        <View style={s.flex} />

        {/* Card — drag the handle down to peek the photo behind it */}
        <Animated.View
          style={[s.card, { transform: [{ translateY: cardDragY }] }]}
          onLayout={(e) => { cardHeightRef.current = e.nativeEvent.layout.height; }}
        >
          <View style={s.grabberZone} {...cardPan.panHandlers}>
            <View style={s.grabber} />
          </View>
          {cardInner}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
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
    case 'qConcern': return <QConcern form={form} update={update} />;
    case 'q4': return <Q4 form={form} update={update} />;
    case 'qOwner': return <QOwner form={form} update={update} />;
    case 'q5': return <Q5 form={form} toggleMulti={toggleMulti} />;
    case 'q6': return <Q6 form={form} update={update} />;
    case 'q7b': return <Q7b form={form} toggleMulti={toggleMulti} />;
    case 'q8': return <Q8 form={form} update={update} toggleMulti={toggleMulti} />;
    case 'qLocation': return <QLocation form={form} update={update} />;
    case 'q12': return <Q12 form={form} update={update} toggleMulti={toggleMulti} />;
    case 'q13': return <Q13 form={form} update={update} toggleMulti={toggleMulti} />;
    case 'q14': return <Q14 form={form} toggleMulti={toggleMulti} />;
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
    const filtered = (!query || query === form.breed.toLowerCase())
      ? DOG_BREEDS_PT
      : DOG_BREEDS_PT.filter(b => b.toLowerCase().includes(query));
    return [...filtered, 'Outra'];
  }, [search, form.breed]);

  function handleSelect(breedName: string) {
    if (breedName === 'Outra') {
      update('breed', 'other');
      update('breedOther', '');
      setSearch('Outra');
    } else {
      update('breed', breedName);
      update('breedOther', '');
      setSearch(breedName);
    }
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
      {form.breed === 'other' && (
        <>
          <SectionLabel>Escreve</SectionLabel>
          <TextInput
            style={s.input}
            placeholder="Ex: Doberman, Pastor Belga Malinois..."
            placeholderTextColor={colors.textMuted}
            value={form.breedOther || ''}
            onChangeText={(v) => update('breedOther', v)}
            autoFocus
          />
        </>
      )}
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
      <View style={s.divider} />
      <SectionLabel>Cor do pelo</SectionLabel>
      <CoatColorDropdown
        value={form.coatColor || ''}
        onSelect={(v) => {
          update('coatColor', v);
          if (v !== 'Outra') update('coatColorOther', '');
        }}
      />
      {form.coatColor === 'Outra' && (
        <TextInput
          style={s.input}
          placeholder="Descreve a cor (Ex: Azul merle, Arlequim...)"
          placeholderTextColor={colors.textMuted}
          value={form.coatColorOther || ''}
          onChangeText={(v) => update('coatColorOther', v)}
          autoFocus
        />
      )}
    </View>
  );
}

const COAT_COLORS = ['Preto', 'Branco', 'Castanho', 'Cinzento', 'Dourado', 'Bicolor', 'Tricolor', 'Outra'] as const;

function CoatColorDropdown({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: 15 }}>
      <TouchableOpacity
        style={[s.inputContainer, { flexDirection: 'row', alignItems: 'center' }]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={[s.inputInside, { flex: 1, color: value ? colors.text : colors.textMuted }]}>
          {value || 'Seleciona a cor do pelo...'}
        </Text>
        <View style={s.dropdownArrow}>
          <ChevronDownIcon size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
      {open && (
        <View style={[s.suggestionsContainer, { position: 'absolute', top: 52, left: 0, right: 0, zIndex: 100 }]}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {COAT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[s.suggestionItem, value === color && { backgroundColor: colors.surfaceMuted }]}
                onPress={() => { onSelect(color); setOpen(false); }}
              >
                <Text style={[s.suggestionItemText, value === color && { color: colors.primary, fontFamily: font.semiBold }]}>{color}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function Q3({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Idade e género</Text>
      <SectionLabel>Idade</SectionLabel>
      <View style={s.ageRow}>
        <TextInput
          style={[s.input, { flex: 1, minWidth: 0, marginBottom: 0, marginTop: 0 }]}
          placeholder="Ex: 3"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={form.ageValue}
          onChangeText={(v) => update('ageValue', v.replace(/[^0-9]/g, ''))}
        />
        <View style={s.unitToggleRow}>
          <Pressable
            style={[s.unitBtn, form.ageUnit === 'anos' && s.unitBtnOn]}
            onPress={() => update('ageUnit', 'anos')}
          >
            <Text style={[s.unitBtnText, form.ageUnit === 'anos' && s.unitBtnTextOn]}>Anos</Text>
          </Pressable>
          <Pressable
            style={[s.unitBtn, form.ageUnit === 'meses' && s.unitBtnOn]}
            onPress={() => update('ageUnit', 'meses')}
          >
            <Text style={[s.unitBtnText, form.ageUnit === 'meses' && s.unitBtnTextOn]}>Meses</Text>
          </Pressable>
        </View>
      </View>
      <View style={s.divider} />
      <SectionLabel>Género</SectionLabel>
      <ChoiceRow options={['Macho', 'Fêmea']} selected={form.gender} onSelect={(v) => update('gender', v as Gender)} columns={2} />
    </View>
  );
}

function QConcern({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Há alguma coisa que te preocupe no teu cão?</Text>
      <SectionHint>Comportamento, medos, saúde, etc.</SectionHint>
      <View style={s.sizeCol}>
        <Pressable
          style={[s.sizeBtnCol, form.concern === false && s.sizeBtnOn]}
          onPress={() => { update('concern', false); update('concernNote', ''); }}
        >
          <Text style={[s.sizeBtnTextCol, form.concern === false && s.sizeBtnTextOn]}>Não</Text>
        </Pressable>
        <Pressable
          style={[s.sizeBtnCol, form.concern === true && s.sizeBtnOn]}
          onPress={() => update('concern', true)}
        >
          <Text style={[s.sizeBtnTextCol, form.concern === true && s.sizeBtnTextOn]}>Sim</Text>
        </Pressable>
      </View>
      {form.concern === true && (
        <>
          <SectionLabel>O que te preocupa?</SectionLabel>
          <TextInput
            style={[s.input, s.inputMultiline]}
            multiline
            placeholder="Ex: Puxa muito a trela, ladra a estranhos, tem medo de barulhos fortes..."
            placeholderTextColor={colors.textMuted}
            value={form.concernNote || ''}
            onChangeText={(v) => update('concernNote', v)}
            autoFocus
          />
        </>
      )}
    </View>
  );
}

function Q4({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  const aggressionTargets = ['Cães', 'Pessoas Estranhas', 'Membros da Família', 'Outros Animais'];
  
  return (
    <View>
      <Text style={s.question}>Comportamento do cão</Text>
      <SectionHint>Avalia o teu cão em cada escala (0 a 4). Sliders são opcionais.</SectionHint>
      
      <SectionLabel>Medo de pessoas estranhas</SectionLabel>
      <ScaleSelector
        value={form.fearStrangers}
        onChange={(v) => update('fearStrangers', v)}
        min={0}
        max={4}
        anchors={['Amigável', 'Muito Medo']}
      />
      <View style={s.divider} />

      <SectionLabel>Medo de outros cães</SectionLabel>
      <ScaleSelector
        value={form.fearDogs}
        onChange={(v) => update('fearDogs', v)}
        min={0}
        max={4}
        anchors={['Sociável', 'Muito Medo']}
      />
      <View style={s.divider} />

      <SectionLabel>Medo de barulhos/situações novas (Não-social)</SectionLabel>
      <ScaleSelector
        value={form.fearNonsocial}
        onChange={(v) => update('fearNonsocial', v)}
        min={0}
        max={4}
        anchors={['Tranquilo', 'Muito Medo']}
      />
      <View style={s.divider} />

      <SectionLabel>Sensibilidade ao toque / manipulação</SectionLabel>
      <ScaleSelector
        value={form.touchSensitivity}
        onChange={(v) => update('touchSensitivity', v)}
        min={0}
        max={4}
        anchors={['Tranquilo', 'Muito Sensível']}
      />
      <View style={s.divider} />

      <SectionLabel>Sinais de agressão (rosnar, morder, etc.)</SectionLabel>
      <ScaleSelector
        value={form.aggression}
        onChange={(v) => update('aggression', v)}
        min={0}
        max={4}
        anchors={['Inexistente', 'Muito Frequente']}
      />
      
      {form.aggression !== undefined && form.aggression > 0 && (
        <View style={{ marginTop: spacing[4] }}>
          <SectionLabel>Dirigida a quem?</SectionLabel>
          <SectionHint>Seleciona todos os que se aplicam.</SectionHint>
          <MultiChoiceList
            options={aggressionTargets}
            selected={form.aggrTargets || []}
            onToggle={(v) => {
              const list = form.aggrTargets || [];
              const nextList = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
              update('aggrTargets', nextList);
            }}
          />
        </View>
      )}
      <View style={s.divider} />

      <SectionLabel>Comportamento quando fica sozinho</SectionLabel>
      <ScaleSelector
        value={form.separation}
        onChange={(v) => update('separation', v)}
        min={0}
        max={4}
        anchors={['Tranquilo', 'Muito Ansioso']}
      />
    </View>
  );
}

function QOwner({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  return (
    <View>
      <Text style={s.question}>Autoavaliação do Tutor</Text>
      <SectionHint>Responde opcionalmente sobre a tua própria percepção (0 a 4).</SectionHint>

      <SectionLabel>Desejo de proteger o teu cão</SectionLabel>
      <SectionHint>Ex: Evitar situações difíceis, defendê-lo de outros cães, etc.</SectionHint>
      <ScaleSelector
        value={form.ownerProtect}
        onChange={(v) => update('ownerProtect', v)}
        min={0}
        max={4}
        anchors={['Inexistente', 'Muito Forte']}
      />
      <View style={s.divider} />

      <SectionLabel>Preocupação com o comportamento / bem-estar dele</SectionLabel>
      <SectionHint>Ex: Sentir ansiedade no passeio, receio de problemas, etc.</SectionHint>
      <ScaleSelector
        value={form.ownerWorry}
        onChange={(v) => update('ownerWorry', v)}
        min={0}
        max={4}
        anchors={['Inexistente', 'Constante']}
      />
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

function Q6({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  const housingOpts: Housing[] = ['Apartamento', 'Casa sem jardim', 'Casa com jardim', 'Quinta / rural'];
  const foodTypeOpts = ['Ração seca', 'Ração húmida', 'Mista', 'Caseira'];
  return (
    <View>
      <Text style={s.question}>Habitação e Alimentação</Text>
      
      <SectionLabel>Habitação</SectionLabel>
      <ChoiceRow options={housingOpts} selected={form.housing} onSelect={(v) => update('housing', v as Housing)} columns={2} />
      <View style={s.divider} />

      <SectionLabel>Tipo de alimentação (Opcional)</SectionLabel>
      <ChoiceRow
        options={foodTypeOpts}
        selected={form.foodType}
        onSelect={(v) => update('foodType', v as any)}
        columns={2}
      />
      <View style={s.divider} />

      <SectionLabel>Refeições por dia (Opcional)</SectionLabel>
      <TextInput
        style={s.input}
        placeholder="Ex: 2"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={form.mealsPerDay ? String(form.mealsPerDay) : ''}
        onChangeText={(v) => {
          const num = parseInt(v.replace(/[^0-9]/g, ''), 10);
          update('mealsPerDay', isNaN(num) ? undefined : num);
        }}
      />
    </View>
  );
}

function Q7b({ form, toggleMulti }: Pick<StepProps, 'form' | 'toggleMulti'>) {
  return (
    <View>
      <Text style={s.question}>Quem mais vive em casa?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList options={['Outro cão','Gato(s)','Criança','Adolescente','Idoso','Ninguém','Outras pessoas']} selected={form.housemates} onToggle={(v) => toggleMulti('housemates', v)} />
    </View>
  );
}

function Q8({ form, update, toggleMulti }: Pick<StepProps, 'form' | 'update' | 'toggleMulti'>) {
  const sleepOpts: SleepingPlace[] = ['Na cama', 'No sofá', 'Cama própria', 'No exterior'];
  const exerciseOpts: ExerciseDuration[] = ['< 30 min', '30–60 min', '> 60 min'];
  const origins: DogOrigin[] = ['Adotei de um canil ou associação','Comprei de um criador','Resgatei da rua','Recebi de alguém','Outra forma'];
  return (
    <View>
      <Text style={s.question}>Rotina e Origem</Text>

      <SectionLabel>Onde dorme?</SectionLabel>
      <ChoiceRow options={sleepOpts} selected={form.sleepingPlace} onSelect={(v) => update('sleepingPlace', v as SleepingPlace)} columns={2} />
      <View style={s.divider} />

      <SectionLabel>Exercício diário</SectionLabel>
      <ChoiceRow options={exerciseOpts} selected={form.exerciseDuration} onSelect={(v) => update('exerciseDuration', v as ExerciseDuration)} />
      <View style={s.divider} />

      <RadioChoiceList
        options={origins}
        selected={form.origin}
        onSelect={(v) => update('origin', v as DogOrigin)}
      />
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

function QLocation({ form, update }: Pick<StepProps, 'form' | 'update'>) {
  function handlePostalCodeChange(text: string) {
    let cleaned = text.replace(/[^0-9-]/g, '');
    if (cleaned.length === 4 && !cleaned.includes('-')) {
      cleaned = cleaned + '-';
    } else if (cleaned.length > 4 && cleaned.charAt(4) !== '-') {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4).replace('-', '');
    }
    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8);
    }
    update('postalCode', cleaned);
  }

  return (
    <View>
      <Text style={s.question}>Onde moras?</Text>
      <SectionLabel>Código postal</SectionLabel>
      <SectionHint>Formato: XXXX-XXX</SectionHint>
      <TextInput
        style={s.input}
        placeholder="Ex: 1050-012"
        placeholderTextColor={colors.textMuted}
        value={form.postalCode || ''}
        onChangeText={handlePostalCodeChange}
        keyboardType="numeric"
        maxLength={8}
      />
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
  const options = ['Veterinário', 'Passeio', 'Pet Sitting', 'Creche', 'Hotel', 'Treino', 'Banho', 'Corte', 'Outro'];
  return (
    <View>
      <Text style={s.question}>Que serviços normalmente procuras?</Text>
      <SectionHint>Podes escolher mais de uma.</SectionHint>
      <MultiChoiceList options={options} selected={form.services} onToggle={(v) => toggleMulti('services', v)} />
      {form.services.includes('Outro') && (
        <>
          <SectionLabel>Qual outro serviço?</SectionLabel>
          <TextInput
            style={s.input}
            placeholder="Descreve o serviço que procuras..."
            placeholderTextColor={colors.textMuted}
            value={form.customService || ''}
            onChangeText={(v) => update('customService', v)}
            autoFocus
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
      <Text style={s.consentSub}>Para terminar o teu perfil.</Text>
      <ConsentRow checked={form.consentMarketing} onToggle={() => update('consentMarketing', !form.consentMarketing)} label="Aceito receber comunicações da Buddy sobre o lançamento. (Opcional)" />
      <ConsentRow checked={form.consentDataUse} onToggle={() => update('consentDataUse', !form.consentDataUse)} label="Aceito que a Buddy use estes dados de forma anónima para melhorar os serviços." />
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
  outerBg: { flex: 1, backgroundColor: colors.primaryDeep },
  safe: { flex: 1, backgroundColor: 'transparent', maxWidth: 430, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },

  // ─── Desktop split-screen layout (web, wide viewport) ───
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: '#ffffff' },
  desktopLeft: {
    width: '42%',
    maxWidth: 560,
    backgroundColor: colors.primaryDeep,
    overflow: 'hidden',
  },
  desktopLeftInner: {
    flex: 1,
    padding: spacing[10],
    justifyContent: 'space-between',
    zIndex: 1,
  },
  desktopLeftTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopLeftCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  desktopRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  desktopCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: '#ffffff',
  },

  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: CARD_MAX_HEIGHT,
    overflow: 'hidden',
  },
  grabberZone: { alignItems: 'center', paddingTop: 14, paddingBottom: 12 },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D6D3DE' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing[6],
    height: 68,
  },
  backBtn: { width: 32 },
  counter: { fontFamily: font.regular, fontSize: fontSize.base, color: '#ffffff', width: 60, textAlign: 'right', opacity: 0.8 },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing[6],
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  progressSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  progressSegmentInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
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
  footer: { padding: spacing[4], backgroundColor: '#ffffff' },
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
  
  // Age structured layout styles
  ageRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
    alignItems: 'center',
  },
  unitToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 3,
  },
  unitBtn: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 10,
  },
  unitBtnOn: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  unitBtnText: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unitBtnTextOn: {
    color: colors.primary,
    fontFamily: font.semiBold,
  },
});
