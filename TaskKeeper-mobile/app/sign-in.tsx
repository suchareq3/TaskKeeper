import { router, useRouter } from "expo-router";
import { KeyboardAvoidingView, TextInput, View, ActivityIndicator } from "react-native";
import { useSession } from "@/components/AuthContext";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { useState } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import Logo from "@/components/Logo";
import i18n from "@/components/translations";
import { useError } from "@/components/ErrorContext";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useSession();
  const { showError } = useError();

  const validateForm = () => {
    if (!email.trim()) {
      showError(i18n.t("app_signIn_error_emailRequired") || "Email is required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError(i18n.t("app_signIn_error_invalidEmail") || "Please enter a valid email address");
      return false;
    }
    
    if (!password.trim()) {
      showError(i18n.t("app_signIn_error_passwordRequired") || "Password is required");
      return false;
    }
    
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (error) {
      // Error is already logged and displayed by the error context
      // No need to do anything else here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 flex-col justify-between items-center bg-background h-full py-20">
      <View className="flex">
        <Logo />
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
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text>{i18n.t("app_signIn_button_signIn")}</Text>
          )}
        </Button>
        <Button
          onPress={() => router.push("/sign-up")}
          disabled={isLoading}
        >
          <Text>{i18n.t("app_signIn_button_createAccount")}</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
