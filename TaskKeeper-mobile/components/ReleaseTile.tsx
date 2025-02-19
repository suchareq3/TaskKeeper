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
import { Timestamp } from "@react-native-firebase/firestore";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useSession } from "./AuthContext";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { useTheme } from "@react-navigation/native";

export default function ReleaseTile({
  isManager,
  projectId,
  releaseId,
  name,
  description,
  startDate,
  plannedEndDate,
  actualEndDate,
  status,
}: {
  isManager: boolean;
  projectId: string;
  releaseId: string;
  name: string;
  description: string;
  startDate: Timestamp | null;
  plannedEndDate: Timestamp | null;
  actualEndDate: Timestamp | null;
  status: string;
}) {
  const { deleteTask } = useSession();
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  console.log("plannedEndDate:", plannedEndDate);
  return (
    <Card className="p-0 flex-row p-0">
      <View className="flex-1">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription className="text-2xl">{i18n.t(`components_constants_const_releaseStatusOptionsLabel${status.charAt(0).toUpperCase() + status.slice(1)}`)}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col items-start">
          {description && (
            <Text>
              {i18n.t("components_releaseTile_text_description")}: {description}
            </Text>
          )}
          {startDate && (
            <Text>
              {i18n.t("components_releaseTile_text_startDate")}: {startDate?.toDate().toLocaleDateString()}
            </Text>
          )}
          {plannedEndDate && (
            <Text>
              {i18n.t("components_releaseTile_text_plannedEndDate")}: {plannedEndDate?.toDate().toLocaleDateString()}
            </Text>
          )}
          {actualEndDate && (
            <Text>
              {i18n.t("components_releaseTile_text_actualEndDate")}: {actualEndDate?.toDate().toLocaleDateString()}
            </Text>
          )}
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
                <DropdownMenuItem onPress={() => router.push({ pathname: "/inner_screens/release-tasks", params: { releaseId: releaseId, releaseName: name } })}>
                  <Text>{i18n.t("components_releaseTile_dropdownMenuItem_showTasks")}</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!isManager}
                  onPress={() => router.push({ pathname: "/inner_screens/edit-release", params: { releaseId: releaseId, projectId: projectId } })}
                  className=""
                >
                  <Text>{i18n.t("components_releaseTile_dropdownMenuItem_edit")}</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {status === "planned" && (
                  <>
                    <DropdownMenuItem
                      disabled={!isManager}
                      onPress={() => fbFunctions.startRelease(releaseId as string, projectId).then(() => router.back())}
                    >
                      <Text>{i18n.t("components_releaseTile_dropdownMenuItem_startRelease")}</Text>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {status === "started" && (
                  <>
                    <DropdownMenuItem
                      disabled={!isManager}
                      onPress={() => fbFunctions.revertRelease(releaseId as string).then(() => router.back())}
                    >
                      <Text>{i18n.t("components_releaseTile_dropdownMenuItem_revertToPlanned")}</Text>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={!isManager}
                      onPress={() => fbFunctions.finishRelease(releaseId as string).then(() => router.back())}
                    >
                      <Text>{i18n.t("components_releaseTile_dropdownMenuItem_finishRelease")}</Text>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {status === "finished" && (
                  <>
                    <DropdownMenuItem
                      disabled={!isManager}
                      onPress={() => fbFunctions.startRelease(releaseId as string, projectId).then(() => router.back())}
                    >
                      <Text>{i18n.t("components_releaseTile_dropdownMenuItem_revertToStarted")}</Text>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <Dialog className="">
                  <DialogTrigger
                    asChild
                    className=""
                  >
                    <Button
                      disabled={!isManager}
                      className="flex items-start"
                      variant="destructive"
                    >
                      <Text>{i18n.t("components_releaseTile_dropdownMenuItem_delete")}</Text>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="!text-lg">
                    <DialogHeader>
                      <DialogTitle className="!text-[20px]">{i18n.t("components_releaseTile_dialogTitle_deleteRelease")}</DialogTitle>
                      <DialogDescription className="!text-[16px]">{i18n.t("components_releaseTile_dialogText_deleteRelease")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-between mt-5">
                      <DialogClose asChild>
                        <Button>
                          <Text>{i18n.t("components_releaseTile_button_deleteReleaseRefuse")}</Text>
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant={"destructive"}
                          onPress={() => {
                            fbFunctions.deleteReleaseWithTasks(releaseId as string).then(() => router.back());
                          }}
                        >
                          <Text>{i18n.t("components_releaseTile_button_deleteReleaseConfirm")}</Text>
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </View>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </View>
    </Card>
  );
}
