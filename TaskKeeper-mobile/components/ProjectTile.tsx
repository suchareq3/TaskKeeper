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

export default function ProjectTile({ id, title, description, githubUrl, memberUids }: { id: string; title: string; description: string; githubUrl: string; memberUids: string[]; }) {
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
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col items-start">
          <Text>ID: {id}</Text>
          <Text>{githubUrl}</Text>
          {/* TODO: replace member UIDs here with member avatars */}
          <Text>Members: {memberUids.join(", ")}</Text>
        </CardFooter>
      </View>
      <View>
        <CardHeader className="items-end p-0">
          <DropdownMenu className="flex">
            <DropdownMenuTrigger style={{borderColor: "red", borderWidth: 2}} asChild>
              <Button size={null} className="p-3   items-center justify-center rounded-none bg-transparent">
                <Entypo name="dots-three-vertical" size={22} color="white" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent insets={contentInsets}>
              <View>
                <DropdownMenuItem>
                  <Text>Edit project</Text>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Text>Add/remove members</Text>
                </DropdownMenuItem>
              </View>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </View>
    </Card>
  );
}
