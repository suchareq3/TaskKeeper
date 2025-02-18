import { Link, router, useLocalSearchParams } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import ProjectTile from "@/components/ProjectTile";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskTile from "@/components/TaskTile";
import { countSubtasks } from "@/components/utilityFunctions";
import i18n from "@/components/translations";
import { getCurrentRelease } from "@/components/utilityFunctions";

export default function ReleaseTasks() {
  const { releaseId, releaseName } = useLocalSearchParams();

  const [tasks, setTasks] = useState<
    {
      taskId: string;
      taskName: string;
      taskDescription: string;
      projectId: string;
      releaseId: string;
      priorityLevel: string;
      taskStatus: string;
      type: string;
      subtasks: Array<any>;
    }[]
  >([]);

  const fetchData = async () => {
    try {
      const loadedTasks = await fbFunctions.loadReleaseTasks(releaseId as string);
      setTasks(loadedTasks || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setTasks([]); // Ensure tasks is always an array
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView className="flex-1 justifyitems-center bg-[#25292e] p-5 gap-5">
      <Button
        onPress={() => {
          fetchData();
        }}
      >
        <Text>{i18n.t("app_tabs_tasks_button_refreshTasks")}</Text>
      </Button>
      <View className="mb-4 gap-3">
        <Text className="text-2xl font-bold">{i18n.t("app_innerScreens_releaseTasks_text_releasesTasks", { variable: releaseName })}:</Text>
        {tasks.map((task, taskIndex) => {
          const counts = countSubtasks(task.subtasks);
          return (
            <TaskTile
              key={taskIndex}
              id={task.taskId}
              title={task.taskName}
              subtaskDoneCount={counts.completed}
              subtaskTodoCount={counts.total}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}
