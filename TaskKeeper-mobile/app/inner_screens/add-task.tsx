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
import { Textarea } from "~/components/ui/textarea";
import { Option } from "@rn-primitives/select";

export default function CreateProject() {
  const { createTask } = useSession();
  const { projects } = useLocalSearchParams();
  const parsedProjects = projects ? JSON.parse(projects as string) : [];

  const [selectedProject, setSelectedProject] = useState({ value: {projectId: ""}, label: "" } );
  const [priorityLevel, setPriorityLevel] = useState({ value: "", label: "" } as Option);
  // const [taskState, setTaskState] = useState({value: "", label: ""});
  const [taskType, setTaskType] = useState({ value: "", label: "" } as Option);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const DEFAULT_PRIORITY_LEVEL = { label: "3", value: "3" };
  const DEFAULT_TASK_TYPE = { label: "New feature", value: "new-feature" };

  const initialData: Item[] = [];
  const [subtaskData, setSubtaskData] = useState(initialData);

  type Item = {
    key: string;
    label: string;
    completed: boolean;
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => {
    const handleRemoveItem = (key: string) => {
      setSubtaskData((prevData) => prevData.filter((dataItem) => dataItem.key !== key));
    };

    const handleTextChange = (key: string, newText: string) => {
      setSubtaskData((prevData) => prevData.map((dataItem) => (dataItem.key === key ? { ...dataItem, label: newText } : dataItem)));
    };

    return (
      <View className="relative">
        <ScaleDecorator>
          <View className="flex w-full max-h-[50] bg-gray-600 scroll">
            <TouchableOpacity
              delayLongPress={250}
              onLongPress={drag}
              className="h-20"
            >
              <MaterialIcons
                name="drag-indicator"
                size={32}
                color="black"
                className="absolute opacity-50 left-[5] top-[4] bottom-0 z-[50]"
              />
              <Input
                className="text-white !text-xl text-left ml-12 mr-[88] !bg-transparent bg-red-500"
                editable={true}
                onChangeText={(text) => handleTextChange(item.key, text)}
              >
                {item.label}
              </Input>
            </TouchableOpacity>
            <Checkbox
              className="absolute right-[48] top-[2] border-2 p-5"
              checked={item.completed}
              onCheckedChange={(checked) => setSubtaskData((prevData) => prevData.map((dataItem) => (dataItem.key === item.key ? { ...dataItem, completed: checked } : dataItem)))}
            />
            <Button
              className="absolute right-0 bg-red-500"
              onPress={() => handleRemoveItem(item.key)}
            >
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
        <View className="w-full">
          <Select
            onValueChange={(value) => {
              setSelectedProject(value);
              console.log(selectedProject);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder="Pick a project"
              />
            </SelectTrigger>
            <SelectContent className="w-[250px]">
              <SelectGroup>
                <SelectLabel>Your projects</SelectLabel>
                {parsedProjects.map((project) => (
                  <SelectItem
                    key={project.projectId}
                    label={project.name}
                    value={project}
                  />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedProject.value.projectId && (
            <>
              <Separator className="my-5"/>

              <View className="gap-2">
                <Input
                  placeholder="Task name"
                  value={taskName}
                  onChangeText={setTaskName}
                  keyboardType="default"
                />
                <Textarea
                  className="max-h-[120]"
                  numberOfLines={2}
                  placeholder="Task description (optional)"
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  keyboardType="default"
                />

                <View>
                  <Label nativeID="priority-level">Priority level</Label>
                  <Select
                    aria-labelledby="priority-level"
                    onValueChange={(value) => {
                      setPriorityLevel(value);
                    }}
                    onLayout={() => setPriorityLevel(DEFAULT_PRIORITY_LEVEL)}
                    defaultValue={DEFAULT_PRIORITY_LEVEL}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Set priority level"
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        <SelectItem
                          key={1}
                          label="1 (highest)"
                          value="1"
                        />
                        <SelectItem
                          key={2}
                          label="2"
                          value="2"
                        />
                        <SelectItem
                          key={3}
                          label="3"
                          value="3"
                        />
                        <SelectItem
                          key={4}
                          label="4"
                          value="4"
                        />
                        <SelectItem
                          key={5}
                          label="5 (lowest)"
                          value="5"
                        />
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                <View>
                  <Label nativeID="task-type">Task type</Label>
                  <Select
                    aria-labelledby="task-type"
                    onValueChange={(value) => {
                      setTaskType(value);
                    }}
                    onLayout={() => setTaskType(DEFAULT_TASK_TYPE)}
                    defaultValue={DEFAULT_TASK_TYPE}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Set priority level"
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        <SelectItem
                          key={1}
                          label="New feature"
                          value="new-feature"
                        />
                        <SelectItem
                          key={2}
                          label="Change"
                          value="change"
                        />
                        <SelectItem
                          key={3}
                          label="Bug fix"
                          value="bug-fix"
                        />
                        <SelectItem
                          key={4}
                          label="Testing"
                          value="testing"
                        />
                        <SelectItem
                          key={5}
                          label="Documentation"
                          value="documentation"
                        />
                        <SelectItem
                          key={6}
                          label="Research"
                          value="research"
                        />
                        <SelectItem
                          key={7}
                          label="Other"
                          value="other"
                        />
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                <Separator />

                <Button onPress={() => setSubtaskData([...subtaskData, { key: Crypto.randomUUID(), label: "Edit me!", completed: false }])}>
                  <Text>Add new subtask</Text>
                </Button>
                <DraggableFlatList
                  data={subtaskData}
                  onDragEnd={({ data }) => {
                    setSubtaskData(data);
                    console.log("new data:", data);
                  }}
                  keyExtractor={(item) => item.key}
                  renderItem={renderItem}
                />

                <Separator className="my-5" />

                <Button
                  onPress={() => {
                    //TODO: implement proper error handling with user-facing alerts
                    try {
                      createTask(selectedProject.value.projectId, taskName, taskDescription, priorityLevel.value, taskType.value, subtaskData).then(() => {
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
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
