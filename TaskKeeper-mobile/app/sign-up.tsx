import { useSession } from "@/components/AuthContext";
import Logo from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, TextInput, View } from "react-native";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import i18n from "@/components/translations";
import { Timestamp } from "@react-native-firebase/firestore";

export default function SignUp() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // NOTE: this works ONLY for Android! if I'll want to support iOS later, here's an important link for myself:
  // https://github.com/react-native-datetimepicker/datetimepicker?tab=readme-ov-file#usage
  const [date, setDate] = useState(Timestamp.now().toDate());
  const onChangeDate = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: onChangeDate,
      mode: "date",
    });
  };

  const { signUp, signIn } = useSession();
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
          onPress={() => {
            //TODO: implement proper error handling with user-facing alerts
            //TODO: implement proper loading state (doesn't seem to work while Firebase is processing the sign-up)
            signUp(email, password, { first_name: name, last_name: lastName, date_of_birth: Timestamp.fromDate(date) }).then(() => {
              //router.replace("/");
              signIn(email, password).then(() => {
                router.replace("/");
              });
            });
            // Navigate after signing up (and signing in)
            // TODO: You may want to tweak this to ensure sign-up (and sign-in) is successful before navigating.
          }}
        >
          <Text>{i18n.t("app_signUp_button_createAccount")}</Text>
        </Button>
        <Button onPress={() => router.back()}>
          <Text>{i18n.t("app_signUp_button_goBack")}</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
