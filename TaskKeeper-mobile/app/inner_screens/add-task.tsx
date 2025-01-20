import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useCallback, useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import React from "react";

export default function CreateProject() {
  const { createProject, addUserToProjectViaInviteCode } = useSession();

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isTimed, setIsTimed] = useState(false);
  const [hasSubtasks, setHasSubtasks] = useState(false);
  const [date, setDate] = useState(new Date(Date.now()));

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

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 items-center w-full p-5">
        <View className="w-full ">
          <Input
            className=""
            placeholder="Task name"
            value={taskName}
            onChangeText={setTaskName}
            keyboardType="default"
          />
          <Input
            placeholder="Task description (optional)"
            value={taskDescription}
            onChangeText={setTaskDescription}
            keyboardType="default"
          />
          <View className="flex-row items-center !m-0">
            <Checkbox
              className="p-5 !m-0"
              checked={isTimed}
              onCheckedChange={setIsTimed}
            />
            <Label
              className="!text-xl h-auto p-3 pr-8 !m-0"
              nativeID="terms"
              onPress={() => setIsTimed((prev) => !prev)}
            >
              Deadline
            </Label>
          </View>
          <View className="flex-row items-center !m-0">
            <Checkbox
              className="p-5 !m-0"
              checked={hasSubtasks}
              onCheckedChange={setHasSubtasks}
            />
            <Label
              className="!text-xl h-auto p-3 pr-8 !m-0"
              nativeID="terms"
              onPress={() => setHasSubtasks((prev) => !prev)}
            >
              Add subtasks
            </Label>
          </View>

          {isTimed && (
            <>
              <Button onPress={showDatepicker}>
                <Text>show date picker!</Text>
              </Button>
              <Text className="text-white">ETA: {date.toLocaleDateString()}</Text>
            </>
          )}

          <Separator className="my-4" />
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
            <Text>Create new project!</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
