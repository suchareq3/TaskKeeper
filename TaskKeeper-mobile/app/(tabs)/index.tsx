import { Text, View, Button, StyleSheet } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
//import { useEffect } from "react";
//import { Link } from "expo-router";
import { useSession } from "@/components/AuthContext";

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
      <Text style={styles.text}>Text! :3</Text>
      <Button
        title="showmepls"
        onPress={() => fbFunctions.someSharedFunction()}
      ></Button>
      <Button
        title="LOG IN DUDE!"
        onPress={() =>
          fbFunctions.logInWithPassword("abc123@gmail.com", "abc123")
        }
      ></Button>
      <Button
        title="LOG OUT DUDE!"
        onPress={() =>
          signOut()
          //fbFunctions.logOutUser()
        }
      ></Button>
      {/* <Button title="LOG OUT" onPress={() => signOut()}></Button> */}
      <Button
        title="check user status"
        onPress={() => fbFunctions.checkUserStatus()}
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
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
