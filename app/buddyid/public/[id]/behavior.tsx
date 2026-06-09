import { useLocalSearchParams } from 'expo-router';
import EditBehavioralProfile from '../../../../src/screens/dog/EditBehavioralProfile';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditBehavioralProfile id={id} isReadOnly={true} />;
}
