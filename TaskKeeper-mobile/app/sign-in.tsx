import { router, useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

import { useSession } from "@/components/AuthContext";
import { fbFunctions } from "../../shared/firebaseFunctions";

export default function SignIn() {
  const { signIn } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Sign Into abc123@gmail.com"
        onPress={() => {
          signIn("abc123@gmail.com", "abc123");
          //fbFunctions.logInWithPassword("abc123@gmail.com", "abc123");
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace("/");
        }}
      >
      </Button>

      <Button title="check user status" onPress={() => fbFunctions.checkUserStatus()}></Button>
      <Button title="LOGIN WITHOUT GOING THROUGH AUTHCONTEXT" onPress={() => fbFunctions.logInWithPassword("abc123@gmail.com","abc123")}></Button>
      <Button title="if you're logged out, this redirect shouldn't work!" onPress={() => router.navigate("/")}></Button>
    </View>
  );
}
