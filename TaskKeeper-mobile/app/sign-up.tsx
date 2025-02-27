import { useSession } from "@/components/AuthContext";
import Logo from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, TextInput, View, ActivityIndicator } from "react-native";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import i18n from "@/components/translations";
import firestore from "@react-native-firebase/firestore";
import { useError } from "@/components/ErrorContext";

export default function SignUp() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useSession();
  const { showError } = useError();
  const router = useRouter();

  // NOTE: this works ONLY for Android! if I'll want to support iOS later, here's an important link for myself:
  // https://github.com/react-native-datetimepicker/datetimepicker?tab=readme-ov-file#usage
  const onChangeDate = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onChangeDate,
      mode: "date",
      is24Hour: true,
    });
  };

  const validateForm = () => {
    if (!name.trim()) {
      showError(i18n.t("app_signUp_error_nameRequired") || "First name is required");
      return false;
    }
    
    if (!lastName.trim()) {
      showError(i18n.t("app_signUp_error_lastNameRequired") || "Last name is required");
      return false;
    }
    
    if (!email.trim()) {
      showError(i18n.t("app_signUp_error_emailRequired") || "Email is required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError(i18n.t("app_signUp_error_invalidEmail") || "Please enter a valid email address");
      return false;
    }
    
    if (!password.trim()) {
      showError(i18n.t("app_signUp_error_passwordRequired") || "Password is required");
      return false;
    }
    
    if (password.length < 6) {
      showError(i18n.t("app_signUp_error_passwordTooShort") || "Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(email, password, { 
        first_name: name, 
        last_name: lastName, 
        date_of_birth: firestore.Timestamp.fromDate(date) 
      });
      
      try {
        await signIn(email, password);
        router.replace("/");
      } catch (signInError) {
        // If sign-in fails after successful sign-up, show a specific message
        showError(i18n.t("app_signUp_error_signInAfterSignUp") || "Account created successfully, but sign-in failed. Please try signing in manually.");
      }
    } catch (error) {
      // Error is already logged and displayed by the error context
      // No need to do anything else here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 flex flex-col justify-between items-center bg-background h-full py-20 p-5">
      <View className="flex">
        <Logo />
      </View>
      <View className="flex gap-3 w-full">
        <Input
          placeholder={i18n.t("app_signUp_input_namePlaceholder")}
          value={name}
          onChangeText={setName}
          keyboardType="default"
        />
        <Input
          placeholder={i18n.t("app_signUp_input_lastNamePlaceholder")}
          value={lastName}
          onChangeText={setLastName}
          keyboardType="default"
        />
        {/*  */}
        <Button onPress={showDatepicker}>
          <Text>{i18n.t("app_signUp_button_pickDateOfBirth")}</Text>
        </Button>
        <Text>{i18n.t("app_signUp_text_datePicked")}: {date.toLocaleDateString()}</Text>

        <Input
          placeholder={i18n.t("app_signUp_input_emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Input
          placeholder={i18n.t("app_signUp_input_passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          keyboardType="default"
          secureTextEntry={true}
        />
        <Button
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text>{i18n.t("app_signUp_button_createAccount")}</Text>
          )}
        </Button>
        <Button onPress={() => router.back()} disabled={isLoading}>
          <Text>{i18n.t("app_signUp_button_goBack")}</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
