import { useLocalSearchParams } from 'expo-router';
import PublicBehaviorScreen from '../../../../src/screens/dog/public/PublicBehaviorScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PublicBehaviorScreen id={id} />;
}
