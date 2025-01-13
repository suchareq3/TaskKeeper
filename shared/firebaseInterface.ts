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
  loadUserProjects: () => any;
}