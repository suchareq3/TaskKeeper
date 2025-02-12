import { View, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Crypto from "expo-crypto";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import i18n from "@/components/translations";
import { PRIORITY_OPTIONS, TASK_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from "@/components/constants";

export default function CreateTask() {
  const { createTask } = useSession();
  const { projects } = useLocalSearchParams();
  const parsedProjects = projects ? JSON.parse(projects as string) : [];

  const [selectedProject, setSelectedProject] = useState({ value: { projectId: "" }, label: "" });
  const [priorityLevel, setPriorityLevel] = useState(PRIORITY_OPTIONS[2]);
  const [taskType, setTaskType] = useState(TASK_TYPE_OPTIONS[0]);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [subtaskData, setSubtaskData] = useState<Array<{ key: string; label: string; completed: boolean }>>([]);

  const renderItem = ({ item, drag }: RenderItemParams<{ key: string; label: string; completed: boolean }>) => {
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
              <Text>[DNT]X</Text>
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
                placeholder={i18n.t("app_innerScreens_addTask_select_pickProjectPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent className="w-[250px]">
              <SelectGroup>
                <SelectLabel>{i18n.t("app_innerScreens_addTask_select_pickProjectLabel")}</SelectLabel>
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
              <Separator className="bg-primary my-5" />

              <View className="gap-2">
                <Input
                  placeholder={i18n.t("app_innerScreens_addTask_input_taskNamePlaceholder")}
                  value={taskName}
                  onChangeText={setTaskName}
                  keyboardType="default"
                />
                <Textarea
                  className="max-h-[120]"
                  numberOfLines={2}
                  placeholder={i18n.t("app_innerScreens_addTask_input_taskDescriptionPlaceholder")}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  keyboardType="default"
                />

                <View>
                  <Label nativeID="priority-level">{i18n.t("app_innerScreens_addTask_select_priorityLevelLabel")}</Label>
                  <Select
                    aria-labelledby="priority-level"
                    onValueChange={(value) => {
                      setPriorityLevel(value);
                    }}
                    onLayout={() => setPriorityLevel(PRIORITY_OPTIONS[2])}
                    defaultValue={PRIORITY_OPTIONS[2]}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder={i18n.t("app_innerScreens_addTask_select_priorityLevelPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        {PRIORITY_OPTIONS.map((option) => (
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

                <View>
                  <Label nativeID="task-type">{i18n.t("app_innerScreens_addTask_select_taskTypeLabel")}</Label>
                  <Select
                    aria-labelledby="task-type"
                    onValueChange={(value) => {
                      setTaskType(value);
                    }}
                    onLayout={() => setTaskType(TASK_TYPE_OPTIONS[0])}
                    defaultValue={TASK_TYPE_OPTIONS[0]}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder={i18n.t("app_innerScreens_addTask_select_taskTypePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        {TASK_TYPE_OPTIONS.map((option) => (
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

                <Button onPress={() => setSubtaskData([...subtaskData, { key: Crypto.randomUUID(), label: "Edit me!", completed: false }])}>
                  <Text>{i18n.t("app_innerScreens_addTask_button_createSubtask")}</Text>
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

                <Separator className="bg-primary my-5" />

                <Button
                  onPress={() => {
                    try {
                      createTask(selectedProject.value.projectId, taskName, taskDescription, priorityLevel.value, taskType.value, subtaskData).then(() => {
                        router.back();
                      });
                    } catch (e) {
                      console.log("smth went wrong: ", e);
                    }
                  }}
                >
                  <Text>{i18n.t("app_innerScreens_addTask_button_createTask")}</Text>
                </Button>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
