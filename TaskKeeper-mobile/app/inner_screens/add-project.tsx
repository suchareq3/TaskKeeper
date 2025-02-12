import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import i18n from "@/components/translations";

export default function CreateProject() {
  const { createProject, addUserToProjectViaInviteCode } = useSession();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 items-center w-full p-5">
        <View className=" w-full">
          <Input
            className=""
            placeholder={i18n.t("app_innerScreens_addProject_input_projectNamePlaceholder")}
            value={projectName}
            onChangeText={setProjectName}
            keyboardType="default"
          />
          <Input
            placeholder={i18n.t("app_innerScreens_addProject_input_projectDescriptionPlaceholder")}
            value={projectDescription}
            onChangeText={setProjectDescription}
            keyboardType="default"
          />
          <Input
            placeholder={i18n.t("app_innerScreens_addProject_input_githubUrlPlaceholder")}
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
            <Text>{i18n.t("app_innerScreens_addProject_button_createProject")}</Text>
          </Button>
        </View>
        <Separator className="bg-primary my-5" />
        <Text className="text-5xl">{i18n.t("app_innerScreens_addProject_text_or")}</Text>
        <Separator className="bg-primary my-5" />
        <View className="w-full">
          <Input
            placeholder={i18n.t("app_innerScreens_addProject_input_inviteCodePlaceholder")}
            value={inviteCode}
            onChangeText={setInviteCode}
            keyboardType="default"
          />
          <Button
            onPress={() => {
              addUserToProjectViaInviteCode(inviteCode).then(() => {
                router.back();
              });
            }}
          >
            <Text>{i18n.t("app_innerScreens_addProject_button_joinExistingProject")}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
