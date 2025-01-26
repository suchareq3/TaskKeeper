import { View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Crypto from "expo-crypto";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '~/components/ui/textarea';

export default function CreateProject() {
  const { createTask } = useSession();
  const { projects } = useLocalSearchParams();
  const parsedProjects = projects ? JSON.parse(projects) : [];

  const [selectedProject, setSelectedProject] = useState({ value: "", label: "" });
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [isTimed, setIsTimed] = useState(false);
  const [hasSubtasks, setHasSubtasks] = useState(false);
  const [date, setDate] = useState(new Date(Date.now()));

  const initialData: Item[] = [{ key: Crypto.randomUUID(), label: "New subtask name", completed: false }];
  const [data, setData] = useState(initialData);

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

  type Item = {
    key: string;
    label: string;
    completed: boolean;
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
    const handleRemoveItem = (key: string) => {
      setData((prevData) => prevData.filter((dataItem) => dataItem.key !== key));
    };

    const handleTextChange = (key: string, newText: string) => {
      setData((prevData) => prevData.map((dataItem) => (dataItem.key === key ? { ...dataItem, label: newText } : dataItem)));
    };

    return (
      <View className="relative">
        <ScaleDecorator>
          <View className="flex w-full max-h-[50] bg-gray-600 scroll">
            <TouchableOpacity delayLongPress={250} onLongPress={drag} className="h-20">
              <MaterialIcons name="drag-indicator" size={32} color="black" className="absolute opacity-50 left-[5] top-[4] bottom-0 z-[50]" />
              <Input className="text-white !text-xl text-left ml-12 mr-[88] !bg-transparent bg-red-500" editable={true} onChangeText={(text) => handleTextChange(item.key, text)}>
                {item.label}
              </Input>
            </TouchableOpacity>
            <Checkbox
              className="absolute right-[48] top-[2] border-2 p-5"
              checked={item.completed}
              onCheckedChange={(checked) => setData((prevData) => prevData.map((dataItem) => (dataItem.key === item.key ? { ...dataItem, completed: checked } : dataItem)))}
            />
            <Button className="absolute right-0 bg-red-500" onPress={() => handleRemoveItem(item.key)}>
              <Text>X</Text>
            </Button>
          </View>
        </ScaleDecorator>
      </View>
    );
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 items-center w-full p-5">
        <View className="w-full ">
          <Select
            onValueChange={(value) => {
              setSelectedProject(value);
              console.log(selectedProject);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue className="text-foreground text-sm native:text-lg" placeholder="Pick a project" />
            </SelectTrigger>
            <SelectContent className="w-[250px]">
              <SelectGroup>
                <SelectLabel>Your projects</SelectLabel>
                {parsedProjects.map((project) => (
                  <SelectItem key={project.projectId} label={project.name} value={project.projectId} />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedProject.value && (
            <>
              <Input placeholder="Task name" value={taskName} onChangeText={setTaskName} keyboardType="default" />
              <Textarea className="max-h-[120]" numberOfLines={2} placeholder="Task description (optional)" value={taskDescription} onChangeText={setTaskDescription} keyboardType="default" />
              <View className="flex-row items-center !m-0">
                <Checkbox className="p-5 !m-0" checked={isTimed} onCheckedChange={setIsTimed} />
                <Label className="!text-xl h-auto p-3 pr-8 !m-0" nativeID="terms" onPress={() => setIsTimed((prev) => !prev)}>
                  Deadline
                </Label>
              </View>
              <View className="flex-row items-center !m-0">
                <Checkbox className="p-5 !m-0" checked={hasSubtasks} onCheckedChange={setHasSubtasks} />
                <Label className="!text-xl h-auto p-3 pr-8 !m-0" nativeID="terms" onPress={() => setHasSubtasks((prev) => !prev)}>
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

              {hasSubtasks && (
                <>
                  <Button onPress={() => setData([...data, { key: Crypto.randomUUID(), label: "Edit me!", completed: false }])}>
                    <Text>Add new subtask</Text>
                  </Button>
                  <DraggableFlatList
                    data={data}
                    onDragEnd={({ data }) => {
                      setData(data);
                      console.log("new data:", data);
                    }}
                    keyExtractor={(item) => item.key}
                    renderItem={renderItem}
                  />
                </>
              )}

              <Separator className="my-4" />
              <Button
                onPress={() => {
                  //TODO: implement proper error handling with user-facing alerts
                  try {
                    createTask(selectedProject.value, taskName, taskDescription, isTimed, date, hasSubtasks, data).then(() => {
                      //TODO: navigate to the 'tasks' tab!
                      router.back();
                    });
                  } catch (e) {
                    console.log("smth went wrong: ", e);
                  }
                }}
              >
                <Text>Create new task!</Text>
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
