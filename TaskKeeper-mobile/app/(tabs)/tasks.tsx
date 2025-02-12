import { Link, router } from "expo-router";
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

export default function TasksScreen() {
  const [projects, setProjects] = useState<
    {
      projectId: string;
      name: string;
      description: string;
      githubUrl: string;
      memberUids: Array<string>;
    }[]
  >([]);

  const [tasks, setTasks] = useState<
    {
      taskId: string;
      taskName: string;
      taskDescription: string;
      projectId: string;
      priorityLevel: string;
      taskStatus: string;
      type: string;
      subtasks: Array<any>;
    }[]
  >([]);

  const [groupedTasks, setGroupedTasks] = useState<{
    [projectId: string]: {
      project: {
        projectId: string;
        name: string;
        description: string;
        githubUrl: string;
        memberUids: Array<string>;
      };
      tasks: Array<{
        taskId: string;
        taskName: string;
        taskDescription: string;
        projectId: string;
        priorityLevel: string;
        taskStatus: string;
        type: string;
        subtasks: Array<any>;
      }>;
    };
  }>({});

  const fetchData = async () => {
    try {
      // Fetch projects
      const cachedProjects = await AsyncStorage.getItem("projects");
      if (cachedProjects) {
        setProjects(JSON.parse(cachedProjects));
      }

      const loadedProjects = await fbFunctions.loadUserProjects();
      setProjects(loadedProjects || []);
      AsyncStorage.setItem("projects", JSON.stringify(loadedProjects));

      // Fetch tasks
      const cachedTasks = await AsyncStorage.getItem("tasks");
      if (cachedTasks) {
        setTasks(JSON.parse(cachedTasks));
      }

      const loadedTasks = await fbFunctions.loadUserTasks();
      setTasks(loadedTasks || []);
      AsyncStorage.setItem("tasks", JSON.stringify(loadedTasks));

      // Group tasks by projectId using the fetched projects
      const grouped: {
        [projectId: string]: {
          project: {
            projectId: string;
            name: string;
            description: string;
            githubUrl: string;
            memberUids: Array<string>;
          };
          tasks: Array<{
            taskId: string;
            taskName: string;
            taskDescription: string;
            projectId: string;
            priorityLevel: string;
            taskStatus: string;
            type: string;
            subtasks: Array<any>;
          }>;
        };
      } = {};

      for (const task of loadedTasks) {
        if (!grouped[task.projectId]) {
          // Find the project details from the fetched projects array
          const project = loadedProjects.find((p) => p.projectId === task.projectId);

          if (!project) {
            console.warn(`Project not found for task: ${task.taskId}`);
            continue; // Skip this task if the project is not found
          }

          grouped[task.projectId] = {
            project,
            tasks: [],
          };
        }

        // Add the task to the corresponding project
        grouped[task.projectId].tasks.push(task);
      }

      setGroupedTasks(grouped);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setTasks([]); // Ensure tasks is always an array
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView className="flex-1 justifyitems-center bg-[#25292e] p-5">
      <View>
        <Text className="text-2xl">{i18n.t("app_tabs_tasks_text_yourTasks")}:</Text>
      </View>
      <Button
        onPress={() => {
          fetchData();
        }}
      >
        <Text>{i18n.t("app_tabs_tasks_button_refreshTasks")}</Text>
      </Button>
      {Object.values(groupedTasks).map((group, index) => (
        <View
          key={index}
          className="mb-4"
        >
          <Text className="text-xl font-bold">{i18n.t("app_tabs_tasks_text_project") + ": " + group.project.name}</Text>
          {group.tasks.map((task, taskIndex) => {
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
      ))}
      <Button onPress={() => router.push({ pathname: "/inner_screens/add-task", params: { projects: JSON.stringify(projects) } })}>
        <Text>{i18n.t("app_tabs_tasks_button_addTask")}</Text>
      </Button>
    </ScrollView>
  );
}
