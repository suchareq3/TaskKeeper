import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, KeyboardAvoidingView, ToastAndroid } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";


export default function EditProject() {
  const { editProject } = useSession();

  const { projectId } = useLocalSearchParams();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [projectMemberUids, setProjectMemberUids] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const storedProjects = await AsyncStorage.getItem("projects");
        const projects = storedProjects ? JSON.parse(storedProjects) : [];
        const project = projects.find((project) => project.projectId === projectId);

        console.log("new project loaded to edit!: ", project);
        setProjectName(project.name);
        setProjectDescription(project.description);
        setGithubUrl(project.githubUrl);
        setProjectMemberUids(project.memberUids);
        setInviteCode(project.inviteCode);
      } catch (error) {
        console.error("Failed to fetch project: ", error);
      }
    };
    fetchProject();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 flex flex-col  items-center w-full p-5">
        {/* name, description & github url */}
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
                editProject(projectId as string, projectName, projectDescription, githubUrl).then(() => {
                  //TODO: navigate to the 'projects' tab!
                  router.back();
                });
              } catch (e) {
                console.log("smth went wrong: ", e);
              }
            }}
          >
            <Text>Edit project!</Text>
          </Button>
        </View>
        <Separator className="bg-primary my-4" />
        <View className="flex flex-col w-full items-center">
          <Text className="text-xl">Your project's invite code:</Text>
          <Button
            size={"lg"}
            className="flex relative pl-3 pr-9"
            onPress={() => {
              Clipboard.setStringAsync(inviteCode).then(() => {
                ToastAndroid.show("Invite code copied!", ToastAndroid.SHORT);
              });
            }}
          >
            <Text className="!text-3xl">{inviteCode}</Text>
            <MaterialIcons
              className="absolute right-2 opacity-40"
              name="content-copy"
              size={17}
              color="black"
            />
          </Button>
          <Text>{inviteCode}</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
