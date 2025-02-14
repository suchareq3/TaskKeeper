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
  editTask: (taskId: string, name: string, description: string, status: string, type: string, priorityLevel: string, assigneeUid: string, subtasks: Array<{ key: string; label: string; completed: boolean }>) => Promise<any>;
  addUserToProjectViaInviteCode: (inviteCode: string) => Promise<any>;
  createTask: (projectId: string, taskName: string, taskDescription: string, priorityLevel: string, taskType: string, taskAssigneeUid: string, subTaskdata: { key: string; label: string; completed: boolean }[]) => Promise<any>;
}