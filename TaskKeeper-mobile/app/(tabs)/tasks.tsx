import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen</Text>
      <Link
        href="/"
        style={styles.goTo}
      >
        Go to HOME screen
      </Link>
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
