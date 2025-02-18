import { Stack } from 'expo-router';
import i18n from "@/components/translations";

export default function InnerScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="add-project"
        options={{ title: i18n.t("app_innerScreens_layout_stack_addProjectTitle"), headerShown: true }}
      />
      <Stack.Screen
        name="edit-project"
        options={{ title: i18n.t("app_innerScreens_layout_stack_editProjectTitle"), headerShown: true }}
      />
      <Stack.Screen
        name="add-task"
        options={{ title: i18n.t("app_innerScreens_layout_stack_addTaskTitle"), headerShown: true }}
      />
      <Stack.Screen
        name="edit-task"
        options={{ title: i18n.t("app_innerScreens_layout_stack_editTaskTitle"), headerShown: true }}
      />
      <Stack.Screen
        name="project-releases"
        options={{ title: i18n.t("app_innerScreens_layout_stack_releases"), headerShown: true }}
      />
      <Stack.Screen
        name="edit-release"
        options={{ title: i18n.t("app_innerScreens_layout_stack_editRelease"), headerShown: true }}
      />
      <Stack.Screen
        name="release-tasks"
        options={{ title: i18n.t("app_innerScreens_layout_stack_releaseTasks"), headerShown: true }}
      />
    </Stack>
  );
}