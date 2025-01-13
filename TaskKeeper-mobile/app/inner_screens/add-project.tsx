import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateProject() {
  const { createProject } = useSession();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 flex flex-col justify-between items-center bg-violet-900 w-full p-5">
        <View className="flex flex-col w-full">
          <Input
            className=""
            placeholder="Project name here please!"
            value={projectName}
            onChangeText={setProjectName}
            keyboardType="default"
          />
          <Input
            placeholder="Project description here please!"
            value={projectDescription}
            onChangeText={setProjectDescription}
            keyboardType="default"
          />
          <Input
            placeholder="Github URL here please!"
            value={githubUrl}
            onChangeText={setGithubUrl}
            keyboardType="default"
          />
          <Button
            onPress={() => {
              //TODO: implement proper error handling with user-facing alerts
              try {
                createProject(projectName, projectDescription, githubUrl).then(() => {
                  //TODO: navigate to the 'projects' tab!
                  router.back();
                });
              } catch (e) {
                console.log("smth went wrong: ", e);
              }
            }}
          >
            <Text>Create project!</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
