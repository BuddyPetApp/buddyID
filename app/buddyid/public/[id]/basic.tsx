import { useLocalSearchParams } from 'expo-router';
import PublicBasicInfoScreen from '../../../../src/screens/dog/public/PublicBasicInfoScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PublicBasicInfoScreen id={id} />;
}
