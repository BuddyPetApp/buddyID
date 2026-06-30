import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { apiClient } from '../api/client';
import { colors, font, fontSize, spacing } from '../tokens';
import { WebSheet } from '../components/WebSheet';
import { Logomark } from '../components/Logo';
import type { BuddyIDFormData } from './types';

const BUDDYID_PENDING_DOGS = 'buddyid_pending_dogs';
const BUDDYID_RESULT_KEY   = 'buddyid_result';

export default function Loading() {
  const [dogName, setDogName] = useState('meu cão');

  const spin    = useRef(new Animated.Value(0)).current;
  const pulse   = useRef(new Animated.Value(1)).current;
  const dot1    = useRef(new Animated.Value(0.3)).current;
  const dot2    = useRef(new Animated.Value(0.3)).current;
  const dot3    = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();
    const dot = (d: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        Animated.delay(700),
      ]));
    Animated.parallel([dot(dot1, 0), dot(dot2, 230), dot(dot3, 460)]).start();

    AsyncStorage.getItem(BUDDYID_PENDING_DOGS).then(async (raw) => {
      const dogs: Partial<BuddyIDFormData>[] = raw ? JSON.parse(raw) : [];
      if (!dogs.length) dogs.push({});
      const firstDog = dogs[0];
      const article = firstDog?.gender === 'Fêmea' ? 'da' : 'do';
      const first = firstDog?.name || (firstDog?.gender === 'Fêmea' ? 'minha cadela' : 'meu cão');
      setDogName(dogs.length > 1 ? 'dos teus cães' : `${article} ${first}`);

      try {
        const results = [];
        for (const form of dogs) {
          let finalPhotoUrl = form.photoUri;
          if (form.photoUri && form.photoUri.startsWith('file://')) {
            try {
              const fileResponse = await fetch(form.photoUri);
              const blob = await fileResponse.blob();
              let fileExt = 'jpg';
              const parts = form.photoUri.split('.');
              const lastPart = parts[parts.length - 1];
              fileExt = lastPart.split('?')[0] || 'jpg';
              fileExt = fileExt.toLowerCase();
              if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) fileExt = 'jpg';
              
              const fileName = `buddyid_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
              const filePath = `avatars/${fileName}`;
              
              const { error: uploadError } = await supabase.storage.from('dogs').upload(filePath, blob, {
                contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
                upsert: true,
              });
              
              if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage.from('dogs').getPublicUrl(filePath);
                finalPhotoUrl = publicUrl;
              }
            } catch (err) {
              console.warn('Failed to upload buddyid photo', err);
            }
          }

          const now = new Date();
          let birthDate = new Date();
          const val = parseInt(form.ageValue || '0', 10);
          if (form.ageUnit === 'meses') {
            birthDate.setMonth(now.getMonth() - val);
          } else {
            birthDate.setFullYear(now.getFullYear() - val);
          }
          const birthdateStr = birthDate.toISOString().split('T')[0];

          const mappedFoodType = form.foodType === 'Ração seca' ? 'dry' :
                                 form.foodType === 'Ração húmida' ? 'wet' :
                                 form.foodType === 'Mista' ? 'mixed' :
                                 form.foodType === 'Caseira' ? 'homemade' : undefined;

          const command = {
            name: form.name, breed: form.breed, breedOther: form.breed === 'other' ? form.breedOther : undefined,
            size: form.size === 'XS' ? 'xs' :
                  form.size === 'S' ? 'sm' :
                  form.size === 'M' ? 'md' :
                  form.size === 'L' ? 'lg' :
                  form.size === 'XL' ? 'xl' :
                  undefined,
            ageRange: null,
            birthdate: birthdateStr,
            gender: form.gender === 'Macho' ? 'male' : form.gender === 'Fêmea' ? 'female' : null,
            neutered: null, // não recolhido no signup
            adopted: form.origin?.includes('Adotei') || form.origin?.includes('Resgatei'),
            habitsJson: JSON.stringify({
              origin: form.origin,
              traumaHistory: form.traumaHistory,
              housemates: form.housemates,
              preferredServices: form.services,
              customService: form.customService,
              lifestyle: {
                housing: form.housing,
                sleepingPlace: form.sleepingPlace,
                exerciseDuration: form.exerciseDuration,
                postalCode: form.postalCode,
                city: form.city,
                ageValue: form.ageValue,
                ageUnit: form.ageUnit,
                coatColor: form.coatColor,
                coatColorOther: form.coatColorOther,
              },
              food: {
                type: mappedFoodType,
                mealsPerDay: form.mealsPerDay,
              }
            }),
            behaviorJson: JSON.stringify({
              behavior: {
                constructs: {
                  fearStrangers: form.fearStrangers !== undefined ? { priorTutor: form.fearStrangers } : null,
                  fearDogs: form.fearDogs !== undefined ? { priorTutor: form.fearDogs } : null,
                  fearNonsocial: form.fearNonsocial !== undefined ? { priorTutor: form.fearNonsocial } : null,
                  touchSensitivity: form.touchSensitivity !== undefined ? { priorTutor: form.touchSensitivity } : null,
                  aggression: form.aggression !== undefined ? { priorTutor: form.aggression } : null,
                  separation: form.separation !== undefined ? { priorTutor: form.separation } : null,
                },
                aggrTargets: form.aggrTargets,
                concern: form.concern,
                concernNote: form.concernNote,
                ownerProtect: form.ownerProtect,
                ownerWorry: form.ownerWorry,
              },
              separationAnxiety: form.separationAnxiety,
              goals: form.goals,
              leashBehavior: form.leashBehavior,
              fears: form.customFear ? [...(form.fears || []), form.customFear] : form.fears
            }),
            healthJson: JSON.stringify({
              concerns: form.concern ? 'Sim' : 'Não',
              concernsText: form.concernNote
            }),
            photoUrl: finalPhotoUrl,
          };
          const response = await apiClient.post<{ dogId: string }>('/dogs', command);
          const pct = Math.min(Math.round((Object.values(form).filter(v => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)).length / 20) * 100), 95);
          results.push({
            dogName: form.name || 'Cão',
            breed: form.breed || '',
            age: form.ageValue ? `${form.ageValue} ${form.ageUnit || 'anos'}` : '',
            size: form.size,
            buddyId: response.dogId,
            completionPercent: pct,
            photoUri: form.photoUri,
            gender: form.gender
          });
        }
        await AsyncStorage.setItem(BUDDYID_RESULT_KEY, JSON.stringify(results));
        await AsyncStorage.removeItem(BUDDYID_PENDING_DOGS);
        router.replace('/buddyid/success' as any);
      } catch (err: any) {
        console.error('Error creating BuddyID:', err);
        if (Platform.OS === 'web') {
          window.alert('Erro ao criar BuddyID: ' + (err.message || 'Não foi possível ligar ao servidor.'));
          router.replace('/buddyid' as any);
        } else {
          Alert.alert(
            'Erro ao criar BuddyID',
            err.message || 'Não foi possível ligar ao servidor. Verifica a tua ligação.',
            [{ text: 'Ok', onPress: () => router.replace('/buddyid' as any) }]
          );
        }
      }
    });
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <WebSheet>
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.spinner}>
          <View style={s.spinnerOuter} />
          <Animated.View style={[s.spinnerRing, { transform: [{ rotate }] }]}>
            <View style={s.spinnerDot} />
          </Animated.View>
          <Animated.View style={[s.logoWrap, { transform: [{ scale: pulse }] }]}>
            <Logomark color="#fff" size={44} />
          </Animated.View>
        </View>

        <Text style={s.title}>A criar o BuddyID{'\n'}{dogName}...</Text>
        <Text style={s.sub}>Estamos a analisar as respostas e a personalizar o perfil.</Text>

        <View style={s.dots}>
          {[dot1, dot2, dot3].map((d, i) => <Animated.View key={i} style={[s.dot, { opacity: d }]} />)}
        </View>
      </View>
    </SafeAreaView>
    </WebSheet>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.primaryDark },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6] },
  spinner:     { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[10] },
  spinnerOuter:{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)' },
  spinnerRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', borderTopColor: '#fff', alignItems: 'center' },
  spinnerDot:  { position: 'absolute', top: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  logoWrap:    { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  title:       { fontFamily: font.bold, fontSize: fontSize.xl, color: '#fff', textAlign: 'center', lineHeight: 32, marginBottom: spacing[3] },
  sub:         { fontFamily: font.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20, marginBottom: spacing[8] },
  dots:        { flexDirection: 'row', gap: spacing[2] },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
