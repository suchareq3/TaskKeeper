import { View, KeyboardAvoidingView } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { Text } from "@/components/ui/text";
import { useState, React, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native-gesture-handler";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Crypto from "expo-crypto";
import { Option, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import i18n from "@/components/translations";
import { PRIORITY_OPTIONS, TASK_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from "@/components/constants";
import { getAuth } from "@react-native-firebase/auth";

export default function CreateTask() {
  const { createTask } = useSession();
  const { projects } = useLocalSearchParams();
  const parsedProjects = projects ? JSON.parse(projects as string) : [];

  const [selectedProject, setSelectedProject] = useState({ value: { projectId: "" }, label: "" });
  const [priorityLevel, setPriorityLevel] = useState(PRIORITY_OPTIONS[2]);
  const [taskType, setTaskType] = useState(TASK_TYPE_OPTIONS[0]);
  const [taskName, setTaskName] = useState("");
  const [taskAssignee, setTaskAssignee] = useState({
    value: getAuth().currentUser!.uid,
    label: getAuth().currentUser!.uid + ` ${i18n.t("app_innerScreens_addTask_select_taskAssigneeYou")}`,
  } as Option);
  const [taskDescription, setTaskDescription] = useState("");
  const [subtaskData, setSubtaskData] = useState<Array<{ key: string; label: string; completed: boolean }>>([]);
  const [releases, setReleases] = useState<Array<{ releaseId: string; name: string; status: string }>>([]);
  const [selectedRelease, setSelectedRelease] = useState<{ value: string; label: string } | null>(null);

  const memberOptions = selectedProject.value.projectId ? Object.keys(parsedProjects.find((p) => p.projectId === selectedProject.value.projectId)?.members || {}) : [];

  // Fetch releases when a project is selected
  useEffect(() => {
    if (selectedProject.value.projectId) {
      const fetchReleases = async () => {
        try {
          const releases = await fbFunctions.getProjectReleases(selectedProject.value.projectId);
          // Filter releases to only include "planned" or "started" statuses
          const filteredReleases = releases.filter((release) => release.status === "planned" || release.status === "started");
          setReleases(filteredReleases);
        } catch (error) {
          console.error("Failed to fetch releases:", error);
        }
      };
      fetchReleases();
    }
  }, [selectedProject.value.projectId]);

  const renderItem = ({ item, drag }: RenderItemParams<{ key: string; label: string; completed: boolean }>) => {
    const handleRemoveItem = (key: string) => {
      setSubtaskData((prevData) => prevData.filter((dataItem) => dataItem.key !== key));
    };

    const handleTextChange = (key: string, newText: string) => {
      setSubtaskData((prevData) => prevData.map((dataItem) => (dataItem.key === key ? { ...dataItem, label: newText } : dataItem)));
    };

    return (
      <View className="relative">
        <ScaleDecorator>
          <View className="flex w-full max-h-[50] bg-gray-600 scroll">
            <TouchableOpacity
              delayLongPress={250}
              onLongPress={drag}
              className="h-20"
            >
              <MaterialIcons
                name="drag-indicator"
                size={32}
                color="black"
                className="absolute opacity-50 left-[5] top-[4] bottom-0 z-[50]"
              />
              <Input
                className="text-white !text-xl text-left ml-12 mr-[88] !bg-transparent"
                editable={true}
                onChangeText={(text) => handleTextChange(item.key, text)}
              >
                {item.label}
              </Input>
            </TouchableOpacity>
            <Checkbox
              className="absolute right-[48] top-[2] border-2 p-5"
              checked={item.completed}
              onCheckedChange={(checked) => setSubtaskData((prevData) => prevData.map((dataItem) => (dataItem.key === item.key ? { ...dataItem, completed: checked } : dataItem)))}
            />
            <Button
              className="absolute right-0"
              onPress={() => handleRemoveItem(item.key)}
            >
              <Text>[DNT]X</Text>
            </Button>
          </View>
        </ScaleDecorator>
      </View>
    );
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#25292e]">
      <KeyboardAvoidingView className="flex-1 items-center w-full p-5">
        <View className="w-full">
          <Select
            onValueChange={(value) => {
              setSelectedProject(value);
              setSelectedRelease(null); // Reset selected release when project changes
              console.log(selectedProject);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue
                className="text-foreground text-sm native:text-lg"
                placeholder={i18n.t("app_innerScreens_addTask_select_pickProjectPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent className="w-[250px]">
              <SelectGroup>
                <SelectLabel>{i18n.t("app_innerScreens_addTask_select_pickProjectLabel")}</SelectLabel>
                {parsedProjects.map((project) => (
                  <SelectItem
                    key={project.projectId}
                    label={project.name}
                    value={project}
                  />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedProject.value.projectId && (
            <>
              <Separator className="bg-primary my-5" />

              <View className="gap-1">
                <Input
                  placeholder={i18n.t("app_innerScreens_addTask_input_taskNamePlaceholder")}
                  value={taskName}
                  onChangeText={setTaskName}
                  keyboardType="default"
                />
                <Textarea
                  className="max-h-[120]"
                  numberOfLines={2}
                  placeholder={i18n.t("app_innerScreens_addTask_input_taskDescriptionPlaceholder")}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  keyboardType="default"
                />
                {/* New Select for Releases */}
                <View>
                  <Label nativeID="release">{i18n.t("app_innerScreens_addTask_select_releaseLabel")}</Label>
                  <Select
                    aria-labelledby="release"
                    value={selectedRelease}
                    onValueChange={(value) => {
                      setSelectedRelease(value);
                    }}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder={i18n.t("app_innerScreens_addTask_select_releasePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        {releases.map((release) => (
                          <SelectItem
                            key={release.releaseId}
                            label={release.name}
                            value={release.releaseId}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                <View>
                  <Label nativeID="priority-level">{i18n.t("app_innerScreens_addTask_select_priorityLevelLabel")}</Label>
                  <Select
                    aria-labelledby="priority-level"
                    onValueChange={(value) => {
                      setPriorityLevel(value!);
                    }}
                    onLayout={() => setPriorityLevel(PRIORITY_OPTIONS[2])}
                    defaultValue={PRIORITY_OPTIONS[2]}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder={i18n.t("app_innerScreens_addTask_select_priorityLevelPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            label={option.label}
                            value={option.value}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                <View>
                  <Label nativeID="task-type">{i18n.t("app_innerScreens_addTask_select_taskTypeLabel")}</Label>
                  <Select
                    aria-labelledby="task-type"
                    onValueChange={(value) => {
                      setTaskType(value!);
                    }}
                    onLayout={() => setTaskType(TASK_TYPE_OPTIONS[0])}
                    defaultValue={TASK_TYPE_OPTIONS[0]}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder={i18n.t("app_innerScreens_addTask_select_taskTypePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[250px]">
                      <SelectGroup>
                        {TASK_TYPE_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            label={option.label}
                            value={option.value}
                          />
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>

                <View className="w-full">
                  {/* Existing project selection */}
                  {selectedProject.value.projectId && (
                    <>
                      {/* Modified assignee selection */}
                      <View>
                        <Label nativeID="task-assignee">{i18n.t("app_innerScreens_addTask_select_taskAssigneeLabel")}</Label>
                        <Select
                          aria-labelledby="task-assignee"
                          onValueChange={(option) => {
                            setTaskAssignee(option);
                          }}
                          defaultValue={taskAssignee}
                        >
                          <SelectTrigger className="">
                            <SelectValue
                              className="text-foreground text-sm native:text-lg"
                              placeholder={i18n.t("app_innerScreens_addTask_select_taskAssigneePlaceholder")}
                            />
                          </SelectTrigger>
                          <SelectContent className="">
                            <SelectGroup>
                              {memberOptions.map((uid) => (
                                <SelectItem
                                  key={uid}
                                  label={`${uid}${uid === getAuth().currentUser!.uid && ` ${i18n.t("app_innerScreens_addTask_select_taskAssigneeYou")}`}`} // You might want to display user names here instead of UIDs
                                  value={uid}
                                />
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </View>
                      <Separator className="bg-primary my-5" />
                    </>
                  )}
                </View>

                <Button onPress={() => setSubtaskData([...subtaskData, { key: Crypto.randomUUID(), label: "Edit me!", completed: false }])}>
                  <Text>{i18n.t("app_innerScreens_addTask_button_createSubtask")}</Text>
                </Button>
                <DraggableFlatList
                  data={subtaskData}
                  onDragEnd={({ data }) => {
                    setSubtaskData(data);
                    console.log("new data:", data);
                  }}
                  keyExtractor={(item) => item.key}
                  renderItem={renderItem}
                />

                <Separator className="bg-primary my-5" />

                <Button
                  onPress={() => {
                    try {
                      createTask (selectedRelease!.value, selectedProject.value.projectId, taskName, taskDescription, priorityLevel.value, taskType.value, taskAssignee!.value, subtaskData).then(() => {
                        router.back();
                      });
                    } catch (e) {
                      console.log("smth went wrong: ", e);
                    }
                  }}
                >
                  <Text>{i18n.t("app_innerScreens_addTask_button_createTask")}</Text>
                </Button>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
