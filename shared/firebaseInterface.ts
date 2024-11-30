export interface FirebaseFunctions {
  someSharedFunction: () => void;
  logInWithPassword: (email: string, password: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  checkUserStatus: () => void;
  checkUserLoginStatus: (nextOrObserver: any) => any;
  signUpUser: (email: string, password: string, extraData: { [key: string]: string }) => any;
}