import { Text, View, Button } from "react-native";
import { someSharedFunction, checkUserStatus, logInWithPassword, logOutUser} from "../../shared/firebaseFunctions";
import { useEffect } from "react";
//import firebase from '../TaskKeeper-mobile/node_modules/@react-native-firebase/app';

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
      <Button title="showmepls" onPress={() => someSharedFunction()}></Button>
      <Button title="log IN DUDEEEE" onPress={() => logInWithPassword('abc123@gmail.com','abc123')}></Button>
      <Button title="LOG OUT" onPress={logOutUser}></Button>
      <Button title="check user status" onPress={checkUserStatus}></Button>
    </View>
  );
}
