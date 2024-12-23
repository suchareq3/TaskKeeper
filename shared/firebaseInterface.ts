export interface FirebaseFunctions {
  someSharedFunction: () => void;
  logInWithPassword: (email: string, password: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  checkUserStatus: () => string;
  checkUserLoginStatus: (nextOrObserver: any) => any;
  signUpUser: (email: string, password: string, extraData: { [key: string]: string }) => any;
  showNotification: (title: string, description: string) => string;
}