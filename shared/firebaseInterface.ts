export interface FirebaseFunctions {
  someSharedFunction: () => void;
  logInWithPassword: (email: string, password: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  checkUserStatus: () => Promise<string>;
  checkUserLoginStatus: (nextOrObserver: any) => any;
  signUpUser: (email: string, password: string, extraData: { [key: string]: string }) => any;
  showNotification: (title: string, description: string) => Promise<string | undefined>;
  createProject: (name: string, description: string, githubUrl: string) => Promise<void>;
  editProject: (projectId: string, name: string, description: string, githubUrl: string) => Promise<any>;
  removeUserFromProject: (projectId: string, userId: string) => Promise<any>;
  deleteProject: (projectId: string) => Promise<any>;
  loadUserProjects: () => any;
  loadUserTasks: () => any;
  deleteTask: (taskId: string) => Promise<any>;
  editTask: (
    taskId: string,
    name: string,
    description: string,
    status: string,
    type: string,
    priorityLevel: string,
    assigneeUid: string,
    subtasks: Array<{ key: string; label: string; completed: boolean }>
  ) => Promise<any>;
  addUserToProjectViaInviteCode: (inviteCode: string) => Promise<any>;
  refreshProjectInviteCode: (projectId: string) => Promise<any>;
  updateProjectMemberManagerStatus: (projectId: string, userId: string, isManager: boolean) => Promise<any>;
  createTask: (
    releaseId: string,
    projectId: string,
    taskName: string,
    taskDescription: string,
    priorityLevel: string,
    taskType: string,
    taskAssigneeUid: string,
    subTaskdata: { key: string; label: string; completed: boolean }[]
  ) => Promise<any>;
  createRelease: (projectId: string, releaseName: string, releaseDescription: string, plannedEndDate: Date) => Promise<any>;
  getProjectReleases: (projectId: string) => Promise<any>;
  deleteRelease: (releaseId: string) => Promise<any>;
  deleteReleaseWithTasks: (releaseId: string) => Promise<any>;
  editRelease: (releaseId: string, name: string, description: string, plannedEndDate: Date, status: string) => Promise<any>;
  getAllReleases: () => Promise<any>;
  startRelease: (releaseId: string, projectId: string) => Promise<any>;
  finishRelease: (releaseId: string) => Promise<any>;
  revertRelease: (releaseId: string) => Promise<any>;
  loadReleaseTasks: (releaseId: string) => Promise<any>;
  getUserNotifications: () => Promise<any>;
}