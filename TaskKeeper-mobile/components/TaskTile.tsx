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
import i18n from "@/components/translations";

export default function TaskTile({ id, title, subtaskDoneCount, subtaskTodoCount }: { id: string; title: string; subtaskDoneCount: number; subtaskTodoCount: number }) {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <Card className="p-0 flex-row p-0">
      <View className="bg-red-500 flex-1">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex  ">
          <View className="gap-5 flex flex-row">
            <Text className="text-3xl font-extrabold">{`${subtaskDoneCount} / ${subtaskTodoCount}`}</Text>
            <Progress
              value={calculatePercentage(subtaskDoneCount, subtaskTodoCount)}
              className="flex-1 relative top-2"
            />
          </View>
          <Text className="text-lg font-medium">{i18n.t("components_taskTile_text_subtasksDone")}</Text>
        </CardContent>
      </View>
      <View>
        <CardHeader className="items-end p-0">
          <DropdownMenu className="flex">
            <DropdownMenuTrigger
              style={{ borderColor: "red", borderWidth: 2 }}
              asChild
            >
              <Button
                size={null}
                className="p-3   items-center justify-center rounded-none bg-transparent"
              >
                <Entypo
                  name="dots-three-vertical"
                  size={22}
                  color="white"
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent insets={contentInsets}>
              <View>
                <DropdownMenuItem onPress={() => router.push({ pathname: "/inner_screens/edit-task", params: { taskId: id } })}>
                  <Text>{i18n.t("components_taskTile_dropdownMenuItem_editTask")}</Text>
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
