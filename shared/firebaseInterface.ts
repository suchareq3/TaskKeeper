export interface FirebaseFunctions {
  someSharedFunction: () => void;
  logInWithPassword: (email: string, password: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  checkUserStatus: () => Promise<string>;
  checkUserLoginStatus: (nextOrObserver: any) => any;
  signUpUser: (email: string, password: string, extraData: { [key: string]: any }) => any;
  signUpUserNoToken: (email: string, password: string, extraData: { [key: string]: any }) => any;
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
  getAllUsers: () => Promise<any>;
  getUserById: (userId: string) => Promise<any>;
  updateUserDetails: (userId: string, data: { [key: string]: any }) => Promise<any>;
  deleteUserById: (userId: string) => Promise<any>;
  getAllProjects: () => Promise<any>;
  getProjectById: (projectId: string) => Promise<any>;
  editProjectWithMembers: (
    projectId: string,
    updatedFields: Partial<{
      name: string;
      description: string;
      github_url: string;
      members: Record<string, { isManager: boolean }>;
    }>
  ) => Promise<any>;
  getReleaseById: (releaseId: string) => Promise<any>;
  getAllTasks: () => Promise<any>;
  getTaskById: (taskId: string) => Promise<any>;
  getAllNotifications: () => Promise<any>;
  createCustomNotification: (title: string, body: string, userUids: string[]) => Promise<any>;
  getNotificationById: (notificationId: string) => Promise<any>;
  deleteNotificationById: (notificationId: string) => Promise<any>;
  getAllTemplates: () => Promise<any>;
  getTables: () => Promise<any>;
  getTableFields: (table: string) => Promise<any>;
  uploadTemplate: (name: string, table: string, fields: string[], file: File) => Promise<any>;
  handleDelete: (templateId: string) => void;
  handleDownload: (templateId: string) => void;
  getAllTableRecords: (params: any) => Promise<any>;
}