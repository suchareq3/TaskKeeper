import { Link, router } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import ProjectTile from "@/components/ProjectTile";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/components/translations";
import { getCurrentRelease } from "@/components/utilityFunctions";
import { Timestamp } from "@react-native-firebase/firestore";
import NotificationTile from "@/components/NotificationTile";

export default function NotificationsScreen() {

  const [notifications, setNotifications] = useState<
    {
      notificationId: string;
      title: string;
      body: string;
      createdOn: Timestamp;
    }[]
  >([]);
  const fetchData = async () => {
    try {
      // cached version of the data, useful for laggy networks
      // NOTE: this could potentially cause a large cache size if the user has a lot of notifications

      const cachedNotifications = await AsyncStorage.getItem("notifications");
      if (cachedNotifications) {
        setNotifications(JSON.parse(cachedNotifications));
      }
      const loadedNotifications = await fbFunctions.getUserNotifications();
      setNotifications(loadedNotifications);
      AsyncStorage.setItem("notifications", JSON.stringify(loadedNotifications));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView
      className="flex-1 justifyitems-center bg-background p-5"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="gap-1">
        <Button
          className="mb-4"
          onPress={() => {
            fetchData();
          }}
        >
          <Text>{i18n.t("app_tabs_notifications_text_refreshNotifications")}</Text>
        </Button>
        {notifications.map((notification, index) => {
          return (
            <NotificationTile
              key={index}
              title={notification.title}
              body={notification.body}
              createdOn={new Timestamp(notification.createdOn.seconds, notification.createdOn.nanoseconds)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}
