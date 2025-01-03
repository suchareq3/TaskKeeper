import { Link, router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import ProjectTile from "@/components/ProjectTile";
import { Button } from "@/components/ui/button";

export default function ProjectsScreen() {
  return (
    <View className="flex-1 justifyitems-center bg-[#25292e] p-5">
      <View>
        <Text className="text-2xl">Your projects: </Text>
      </View>
      {/* TODO: take info from firebase and loop over it */}
      <ProjectTile title="Project name" description="project description" githubUrl="https://github.com/suchareq3/covid-vaccination-map" />
      <Button
        onPress={() => {
          router.push("/inner_screens/add-project");
        }}
      >
        <Text>Add new project</Text>
      </Button>
    </View>
  );
}
