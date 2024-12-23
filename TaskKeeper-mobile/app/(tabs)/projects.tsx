import { requestPermissions } from "@/components/permissionFunctions";
import { Link } from "expo-router";
import { Text, View, StyleSheet, Button } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useState } from "react";

export default function ProjectsScreen() {
  requestPermissions();
  const [text, setText] = useState('text');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen</Text>

      <Button
        title="show messaging token!"
        onPress={() => setText(fbFunctions.showNotification("hi there title!!!", "hello there description!"))}
      ></Button>
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#13569e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  goTo: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
