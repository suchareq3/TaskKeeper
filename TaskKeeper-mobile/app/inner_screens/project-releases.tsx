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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import ReleaseTile from "@/components/ReleaseTile";

export default function ProjectReleases() {
  const { getProjectReleases, createRelease } = useSession();

  const { projectId } = useLocalSearchParams();

  const [releases, setReleases] = useState<
    {
      releaseId: string;
      projectId: string;
      name: string;
      description: string | null;
      startDate: Timestamp | null;
      plannedEndDate: Timestamp | null;
      actualEndDate: Timestamp | null;
      status: string;
    }[]
  >([]);

  const [projectName, setProjectName] = useState("");
  const [isManager, setIsManager] = useState(false);
  const auth = getAuth();
  const currentUserUid = auth.currentUser!.uid;

  const [releaseName, setReleaseName] = useState("");
  const [releaseDescription, setReleaseDescription] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState(new Date());

  // NOTE: this works ONLY for Android! if I'll want to support iOS later, here's an important link for myself:
  // https://github.com/react-native-datetimepicker/datetimepicker?tab=readme-ov-file#usage
  const onChangeDate = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate || plannedEndDate;
    setPlannedEndDate(currentDate);
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: plannedEndDate,
      onChange: onChangeDate,
      mode: "date",
    });
  };

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        // cached version of the data, useful for laggy networks
        // NOTE: this could potentially cause a large cache size if the user has a lot of projects or releases
        // const cachedReleases = await AsyncStorage.getItem(`releases-${projectId}`);
        // if (cachedReleases) {
        //   setReleases(JSON.parse(cachedReleases));
        // }

        const loadedReleases = await fbFunctions.getProjectReleases(projectId as string);

        // Sort releases by status
        const sortedReleases = [...loadedReleases].sort((a, b) => {
          const statusOrder: Record<string, number> = {
            started: 0,
            planned: 1,
            finished: 2,
          };

          const aStatus = a.status?.toLowerCase() || "unknown";
          const bStatus = b.status?.toLowerCase() || "unknown";

          return (statusOrder[aStatus] ?? 3) - (statusOrder[bStatus] ?? 3);
        });

        console.log("loadedReleases: ", sortedReleases);
        setReleases(sortedReleases);
        AsyncStorage.setItem(`releases-${projectId}`, JSON.stringify(sortedReleases));
      } catch (error) {
        console.error("Failed to fetch releases: ", error);
      }
    };
    const fetchProject = async () => {
      try {
        const storedProjects = await AsyncStorage.getItem("projects");
        const projects = storedProjects ? JSON.parse(storedProjects) : [];
        // TODO: create a custom 'project' Type for TypeScript bc it's yelling at me :(
        const project = projects.find((project) => project.projectId === projectId);

        console.log("new project loaded to edit!: ", project);
        setProjectName(project.name);
        setIsManager(project.members[currentUserUid]?.isManager == true);
        console.log(project.members[currentUserUid]);
      } catch (error) {
        console.error("Failed to fetch project: ", error);
      }
    };
    fetchProject();
    fetchReleases();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 flex flex-col  items-center w-full p-5">
        <View className="flex flex-col w-full">
          {releases &&
            // Sort releases by status, prioritizing started, then planned, then finished
            releases
              .sort((a, b) => {
                const statusOrder: Record<string, number> = { started: 0, planned: 1, finished: 2 };

                // First, sort by status
                const statusComparison = statusOrder[a.status] - statusOrder[b.status];
                if (statusComparison !== 0) return statusComparison;

                // If both are "planned", sort by plannedEndDate (most recent first)
                if (a.status === "planned" && b.status === "planned") {
                  return (b.plannedEndDate?.toDate()?.getTime() || 0) - (a.plannedEndDate?.toDate()?.getTime() || 0);
                }

                // If both are "finished", sort by actualEndDate (most recent first)
                if (a.status === "finished" && b.status === "finished") {
                  return (b.actualEndDate?.toDate().getTime() || 0) - (a.actualEndDate?.toDate().getTime() || 0);
                }

                return 0; // Default case (shouldn't be needed)
              })

              .map((release, index) => {
                console.log("releeeeease: ", release);
                return (
                  <ReleaseTile
                    key={index}
                    isManager={isManager}
                    projectId={projectId as string}
                    releaseId={release.releaseId}
                    name={release.name}
                    description={release.description || ""}
                    startDate={release.startDate ? release.startDate : null}
                    plannedEndDate={release.plannedEndDate ? release.plannedEndDate : null}
                    actualEndDate={release.actualEndDate ? release.actualEndDate : null}
                    status={release.status}
                  />
                );
              })}
        </View>
        <Separator className="bg-primary my-5" />
        <View className="w-full gap-2">
          <Text className="text-2xl">{i18n.t("app_innerScreens_projectReleases_text_createANewRelease")}</Text>
          <Input
            placeholder={i18n.t("app_innerScreens_projectReleases_input_releaseNamePlaceholder")}
            value={releaseName}
            onChangeText={setReleaseName}
            keyboardType="default"
            editable={isManager}
          />
          <Textarea
            placeholder={i18n.t("app_innerScreens_projectReleases_input_releaseDescriptionPlaceholder")}
            value={releaseDescription}
            onChangeText={setReleaseDescription}
            keyboardType="default"
            editable={isManager}
          />

          <Button
            onPress={showDatepicker}
            disabled={!isManager}
          >
            <Text>{i18n.t("app_innerScreens_projectReleases_button_ChoosePlannedEndDate")}</Text>
          </Button>
          <Text className="text-white">
            {i18n.t("app_innerScreens_projectReleases_text_plannedEndDate")}: {plannedEndDate.toLocaleDateString()}
          </Text>
          <Button
            disabled={!isManager}
            onPress={() => {
              createRelease(projectId as string, releaseName, releaseDescription, plannedEndDate).then(() => {
                router.back();
              });
            }}
          >
            <Text>{i18n.t("app_innerScreens_projectReleases_button_createNewRelease")}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
