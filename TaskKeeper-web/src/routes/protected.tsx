import { Button } from "@radix-ui/themes";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../../../shared/firebaseFunctions";
import { router } from "../main";

export const Route = createFileRoute("/protected")({
  beforeLoad: async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw redirect({ to: "/login" });
    }

    // check the Auth module (not firestore!) if the user has an 'admin' role
    await user.getIdToken(true);
    const decodedToken = await user.getIdTokenResult();

    if (decodedToken.claims.role !== "admin") {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: ProtectedLayout, // Renders nested routes
});

function ProtectedLayout() {
  return (
    <>
      <div className="flex flex-row justify-between p-5 bg-slate-200">
        <div className="flex flex-row gap-5">
          <Button onClick={() => router.history.push("/")} className="!cursor-pointer">
            Home
          </Button>
          <Button className="!cursor-pointer" onClick={() => router.history.push("/protected/users")}>
            Users
          </Button>
          <Button className="!cursor-pointer" onClick={() => router.history.push("/protected/projects")}>
            Projects
          </Button>
          <Button className="!cursor-pointer" onClick={() => router.history.push("/protected/releases")}>
            Releases
          </Button>
          <Button className="!cursor-pointer" onClick={() => router.history.push("/protected/tasks")}>
            Tasks
          </Button>
          <Button className="!cursor-pointer" onClick={() => router.history.push("/protected/notifications")}>
            Notifications
          </Button>
          <Button className="!cursor-pointer" onClick={() => router.history.push("/protected/templates")}>
            Templates
          </Button>
        </div>
        <Button className="!cursor-pointer" onClick={() => signOut(auth).then(() => router.history.push("/"))}>
          Log out
        </Button>
      </div>
      <hr className="text-slate-300" />

      <Outlet />
    </>
  );
}

// export const Route = createFileRoute("/protected")({
//   beforeLoad: async () => {
//     // Direct Firebase check
//     if (!getAuth().currentUser) {
//       throw redirect({ to: "/login" });
//     }
//   },
//   component: ProtectedPage,
// });

// function ProtectedPage() {
//   return <><Button onClick={() => signOut(auth).then(() => router.history.push("/"))}>log out</Button>
//   </>;
// }
