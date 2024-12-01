import { router, useRouter } from "expo-router";
import { KeyboardAvoidingView, TextInput, View } from "react-native";
import { useSession } from "@/components/AuthContext";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { useState } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import Logo from "@/components/Logo";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();
  return (
    <KeyboardAvoidingView className="flex-1 flex-col justify-between items-center bg-violet-900 h-full py-20">
      <View className="flex">
        <Logo className="self-start border-black border-2" />
      </View>
      <View className="gap-3 w-4/5 items-center">
        <Input className="w-4/5" placeholder="Type your EMAIL here please :3" value={email} onChangeText={setEmail} keyboardType="email-address" aria-labelledby="inputLabel" aria-errormessage="inputError" />
        <Input className="w-4/5" placeholder="Type your PASSWORD here please :3" value={password} onChangeText={setPassword} keyboardType="default" secureTextEntry={true} aria-labelledby="inputLabel" aria-errormessage="inputError" />
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
      </View>
    </KeyboardAvoidingView>
  );
}
