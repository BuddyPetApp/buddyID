import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, radius, spacing } from '../tokens';
import { WebSheet } from '../components/WebSheet';
import { Logo } from '../components/Logo';
import { CheckIcon } from '../components/Icons';

const BUDDYID_PENDING_DOGS = 'buddyid_pending_dogs';

const BENEFITS = [
  'Perfil personalizado para cada cão',
  'Recomendações independentes',
  'Dois BuddyIDs, uma conta',
];

export default function SecondDog() {
  const [dogName, setDogName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(BUDDYID_PENDING_DOGS).then((raw) => {
      if (raw) {
        const dogs = JSON.parse(raw);
        if (dogs.length > 0) {
          setDogName(dogs[dogs.length - 1].name || '');
        }
      }
    });
  }, []);

  const initial = dogName?.[0]?.toUpperCase() ?? 'T';

  return (
    <WebSheet>
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Logo variant="dark" size="sm" />
      </View>
      <View style={s.separator} />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={true}>
        {/* First dog card — completed */}
        <View style={s.dogCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={s.dogInfo}>
            <Text style={s.dogName}>{dogName || 'Theo'}</Text>
            <Text style={s.dogStatus}>BuddyID criado</Text>
          </View>
          <View style={s.checkCircle}>
            <CheckIcon size={16} color={colors.success} strokeWidth={2.5} />
          </View>
        </View>

        {/* Connector line */}
        <View style={s.connector} />

        {/* Second dog card — pending */}
        <View style={[s.dogCard, s.dogCardPending]}>
          <View style={[s.avatar, s.avatarPending]}>
            <Text style={[s.avatarText, s.avatarTextPending]}>?</Text>
          </View>
          <View style={s.dogInfo}>
            <Text style={[s.dogName, s.dogNamePending]}>O teu outro cão</Text>
            <Text style={[s.dogStatus, s.dogStatusPending]}>BuddyID por criar</Text>
          </View>
        </View>

        <Text style={s.headline}>O teu outro cão{'\n'}merece um BuddyID!</Text>
        <Text style={s.body}>Tens mais do que um cão em casa. Cria o perfil do segundo — é igualmente gratuito e leva apenas 5 minutos.</Text>

        <View style={s.divider} />

        {BENEFITS.map((b) => (
          <View key={b} style={s.benefitRow}>
            <View style={s.bullet} />
            <Text style={s.benefitText}>{b}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => router.navigate('/buddyid/flow' as any)}>
          <Text style={s.btnPrimaryText}>Criar BuddyID do segundo cão</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGhost} onPress={() => router.replace('/buddyid/loading' as any)}>
          <Text style={s.btnGhostText}>Agora não</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </WebSheet>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3], backgroundColor: colors.surface },
  separator: { height: 3, backgroundColor: colors.borderSoft },
  content: { padding: spacing[6], paddingBottom: spacing[4] },
  dogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    gap: spacing[3],
  },
  dogCardPending: { borderColor: colors.primary, backgroundColor: colors.surfaceAccent },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarPending: { backgroundColor: 'rgba(107,94,191,0.15)' },
  avatarText: { fontFamily: font.bold, fontSize: fontSize.lg, color: colors.primary },
  avatarTextPending: { color: colors.primary },
  dogInfo: { flex: 1 },
  dogName: { fontFamily: font.semiBold, fontSize: fontSize.base, color: colors.text },
  dogNamePending: { color: colors.primary },
  dogStatus: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  dogStatusPending: { color: colors.primary },
  checkCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  connector: { width: 1, height: 20, backgroundColor: colors.borderSoft, alignSelf: 'center', marginVertical: 2 },
  headline: { fontFamily: font.bold, fontSize: fontSize.xl, color: colors.text, lineHeight: 34, marginTop: spacing[6], marginBottom: spacing[3] },
  body: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing[4] },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginBottom: spacing[4] },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, flexShrink: 0 },
  benefitText: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.text },
  footer: { padding: spacing[4], gap: spacing[2] },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: spacing[4], alignItems: 'center' },
  btnPrimaryText: { fontFamily: font.semiBold, fontSize: fontSize.base, color: '#fff' },
  btnGhost: { borderRadius: 14, paddingVertical: spacing[3], alignItems: 'center' },
  btnGhostText: { fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary },
});
