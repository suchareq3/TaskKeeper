import { Text } from "@/components/ui/text";
import { Link } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function TasksScreen() {
  return (
    <View
      style={{
        backgroundColor: "#25292e",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Tasks</Text>
    </View>
  );
}
