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
import { Timestamp } from "@react-native-firebase/firestore";

export default function NotificationTile({ title, body, createdOn }: { title: string; body: string; createdOn: Timestamp }) {
  return (
    <Card className="p-0 flex-row p-0">
      <View className="flex-1">
        <CardHeader className="gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-lg">{createdOn?.toDate().toLocaleString()}</CardDescription>
          <Text className="text-lg">{body}</Text>
        </CardHeader>

      </View>
    </Card>
  );
}
