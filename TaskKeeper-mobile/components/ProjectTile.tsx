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
import i18n from "@/components/translations";
import { useTheme } from "@react-navigation/native";

export default function ProjectTile({
  id,
  title,
  description,
  githubUrl,
  members,
  releaseName,
  releaseStatus,
}: {
  id: string;
  title: string;
  description: string;
  githubUrl: string;
  members: { [uid: string]: { [permission: string]: boolean } };
  releaseName: string;
  releaseStatus: string;
}) {
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
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription className="text-lg">{description}</CardDescription>}
        </CardHeader>
        <CardFooter className="flex flex-col items-start">
          <Text>{githubUrl}</Text>
          <Text>
            {i18n.t("components_projectTile_text_releaseName")}: {releaseName}
          </Text>
          <Text>
            {i18n.t("components_projectTile_text_releaseStatus")}: {releaseStatus}
          </Text>
        </CardFooter>
      </View>
      <View>
        <CardHeader className="items-end p-0">
          <DropdownMenu className="flex">
            <DropdownMenuTrigger asChild>
              <Button
                size={null}
                className="p-3 items-center justify-center rounded-none bg-transparent"
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
                  <Text>{i18n.t("components_projectTile_dropdownMenuItem_editProject")}</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => router.push({ pathname: "/inner_screens/project-releases", params: { projectId: id } })}>
                  <Text>{i18n.t("components_projectTile_dropdownMenuItem_projectReleases")}</Text>
                </DropdownMenuItem>
              </View>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </View>
    </Card>
  );
}
