import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, font, fontSize, spacing } from '../tokens';
import { WebSheet } from '../components/WebSheet';
import { Logo } from '../components/Logo';
import { CheckIcon } from '../components/Icons';

export default function ProviderSuccess() {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <WebSheet>
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Logo variant="dark" size="sm" />
      </View>

      <View style={s.content}>
        <Animated.View style={[s.iconWrap, { transform: [{ scale }], opacity }]}>
          <View style={s.iconCircle}>
            <CheckIcon size={36} color="#fff" strokeWidth={2} />
          </View>
        </Animated.View>

        <Text style={s.title}>Recebemos a tua candidatura</Text>
        <Text style={s.body}>
          A equipa Buddy entra em contacto para conhecer o teu trabalho e juntar-te à app antes do lançamento.
        </Text>

        <View style={s.card}>
          <Text style={s.cardLabel}>O que acontece a seguir</Text>
          {[
            'Validamos o teu perfil.',
            'Entramos em contacto por email ou telemóvel.',
            'Ficas pronto para os primeiros clientes no lançamento.',
          ].map((item, i) => (
            <View key={i} style={s.cardRow}>
              <View style={s.cardDot} />
              <Text style={s.cardText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={s.btn}
          onPress={() => router.replace('/buddyid' as any)}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </WebSheet>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: { alignItems: 'center', paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
  content: { flex: 1, paddingHorizontal: spacing[6], paddingTop: spacing[8], alignItems: 'center' },
  iconWrap: { marginBottom: spacing[5] },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: font.bold, fontSize: fontSize.xxl, color: colors.text, textAlign: 'center', marginBottom: spacing[3] },
  body: {
    fontFamily: font.regular, fontSize: fontSize.base, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: spacing[7], maxWidth: 300,
  },
  card: {
    width: '100%', backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderSoft, padding: spacing[5], marginBottom: spacing[7],
  },
  cardLabel: { fontFamily: font.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing[3] },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[2] },
  cardDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, flexShrink: 0 },
  cardText: { fontFamily: font.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  btn: {
    width: '100%', backgroundColor: colors.primary, borderRadius: 12,
    height: 48, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: font.semiBold, fontSize: 15, color: '#fff' },
});
