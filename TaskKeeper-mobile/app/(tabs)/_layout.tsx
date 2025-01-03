import { useSession } from "@/components/AuthContext";
import { Redirect, Stack, Tabs } from "expo-router";
import { Text, View, useColorScheme } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { colorScheme } from "nativewind";
import { Button } from "@/components/ui/button";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { requestPermissions } from "@/components/permissionFunctions";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabsLayout() {
  requestPermissions();
  const { session, isLoading, signOut } = useSession();
  const isDarkColorScheme = useColorScheme() === "dark";
  const { colors } = useTheme();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    //TODO: replace this with loading.tsx
    //TODO: (even better) completely re-do this logic so that it shows an overlaying modal instead of a new screen
    //TODO: (even bettererer) DO redirect to the new page, but use Skeleton components to show the loading state
    return <Text>Loading...</Text>;
  }

  // redirect the user to the sign-up page if they're not authenticated
  if (!session) {
    return <Redirect href="/sign-in" />;
  }
  console.log("current theme:", colorScheme.get());

  const Drawer = createDrawerNavigator();

  function CustomDrawerContent(props: any) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />

        <DrawerItem
          label="Log Out"
          onPress={() => {
            signOut();
          }}
        />
        <DrawerItem
          label={"Check user status"}
          onPress={() => {
            fbFunctions.checkUserStatus();
          }}
        />
        <View className="flex flex-row justify-center w-full px-3 gap-1">
          <Button
            className="flex-1 rounded-l-3xl rounded-r-none"
            onPress={() => {
              colorScheme.set("light");
              AsyncStorage.setItem("theme", "light");
            }}
          >
            <Text style={{ color: colors.background }} className={""}>
              light
            </Text>
          </Button>

          <Button
            className={`flex-1 rounded-none`}
            onPress={() => {
              colorScheme.set("dark");
              AsyncStorage.setItem("theme", "dark");
            }}
          >
            <Text style={{ color: colors.background }} className={""}>
              dark
            </Text>
          </Button>
          <Button
            style={{ padding: 0 }}
            className="flex-1 rounded-r-3xl rounded-l-none"
            onPress={() => {
              colorScheme.set("system");
              AsyncStorage.setItem("theme", "system");
            }}
          >
            <Text style={{ color: colors.background }} className={""}>
              system
            </Text>
          </Button>
        </View>
      </DrawerContentScrollView>
    );
  }

  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerStatusBarHeight: 0, headerTintColor: colors.text }}>
      {/* 'screens' for navigation go here! all other content goes in the 'CustomDrawerContent' component!*/}
      <Drawer.Screen name="Go to Tabs" component={TabNavigator} options={{ headerStatusBarHeight: 0, headerTintColor: colors.text, headerTitle: "TaskKeeper" }} />
    </Drawer.Navigator>
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