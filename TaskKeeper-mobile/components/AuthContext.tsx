import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  SetStateAction,
} from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { fbFunctions } from "../../shared/firebaseFunctions";
//TODO: refactor this to use fbFunctions instead of using auth() directly

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => any;
  session?: FirebaseAuthTypes.User | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  session: null,
  isLoading: false,
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
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = fbFunctions.checkUserLoginStatus(
      (currentUser: SetStateAction<FirebaseAuthTypes.User | null>) => {
        setSession(currentUser);
        console.log("went into unsubscribe!");
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await fbFunctions.logInWithPassword(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    setIsLoading(true);
    try {
      await fbFunctions.logOutUser();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
