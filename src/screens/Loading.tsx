import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiClient } from '../api/client';
import { colors, font, fontSize, spacing } from '../tokens';
import { Logomark } from '../components/Logo';
import type { BuddyIDFormData } from './types';

const BUDDYID_FORM_KEY = 'buddyid_pending_form';
const BUDDYID_RESULT_KEY = 'buddyid_result';

export default function Loading() {
  const [dogName, setDogName] = useState('');
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

    AsyncStorage.getItem(BUDDYID_FORM_KEY).then(async (raw) => {
      const form: Partial<BuddyIDFormData> = raw ? JSON.parse(raw) : {};
      const name = form.name || 'meu cão';
      setDogName(name);

      try {
        // Map frontend form to backend command structure
        const command = {
          name: form.name,
          breed: form.breed,
          size: form.size?.toLowerCase(), // API expects snake_case enum, Xs -> xs
          age_range: null,
          birthdate: null,
          gender: form.gender === 'Macho' ? 'male' : form.gender === 'Fêmea' ? 'female' : null,
          neutered: form.neutered === 'Sim' ? 'yes' : form.neutered === 'Não' ? 'no' : 'unknown',
          adopted: form.origin?.includes('Adotei') || form.origin?.includes('Resgatei'),
          habits_json: JSON.stringify({
            housing: form.housing,
            housemates: form.housemates,
            sleepingPlace: form.sleepingPlace,
            exerciseDuration: form.exerciseDuration,
            separationAnxiety: form.separationAnxiety,
            services: form.services,
            customService: form.customService,
            goals: form.goals,
          }),
          behavior_json: JSON.stringify({
            energy: form.energy,
            withStrangers: form.withStrangers,
            withHomePeople: form.withHomePeople,
            obedience: form.obedience,
            attachment: form.attachment,
            touchSensitivity: form.touchSensitivity,
            newSituations: form.newSituations,
            leashBehavior: form.leashBehavior,
            fears: form.fears,
          }),
          health_json: JSON.stringify({
            traumaHistory: form.traumaHistory,
          }),
          photo_url: form.photoUri // Backend will accept string for now
        };

        // TODO: Handle authentication token in client.ts before this call
        // const response = await apiClient.post<{ dogId: string }>('/dogs', command);
        // For now, simulate delay if API fails or auth is not set up
        await new Promise((r) => setTimeout(r, 3200));

        const buddyId = 'BD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const completionPercent = Math.round(
          (Object.values(form).filter((v) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).length / 20) * 100
        );

        await AsyncStorage.setItem(
          BUDDYID_RESULT_KEY,
          JSON.stringify({
            dogName: name,
            breed: form.breed || '',
            age: form.age || '',
            size: form.size,
            buddyId, // In the real flow, use response.dogId
            completionPercent: Math.min(completionPercent, 95),
          })
        );
        router.replace('/buddyid/success' as any);
      } catch (e) {
        console.error('Error creating dog profile', e);
        // Fallback for demo
        router.replace('/buddyid/success' as any);
      }
    });
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.spinnerWrap}>
          <View style={s.outerCircle} />
          <Animated.View style={[s.spinnerRing, { transform: [{ rotate }] }]}>
            <View style={s.spinnerDot} />
          </Animated.View>
          <Animated.View style={[s.logoWrap, { transform: [{ scale: pulse }] }]}>
            <Logomark color="#fff" size={44} />
          </Animated.View>
        </View>

        <Text style={s.title}>A criar o BuddyID{'\n'}do {dogName || '...'}...</Text>
        <Text style={s.sub}>Estamos a analisar as respostas e{'\n'}a personalizar o perfil do teu cão.</Text>

        <View style={s.dots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[s.dot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6] },
  spinnerWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[8] },
  outerCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  spinnerRing: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderTopColor: '#fff',
    alignItems: 'center',
  },
  spinnerDot: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: font.bold,
    fontSize: fontSize.xl,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing[3],
  },
  sub: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[6],
  },
  dots: { flexDirection: 'row', gap: spacing[2] },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
