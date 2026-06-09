import { useLocalSearchParams } from 'expo-router';
import DogProfileScreen from '../../../../src/screens/dog/DogProfileScreen';

export default function Screen() {
  const { id, sections } = useLocalSearchParams<{ id: string; sections?: string }>();
  return <DogProfileScreen id={id} isPublic={true} sections={sections} />;
}
