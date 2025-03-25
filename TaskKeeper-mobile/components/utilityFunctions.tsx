import { useNavigation } from "expo-router";
import { useState } from "react";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Button } from "./ui/button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./ui/text";
import { useTheme } from "@react-navigation/native";

export const countSubtasks = (subtasks: Array<{ completed: boolean }>) => {
  let completedCount = 0;
  let totalCount = subtasks.length;

  for (const subtask of subtasks) {
    if (subtask.completed) {
      completedCount++;
    }
  }

  return {
    total: totalCount,
    completed: completedCount,
  };
};

type DropdownOption =
  | {
      isCustom: true;
      customOption: any;
      label?: never;
      onPress?: never;
    }
  | {
      isCustom: false;
      customOption?: never;
      label: string;
      onPress: () => void;
    };

export const useHeaderDropdown = (options: DropdownOption[]) => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const navigation = useNavigation();

  const dropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="p-3 items-center justify-center rounded-none bg-transparent">
          <Entypo
            name="dots-three-vertical"
            size={22}
            color={useTheme().colors.primary}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="shadow-lg"
        insets={contentInsets}
      >
        <View className="rounded-lg w-48">
          {options.map((option, index) => (
            <View key={index}>
              {option.isCustom ? (
                option.customOption
              ) : (
                <DropdownMenuItem
                  onPress={() => {
                    option.onPress();
                  }}
                  className=""
                >
                  <Text>{option.label}</Text>
                </DropdownMenuItem>
              )}

              {index < options.length - 1 && <DropdownMenuSeparator />}
            </View>
          ))}
        </View>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerRight: () => dropdown });
  }, [navigation, options]);
};

export const getCurrentRelease = (
  projectId: string,
  releases: {
    releaseId: string;
    projectId: string;
    name: string;
    status: string;
    actualEndDate: string;
    plannedEndDate: string;
  }[]
) => {
  // returns ONE release, prioritizing started > planned > finished
  // for 'started', there's only max 1 release
  // for 'finished', prioritizes the most recent by actualEndDate
  // for 'planned', prioritizes the most recent by plannedEndDate
  // Find the 'started' release first (there should be only one)
  const startedRelease = releases.find((release) => release.projectId === projectId && release.status === "started");
  if (startedRelease) return startedRelease;

  // Find the most recent 'planned' release by plannedEndDate
  const plannedReleases = releases
    .filter((release) => release.projectId === projectId && release.status === "planned")
    .sort((a, b) => new Date(b.plannedEndDate).getTime() - new Date(a.plannedEndDate).getTime());
  if (plannedReleases.length > 0) return plannedReleases[0];

  // Find the most recent 'finished' release by actualEndDate
  const finishedReleases = releases
    .filter((release) => release.projectId === projectId && release.status === "finished")
    .sort((a, b) => new Date(b.actualEndDate).getTime() - new Date(a.actualEndDate).getTime());
  if (finishedReleases.length > 0) return finishedReleases[0];

  // Return null if no releases are found
  return null;
};