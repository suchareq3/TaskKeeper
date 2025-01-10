import { Link, router } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import ProjectTile from "@/components/ProjectTile";
import { Button } from "@/components/ui/button";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<{
    projectId: string; name: string; description: string; githubUrl: string 
}[]>([]);
  const fetchProjects = async () => {
    try {
      const loadedProjects = await fbFunctions.loadUserProjects();
      setProjects(loadedProjects);
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
        <Text className="text-2xl">Your projects: </Text>
      </View>
      <Button
        onPress={() => {
          fetchProjects()
        }}
      >
        <Text>Refresh projects</Text>
      </Button>
      {projects.map((project, index) => (
        
        <ProjectTile
          key={index}
          id={project.projectId}
          title={project.name}
          description={project.description}
          githubUrl={project.githubUrl}
        />
        
      ))}
      <Button
        onPress={() => {
          router.push("/inner_screens/add-project");
        }}
      >
        <Text>Add new project</Text>
      </Button>
    </ScrollView>
  );
}