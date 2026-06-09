import { useLocalSearchParams } from 'expo-router';
import EditBasicInfo from '../../../../src/screens/dog/EditBasicInfo';

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditBasicInfo id={id} isReadOnly={true} />;
}
