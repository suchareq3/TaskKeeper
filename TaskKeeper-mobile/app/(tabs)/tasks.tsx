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
  const fetchProjects = async () => {
    try {
      //cached version of the data, useful for laggy networks
      const cachedProjects = await AsyncStorage.getItem("projects");
      if (cachedProjects) {
        setProjects(JSON.parse(cachedProjects));
      }

      const loadedProjects = await fbFunctions.loadUserProjects();
      setProjects(loadedProjects);
      AsyncStorage.setItem("projects", JSON.stringify(loadedProjects));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fbFunctions.loadUserProjects]);

  return (
    <ScrollView className="flex-1 justifyitems-center bg-[#25292e] p-5">
      <View>
        <Text className="text-2xl">Your tasks: </Text>
      </View>
      <Button
        onPress={() => {
          fetchProjects();
        }}
      >
        <Text>Refresh tasks</Text>
      </Button>
      {projects.map((project, index) => (
        <TaskTile
          key={index}
          id={"123"}
          title={"Sweep the floor sweep the floor sweep the floor the floor the floor sweep"}
          subtaskDoneCount={1}
          subtaskTodoCount={6}
        />
      ))}
      <Button
        onPress={() => {
          router.push("/inner_screens/add-task");
        }}
      >
        <Text>Add new task</Text>
      </Button>
    </ScrollView>
  );
}
