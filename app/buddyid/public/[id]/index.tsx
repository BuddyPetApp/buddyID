import { useLocalSearchParams } from 'expo-router';
import DogProfileScreen from '../../../../src/screens/dog/DogProfileScreen';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DogProfileScreen id={id} isPublic={true} />;
}
