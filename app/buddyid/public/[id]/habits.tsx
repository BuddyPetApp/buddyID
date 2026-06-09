import { useLocalSearchParams } from 'expo-router';
import EditHabits from '../../../../src/screens/dog/EditHabits';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditHabits id={id} isReadOnly={true} />;
}
