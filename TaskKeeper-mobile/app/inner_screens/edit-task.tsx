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

const PRIORITY_OPTIONS = [
  { value: "1", label: "1 (highest)" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5 (lowest)" },
];

const TASK_TYPE_OPTIONS = [
  { value: "new-feature", label: "New feature" },
  { value: "change", label: "Change" },
  { value: "bug-fix", label: "Bug fix" },
  { value: "testing", label: "Testing" },
  { value: "documentation", label: "Documentation" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

const TASK_STATUS_OPTIONS = [
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
];

export default function EditTask() {
  const { editTask } = useSession();
  const { taskId } = useLocalSearchParams();

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priorityLevel, setPriorityLevel] = useState(PRIORITY_OPTIONS[2]);
  const [taskType, setTaskType] = useState(TASK_TYPE_OPTIONS[0]);
  const [taskStatus, setTaskStatus] = useState(TASK_STATUS_OPTIONS[0]);
  const [subtasks, setSubtasks] = useState<Array<{ key: string; label: string; completed: boolean }>>([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        const task = tasks.find((t) => t.taskId === taskId);

        if (task) {
          setTaskName(task.taskName);
          setTaskDescription(task.taskDescription);

          setPriorityLevel(PRIORITY_OPTIONS.find((p) => p.value === task.priorityLevel) || PRIORITY_OPTIONS[2]);
          setTaskType(TASK_TYPE_OPTIONS.find((t) => t.value === task.taskType) || TASK_TYPE_OPTIONS[0]);
          setTaskStatus(TASK_STATUS_OPTIONS.find((s) => s.value === task.taskStatus) || TASK_STATUS_OPTIONS[0]);
          
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

      ToastAndroid.show("Task updated successfully!", ToastAndroid.SHORT);
      router.back();
    } catch (error) {
      console.error("Failed to edit task: ", error);
      ToastAndroid.show("Failed to update task", ToastAndroid.SHORT);
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
            placeholder="Task name"
            value={taskName}
            onChangeText={setTaskName}
          />

          <Textarea
            placeholder="Task description"
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
                <SelectValue placeholder="Priority level" />
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
                <SelectValue placeholder="Task type" />
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
                <SelectValue placeholder="Task status" />
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

          <Separator />

          <Text className="text-lg font-semibold">Subtasks</Text>
          <DraggableFlatList
            data={subtasks}
            onDragEnd={({ data }) => setSubtasks(data)}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
          />

          <Button onPress={() => setSubtasks((prev) => [...prev, { key: Crypto.randomUUID(), label: "New subtask", completed: false }])}>
            <Text>Add Subtask</Text>
          </Button>

          <Button onPress={handleEditTask}>
            <Text>Save Changes</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
