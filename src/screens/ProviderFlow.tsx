import { useRef, useState } from 'react';
import {
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
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logo } from '../components/Logo';
import { ChoiceRow, SectionLabel, SectionHint } from './shared';
import { NavBar } from '../components/NavBar';

// ── Icons ─────────────────────────────────────────────────────────────
const ICO_BADGE_CHECK = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2l2.4 1.6 2.8-.4 1.2 2.6 2.6 1.2-.4 2.8L22 12l-1.4 2.2.4 2.8-2.6 1.2-1.2 2.6-2.8-.4L12 22l-2.2-1.4-2.8.4-1.2-2.6L3.2 17l.4-2.8L2 12l1.6-2.4-.4-2.8 2.6-1.2 1.2-2.6 2.8.4z" stroke="#6B5EBF" stroke-width="1.75" stroke-linejoin="round"/>
  <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="#6B5EBF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ── Storage key ──────────────────────────────────────────────────────
export const PROVIDER_FORM_KEY = 'provider_pending_form';

// ── Types ─────────────────────────────────────────────────────────────
type Branch = 'negocio' | 'freelancer';

interface ProviderForm {
  branch: Branch | null;
  // Negócio
  ownerName: string;
  businessName: string;
  services: string;
  bizExperience: string;
  website: string;
  // Freelancer
  freelancerName: string;
  freelancerService: string;
  availability: string;
  dogExperience: string;
  // Partilhado
  city: string;
  postalCode: string;
  phone: string;
  email: string;
}

const INITIAL: ProviderForm = {
  branch: null,
  ownerName: '', businessName: '', services: '', bizExperience: '', website: '',
  freelancerName: '', freelancerService: '', availability: '', dogExperience: '',
  city: '', postalCode: '', phone: '', email: '',
};

// ── Step definitions ──────────────────────────────────────────────────
const NEGOCIO_STEPS = ['N1','N2','N3','N4','N5','N6'] as const;
const FREELANCER_STEPS = ['F0','F1','F2','F3','F4','F5','F6'] as const;
type NegocioStep = typeof NEGOCIO_STEPS[number];
type FreelancerStep = typeof FREELANCER_STEPS[number];
type Step = 'choose' | NegocioStep | FreelancerStep;

const TOTAL = 6;

function stepLabel(step: Step): { current: number | null; total: number } {
  const nIdx = NEGOCIO_STEPS.indexOf(step as NegocioStep);
  const fIdx = FREELANCER_STEPS.indexOf(step as FreelancerStep);
  if (nIdx >= 0) return { current: nIdx + 1, total: TOTAL };
  if (fIdx >= 0 && step !== 'F0') return { current: fIdx, total: TOTAL };
  return { current: null, total: TOTAL };
}

// ── Main component ────────────────────────────────────────────────────
export default function ProviderFlow() {
  const [step, setStep] = useState<Step>('choose');
  const [form, setForm] = useState<ProviderForm>(INITIAL);
  const scrollRef = useRef<ScrollView>(null);

  function update<K extends keyof ProviderForm>(key: K, value: ProviderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function scrollTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function chooseBranch(branch: Branch) {
    update('branch', branch);
    setStep(branch === 'negocio' ? 'N1' : 'F0');
    scrollTop();
  }

  function goBack() {
    scrollTop();
    if (step === 'choose') { router.back(); return; }
    if (step === 'N1' || step === 'F0') { setStep('choose'); return; }
    const negIdx = NEGOCIO_STEPS.indexOf(step as NegocioStep);
    const freIdx = FREELANCER_STEPS.indexOf(step as FreelancerStep);
    if (negIdx > 0) setStep(NEGOCIO_STEPS[negIdx - 1]);
    else if (freIdx > 0) setStep(FREELANCER_STEPS[freIdx - 1]);
  }

  function goNext() {
    scrollTop();
    const negIdx = NEGOCIO_STEPS.indexOf(step as NegocioStep);
    const freIdx = FREELANCER_STEPS.indexOf(step as FreelancerStep);

    if (negIdx >= 0) {
      if (negIdx < NEGOCIO_STEPS.length - 1) setStep(NEGOCIO_STEPS[negIdx + 1]);
      else handleSubmit();
      return;
    }
    if (freIdx >= 0) {
      if (freIdx < FREELANCER_STEPS.length - 1) setStep(FREELANCER_STEPS[freIdx + 1]);
      else handleSubmit();
    }
  }

  async function handleSubmit() {
    await AsyncStorage.setItem(PROVIDER_FORM_KEY, JSON.stringify(form));
    router.replace('/buddyid/provider-loading' as any);
  }

  function isDisabled(): boolean {
    switch (step) {
      case 'N1': return form.ownerName.trim().length < 2 || form.businessName.trim().length < 2;
      case 'N2': return form.services.trim().length < 3;
      case 'N3': return !form.bizExperience;
      case 'N4': return form.city.trim().length < 2 || form.postalCode.trim().length < 4;
      case 'N5': return form.website.trim().length < 3;
      case 'N6': return form.phone.trim().length < 7 || !form.email.includes('@');
      case 'F1': return form.freelancerName.trim().length < 2;
      case 'F2': return !form.freelancerService;
      case 'F3': return !form.availability;
      case 'F4': return !form.dogExperience;
      case 'F5': return form.city.trim().length < 2 || form.postalCode.trim().length < 4;
      case 'F6': return form.phone.trim().length < 7 || !form.email.includes('@');
      default: return false;
    }
  }

  const { current, total } = stepLabel(step);
  const progress = current != null ? current / total : 0;
  const showProgress = step !== 'choose' && step !== 'F0';
  const showFooterBtn = step !== 'choose' && step !== 'F0';
  const isLastStep = step === 'N6' || step === 'F6';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} hitSlop={12} style={s.backBtn}>
          <Text style={s.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Junta-te a nós</Text>
        {current != null
          ? <Text style={s.counter}>{current} de {total}</Text>
          : <View style={{ width: 60 }} />}
      </View>

      {/* Progress bar */}
      {showProgress && (
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
      )}

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepContent step={step} form={form} update={update} chooseBranch={chooseBranch} goNext={goNext} />
        </ScrollView>

        {showFooterBtn && (
          <View style={s.footer}>
            <TouchableOpacity
              style={[s.continueBtn, isDisabled() && s.continueBtnDisabled]}
              onPress={goNext}
              disabled={isDisabled()}
            >
              <Text style={s.continueBtnText}>
                {isLastStep ? 'Enviar registo' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
      {step === 'choose' && <NavBar />}
    </SafeAreaView>
  );
}

// ── Step content ──────────────────────────────────────────────────────
function StepContent({
  step, form, update, chooseBranch, goNext,
}: {
  step: Step;
  form: ProviderForm;
  update: <K extends keyof ProviderForm>(k: K, v: ProviderForm[K]) => void;
  chooseBranch: (b: Branch) => void;
  goNext: () => void;
}) {
  switch (step) {
    case 'choose': return <ChoosePath chooseBranch={chooseBranch} />;
    case 'N1': return <N1 form={form} update={update} />;
    case 'N2': return <N2 form={form} update={update} />;
    case 'N3': return <N3 form={form} update={update} />;
    case 'N4': return <LocationStep title="Onde prestas serviço?" form={form} update={update} />;
    case 'N5': return <N5 form={form} update={update} />;
    case 'N6': return <ContactStep title="Como te contactamos?" form={form} update={update} />;
    case 'F0': return <F0 goNext={goNext} />;
    case 'F1': return <F1 form={form} update={update} />;
    case 'F2': return <F2 form={form} update={update} />;
    case 'F3': return <F3 form={form} update={update} />;
    case 'F4': return <F4 form={form} update={update} />;
    case 'F5': return <LocationStep title="Onde moras?" form={form} update={update} />;
    case 'F6': return <ContactStep title="O teu contacto" form={form} update={update} />;
  }
}

// ── Ecrã 0: Escolha do caminho ───────────────────────────────────────
const PATH_CARDS: {
  pill: string;
  title: string;
  hook: string;
  btnLabel: string;
  branch: Branch;
}[] = [
  {
    pill: 'Já tenho negócio',
    title: 'Tenho um negócio com cães',
    hook: 'Apareces primeiro aos tutores da tua zona, desde o dia um.',
    btnLabel: 'Quero ser parceiro',
    branch: 'negocio',
  },
  {
    pill: 'Começo do zero',
    title: 'Adoro cães e quero ganhar',
    hook: 'Defines o teu horário e trabalhas ao teu ritmo.',
    btnLabel: 'Quero começar',
    branch: 'freelancer',
  },
];

function ChoosePath({ chooseBranch }: { chooseBranch: (b: Branch) => void }) {
  return (
    <View style={s.questionWrap}>
      {/* Pill de escassez */}
      <View style={s.headerPill}>
        <Text style={s.headerPillText}>Pré-lançamento · Vagas limitadas</Text>
      </View>

      {/* Título com realce */}
      <Text style={s.questionTitle}>
        <Text style={s.questionTitleAccent}>Sê dos primeiros</Text>
        {' a trabalhar com cães na Buddy'}
      </Text>

      {/* Subtítulo */}
      <Text style={s.questionSub}>
        Estamos a formar o grupo fundador de prestadores em Portugal, antes do lançamento.
      </Text>

      {/* Linha de confiança */}
      <View style={s.proofRow}>
        <SvgXml xml={ICO_BADGE_CHECK} width={16} height={16} style={s.proofIcon} />
        <Text style={s.proofText}>Entrar não tem custo nem compromisso.</Text>
      </View>

      <View style={s.headerGap} />

      {PATH_CARDS.map((card) => (
        <PathCard key={card.branch} {...card} onPress={() => chooseBranch(card.branch)} />
      ))}
    </View>
  );
}

function PathCard({ pill, title, hook, btnLabel, onPress }: {
  pill: string; title: string; hook: string; btnLabel: string; onPress: () => void;
}) {
  return (
    <View style={s.pathCard}>
      <View style={s.pathGlow} />
      <View style={s.pathPill}><Text style={s.pathPillText}>{pill}</Text></View>
      <Text style={s.pathTitle}>{title}</Text>
      <Text style={s.pathHook}>{hook}</Text>
      <View style={s.pathStrip}>
        <Text style={s.pathStripText}>
          <Text style={s.pathStripBold}>0%</Text>
          {' de comissão no primeiro ano para quem entra no pré-lançamento.'}
        </Text>
      </View>
      <TouchableOpacity style={s.pathBtn} onPress={onPress} activeOpacity={0.85}>
        <Text style={s.pathBtnText}>{btnLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Negócio ───────────────────────────────────────────────────────────
function N1({ form, update }: StepProps) {
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Quem és?</Text>
      <SectionLabel>Nome e apelido</SectionLabel>
      <Field
        value={form.ownerName}
        onChange={(v) => update('ownerName', v)}
        placeholder="ex: Ana Ferreira"
        autoCapitalize="words"
      />
      <SectionLabel>Nome do negócio</SectionLabel>
      <Field
        value={form.businessName}
        onChange={(v) => update('businessName', v)}
        placeholder="ex: Patinhas do João, Dog Studio Lisboa"
        autoCapitalize="words"
      />
    </View>
  );
}

function N2({ form, update }: StepProps) {
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Que serviços ofereces?</Text>
      <SectionHint>Escreve um por linha. Queremos conhecer tudo o que fazes.</SectionHint>
      <TextInput
        style={s.textArea}
        value={form.services}
        onChangeText={(v) => update('services', v)}
        placeholder={'ex: Passeios\nBanho e tosquia\nCreche\nTreino...'}
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

function N3({ form, update }: StepProps) {
  const options = [
    'Menos de 1 ano',
    'Entre 1 e 3 anos',
    'Entre 3 e 7 anos',
    'Mais de 7 anos',
  ];
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Há quanto tempo trabalhas com cães a título profissional?</Text>
      <ChoiceList
        options={options}
        selected={form.bizExperience}
        onSelect={(v) => update('bizExperience', v)}
      />
    </View>
  );
}

function N5({ form, update }: StepProps) {
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Tens website, Instagram ou Google Business?</Text>
      <Field
        value={form.website}
        onChange={(v) => update('website', v)}
        placeholder="Link ou @username"
        autoCapitalize="none"
        keyboardType="url"
      />
    </View>
  );
}

// ── Freelancer ────────────────────────────────────────────────────────
function F0({ goNext }: { goNext: () => void }) {
  const points = [
    'Tu defines a tua disponibilidade. Aceitas quando queres.',
    'Ficas com 100% do que ganhas nos primeiros meses.',
    'Clientes verificados pela Buddy.',
  ];
  return (
    <View style={s.questionWrap}>
      <Text style={s.saleTitle}>Ganha dinheiro a passear cães e a tomar conta deles.</Text>
      <Text style={s.saleSubtitle}>Ao teu ritmo, nas tuas horas.</Text>
      <Text style={s.saleBody}>
        Não precisas de experiência profissional. Precisas de gostar de cães e de ser de confiança.
      </Text>
      <View style={s.pointsList}>
        {points.map((p) => (
          <View key={p} style={s.pointRow}>
            <View style={s.pointDot} />
            <Text style={s.pointText}>{p}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.saleBtn} onPress={goNext} activeOpacity={0.85}>
        <Text style={s.saleBtnText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

function F1({ form, update }: StepProps) {
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Qual é o teu nome?</Text>
      <Field
        value={form.freelancerName}
        onChange={(v) => update('freelancerName', v)}
        placeholder="ex: Ana Ferreira"
        autoCapitalize="words"
      />
    </View>
  );
}

function F2({ form, update }: StepProps) {
  const options = [
    'Passear cães',
    'Pet sitting (ficar com o cão em casa)',
    'As duas coisas',
  ];
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>O que queres fazer?</Text>
      <ChoiceList
        options={options}
        selected={form.freelancerService}
        onSelect={(v) => update('freelancerService', v)}
      />
    </View>
  );
}

function F3({ form, update }: StepProps) {
  const options = [
    'Menos de 5 horas',
    'Entre 5 e 10 horas',
    'Entre 10 e 20 horas',
    'Mais de 20 horas',
  ];
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Quantas horas por semana tens disponíveis?</Text>
      <ChoiceList
        options={options}
        selected={form.availability}
        onSelect={(v) => update('availability', v)}
      />
    </View>
  );
}

function F4({ form, update }: StepProps) {
  const options = [
    'Tenho ou tive cães',
    'Tomo conta de cães de amigos ou família',
    'Nunca tive cão mas adoro',
  ];
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>Já tens experiência com cães?</Text>
      <ChoiceList
        options={options}
        selected={form.dogExperience}
        onSelect={(v) => update('dogExperience', v)}
      />
    </View>
  );
}

// ── Ecrãs partilhados ─────────────────────────────────────────────────
function LocationStep({ title, form, update }: StepProps & { title: string }) {
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>{title}</Text>
      <SectionLabel>Cidade ou distrito</SectionLabel>
      <Field
        value={form.city}
        onChange={(v) => update('city', v)}
        placeholder="ex: Lisboa, Porto, Braga"
        autoCapitalize="words"
      />
      <SectionLabel>Código postal</SectionLabel>
      <Field
        value={form.postalCode}
        onChange={(v) => update('postalCode', v)}
        placeholder="ex: 4000-123"
        keyboardType="numeric"
      />
    </View>
  );
}

function ContactStep({ title, form, update }: StepProps & { title: string }) {
  return (
    <View style={s.questionWrap}>
      <Text style={s.questionTitle}>{title}</Text>
      <SectionLabel>Telemóvel</SectionLabel>
      <Field
        value={form.phone}
        onChange={(v) => update('phone', v)}
        placeholder="+351 9XX XXX XXX"
        keyboardType="phone-pad"
      />
      <SectionLabel>Email</SectionLabel>
      <Field
        value={form.email}
        onChange={(v) => update('email', v.toLowerCase().trim())}
        placeholder="o.teu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────
type StepProps = {
  form: ProviderForm;
  update: <K extends keyof ProviderForm>(k: K, v: ProviderForm[K]) => void;
};

function Field({
  value, onChange, placeholder, autoCapitalize = 'sentences', keyboardType = 'default',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
}) {
  return (
    <TextInput
      style={s.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
    />
  );
}

function ChoiceList({ options, selected, onSelect }: {
  options: string[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <View>
      {options.map((opt) => {
        const on = selected === opt;
        return (
          <Pressable key={opt} onPress={() => onSelect(opt)} style={[s.choiceItem, on && s.choiceItemOn]}>
            <View style={[s.choiceRadio, on && s.choiceRadioOn]}>
              {on && <View style={s.choiceRadioDot} />}
            </View>
            <Text style={[s.choiceItemText, on && s.choiceItemTextOn]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: colors.primary, fontFamily: font.regular },
  headerTitle: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text },
  counter: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textMuted, width: 60, textAlign: 'right' },

  progressTrack: { height: 3, backgroundColor: colors.borderSoft },
  progressFill: { height: 3, backgroundColor: colors.primary },

  scrollContent: { paddingHorizontal: spacing[5], paddingTop: spacing[6], paddingBottom: spacing[10] },
  questionWrap: {},
  headerPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#6B5EBF14',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing[3],
  },
  headerPillText: { fontFamily: font.semiBold, fontSize: 11, color: colors.primary },
  questionTitle: {
    fontFamily: font.bold,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing[2],
    lineHeight: 32,
  },
  questionTitleAccent: {
    color: colors.primary,
  },
  questionSub: {
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: 22,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 0,
  },
  proofIcon: { flexShrink: 0 },
  proofText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: '#8c84a0',
    lineHeight: 18,
    flex: 1,
  },
  headerGap: { height: 24 },

  // ── Path cards (Ecrã 0) ──
  pathCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pathGlow: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pathPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing[3],
  },
  pathPillText: { fontFamily: font.semiBold, fontSize: 11, color: colors.primary },
  pathTitle: {
    fontFamily: font.bold,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: spacing[2],
    lineHeight: 26,
  },
  pathHook: {
    fontFamily: font.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  pathStrip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing[4],
  },
  pathStripText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  pathStripBold: {
    fontFamily: font.bold,
    color: '#FFFFFF',
  },
  pathBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathBtnText: { fontFamily: font.semiBold, fontSize: 15, color: colors.primary },

  // ── Freelancer sale page (F0) ──
  saleTitle: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, lineHeight: 30, marginBottom: spacing[2] },
  saleSubtitle: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing[4] },
  saleBody: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing[5] },
  pointsList: { gap: spacing[3], marginBottom: spacing[7] },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  pointDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 7, flexShrink: 0 },
  pointText: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.text, flex: 1, lineHeight: 22 },
  saleBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleBtnText: { fontFamily: font.semiBold, fontSize: 15, color: '#fff' },

  // ── Inputs ──
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
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    height: 160,
    textAlignVertical: 'top',
  },

  // ── Choice list (radio) ──
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  choiceItemOn: { borderColor: colors.primary, backgroundColor: colors.surfaceAccent },
  choiceRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  choiceRadioOn: { borderColor: colors.primary },
  choiceRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  choiceItemText: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.textSecondary, flex: 1 },
  choiceItemTextOn: { color: colors.primary, fontFamily: font.semiBold },

  // ── Footer button ──
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnText: { fontFamily: font.semiBold, fontSize: 15, color: '#fff' },
});
