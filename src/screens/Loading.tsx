import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import type { BuddyIDFormData } from './types';

const BUDDYID_FORM_KEY = 'buddyid_pending_form';
const BUDDYID_RESULT_KEY = 'buddyid_result';

export default function Loading() {
  const [dogName, setDogName] = useState('');
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    const dots = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();
    dots.start();
    return () => {
      pulse.stop();
      dots.stop();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const raw = await AsyncStorage.getItem(BUDDYID_FORM_KEY);
      if (!raw || cancelled) return;

      const form: BuddyIDFormData = JSON.parse(raw);
      setDogName(form.name);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (cancelled) return;

      const buddyId = 'BD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const result = {
        dogName: form.name,
        breed: form.breed,
        age: form.age,
        size: form.size,
        buddyId,
        completionPercent: computeCompletion(form),
      };
      await AsyncStorage.setItem(BUDDYID_RESULT_KEY, JSON.stringify(result));

      if (!cancelled) {
        router.replace('/buddyid/success' as any);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.inner}>
        <Animated.View style={[s.logoWrap, { transform: [{ scale }] }]}>
          <View style={s.pawCircle}>
            <Text style={s.pawEmoji}>🐾</Text>
          </View>
        </Animated.View>

        <Text style={s.title}>
          A criar o BuddyID{dogName ? ` de ${dogName}` : ''}
          <Text style={s.ellipsis}>...</Text>
        </Text>

        <View style={s.dotsRow}>
          {([dot1, dot2, dot3] as Animated.Value[]).map((dot, i) => (
            <Animated.View key={i} style={[s.dot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

function computeCompletion(form: BuddyIDFormData): number {
  const fields: (keyof BuddyIDFormData)[] = [
    'name', 'photoUri', 'breed', 'size', 'age', 'gender', 'neutered',
    'energy', 'withStrangers', 'withHomePeople', 'obedience', 'attachment',
    'housing', 'sleepingPlace', 'separationAnxiety', 'city',
  ];
  const filled = fields.filter((f) => {
    const v = form[f];
    return v !== undefined && v !== '' && v !== null;
  });
  return Math.round((filled.length / fields.length) * 100);
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  pawCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawEmoji: { fontSize: 36 },
  title: {
    fontFamily: font.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 26,
  },
  ellipsis: { color: colors.primary },
  dotsRow: { flexDirection: 'row', gap: spacing[2] },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
