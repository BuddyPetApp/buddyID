import { useLocalSearchParams } from 'expo-router';
import PublicHabitsScreen from '../../../../src/screens/dog/public/PublicHabitsScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PublicHabitsScreen id={id} />;
}
