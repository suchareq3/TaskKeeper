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
import i18n from "@/components/translations";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();
  return (
    <KeyboardAvoidingView className="flex-1 flex-col justify-between items-center bg-background h-full py-20">
      <View className="flex">
        <Logo className="p-6 rounded-full bg-card shadow-lg inset-shadow-lg" />
      </View>
      <View className="gap-3 w-4/5 items-center">
        <Input
          className="w-4/5"
          placeholder={i18n.t("app_signIn_input_emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          aria-labelledby="inputLabel"
          aria-errormessage="inputError"
        />
        <Input
          className="w-4/5"
          placeholder={i18n.t("app_signIn_input_passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          keyboardType="default"
          secureTextEntry={true}
          aria-labelledby="inputLabel"
          aria-errormessage="inputError"
        />
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
          <Text>{i18n.t("app_signIn_button_signIn")}</Text>
        </Button>
        <Button onPress={() => router.navigate("/sign-up")}>
          <Text>{i18n.t("app_signIn_button_signUp")}</Text>
        </Button>

        <Button onPress={() => fbFunctions.checkUserStatus()}>
          <Text>[DNT]Check. User. STATUS!</Text>
        </Button>
        {/* <Button title="LOGIN WITHOUT GOING THROUGH AUTHCONTEXT" onPress={() => fbFunctions.logInWithPassword("abc123@gmail.com","abc123")}></Button>
        <Button title="if you're logged out, this redirect shouldn't work!" onPress={() => router.navigate("/")}></Button> */}
      </View>
    </KeyboardAvoidingView>
  );
}
