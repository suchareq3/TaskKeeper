import { PermissionsAndroid } from "react-native";

export function requestPermissions() {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
}
