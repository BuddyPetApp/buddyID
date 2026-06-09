import { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../tokens';
import { ChevronLeftIcon } from '../../components/Icons';
import Svg, { Path } from 'react-native-svg';
import { apiClient } from '../../api/client';

function ShareIcon({ size = 20, color = colors.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShareSheet({
  visible,
  dogName,
  hasHabits,
  hasBehavior,
  hasHealth,
  onClose,
  onShare,
}: {
  visible: boolean;
  dogName: string;
  hasHabits: boolean;
  hasBehavior: boolean;
  hasHealth: boolean;
  onClose: () => void;
  onShare: (sections: string[]) => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(['basic']);

  useEffect(() => {
    if (visible) setSelected(['basic']);
  }, [visible]);

  const toggle = (sec: string) => {
    if (sec === 'basic') return; // Basic is always included
    setSelected((prev) => prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]);
  };

  const translateY = useRef(new Animated.Value(600)).current;
  useEffect(() => {
    Animated.timing(translateY, { toValue: visible ? 0 : 600, duration: 250, useNativeDriver: true }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetGrabber} />
          <Text style={styles.sheetTitle}>Partilhar BuddyID</Text>
          <Text style={styles.sheetSub}>O que queres partilhar do perfil de {dogName}?</Text>

          <View style={styles.sheetOptions}>
            <Pressable style={[styles.sheetOpt, styles.sheetOptSelected]}>
              <CheckCircleFilled size={20} />
              <Text style={[styles.sheetOptLabel, styles.sheetOptLabelSelected]}>Informações Básicas</Text>
            </Pressable>
            
            {hasHabits && (
              <Pressable style={[styles.sheetOpt, selected.includes('habits') && styles.sheetOptSelected]} onPress={() => toggle('habits')}>
                {selected.includes('habits') ? <CheckCircleFilled size={20} /> : <CheckCircleOutline size={20} />}
                <Text style={[styles.sheetOptLabel, selected.includes('habits') && styles.sheetOptLabelSelected]}>Hábitos & Rotinas</Text>
              </Pressable>
            )}

            {hasBehavior && (
              <Pressable style={[styles.sheetOpt, selected.includes('behavior') && styles.sheetOptSelected]} onPress={() => toggle('behavior')}>
                {selected.includes('behavior') ? <CheckCircleFilled size={20} /> : <CheckCircleOutline size={20} />}
                <Text style={[styles.sheetOptLabel, selected.includes('behavior') && styles.sheetOptLabelSelected]}>Perfil Comportamental</Text>
              </Pressable>
            )}

            {hasHealth && (
              <Pressable style={[styles.sheetOpt, selected.includes('health') && styles.sheetOptSelected]} onPress={() => toggle('health')}>
                {selected.includes('health') ? <CheckCircleFilled size={20} /> : <CheckCircleOutline size={20} />}
                <Text style={[styles.sheetOptLabel, selected.includes('health') && styles.sheetOptLabelSelected]}>Saúde</Text>
              </Pressable>
            )}
          </View>

          <Pressable style={({pressed}) => [styles.sheetBtn, pressed && { opacity: 0.85 }]} onPress={() => onShare(selected)}>
            <Text style={styles.sheetBtnText}>Gerar Link</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
import {
  DOG_COLORS,
  DOG_SHADOW,
  DOG_RADIUS,
  DOG_FONT,
  ChevronRight,
  CheckCircleFilled,
  CheckCircleOutline,
} from './_shared';
import {
  computeCompleteness,
  computeProgress,
  GENDER_LABELS_PT,
  TEMPERAMENT_LABELS_PT,
  FOOD_TYPE_LABELS_PT,
  ACTIVITY_LEVEL_LABELS_PT,
  HOUSING_LABELS_PT,
  SIZE_LABELS_PT,
  type DogGender,
  type FoodType,
  type ActivityLevel,
  type HousingType,
  ageFromBirthdate,
  type DogProfile,
  type DogBasicInfo,
  type DogHabits,
  type DogBehavior,
  type DogHealth,
} from '../../types/dog';

function isoToShortDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}

function buildBasicSummary(profile: any): string | null {
  const b = profile?.basicInfo;
  if (!b) return null;
  const parts: string[] = [];
  if (b.breed) parts.push(b.breed);
  if (typeof b.weightKg === 'number') parts.push(`${b.weightKg} kg`);
  if (b.gender) parts.push(GENDER_LABELS_PT[b.gender as DogGender]);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function buildHabitsSummary(profile: any, t: any): string | null {
  const h = profile?.habits;
  if (!h) return null;
  const parts: string[] = [];
  
  if (h.lifestyle?.housing) parts.push(HOUSING_LABELS_PT[h.lifestyle.housing as HousingType] || h.lifestyle.housing);
  if (h.origin) parts.push(h.origin);
  if (h.preferredServices?.length) parts.push(`${h.preferredServices.length} serviço${h.preferredServices.length === 1 ? '' : 's'}`);
  if (h.activity?.level) parts.push(`Atividade ${ACTIVITY_LEVEL_LABELS_PT[h.activity.level as ActivityLevel]?.toLowerCase() || h.activity.level}`);
  
  return parts.length > 0 ? parts.slice(0, 3).join(' · ') : null;
}

function buildBehaviorSummary(profile: any, t: any): string | null {
  const b = profile?.behavior;
  if (!b) return null;
  const parts: string[] = [];

  if (b.separationAnxiety) {
    parts.push(`Ansiedade: ${b.separationAnxiety.toLowerCase()}`);
  }
  if (b.likes?.length) {
    parts.push(`Gosta de ${b.likes.slice(0, 2).join(', ').toLowerCase()}`);
  }
  if (b.fears?.length) {
    parts.push(b.fears.length === 1 ? '1 medo' : `${b.fears.length} medos`);
  }
  if (b.leashBehavior?.length) {
    parts.push(`Trela: ${b.leashBehavior[0].toLowerCase()}`);
  }

  return parts.length > 0 ? parts.slice(0, 3).join(' · ') : null;
}

function buildHealthSummary(profile: any, t: any): string | null {
  const health = profile?.health;
  if (!health) return null;
  const parts: string[] = [];
  const vaccines = health.vaccines ?? [];
  if (vaccines.length > 0) {
    const latest = [...vaccines].sort((a: any, b: any) => b.date.localeCompare(a.date))[0];
    parts.push(t('tutor.dogProfile.lastVaccine', { date: isoToShortDisplay(latest.date) }));
  }
  const allergyCount = (health.allergies?.tags?.length ?? 0) + (health.allergies?.other ? 1 : 0);
  if (allergyCount > 0) {
    parts.push(allergyCount === 1 ? t('tutor.dogProfile.allergy') : t('tutor.dogProfile.allergies', { count: allergyCount }));
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

const HERO_HEIGHT = 150;
const AVATAR_SIZE = 110;
const AVATAR_BORDER = 4;

export default function DogProfileScreen({ id, isPublic = false, sections }: { id?: string; isPublic?: boolean; sections?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);

  const isReadOnly = isPublic;

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    const endpoint = isPublic ? `/dogs/${id}/public` : `/dogs/${id}`;
    apiClient.get<any>(endpoint)
      .then((data) => {
        if (data) {
          const mappedProfile: DogProfile = {
            id: data.id,
            basicInfo: {
              name: data.name || '',
              breed: data.breed,
              birthdate: data.birthdate,
              gender: data.gender,
              weightKg: data.weightKg,
              size: data.size,
              photoUrl: data.photoUrl,
            },
            habits: data.habitsJson ? (() => {
              try { 
                const raw = JSON.parse(data.habitsJson); 
                return {
                  ...raw,
                  lifestyle: raw.lifestyle || {
                    housing: raw.housing,
                    sleepingPlace: raw.sleepingPlace,
                    exerciseDuration: raw.exerciseDuration,
                  },
                  preferredServices: raw.preferredServices || raw.services,
                  origin: raw.origin || (data.adopted ? "Adotei/Resgatei" : undefined)
                };
              } catch { return {}; }
            })() : {},
            behavior: data.behaviorJson ? (() => {
              try { 
                const raw = JSON.parse(data.behaviorJson); 
                const habits = data.habitsJson ? JSON.parse(data.habitsJson) : {};
                return {
                  ...raw,
                  separationAnxiety: raw.separationAnxiety || habits.separationAnxiety,
                  goals: raw.goals || habits.goals,
                  tutorNotes: raw.tutorNotes || (raw.customFear ? `Fobia extra: ${raw.customFear}` : undefined),
                };
              } catch { return {}; }
            })() : {},
            health: data.healthJson ? (() => {
              try { return JSON.parse(data.healthJson); } catch { return undefined; }
            })() : undefined,
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          setProfile(mappedProfile);
        }
      })
      .catch((err) => {
        console.error('Error fetching dog profile:', err);
        Alert.alert(t('common.error') || 'Erro', 'Não foi possível carregar o perfil do cão.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const completeness = useMemo(() => {
    if (!profile) return { basic: false, habits: false, behavior: false };
    return computeCompleteness(profile);
  }, [profile]);

  const progress = useMemo(() => {
    if (!profile) return 0;
    return computeProgress(profile);
  }, [profile]);

  const basicSummary = useMemo(() => buildBasicSummary(profile), [profile]);
  const habitsSummary = useMemo(() => buildHabitsSummary(profile, t), [profile, t]);
  const behaviorSummary = useMemo(() => buildBehaviorSummary(profile, t), [profile, t]);
  const healthSummary = useMemo(() => buildHealthSummary(profile, t), [profile, t]);

  const hasHabits = useMemo(() => {
    if (isPublic && sections && !sections.includes('habits')) return false;
    return !!profile && !!profile.habits && Object.keys(profile.habits).length > 0;
  }, [profile, isPublic, sections]);

  const hasBehavior = useMemo(() => {
    if (isPublic && sections && !sections.includes('behavior')) return false;
    return !!profile && !!profile.behavior && Object.keys(profile.behavior).length > 0;
  }, [profile, isPublic, sections]);

  const hasHealth = useMemo(() => {
    if (isPublic && sections && !sections.includes('health')) return false;
    return !!profile && !!profile.health && Object.keys(profile.health).length > 0;
  }, [profile, isPublic, sections]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{t('tutor.dogProfile.noDogs')}</Text>
        <Pressable onPress={() => router.replace('/buddyid' as any)} style={styles.backButtonInline}>
          <Text style={styles.backButtonInlineText}>Voltar ao Dashboard</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const basic = profile.basicInfo;
  const age = ageFromBirthdate(basic.birthdate);

  const tagline = [
    basic.breed,
    age !== null ? `${age} ${age === 1 ? t('tutor.dogProfile.year') : t('tutor.dogProfile.years')}` : null,
    basic.gender ? GENDER_LABELS_PT[basic.gender] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const handleShare = (sections: string[] = []) => {
    const baseWebUrl = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.EXPO_PUBLIC_FORM_WEB_URL || 'https://buddy.pet');
    const article = basic.gender === 'female' ? 'da' : 'do';
    
    let link = `${baseWebUrl}/buddyid/public/${profile.id}`;
    if (sections.length > 0) {
      link += `?sections=${sections.join(',')}`;
    }
    
    Share.share({
      message: Platform.OS === 'android' ? `Vê o BuddyID ${article} ${basic.name}! ${link}` : `Vê o BuddyID ${article} ${basic.name}!`,
      url: link,
    }).catch(console.error);
  };

  const goToEdit = (section: 'basic' | 'habits' | 'behavior' | 'health') => {
    if (isReadOnly) {
      router.push(`/buddyid/public/${profile.id}/${section}` as any);
    } else {
      router.push(`/buddyid/dog/${profile.id}/edit-${section}` as any);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/buddyid' as any)} hitSlop={12} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color={colors.primary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{isReadOnly ? 'BuddyID' : t('tutor.dogProfile.profile')}</Text>
        {!isReadOnly ? (
          <Pressable onPress={() => setShareSheetVisible(true)} hitSlop={12} style={styles.shareHeaderBtn}>
            <ShareIcon size={20} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Purple Hero Section */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              {basic.photoUrl ? (
                <Image source={{ uri: basic.photoUrl }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>{basic.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Dog Meta */}
        <View style={styles.metaWrap}>
          <Text style={styles.name}>{basic.name}</Text>
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
        </View>

        {/* Progress Card */}
        {!isReadOnly && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{t('tutor.dogProfile.knowBetter', { name: basic.name })}</Text>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressBody}>
              {progress === 100
                ? t('tutor.dogProfile.profileComplete')
                : t('tutor.dogProfile.theMoreTheyTell', { name: basic.name })}
            </Text>

            <View style={styles.progressRows}>
              <ProgressRow
                label={t('tutor.dogProfile.basicInfo')}
                complete={completeness.basic}
                onPress={() => goToEdit('basic')}
              />
              <ProgressRow
                label={t('tutor.dogProfile.habits')}
                complete={completeness.habits}
                onPress={() => goToEdit('habits')}
              />
              <ProgressRow
                label={t('tutor.dogProfile.behavioralProfile')}
                complete={completeness.behavior}
                onPress={() => goToEdit('behavior')}
              />
              <ProgressRow
                label={t('tutor.dogProfile.health')}
                complete={hasHealth}
                onPress={() => goToEdit('health')}
                isLast
              />
            </View>
          </View>
        )}

        {/* Section Links */}
        <Text style={styles.sectionTitle}>Secções do Perfil</Text>
        <View style={styles.linksCard}>
          <AccordionSection
            title={t('tutor.dogProfile.basicInfo')}
            summary={basicSummary}
            complete={completeness.basic}
            onEdit={() => goToEdit('basic')}
            isReadOnly={isReadOnly}
            isLast={isReadOnly && !hasHabits && !hasBehavior && !hasHealth}
          >
            <DataRow label="Nome" value={basic.name} />
            <DataRow label="Raça" value={basic.breed} />
            <DataRow label="Data de Nasc." value={basic.birthdate ? isoToShortDisplay(basic.birthdate) : null} />
            <DataRow label="Idade" value={age !== null ? `${age} anos` : null} />
            <DataRow label="Género" value={basic.gender ? GENDER_LABELS_PT[basic.gender] : null} />
            <DataRow label="Peso" value={basic.weightKg ? `${basic.weightKg} kg` : null} />
            <DataRow label="Tamanho" value={basic.size ? SIZE_LABELS_PT[basic.size] : null} />
            <DataRow label="Esterilizado" value={basic.isSterilized === true ? 'Sim' : basic.isSterilized === false ? 'Não' : null} />
          </AccordionSection>

          {hasHabits && (
            <AccordionSection
              title={t('tutor.dogProfile.habits')}
              summary={habitsSummary}
              complete={completeness.habits}
              onEdit={() => goToEdit('habits')}
              isReadOnly={isReadOnly}
              isLast={isReadOnly && !hasBehavior && !hasHealth}
            >
              <DataRow label="Tipo de Alimentação" value={profile.habits?.food?.type ? FOOD_TYPE_LABELS_PT[profile.habits.food.type as FoodType] : null} />
              <DataRow label="Marca de Ração" value={profile.habits?.food?.brand} />
              <DataRow label="Refeições/dia" value={profile.habits?.food?.mealsPerDay} />
              <DataRow label="Nível de Atividade" value={profile.habits?.activity?.level ? ACTIVITY_LEVEL_LABELS_PT[profile.habits.activity.level as ActivityLevel] : null} />
              <DataRow label="Passeios/dia" value={profile.habits?.activity?.walksPerDay} />
              <DataRow label="Habitação" value={profile.habits?.lifestyle?.housing ? HOUSING_LABELS_PT[profile.habits.lifestyle.housing as HousingType] || profile.habits.lifestyle.housing : null} />
              <DataTags label="Quem vive em casa" values={profile.habits?.housemates} />
              <DataRow label="Local de Descanso" value={profile.habits?.lifestyle?.sleepingPlace} />
              <DataRow label="Duração Exercício" value={profile.habits?.lifestyle?.exerciseDuration} />
              <DataTags label="Serviços Preferidos" values={profile.habits?.preferredServices} />
              <DataRow label="Outros Serviços" value={profile.habits?.customService} />
              <DataRow label="Origem" value={profile.habits?.origin} />
            </AccordionSection>
          )}

          {hasBehavior && (
            <AccordionSection
              title={t('tutor.dogProfile.behavioralProfile')}
              summary={behaviorSummary}
              complete={completeness.behavior}
              onEdit={() => goToEdit('behavior')}
              isReadOnly={isReadOnly}
              isLast={isReadOnly && !hasHealth}
            >
              <DataRow label="Nível de Energia" value={profile.behavior?.energy} />
              <DataRow label="Com Estranhos" value={profile.behavior?.withStrangers} />
              <DataRow label="Pessoas de Casa" value={profile.behavior?.withHomePeople} />
              <DataRow label="Obediência" value={profile.behavior?.obedience} />
              <DataRow label="Apego" value={profile.behavior?.attachment} />
              <DataRow label="Sensibilidade ao Toque" value={profile.behavior?.touchSensitivity} />
              <DataRow label="Situações Novas" value={profile.behavior?.newSituations} />
              <DataRow label="Socialização (Pessoas)" value={profile.behavior?.socialization?.people ? `${profile.behavior.socialization.people}/5` : null} />
              <DataRow label="Socialização (Cães)" value={profile.behavior?.socialization?.dogs ? `${profile.behavior.socialization.dogs}/5` : null} />
              <DataRow label="Socialização (Crianças)" value={profile.behavior?.socialization?.children ? `${profile.behavior.socialization.children}/5` : null} />
              <DataTags label="Ansiedade de Separação" values={Array.isArray(profile.behavior?.separationAnxiety) ? profile.behavior.separationAnxiety : (profile.behavior?.separationAnxiety ? [profile.behavior.separationAnxiety] : undefined)} />
              <DataTags label="Comportamento à Trela" values={profile.behavior?.leashBehavior} />
              <DataTags label="Do que gosta" values={profile.behavior?.likes} />
              <DataTags label="Medos / Fobias" values={profile.behavior?.fears} />
              <DataRow label="Nota Adicional" value={profile.behavior?.tutorNotes} />
              <DataTags label="Objetivos" values={profile.behavior?.goals} />
            </AccordionSection>
          )}

          {hasHealth && (
            <AccordionSection
              title={t('tutor.dogProfile.health')}
              summary={healthSummary}
              complete={hasHealth}
              optional
              onEdit={() => goToEdit('health')}
              isLast
              isReadOnly={isReadOnly}
            >
              <DataRow label="Histórico de Trauma" value={profile.habits?.traumaHistory} />
              <DataRow label="Tem Preocupações?" value={profile.health?.concerns} />
              <DataRow label="Quais Preocupações?" value={profile.health?.concernsText} />
              <DataTags label="Alergias" values={profile.health?.allergies?.tags} />
              <DataRow label="Outras Alergias" value={profile.health?.allergies?.other} />
              <DataRow label="Medicação Atual" value={profile.health?.medication} />
              {profile.health?.vaccines?.map((v: any, i: number) => (
                <DataRow key={i} label={`Vacina: ${v.name}`} value={isoToShortDisplay(v.date)} />
              ))}
            </AccordionSection>
          )}
        </View>

        {!isReadOnly && (
          <Pressable
            onPress={() => setShareSheetVisible(true)}
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.shareBtnText}>{t('tutor.dogProfile.shareCard', { name: basic.name })}</Text>
          </Pressable>
        )}
      </ScrollView>

      {profile && (
        <ShareSheet
          visible={shareSheetVisible}
          dogName={basic.name}
          hasHabits={hasHabits}
          hasBehavior={hasBehavior}
          hasHealth={hasHealth}
          onClose={() => setShareSheetVisible(false)}
          onShare={(sections) => {
            setShareSheetVisible(false);
            handleShare(sections);
          }}
        />
      )}
    </View>
  );
}

function ProgressRow({
  label,
  complete,
  onPress,
  isLast = false,
}: {
  label: string;
  complete: boolean;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pRow,
        !isLast && styles.pRowDivider,
        pressed && { opacity: 0.7 },
      ]}
    >
      {complete ? <CheckCircleFilled size={20} /> : <CheckCircleOutline size={20} />}
      <Text style={[styles.pRowLabel, complete && styles.pRowLabelComplete]}>{label}</Text>
      <ChevronRight />
    </Pressable>
  );
}

function AccordionSection({
  title,
  summary,
  complete,
  optional = false,
  isLast = false,
  isReadOnly = false,
  onEdit,
  children
}: {
  title: string;
  summary?: string | null;
  complete: boolean;
  optional?: boolean;
  isLast?: boolean;
  isReadOnly?: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.accordionWrap, !isLast && styles.accordionDivider]}>
      <Pressable onPress={toggle} style={({ pressed }) => [
        styles.accordionHeader,
        pressed && { backgroundColor: 'rgba(0,0,0,0.02)' }
      ]}>
        <View style={styles.accordionTitleWrap}>
          <Text style={styles.sLinkTitle}>{title}</Text>
          {!expanded && (
             summary ? (
               <Text style={styles.sLinkSummary} numberOfLines={2}>{summary}</Text>
             ) : (
               <Text style={[styles.sLinkStatus, complete && styles.sLinkStatusComplete, isReadOnly && !complete && { color: colors.textSecondary }]}>
                 {complete
                   ? 'Preenchido'
                   : isReadOnly
                   ? 'Sem informação'
                   : optional
                   ? t('tutor.dogProfile.optionalAdd')
                   : t('tutor.dogProfile.addLower')}
               </Text>
             )
          )}
        </View>
        <View style={[styles.chevronWrap, { transform: [{ rotate: expanded ? '-90deg' : '90deg' }] }]}>
          <ChevronRight />
        </View>
      </Pressable>
      
      {expanded && (
        <View style={styles.accordionContent}>
          {children}
          {!isReadOnly && (
            <Pressable onPress={onEdit} style={({ pressed }) => [
              styles.accordionEditBtn,
              pressed && { opacity: 0.8 }
            ]}>
              <Text style={styles.accordionEditBtnText}>Editar {title}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function DataRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function DataTags({ label, values }: { label: string; values?: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <View style={styles.dataTagsWrap}>
      <Text style={styles.dataLabel}>{label}</Text>
      <View style={styles.tagsContainer}>
        {values.map(v => (
          <View key={v} style={styles.tag}>
            <Text style={styles.tagText}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  emptyText: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing[4] },
  backButtonInline: { paddingVertical: spacing[3], paddingHorizontal: spacing[5], backgroundColor: colors.primary, borderRadius: 12 },
  backButtonInlineText: { color: '#fff', fontFamily: font.semiBold, fontSize: fontSize.base },
  
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: font.bold, fontSize: fontSize.md, color: colors.text },
  shareHeaderBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  
  scroll: { paddingBottom: spacing[8] },
  hero: {
    backgroundColor: colors.primary,
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    marginBottom: (AVATAR_SIZE / 2) + 12,
  },
  avatarWrap: {
    position: 'absolute',
    bottom: -(AVATAR_SIZE / 2),
    alignSelf: 'center',
    zIndex: 10,
  },
  avatarRing: {
    width: AVATAR_SIZE + AVATAR_BORDER * 2,
    height: AVATAR_SIZE + AVATAR_BORDER * 2,
    borderRadius: (AVATAR_SIZE + AVATAR_BORDER * 2) / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...DOG_SHADOW,
  },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarFallback: { backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { fontSize: 44, fontFamily: font.bold, color: colors.primary },
  
  metaWrap: { alignItems: 'center', paddingHorizontal: spacing[4], marginBottom: spacing[5] },
  name: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text },
  tagline: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.textSecondary, marginTop: 4 },
  
  progressCard: {
    marginHorizontal: spacing[4],
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: spacing[4],
    marginBottom: spacing[5],
    ...DOG_SHADOW,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  progressTitle: { fontFamily: font.bold, fontSize: fontSize.base, color: colors.text },
  progressPct: { fontFamily: font.bold, fontSize: fontSize.base, color: colors.primary },
  progressTrack: { height: 6, backgroundColor: 'rgba(107,94,191,0.12)', borderRadius: 3, marginBottom: spacing[3] },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  progressBody: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing[4] },
  
  progressRows: { borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: spacing[2] },
  pRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  pRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  pRowLabel: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.textSecondary, flex: 1 },
  pRowLabelComplete: { color: colors.text },
  
  sectionTitle: { fontFamily: font.bold, fontSize: fontSize.md, color: colors.text, marginHorizontal: spacing[5], marginBottom: spacing[3] },
  linksCard: {
    marginHorizontal: spacing[4],
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing[5],
    ...DOG_SHADOW,
  },
  sLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
  sLinkDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  sLinkTitle: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text },
  sLinkStatus: { fontFamily: font.medium, fontSize: fontSize.xs, color: colors.accent, marginTop: 2 },
  sLinkStatusComplete: { color: colors.success },
  sLinkSummary: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  
  accordionWrap: {},
  accordionDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, gap: 12 },
  accordionTitleWrap: { flex: 1 },
  chevronWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  accordionContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
  accordionEditBtn: { alignSelf: 'flex-start', marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(107,94,191,0.08)', borderRadius: 10 },
  accordionEditBtnText: { color: colors.primary, fontFamily: font.semiBold, fontSize: fontSize.sm },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  dataLabel: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  dataValue: { fontFamily: font.medium, fontSize: fontSize.sm, color: colors.text, textAlign: 'right', flex: 1, marginLeft: 16 },
  dataTagsWrap: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: colors.surfaceMuted, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.borderSoft },
  tagText: { fontFamily: font.medium, fontSize: fontSize.xs, color: colors.text },

  shareBtn: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  shareBtnText: { color: '#fff', fontFamily: font.semiBold, fontSize: fontSize.base },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.canvas || '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 32 },
  sheetGrabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderSoft || '#eee', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: font.bold, fontSize: fontSize.lg, color: colors.text, paddingHorizontal: 20, marginBottom: 4 },
  sheetSub: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, paddingHorizontal: 20, marginBottom: 20 },
  sheetOptions: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  sheetOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.borderSoft || '#eee' },
  sheetOptSelected: { borderColor: colors.primary, backgroundColor: 'rgba(107, 94, 191, 0.05)' },
  sheetOptLabel: { fontFamily: font.medium, fontSize: fontSize.base, color: colors.text },
  sheetOptLabelSelected: { color: colors.primary, fontFamily: font.semiBold },
  sheetBtn: { backgroundColor: colors.text || '#000', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginHorizontal: 20 },
  sheetBtnText: { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
});
