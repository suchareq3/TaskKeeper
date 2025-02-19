import { Link, router } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import ProjectTile from "@/components/ProjectTile";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/components/translations";
import { getCurrentRelease } from "@/components/utilityFunctions";

export default function NotificationsScreen() {
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
  const [releases, setReleases] = useState<
    {
      releaseId: string;
      projectId: string;
      name: string;
      status: string;
    }[]
  >([]);
  const fetchData = async () => {
    try {
      // cached version of the data, useful for laggy networks
      // NOTE: this could potentially cause a large cache size if the user has a lot of projects or releases
      const cachedProjects = await AsyncStorage.getItem("projects");
      if (cachedProjects) {
        setProjects(JSON.parse(cachedProjects));
      }
      const loadedProjects = await fbFunctions.loadUserProjects();
      setProjects(loadedProjects);
      AsyncStorage.setItem("projects", JSON.stringify(loadedProjects));

      const cachedReleases = await AsyncStorage.getItem("releases");
      if (cachedReleases) {
        setReleases(JSON.parse(cachedReleases));
      }
      const loadedReleases = await fbFunctions.getAllReleases();
      setReleases(loadedReleases || []);
      AsyncStorage.setItem("releases", JSON.stringify(loadedReleases));
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fbFunctions.loadUserProjects]);

  return (
    <ScrollView className="flex-1 justifyitems-center bg-background p-5">
      <View className="gap-1">
        <View>
          <Text className="text-2xl">{i18n.t("app_tabs_projects_text_yourProjects")}:</Text>
        </View>
        <Button
          onPress={() => {
            fetchData();
          }}
        >
          <Text>{i18n.t("app_tabs_projects_button_refreshProjects")}</Text>
        </Button>
        {projects.map((project, index) => {
          const currentRelease = getCurrentRelease(project.projectId, releases);
          return (
            <ProjectTile
              key={index}
              id={project.projectId}
              title={project.name}
              description={project.description}
              githubUrl={project.githubUrl}
              members={project.members}
              releaseName={currentRelease?.name}
              releaseStatus={currentRelease?.status}
            />
          );
        })}
        <Button
          onPress={() => {
            router.push("/inner_screens/add-project");
          }}
        >
          <Text>{i18n.t("app_tabs_projects_button_addProject")}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
