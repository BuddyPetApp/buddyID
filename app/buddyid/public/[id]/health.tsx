import { useLocalSearchParams } from 'expo-router';
import PublicHealthScreen from '../../../../src/screens/dog/public/PublicHealthScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PublicHealthScreen id={id} />;
}
