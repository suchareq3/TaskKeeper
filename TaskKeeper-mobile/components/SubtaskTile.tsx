import { View } from "react-native";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Entypo from "@expo/vector-icons/Entypo";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
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
} from "./ui/dropdown-menu";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Progress } from "./ui/progress";
import { useTheme } from "@react-navigation/native";

export default function SubtaskTile({ id, title, subtaskDoneCount, subtaskTodoCount }: { id: string; title: string; subtaskDoneCount: number; subtaskTodoCount: number }) {

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <Card className="p-0 flex-row p-0">
      <View className="flex-1">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row ">
          <View className="gap-0">
            <Text className="text-3xl font-extrabold">{`${subtaskDoneCount} / ${subtaskTodoCount}`}</Text>
            <Text className="text-lg">tasks done</Text>
          </View>
          <Progress
            value={calculatePercentage(subtaskDoneCount, subtaskTodoCount)}
            className="flex-1 relative top-2"
          />
        </CardContent>
      </View>
      <View>
        <CardHeader className="items-end p-0">
          <DropdownMenu className="flex">
            <DropdownMenuTrigger asChild>
              <Button
                size={null}
                className="p-3   items-center justify-center rounded-none bg-transparent"
              >
                <Entypo
                  name="dots-three-vertical"
                  size={22}
                  color={useTheme().colors.primary}
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent insets={contentInsets}>
              <View>
                <DropdownMenuItem onPress={() => router.push({ pathname: "/inner_screens/edit-project", params: { projectId: id } })}>
                  <Text>Edit task</Text>
                </DropdownMenuItem>
              </View>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </View>
    </Card>
  );
}

const calculatePercentage = (subtaskDoneCount: number, subtaskTodoCount: number) => {
  if (subtaskTodoCount === 0) {
    return 0; // Avoid division by zero
  }
  return Math.ceil((subtaskDoneCount / subtaskTodoCount) * 100);
};
