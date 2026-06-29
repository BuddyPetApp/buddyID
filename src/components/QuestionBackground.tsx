import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WatermarkBackground } from './Watermarks';

// One real photo per question step. To swap a placeholder, replace the file
// at assets/questions/<key>.jpg keeping the same name — no code change needed.
// Keys match the StepKey values in screens/Flow.tsx.
const QUESTION_IMAGES: Record<string, ReturnType<typeof require>> = {
  q1: require('../../assets/questions/q1.jpg'),
  q2: require('../../assets/questions/q2.jpg'),
  q3: require('../../assets/questions/q3.jpg'),
  q4: require('../../assets/questions/q4.jpg'),
  qOwner: require('../../assets/questions/qOwner.jpg'),
  q5: require('../../assets/questions/q5.jpg'),
  q6: require('../../assets/questions/q6.jpg'),
  q7b: require('../../assets/questions/q7b.jpg'),
  q8: require('../../assets/questions/q8.jpg'),
  qLocation: require('../../assets/questions/qLocation.jpg'),
  q12: require('../../assets/questions/q12.jpg'),
  q13: require('../../assets/questions/q13.jpg'),
  q14: require('../../assets/questions/q14.jpg'),
  qConcern: require('../../assets/questions/qConcern.jpg'),
  consent: require('../../assets/questions/consent.jpg'),
};

export function QuestionBackground({ step }: { step: string }) {
  const image = QUESTION_IMAGES[step];

  // Defensive fallback: if a step has no photo, keep the previous watermark
  if (!image) {
    return <WatermarkBackground step={step} />;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Image source={image} style={styles.image} resizeMode="cover" />
      {/* Subtle neutral scrim: faint darkening at top/bottom only so the white
          header & progress stay legible — no colour tint over the photo */}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  image: { width: '100%', height: '100%' },
});
