import { useSession } from "@/components/AuthContext";
import { Redirect, Stack, Tabs } from "expo-router";
import { Appearance, Button, Text, useColorScheme, } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Drawer from "expo-router/drawer";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { DarkTheme, Theme, ThemeProvider, useTheme, } from "@react-navigation/native";
import { NAV_THEME } from "@/lib/constants";
import { colorScheme } from "nativewind";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export default function TabsLayout() {
  const { session, isLoading } = useSession();
  const isDarkColorScheme = useColorScheme() === "dark";
  const colorScheme = Appearance.getColorScheme();
  console.log("isDarkColorScheme1", colorScheme);
  const { colors } = useTheme();
  console.log("colors", colors);

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
  console.log("isDarkColorScheme2", colorScheme);

  const Drawer = createDrawerNavigator();

  return (
    // using "<Stack/>" here "defers" the layout to either 'index' or whatever's being requested/replaced by the Router
    // however, I do want to use tabs... so I use tabs instead.
    // TODO: perhaps move this to a separate file, for styling and stuff?
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerStatusBarHeight: 0, headerTintColor: colors.text }}>
        {/* 'screens' for navigation go here! all other content goes in the 'CustomDrawerContent' component!*/}
        <Drawer.Screen name="Go to Tabs" component={TabNavigator} options={{ headerStatusBarHeight: 0, headerTintColor: colors.text, headerTitle: "TaskKeeper" }} />
      </Drawer.Navigator>
    </ThemeProvider>
  );
}

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {/* <Button title="Sign Out" onPress={() => {console.log("wawawa")}} /> */}
      <DrawerItem label={"Toggle theme, current: " + colorScheme.get()} onPress={() => { console.log("Theme toggled!", colorScheme.toggle()); }} />
    </DrawerContentScrollView>
  );
}

function TabNavigator() {
  return (
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