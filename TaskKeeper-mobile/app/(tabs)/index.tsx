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
import { getCurrentRelease } from "@/components/utilityFunctions";

export default function TasksScreen() {
  const [projects, setProjects] = useState<
    {
      projectId: string;
      name: string;
      description: string;
      githubUrl: string;
      members: {
        [uid: string]: {
          [permission: string]: boolean;
        };
      };
    }[]
  >([]);

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

  const [groupedTasks, setGroupedTasks] = useState<{
    [projectId: string]: {
      project: {
        projectId: string;
        name: string;
        description: string;
        githubUrl: string;
        members: {
          [uid: string]: {
            [permission: string]: boolean;
          };
        };
      };
      tasks: Array<{
        taskId: string;
        taskName: string;
        taskDescription: string;
        projectId: string;
        releaseId: string;
        priorityLevel: string;
        taskStatus: string;
        type: string;
        subtasks: Array<any>;
      }>;
    };
  }>({});

  const [releases, setReleases] = useState<
    {
      releaseId: string;
      projectId: string;
      name: string;
      status: string;
      actualEndDate: string;
      plannedEndDate: string;
    }[]
  >([]);

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
            members: {
              [uid: string]: {
                [permission: string]: boolean;
              };
            };
          };
          tasks: Array<{
            releaseId: string;
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

      const cachedReleases = await AsyncStorage.getItem("releases");
      if (cachedReleases) {
        setReleases(JSON.parse(cachedReleases));
      }

      const loadedReleases = await fbFunctions.getAllReleases();
      setReleases(loadedReleases || []);
      AsyncStorage.setItem("releases", JSON.stringify(loadedReleases));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setTasks([]); // Ensure tasks is always an array
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    // TODO: bottom nav tabs partially hide the content, find a way to fix this
    <ScrollView className="flex-1 bg-background p-5" contentContainerClassName="justify-center">
      <Button className="mb-4"
        onPress={() => {
          fetchData();
        }}
      >
        <Text>{i18n.t("app_tabs_tasks_button_refreshTasks")}</Text>
      </Button>
      {Object.values(groupedTasks).map((group, index) => {
        const currentRelease = getCurrentRelease(group.project.projectId, releases);
        console.log("currentRelease:", group.project.projectId);

        return (
          <View
            key={index}
            className="mb-4 gap-1"
          >
            <Text className="text-2xl font-bold">{i18n.t("app_tabs_tasks_text_project") + ": " + group.project.name}</Text>
            {currentRelease && <Text className="">{`${i18n.t("app_tabs_tasks_text_currentRelease")}: ${currentRelease.name} (${currentRelease.status})`}</Text>}
            {group.tasks.map((task, taskIndex) => {
              if (currentRelease?.releaseId === task.releaseId) {
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
              }
            })}
          </View>
        );
      })}
      <Button onPress={() => router.push({ pathname: "/inner_screens/add-task", params: { projects: JSON.stringify(projects) } })}>
        <Text>{i18n.t("app_tabs_tasks_button_addTask")}</Text>
      </Button>
    </ScrollView>
  );
}
