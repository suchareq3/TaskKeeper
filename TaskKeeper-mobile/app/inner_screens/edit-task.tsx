import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, KeyboardAvoidingView, ToastAndroid } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Crypto from "expo-crypto";
import i18n from "@/components/translations";
import { PRIORITY_OPTIONS, TASK_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from "@/components/constants";


export default function EditTask() {
  const { editTask } = useSession();
  const { taskId } = useLocalSearchParams();

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priorityLevel, setPriorityLevel] = useState(PRIORITY_OPTIONS[2]);
  const [taskType, setTaskType] = useState(TASK_TYPE_OPTIONS[0]);
  const [taskStatus, setTaskStatus] = useState(TASK_STATUS_OPTIONS[0]);
  const [subtasks, setSubtasks] = useState<Array<{ key: string; label: string; completed: boolean }>>([]);

  // TODO: this takes roughly ~3x longer to load than 'edit-project.tsx'. Find out why & apply some optimizations if possible
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        const task = tasks.find((t) => t.taskId === taskId);

        if (task) {
          setTaskName(task.taskName);
          setTaskDescription(task.taskDescription);

          setPriorityLevel(PRIORITY_OPTIONS.find((p) => p.value === task.priorityLevel) || { value: "", label: "" });
          setTaskType(TASK_TYPE_OPTIONS.find((t) => t.value === task.taskType) || { value: "", label: "" });
          setTaskStatus(TASK_STATUS_OPTIONS.find((s) => s.value === task.taskStatus) || { value: "", label: "" });

          setSubtasks(task.subtasks || []);
        }
      } catch (error) {
        console.error("Failed to fetch task: ", error);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleEditTask = async () => {
    try {
      editTask(taskId as string, taskName, taskDescription, taskStatus.value, taskType.value, priorityLevel.value, subtasks);

      ToastAndroid.show(i18n.t("app_innerScreens_editTask_toast_taskUpdateSuccess"), ToastAndroid.SHORT);
      router.back();
    } catch (error) {
      console.error("Failed to edit task: ", error);
      ToastAndroid.show(i18n.t("app_innerScreens_editTask_toast_taskUpdateFailed"), ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item, drag }: RenderItemParams<{ key: string; label: string; completed: boolean }>) => (
    <ScaleDecorator>
      <View className="flex-row items-center mb-2">
        <TouchableOpacity
          onLongPress={drag}
          className="mr-2"
        >
          <MaterialIcons
            name="drag-indicator"
            size={24}
            color="gray"
          />
        </TouchableOpacity>
        <Input
          className="flex-1"
          value={item.label}
          onChangeText={(text) => setSubtasks((prev) => prev.map((sub) => (sub.key === item.key ? { ...sub, label: text } : sub)))}
        />
        <Checkbox
          checked={item.completed}
          onCheckedChange={(checked) => setSubtasks((prev) => prev.map((sub) => (sub.key === item.key ? { ...sub, completed: !!checked } : sub)))}
          className="ml-2"
        />
        <Button
          variant="destructive"
          className="ml-2"
          onPress={() => setSubtasks((prev) => prev.filter((sub) => sub.key !== item.key))}
        >
          <MaterialIcons
            name="delete"
            size={20}
            color="white"
          />
        </Button>
      </View>
    </ScaleDecorator>
  );

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 w-full p-5">
        <View className="gap-4">
          <Input
            placeholder={i18n.t("app_innerScreens_editTask_input_taskNamePlaceholder")}
            value={taskName}
            onChangeText={setTaskName}
          />

          <Textarea
            placeholder={i18n.t("app_innerScreens_editTask_input_taskDescriptionPlaceholder")}
            value={taskDescription}
            onChangeText={setTaskDescription}
          />

          <View>
            <Select
              defaultValue={priorityLevel}
              value={priorityLevel}
              onValueChange={(value) => setPriorityLevel(value!)}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder={i18n.t("app_innerScreens_editTask_select_priorityLevelPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
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
            <Select
              defaultValue={taskType}
              value={taskType}
              onValueChange={(value) => setTaskType(value!)}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder={i18n.t("app_innerScreens_editTask_select_taskTypePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
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

          <View>
            <Select
              defaultValue={taskStatus}
              value={taskStatus}
              onValueChange={(value) => setTaskStatus(value!)}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder={i18n.t("app_innerScreens_editTask_select_taskStatusPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TASK_STATUS_OPTIONS.map((option) => (
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

          <Separator className="bg-primary my-5" />

          <Text className="text-lg font-semibold">{i18n.t("app_innerScreens_editTask_text_subtasks")}</Text>

          {/* TODO: move all this 'subtasks' stuff to a new original component & re-use it in add-task.tsx */}
          <DraggableFlatList
            data={subtasks}
            onDragEnd={({ data }) => setSubtasks(data)}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
          />

          <Button onPress={() => setSubtasks((prev) => [...prev, { key: Crypto.randomUUID(), label: i18n.t("app_innerScreens_editTask_text_newSubtaskTitle"), completed: false }])}>
            <Text>{i18n.t("app_innerScreens_editTask_button_addSubtask")}</Text>
          </Button>

          <Button onPress={handleEditTask}>
            <Text>{i18n.t("app_innerScreens_editTask_button_saveChanges")}</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
