export interface FirebaseFunctions {
  someSharedFunction: () => void;
  logInWithPassword: (email: string, password: string) => void;
  logOutUser: () => void;
  checkUserStatus: () => void;
}