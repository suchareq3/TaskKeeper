import { useSession } from "@/components/AuthContext";
import { Redirect, Stack, Tabs } from "expo-router";
import { Text } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function TabsLayout() {
  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    //TODO: replace this with loading.tsx
    //TODO: (even better) completely re-do this logic so that it shows an overlaying modal instead of a new screen
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
    // using "<Stack/>" here "defers" the layout to either 'index' or whatever's being requested/replaced by the Router
    // however, I do want to use tabs... so I use tabs instead.
    // TODO: perhaps move this to a separate file, for styling and stuff?
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { height: 50, margin: 0, padding: 0, borderColor: "red", borderTopWidth: 0 }, tabBarActiveBackgroundColor: "rgb(200,200,200)" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500", paddingBottom: 3 },

          tabBarIcon: ({ color }) => (
            <AntDesign
              name="home"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500", paddingBottom: 3 },
          tabBarIcon: ({ color }) => (
            <AntDesign
              name="profile"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500", paddingBottom: 3 },
          tabBarIcon: ({ color }) => (
            <AntDesign
              name="solution1"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "500", paddingBottom: 3 },
          tabBarIcon: ({ color }) => (
            <AntDesign
              name="calendar"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
