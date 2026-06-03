import { useLocalSearchParams } from 'expo-router';
import EditHealthScreen from '../../../../src/screens/dog/EditHealthScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditHealthScreen id={id} />;
}
