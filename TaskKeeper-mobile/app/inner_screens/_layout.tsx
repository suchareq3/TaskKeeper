import { Stack } from 'expo-router';

export default function InnerScreensLayout() {
  return (
    <Stack screenOptions={{headerShown: false}} >
      <Stack.Screen name="add-project" options={{ title: 'Add new project' }} />
    </Stack>
  );
}