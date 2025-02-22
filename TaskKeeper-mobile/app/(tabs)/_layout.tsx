import { useSession } from "@/components/AuthContext";
import { Redirect, Stack, Tabs } from "expo-router";
import { PermissionsAndroid, Text, View, useColorScheme } from "react-native";

import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { colorScheme } from "nativewind";
import { Button } from "@/components/ui/button";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/components/translations";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getAuth } from "@react-native-firebase/auth";

export default function TabsLayout() {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  const { session, isLoading, signOut } = useSession();
  const currentColorScheme = useColorScheme();
  const isDarkColorScheme = currentColorScheme === "dark";
  const { colors } = useTheme();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    //TODO: replace this with loading.tsx
    //TODO: (even better) completely re-do this logic so that it shows an overlaying modal instead of a new screen
    //TODO: (even bettererer) DO redirect to the new page, but use Skeleton components to show the loading state
    return (
      <View className="bg-background items-center justify-center w-full h-full">
        <Text className="text-4xl font-bold text-primary">{i18n.t("app_tabs_layout_text_loading")}</Text>
      </View>
    );
    
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
          <Card className="items-center justify-center p-2 bg-card">
            <Text className="text-lg font-bold text-primary">{getAuth().currentUser?.uid}</Text>
          </Card>
        <DrawerItemList {...props} />

        <DrawerItem
          label={i18n.t("app_tabs_layout_draweritem_logOut")}
          onPress={() => {
            signOut();
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
            <Text
              style={{ color: colors.card }}
              className={""}
            >
              {i18n.t("app_tabs_layout_button_themeSwitchLight")}
            </Text>
          </Button>

          <Button
            className={`flex-1 rounded-none`}
            onPress={() => {
              colorScheme.set("dark");
              AsyncStorage.setItem("theme", "dark");
            }}
          >
            <Text
              style={{ color: colors.card }}
              className={""}
            >
              {i18n.t("app_tabs_layout_button_themeSwitchDark")}
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
            <Text
              style={{ color: colors.card }}
              className={""}
            >
              {i18n.t("app_tabs_layout_button_themeSwitchSystem")}
            </Text>
          </Button>
        </View>
      </DrawerContentScrollView>
    );
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerStatusBarHeight: 0, headerTintColor: colors.text }}
    >
      {/* 'screens' for navigation go here! all other content goes in the 'CustomDrawerContent' component!*/}
      <Drawer.Screen
        name={i18n.t("app_tabs_layout_text_drawerTitle")}
        component={TabNavigator}
        options={{ headerStatusBarHeight: 0, headerTintColor: colors.text, headerTitle: "TaskKeeper" }}
      />
    </Drawer.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveBackgroundColor: "rgb(200,200,200)" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t("app_tabs_layout_text_tasks"),
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500", paddingBottom: 3 },
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
          title: i18n.t("app_tabs_layout_text_projects"),
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500", paddingBottom: 3 },
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
        name="notifications"
        options={{
          title: i18n.t("app_tabs_layout_text_notifications"),
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500", paddingBottom: 3 },
          tabBarIcon: ({ color }) => (
            <Fontisto
              name="bell"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}