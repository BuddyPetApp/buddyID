import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import { WebSheet } from '../components/WebSheet';
import { apiClient } from '../api/client';
import { Logomark } from '../components/Logo';
import { PROVIDER_FORM_KEY } from './ProviderFlow';

export const PROVIDER_RESULT_KEY = 'provider_result';

export default function ProviderLoading() {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1800, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    const dotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    Animated.parallel([dotAnim(dot1, 0), dotAnim(dot2, 200), dotAnim(dot3, 400)]).start();

    AsyncStorage.getItem(PROVIDER_FORM_KEY).then(async (raw) => {
      try {
        if (raw) {
          const form = JSON.parse(raw);
          
          const payload = {
            Branch: form.branch === 'negocio' ? 'business' : 'individual',
            City: form.city,
            PostalCode: form.postalCode,
            Phone: form.phone,
            Email: form.email,
            OwnerName: form.branch === 'negocio' ? form.ownerName : null,
            BusinessName: form.branch === 'negocio' ? form.businessName : null,
            Services: form.branch === 'negocio' ? form.services : null,
            BizExperience: form.branch === 'negocio' ? form.bizExperience : null,
            Website: form.branch === 'negocio' ? form.website : null,
            ProviderName: form.branch === 'freelancer' ? form.freelancerName : null,
            ProviderService: form.branch === 'freelancer' ? form.freelancerService : null,
            Availability: form.branch === 'freelancer' ? form.availability : null,
            DogExperience: form.branch === 'freelancer' ? form.dogExperience : null,
          };

          await apiClient.post('/partner-applications', payload);
          await AsyncStorage.removeItem(PROVIDER_FORM_KEY);
        }
        router.replace('/buddyid/provider-success' as any);
      } catch (err) {
        console.error('Failed to submit partner application:', err);
        setTimeout(() => router.back(), 2000);
      }
    });
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <WebSheet>
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.spinnerWrap}>
          <View style={s.outerCircle} />
          <Animated.View style={[s.spinnerRing, { transform: [{ rotate }] }]}>
            <View style={s.spinnerDot} />
          </Animated.View>
          <Animated.View style={[s.logoWrap, { transform: [{ scale: pulse }] }]}>
            <Logomark color={colors.primary} size={40} />
          </Animated.View>
        </View>

        <Text style={s.title}>A guardar o teu registo...</Text>

        <View style={s.dots}>
          {[dot1, dot2, dot3].map((d, i) => (
            <Animated.View key={i} style={[s.dot, { opacity: d }]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
    </WebSheet>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  spinnerWrap: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[8] },
  outerCircle: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, borderColor: colors.borderSoft,
  },
  spinnerRing: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: 'transparent', borderTopColor: colors.primary,
  },
  spinnerDot: {
    position: 'absolute', top: -4, alignSelf: 'center',
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
  },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing[5] },
  dots: { flexDirection: 'row', gap: spacing[2] },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
