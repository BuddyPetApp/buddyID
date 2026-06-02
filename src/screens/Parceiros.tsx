import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Parceiros() {
  useEffect(() => {
    router.replace('/buddyid/providers' as any);
  }, []);
  return null;
}
