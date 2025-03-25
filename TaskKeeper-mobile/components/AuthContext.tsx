import { createContext, useContext, useState, useEffect, PropsWithChildren, SetStateAction } from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { getToken, default as messaging } from "@react-native-firebase/messaging";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ExpoNotifications from "expo-notifications";
import { Timestamp } from "@react-native-firebase/firestore";

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => any;
  signUp: (email: string, password: string, extraData: { [key: string]: any }) => any;
  createProject: (name: string, description: string, githubUrl: string) => any;
  editProject: (projectId: string, name: string, description: string, githubUrl: string) => any;
  removeUserFromProject: (projectId: string, userId: string) => any;
  addUserToProjectViaInviteCode: (inviteCode: string) => any;
  refreshProjectInviteCode: (projectId: string) => any;
  createTask: (
    releaseId: string,
    projectId: string,
    taskName: string,
    taskDescription: string,
    priorityLevel: string,
    taskType: string,
    taskAssigneeUid: string,
    subTaskdata: { key: string; label: string; completed: boolean }[]
  ) => any;
  editTask: (
    taskId: string,
    name: string,
    description: string,
    status: string,
    type: string,
    priorityLevel: string,
    assigneeUid: string,
    subtasks: Array<{ key: string; label: string; completed: boolean }>
  ) => any;
  deleteTask: (taskId: string) => any;
  createRelease: (projectId: string, releaseName: string, releaseDescription: string, plannedEndDate: Date) => any;
  getProjectReleases: (projectId: string) => any;
  session?: FirebaseAuthTypes.User | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  createProject: () => Promise.resolve(),
  editProject: () => Promise.resolve(),
  removeUserFromProject: () => Promise.resolve(),
  addUserToProjectViaInviteCode: () => Promise.resolve(),
  refreshProjectInviteCode: () => Promise.resolve(),
  createTask: () => Promise.resolve(),
  editTask: () => Promise.resolve(),
  deleteTask: () => Promise.resolve(),
  createRelease: () => Promise.resolve(),
  getProjectReleases: () => Promise.resolve(),
  session: null,
  isLoading: true,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<FirebaseAuthTypes.User | null>(null);
  // TODO: add timeout
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const userLoginStatus = fbFunctions.checkUserLoginStatus((currentUser: SetStateAction<FirebaseAuthTypes.User | null>) => {
      setSession(currentUser);
      console.log("went into userLoginStatus in AuthContext.tsx!: " + JSON.stringify(currentUser));
      if (currentUser) {
        //necessary for notifications
        messaging().registerDeviceForRemoteMessages();
      }
      setIsLoading(false);
    });

    return () => userLoginStatus(); // Cleanup listener
  }, []);

  useEffect(() => {
    console.log("new token!");
  }, [getToken]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.logInWithPassword(email, password);
      // TODO: check & update fcm_token in firebase, replace 'logInWithPassword' with a cloud function (like signup)
      // TODO for fcm_tokens: introduce additional checks & a monthly(?) cloud function failcheck for expired fcm_tokens,
      // https://firebase.google.com/docs/cloud-messaging/manage-tokens
    } catch (error) {
      console.error("signIn in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      await fbFunctions.logOutUser();
      setSession(null);
      // Clear any project-related state here
    } catch (error) {
      console.error("signOut in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signUp = async (email: string, password: string, extraData: { [key: string]: string }) => {
    setIsLoading(true);
    try {
      await fbFunctions.signUpUser(email, password, extraData);
      // TODO: update the cloud function to add fcm_token & fcm_token's timestamp
    } catch (error) {
      console.error("signUp in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  //TODO: re-do this so it's a 3-step process!
  const createProject = async (name: string, description: string, githubUrl: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.createProject(name, description, githubUrl);
    } catch (error) {
      console.error("createProject in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const editProject = async (projectId: string, name: string, description: string, githubUrl: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.editProject(projectId, name, description, githubUrl);
    } catch (error) {
      console.error("editProject in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUserFromProject = async (projectId: string, userId: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.removeUserFromProject(projectId, userId);
    } catch (error) {
      console.error("removeUserFromProject in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserToProjectViaInviteCode = async (inviteCode: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.addUserToProjectViaInviteCode(inviteCode);
    } catch (error) {
      console.error("addUserToProjectViaInviteCode in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  type Item = {
    key: string;
    label: string;
    completed: boolean;
  };

  const createTask = async (
    releaseId: string,
    projectId: string,
    taskName: string,
    taskDescription: string,
    priorityLevel: string,
    taskType: string,
    taskAssigneeUid: string,
    subTaskdata: { key: string; label: string; completed: boolean }[]
  ) => {
    setIsLoading(true);
    try {
      await fbFunctions.createTask(releaseId, projectId, taskName, taskDescription, priorityLevel, taskType, taskAssigneeUid, subTaskdata);
    } catch (error) {
      console.error("createTask in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const editTask = async (taskId: string, name: string, description: string, status: string, type: string, priorityLevel: string, assigneeUid: string, subtasks: Array<{ key: string; label: string; completed: boolean }>) => {
    setIsLoading(true);
    try {
      await fbFunctions.editTask(taskId, name, description, status, type, priorityLevel, assigneeUid, subtasks);
    } catch (error) {
      console.error("editTask in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.deleteTask(taskId);
    } catch (error) {
      console.error("deleteTask in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  const refreshProjectInviteCode = async (projectId: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.refreshProjectInviteCode(projectId);
    } catch (error) {
      console.error("refreshProjectInviteCode in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRelease = async (projectId: string, releaseName: string, releaseDescription: string, plannedEndDate: Date) => {
    setIsLoading(true);
    try {
      await fbFunctions.createRelease(projectId, releaseName, releaseDescription, plannedEndDate);
    } catch (error) {
      console.error("createRelease in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getProjectReleases = async (projectId: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.getProjectReleases(projectId);
    } catch (error) {
      console.error("getProjectReleases in AuthContext.tsx has failed!: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="flex-1">
        <AuthContext.Provider
          value={{
            signIn,
            signOut,
            signUp,
            createProject,
            editProject,
            removeUserFromProject,
            addUserToProjectViaInviteCode,
            createTask,
            editTask,
            deleteTask,
            refreshProjectInviteCode,
            createRelease,
            getProjectReleases,
            session,
            isLoading,
          }}
        >
          {children}
        </AuthContext.Provider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
