import { View, Button, StyleSheet } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
//import { useEffect } from "react";
//import { Link } from "expo-router";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";

export default function Index() {
  const { signOut } = useSession();
  return (
    <View
      style={{
        backgroundColor: "#25292e",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text >Dashboard</Text>
    </View>
  );
}