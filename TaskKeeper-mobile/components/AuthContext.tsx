import { createContext, useContext, useState, useEffect, PropsWithChildren, SetStateAction } from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { fbFunctions } from "../../shared/firebaseFunctions";
import { getToken, default as messaging } from "@react-native-firebase/messaging";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ExpoNotifications from "expo-notifications";
import { Timestamp } from "@react-native-firebase/firestore";
import { useError } from "./ErrorContext";
import { safeExecute } from "@/lib/errorUtils";

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
  const { logError } = useError();

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
    } catch (error) {
      logError(error, "Sign In");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    setIsLoading(true);
    try {
      await fbFunctions.logOutUser();
    } catch (error) {
      logError(error, "Sign Out");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, extraData: { [key: string]: any }) => {
    setIsLoading(true);
    try {
      await fbFunctions.signUpUser(email, password, extraData);
    } catch (error) {
      logError(error, "Sign Up");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  //TODO: re-do this so it's a 3-step process!
  const createProject = async (name: string, description: string, githubUrl: string) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.createProject(name, description, githubUrl), "Create Project");
    } catch (error) {
      logError(error, "Create Project");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const editProject = async (projectId: string, name: string, description: string, githubUrl: string) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.editProject(projectId, name, description, githubUrl), "Edit Project");
    } catch (error) {
      logError(error, "Edit Project");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const removeUserFromProject = async (projectId: string, userId: string) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.removeUserFromProject(projectId, userId), "Remove User From Project");
    } catch (error) {
      logError(error, "Remove User From Project");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const addUserToProjectViaInviteCode = async (inviteCode: string) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.addUserToProjectViaInviteCode(inviteCode), "Add User To Project Via Invite Code");
    } catch (error) {
      logError(error, "Add User To Project Via Invite Code");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProjectInviteCode = async (projectId: string) => {
    setIsLoading(true);
    try {
      const result = await safeExecute(() => fbFunctions.refreshProjectInviteCode(projectId), "Refresh Project Invite Code");
      return result; // Return the new invite code
    } catch (error) {
      logError(error, "Refresh Project Invite Code");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
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
      await safeExecute(() => fbFunctions.createTask(releaseId, projectId, taskName, taskDescription, priorityLevel, taskType, taskAssigneeUid, subTaskdata), "Create Task");
    } catch (error) {
      logError(error, "Create Task");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const editTask = async (taskId: string, name: string, description: string, status: string, type: string, priorityLevel: string, assigneeUid: string, subtasks: Array<{ key: string; label: string; completed: boolean }>) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.editTask(taskId, name, description, status, type, priorityLevel, assigneeUid, subtasks), "Edit Task");
    } catch (error) {
      logError(error, "Edit Task");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.deleteTask(taskId), "Delete Task");
    } catch (error) {
      logError(error, "Delete Task");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const createRelease = async (projectId: string, releaseName: string, releaseDescription: string, plannedEndDate: Date) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.createRelease(projectId, releaseName, releaseDescription, plannedEndDate), "Create Release");
    } catch (error) {
      logError(error, "Create Release");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectReleases = async (projectId: string) => {
    setIsLoading(true);
    try {
      await safeExecute(() => fbFunctions.getProjectReleases(projectId), "Get Project Releases");
    } catch (error) {
      logError(error, "Get Project Releases");
      throw error; // Re-throw the error so the calling component knows the operation failed
    } finally {
      setIsLoading(false);
    }
  };

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
