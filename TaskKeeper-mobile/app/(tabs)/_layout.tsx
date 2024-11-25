import { useSession } from "@/components/AuthContext";
import { Redirect, Stack, Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    //todo: replace this with loading.tsx
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  return (
    // This layout can be deferred because it's not the root layout.
    
    <Tabs>
       <Tabs.Screen name="index" />
       <Tabs.Screen name="about" />
    </Tabs>
  );
}
