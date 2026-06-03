import { Stack } from 'expo-router';

export default function BuddyIDLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="flow" />
      <Stack.Screen name="loading" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="success" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="second-dog" options={{ gestureEnabled: false }} />
      <Stack.Screen name="providers" />
      <Stack.Screen name="associations" />
      <Stack.Screen name="sobre-nos" />
      <Stack.Screen name="parceiros" />
      <Stack.Screen name="contacto" />
      <Stack.Screen name="dog/[id]/index" />
      <Stack.Screen name="dog/[id]/edit-basic" />
      <Stack.Screen name="dog/[id]/edit-habits" />
      <Stack.Screen name="dog/[id]/edit-behavioral" />
      <Stack.Screen name="dog/[id]/edit-health" />
    </Stack>
  );
}
