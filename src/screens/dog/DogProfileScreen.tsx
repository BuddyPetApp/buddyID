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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../tokens';
import { ChevronLeftIcon } from '../../components/Icons';
import { apiClient } from '../../api/client';
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
  if (b.gender) parts.push(GENDER_LABELS_PT[b.gender]);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function buildHabitsSummary(profile: any, t: any): string | null {
  const h = profile?.habits;
  if (!h) return null;
  const parts: string[] = [];
  if (h.food?.type) parts.push(FOOD_TYPE_LABELS_PT[h.food.type]);
  if (h.activity?.level) parts.push(t('tutor.dogProfile.activity', { level: ACTIVITY_LEVEL_LABELS_PT[h.activity.level]?.toLowerCase() || h.activity.level }));
  if (h.lifestyle?.housing) parts.push(HOUSING_LABELS_PT[h.lifestyle.housing]);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function buildBehaviorSummary(profile: any, t: any): string | null {
  const b = profile?.behavior;
  if (!b) return null;
  const parts: string[] = [];
  if (b.likes?.length) {
    parts.push(t('tutor.dogProfile.likes', { likes: b.likes.slice(0, 2).join(', ').toLowerCase() }));
  }
  if (b.fears?.length) {
    parts.push(b.fears.length === 1 ? t('tutor.dogProfile.fear') : t('tutor.dogProfile.fears', { count: b.fears.length }));
  }
  return parts.length > 0 ? parts.join(' · ') : null;
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

export default function DogProfileScreen({ id, isPublic = false }: { id?: string; isPublic?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
              try { return JSON.parse(data.habitsJson); } catch { return {}; }
            })() : {},
            behavior: data.behaviorJson ? (() => {
              try { return JSON.parse(data.behaviorJson); } catch { return {}; }
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

  const handleShare = () => {
    const baseWebUrl = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.EXPO_PUBLIC_FORM_WEB_URL || 'https://buddy.pet');
    const article = basic.gender === 'female' ? 'da' : 'do';
    const link = `${baseWebUrl}/buddyid/public/${profile.id}`;
    Share.share({
      message: Platform.OS === 'android' ? `Vê o BuddyID ${article} ${basic.name}! ${link}` : `Vê o BuddyID ${article} ${basic.name}!`,
      url: link,
    }).catch(console.error);
  };

  const goToEdit = (section: 'basic' | 'habits' | 'behavior' | 'health') => {
    if (isReadOnly) return;
    router.push(`/buddyid/dog/${profile.id}/edit-${section}` as any);
  };

  return (
    <View style={styles.root}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/buddyid' as any)} hitSlop={12} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color={colors.primary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('tutor.dogProfile.profile')}</Text>
        <View style={{ width: 44 }} />
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
                isLast
              />
            </View>
          </View>
        )}

        {/* Section Links */}
        <Text style={styles.sectionTitle}>Secções do Perfil</Text>
        <View style={styles.linksCard}>
          <SectionCard
            title={t('tutor.dogProfile.basicInfo')}
            summary={basicSummary}
            complete={completeness.basic}
            onPress={() => goToEdit('basic')}
            disabled={isReadOnly}
          />
          <SectionCard
            title={t('tutor.dogProfile.habits')}
            summary={habitsSummary}
            complete={completeness.habits}
            onPress={() => goToEdit('habits')}
            disabled={isReadOnly}
          />
          <SectionCard
            title={t('tutor.dogProfile.behavioralProfile')}
            summary={behaviorSummary}
            complete={completeness.behavior}
            onPress={() => goToEdit('behavior')}
            disabled={isReadOnly}
          />
          <SectionCard
            title={t('tutor.dogProfile.health')}
            summary={healthSummary}
            complete={!!profile.health && Object.keys(profile.health).length > 0}
            optional
            onPress={() => goToEdit('health')}
            isLast
            disabled={isReadOnly}
          />
        </View>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.shareBtnText}>{t('tutor.dogProfile.shareCard', { name: basic.name })}</Text>
        </Pressable>
      </ScrollView>
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

function SectionCard({
  title,
  summary,
  complete,
  optional = false,
  onPress,
  isLast = false,
  disabled = false,
}: {
  title: string;
  summary?: string | null;
  complete: boolean;
  optional?: boolean;
  onPress: () => void;
  isLast?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.sLink,
        !isLast && styles.sLinkDivider,
        pressed && !disabled && { backgroundColor: 'rgba(0,0,0,0.02)' },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.sLinkTitle}>{title}</Text>
        {summary ? (
          <Text style={styles.sLinkSummary} numberOfLines={2}>{summary}</Text>
        ) : (
          <Text style={[styles.sLinkStatus, complete && styles.sLinkStatusComplete]}>
            {complete
              ? 'Preenchido'
              : optional
              ? t('tutor.dogProfile.optionalAdd')
              : t('tutor.dogProfile.addLower')}
          </Text>
        )}
      </View>
      {!disabled && <ChevronRight />}
    </Pressable>
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
    backgroundColor: '#fff',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: font.bold, fontSize: fontSize.md, color: colors.text },
  
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
});
