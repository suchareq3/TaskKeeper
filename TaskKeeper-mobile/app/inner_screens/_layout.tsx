import { Stack } from 'expo-router';

export default function InnerScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="add-project"
        options={{ title: "Add new project", headerShown: true }}
      />
      <Stack.Screen
        name="edit-project"
        options={{ title: "Editing project", headerShown: true }}
      />
      <Stack.Screen
        name="add-task"
        options={{ title: "Adding task", headerShown: true }}
      />
    </Stack>
  );
}