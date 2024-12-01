import React from "react";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { SearchIcon } from "@/components/ui/icon";
//import inputic
//import inputfiel
//import { InputField, InputIcon,  Icon, SearchIcon } from "@gluestack-ui/themed";

import { useSession } from "@/components/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { Button, KeyboardAvoidingView, TextInput } from "react-native";
export default function SignUp() {
  const [value, setValue] = React.useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [extraData, setExtraData] = useState({});
  const { signUp, signIn } = useSession();
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Input size={"lg"} variant={"outline"} isInvalid={false} isDisabled={false}>
        <InputField
          onChangeText={setValue}
          value={value}
          placeholder="Enter Text here"
        />
          {/* <InputSlot>
            <InputIcon as={SearchIcon}/>
          </InputSlot> */}
      </Input>
      <TextInput onChangeText={setEmail} placeholder="type your email here" value={email} />
      <TextInput onChangeText={setPassword} placeholder="type your password here" value={password} />
      <Button
        title="Sign Up!"
        onPress={() => {
          //TODO: implement proper error handling with user-facing alerts
          setExtraData({
            displayName: "John Doe",
            age: "30",
          });
          signUp(email, password, extraData).then(() => {
            //router.replace("/");
            signIn(email, password).then(() => {
              router.replace("/");
            });
          });
          // Navigate after signing up (and signing in)
          // TODO: You may want to tweak this to ensure sign-up (and sign-in) is successful before navigating.
        }}
      ></Button>
      <Button title="Go Back" onPress={() => router.back()} />

      {/* <Button title="check user status" onPress={() => fbFunctions.checkUserStatus()}></Button> */}
      {/* <Button title="LOGIN WITHOUT GOING THROUGH AUTHCONTEXT" onPress={() => fbFunctions.logInWithPassword("abc123@gmail.com","abc123")}></Button>
       <Button title="if you're logged out, this redirect shouldn't work!" onPress={() => router.navigate("/")}></Button> */}
    </KeyboardAvoidingView>
  );
}
