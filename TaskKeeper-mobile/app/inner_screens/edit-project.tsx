import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, KeyboardAvoidingView, ToastAndroid } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import React from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import i18n from "@/components/translations";
import { Card, CardContent } from "@/components/ui/card";
import { getAuth } from "@react-native-firebase/auth";
import { useHeaderDropdown } from "@/components/utilityFunctions";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function EditProject() {
  const { editProject, isLoading, refreshProjectInviteCode } = useSession();

  const { projectId } = useLocalSearchParams();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [projectMembers, setProjectMembers] = useState({});
  const [isManager, setIsManager] = useState(false);
  const auth = getAuth();
  const currentUserUid = auth.currentUser!.uid;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const storedProjects = await AsyncStorage.getItem("projects");
        const projects = storedProjects ? JSON.parse(storedProjects) : [];
        // TODO: create a custom 'project' Type for TypeScript bc it's yelling at me :(
        const project = projects.find((project) => project.projectId === projectId);

        console.log("new project loaded to edit!: ", project);
        setProjectName(project.name);
        setProjectDescription(project.description);
        setGithubUrl(project.githubUrl);
        setProjectMembers(project.members || {});
        setInviteCode(project.inviteCode);
        setIsManager(project.members[currentUserUid]?.isManager == true);
        console.log(project.members[currentUserUid]);
      } catch (error) {
        console.error("Failed to fetch project: ", error);
      }
    };
    fetchProject();
  }, []);

  useHeaderDropdown([
    {
      isCustom: true,
      customOption: (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="flex items-start"
              variant="destructive"
            >
              <Text>{i18n.t("app_innerScreens_editProject_button_leaveProject")}</Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="!text-lg">
            <DialogHeader>
              <DialogTitle className="!text-[20px]">{i18n.t("app_innerScreens_editProject_dialogTitle_leaveProject")}</DialogTitle>
              <DialogDescription className="!text-[16px]">{i18n.t("app_innerScreens_editProject_dialogText_leaveProject")}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-between mt-5">
              <DialogClose asChild>
                <Button>
                  <Text>{i18n.t("app_innerScreens_editProject_button_leaveProjectRefuse")}</Text>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                {/* TODO: implement onTrigger (or periodical?) logic for firebase that removes projects with no members in them */}
                <Button
                  variant={"destructive"}
                  onPress={() => {
                    // TODO: use AuthProvider/AuthContext instead!
                    fbFunctions.removeUserFromProject(projectId as string, getAuth().currentUser!.uid).then(() => router.back());
                  }}
                >
                  <Text>{i18n.t("app_innerScreens_editProject_button_leaveProjectConfirm")}</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      isCustom: true,
      customOption: (
        <Dialog>
          <DialogTrigger
            disabled={!isManager}
            asChild
          >
            <Button
              className="flex items-start"
              variant="destructive"
            >
              <Text>{i18n.t("app_innerScreens_editProject_button_deleteProject")}</Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="!text-lg">
            <DialogHeader>
              <DialogTitle className="!text-[20px]">{i18n.t("app_innerScreens_editProject_dialogTitle_deleteProject")}</DialogTitle>
              <DialogDescription className="!text-[16px]">{i18n.t("app_innerScreens_editProject_dialogText_deleteProject")}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-between mt-5">
              <DialogClose asChild>
                <Button>
                  <Text>{i18n.t("app_innerScreens_editProject_button_deleteProjectRefuse")}</Text>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                {/* TODO: implement onTrigger (or periodical?) logic for firebase that removes projects with no members in them */}
                <Button
                  variant={"destructive"}
                  onPress={() => {
                    // TODO: use AuthProvider/AuthContext instead!
                    fbFunctions.deleteProject(projectId as string).then(() => router.back());
                  }}
                >
                  <Text>{i18n.t("app_innerScreens_editProject_button_deleteProjectConfirm")}</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
  ]);

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 flex flex-col  items-center w-full p-5">
        {/* name, description & github url */}
        <View className="flex flex-col w-full">
          <Input
            className=""
            placeholder={i18n.t("app_innerScreens_editProject_input_projectNamePlaceholder")}
            value={projectName}
            onChangeText={setProjectName}
            keyboardType="default"
            editable={isManager}
          />
          <Input
            placeholder={i18n.t("app_innerScreens_editProject_input_projectDescriptionPlaceholder")}
            value={projectDescription}
            onChangeText={setProjectDescription}
            keyboardType="default"
            editable={isManager}
          />
          <Input
            placeholder={i18n.t("app_innerScreens_editProject_input_githubUrlPlaceholder")}
            value={githubUrl}
            onChangeText={setGithubUrl}
            keyboardType="default"
            editable={isManager}
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
            disabled={!isManager}
          >
            <Text>{i18n.t("app_innerScreens_editProject_button_editProject")}</Text>
          </Button>
        </View>
        <Separator className="bg-primary my-5" />
        <Label className="!text-xl">{i18n.t("app_innerScreens_editProject_label_projectMembers")}:</Label>

        {Object.entries(projectMembers).map(([uid, permissions]) => (
          <Card
            className="w-full"
            key={uid}
          >
            <CardContent className="flex flex-row justify-between items-center p-3">
              <Text>{uid}</Text>
              <View className="flex flex-row gap-2 items-center">
                <View className="items-center ">
                  <Label>{i18n.t("app_innerScreens_editProject_label_manager")}</Label>
                  <Checkbox
                    checked={permissions.isManager}
                    onCheckedChange={(checked) => {
                      // Update local state first for instant feedback
                      setProjectMembers((prev) => ({
                        ...prev,
                        [uid]: {
                          ...prev[uid],
                          isManager: checked,
                        },
                      }));
                      console.log("new project members: ", projectMembers);

                      // Update Firebase
                      fbFunctions
                        .updateProjectMemberManagerStatus(projectId as string, uid, checked)
                        .then(() => {
                          setProjectMembers((prev) => ({
                            ...prev,
                            [uid]: {
                              ...prev[uid],
                              isManager: checked,
                            },
                          }));
                          console.log("updated manager status!");
                        })
                        .catch((error) => {
                          console.error("Failed to update manager status:", error);
                          // Revert local state if update fails
                        });
                    }}
                    disabled={!isManager || uid === currentUserUid}
                  />
                </View>
                <Button
                  variant={"destructive"}
                  disabled={!isManager || getAuth().currentUser?.uid === uid}
                  size={"icon"}
                  onPress={() => fbFunctions.removeUserFromProject(projectId as string, uid)}
                >
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color="white"
                  />
                </Button>
              </View>
            </CardContent>
          </Card>
        ))}

        <View></View>
        {isManager && (
          <>
            <Separator className="bg-primary my-5" />
            <View className="flex flex-col w-full items-center gap-2">
              <Label className="!text-xl">{i18n.t("app_innerScreens_editProject_text_yourProjectInviteCode")}:</Label>
              <View className="flex flex-row gap-5">
                <Button
                  size={"lg"}
                  className="flex relative pl-3 pr-9"
                  onPress={() => {
                    Clipboard.setStringAsync(inviteCode).then(() => {
                      ToastAndroid.show(i18n.t("app_innerScreens_editProject_toast_inviteCodeCopied"), ToastAndroid.SHORT);
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
                <Dialog>
                  <DialogTrigger
                    disabled={!isManager}
                    asChild
                  >
                    <Button
                      className="flex items-start "
                      size={null}
                    >
                      <Feather
                        className="p-4 text-primary"
                        name="refresh-ccw"
                        size={20}
                        // color="text-primary"
                      />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="!text-lg">
                    <DialogHeader>
                      <DialogTitle className="!text-[20px]">{i18n.t("app_innerScreens_editProject_dialogTitle_refreshInviteCode")}</DialogTitle>
                      <DialogDescription className="!text-[16px]">{i18n.t("app_innerScreens_editProject_dialogDescription_refreshInviteCode")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-between mt-5">
                      <DialogClose asChild>
                        <Button>
                          <Text>{i18n.t("app_innerScreens_editProject_button_refreshInviteCodeRefuse")}</Text>
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        {/* TODO: implement onTrigger (or periodical?) logic for firebase that removes projects with no members in them */}
                        <Button
                          variant={"destructive"}
                          onPress={() => {
                            // TODO: actually REFRESH the data you get back from firebase instead of using router.back()!
                            refreshProjectInviteCode(projectId as string).then(() => router.back());
                          }}
                        >
                          <Text>{i18n.t("app_innerScreens_editProject_button_refreshInviteCodeConfirm")}</Text>
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
