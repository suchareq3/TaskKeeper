import { Text, View, Button } from "react-native";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { useEffect } from "react";

export default function Index() {

  // useEffect(() => {
  //   //const app = adminLogin();
  //   //const app = initializeApp();
  //   fetch("http://127.0.0.1:5001/taskkeeper-studia/us-central1/app")
  //     //.then(response => response.json())
  //     .then(data => console.log(data))
  //     .catch(error => console.error('Error fetching data:', error));
  // }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button title="showmepls" onPress={() => fbFunctions.someSharedFunction()}></Button>
      <Button title="log IN DUDEEEE" onPress={() => fbFunctions.logInWithPassword("abc123@gmail.com", "abc123")}></Button>
      <Button title="LOG OUT" onPress={() => fbFunctions.logOutUser()}></Button>
      <Button title="check user status" onPress={() => fbFunctions.checkUserStatus()}></Button>
    </View>
  );
}
