import { router, useRouter } from "expo-router";
import { KeyboardAvoidingView, TextInput, View } from "react-native";
import { useSession } from "@/components/AuthContext";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();
  return (
    <KeyboardAvoidingView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput onChangeText={setEmail} placeholder="type your email here" value={email} />
      <TextInput onChangeText={setPassword} placeholder="type your password here" value={password} />
      <Button
        onPress={() => {
          //TODO: implement proper error handling with user-facing alerts
          signIn(email, password);
          //fbFunctions.logInWithPassword("abc123@gmail.com", "abc123");
          // Navigate after signing in.
          // TODO: You may want to tweak this to ensure sign-in is successful before navigating.
          router.replace("/");
        }}
      >
        <Text>Sign In</Text>
      </Button>
      <Button onPress={() => router.navigate("/sign-up")}>
        <Text>Sign Up</Text>
      </Button>

      <Button onPress={() => fbFunctions.checkUserStatus()}>
        <Text>Check. User. STATUS!</Text>
      </Button>
      {/* <Button title="LOGIN WITHOUT GOING THROUGH AUTHCONTEXT" onPress={() => fbFunctions.logInWithPassword("abc123@gmail.com","abc123")}></Button>
      <Button title="if you're logged out, this redirect shouldn't work!" onPress={() => router.navigate("/")}></Button> */}
    </KeyboardAvoidingView>
  );
}
