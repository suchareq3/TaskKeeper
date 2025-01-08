import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateProject() {
  const navigation = useNavigation();
  const { createProject } = useSession();

  useEffect(() => {
    navigation.setOptions({ headerShown: true });
  }, [navigation]);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // TODO: re-do this so it's a 3-step "registration" process!
  // TODO: step 1 is naming, step 2 is linking github (optional), step 3 is inviting ppl(optional)!
  // TODO: step 2 and 3 screens will be RE-USED in 'edit-project'!
  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 flex flex-col justify-between items-center bg-violet-900 w-full p-5">
        <View className="flex flex-col w-full">
          <Input className="" placeholder="Project name here please!" value={projectName} onChangeText={setProjectName} keyboardType="default" />
          <Input placeholder="Project description here please!" value={projectDescription} onChangeText={setProjectDescription} keyboardType="default" />
          <Input placeholder="Github URL here please!" value={githubUrl} onChangeText={setGithubUrl} keyboardType="default" />
          <Button
            onPress={() => {
              //TODO: implement proper error handling with user-facing alerts
              //TODO: implement proper loading state (doesn't seem to work while Firebase is processing the sign-up)
              try {
              createProject(projectName, projectDescription, githubUrl).then(() => {
                console.log("donedy!")
                //router.replace("/");
              }); }
              catch (e) {
                console.log("smth went wrong: ", e);
              }
            
              // Navigate after signing up (and signing in)
              // TODO: You may want to tweak this to ensure sign-up (and sign-in) is successful before navigating.
            }}
          >
            <Text>Create project!</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
