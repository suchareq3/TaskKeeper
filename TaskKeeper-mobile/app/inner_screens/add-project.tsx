import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Text } from "@/components/ui/text";
import { useEffect, useState, useCallback } from "react";
import React from "react";
import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/components/AuthContext";
import i18n from "@/components/translations";
import { useError } from "@/components/ErrorContext";
import { fbFunctions } from "../../../shared/firebaseFunctions";

export default function CreateProject() {
  const { createProject, addUserToProjectViaInviteCode, isLoading } = useSession();
  const { logError } = useError();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreateProject = useCallback(async () => {
    try {
      await createProject(projectName, projectDescription, githubUrl);
      // Only navigate back if successful
      router.back();
    } catch (error) {
      console.log("Error creating project: ", error);
      logError(error, "Create Project");
      // Don't navigate back on error
    }
  }, [createProject, projectName, projectDescription, githubUrl, logError]);

  const handleJoinProject = useCallback(async () => {
    try {
      await addUserToProjectViaInviteCode(inviteCode);
      // Only navigate back if successful
      router.back();
    } catch (error) {
      console.log("Error joining project: ", error);
      logError(error, "Join Project");
      // Don't navigate back on error
    }
  }, [addUserToProjectViaInviteCode, inviteCode, logError]);

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <KeyboardAvoidingView className="flex-1 flex flex-col  items-center w-full p-5">
        <View className="flex flex-col w-full gap-2">
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
            onPress={handleCreateProject}
            disabled={isLoading}
          >
            <Text>{i18n.t("app_innerScreens_addProject_button_createProject")}</Text>
          </Button>
        </View>
        <Separator className="bg-primary my-5" />
        <Text className="text-5xl font-bold">{i18n.t("app_innerScreens_addProject_text_or")}</Text>
        <Separator className="bg-primary my-5" />
        <View className="w-full gap-2">
          <Input
            placeholder={i18n.t("app_innerScreens_addProject_input_inviteCodePlaceholder")}
            value={inviteCode}
            onChangeText={setInviteCode}
            keyboardType="default"
          />
          <Button
            onPress={handleJoinProject}
            disabled={isLoading}
          >
            <Text>{i18n.t("app_innerScreens_addProject_button_joinExistingProject")}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
