import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function CalendarScreen() {
  return (
    <View
      style={{
        backgroundColor: "#25292e",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-white">Calendar</Text>
    </View>
  );
}