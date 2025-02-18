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
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RELEASE_STATUS_OPTIONS } from "@/components/constants";
import { Timestamp } from "@react-native-firebase/firestore";

export default function EditRelease() {
  const { releaseId, projectId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState<Date>(Timestamp.now().toDate());
  const [status, setStatus] = useState(RELEASE_STATUS_OPTIONS[0]);

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
    const fetchRelease = async () => {
      try {
        const cachedReleases = await AsyncStorage.getItem(`releases-${projectId}`);
        console.log("releaseId: ", cachedReleases);
        const releases = cachedReleases ? JSON.parse(cachedReleases) : [];
        // TODO: create a custom 'release' Type for TypeScript bc it's yelling at me :(
        const release = releases.find((release) => release.releaseId === releaseId);
        //console.log("releaseId123: ", release.plannedEndDate.toDate());

        setName(release.name);
        setDescription(release.description);
        setPlannedEndDate(new Timestamp(release.plannedEndDate.seconds, release.plannedEndDate.nanoseconds).toDate());
        setStatus(RELEASE_STATUS_OPTIONS.find((s) => s.value === release.status) || { value: "", label: "" });


        console.log("new release loaded to edit!: ", release);

      } catch (error) {
        console.error("Failed to fetch project: ", error);
      }
    };
    fetchRelease();
  }, []);


  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 flex flex-col items-center w-full p-5">
        <View className="flex flex-col w-full gap-2">
          <Input
            placeholder={i18n.t("app_innerScreens_editRelease_input_releaseNamePlaceholder")}
            value={name}
            onChangeText={setName}
            keyboardType="default"
          />
          <Input
            placeholder={i18n.t("app_innerScreens_editRelease_input_releaseDescriptionPlaceholder")}
            value={description}
            onChangeText={setDescription}
            keyboardType="default"
          />

          <Button onPress={showDatepicker}>
            <Text>{i18n.t("app_innerScreens_editRelease_button_ChoosePlannedEndDate")}</Text>
          </Button>
          <Text className="text-white">
            {i18n.t("app_innerScreens_editRelease_text_plannedEndDate")}: {plannedEndDate?.toLocaleDateString()}
          </Text>

          <View>
            <Label nativeID="release-status">{i18n.t("app_innerScreens_editRelease_label_releaseStatus")}</Label>
            <Select
              defaultValue={status}
              value={status}
              onValueChange={(value) => setStatus(value!)}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder={i18n.t("app_innerScreens_editTask_select_taskStatusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {RELEASE_STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>

          <Button
            onPress={() => {
              //TODO: implement proper error handling with user-facing alerts
              try {
                fbFunctions.editRelease(releaseId as string, name, description, plannedEndDate, status.value).then(() => {
                  //TODO: navigate to the 'projects' tab!
                  router.back();
                });
              } catch (e) {
                console.log("smth went wrong: ", e);
              }
            }}
          >
            <Text>{i18n.t("app_innerScreens_editRelease_button_editRelease")}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
