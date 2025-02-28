// src/routes/login.tsx
import { createFileRoute, redirect, Router } from "@tanstack/react-router";
import { auth } from "../../../shared/firebaseFunctions"
import { GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { Button, Text } from "@radix-ui/themes";
import { router } from "../main";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    // Direct Firebase check
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in!!!", user);
        throw redirect({ to: "/protected" });
      } else {
        console.log("Not logged in!!!");
      }
    });
    console.log(auth.currentUser)
    if (auth.currentUser) {
      throw redirect({ to: "/protected" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const login = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider()).then(() => { router.history.push( "/protected")});
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <Text className="text-5xl !mb-[150px]"><b>TaskKeeper</b><br/>admin panel</Text>
      <Button onClick={login} className="!text-3xl !p-8">Sign in with Google</Button>
    </div>
  );
}
