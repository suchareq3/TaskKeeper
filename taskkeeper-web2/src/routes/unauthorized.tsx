import { Button } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";
import { router } from "../main";
import { fbFunctions } from "../../../shared/firebaseFunctions";

export const Route = createFileRoute("/unauthorized")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-2">
      <h1 className="text-3xl">Unauthorized!</h1>
      <br />
      <h3>
        Your account is unauthorized to access the admin control panel.
        <br />
        Press this button to log out & go back to the login page:
      </h3>
      <br />
      <Button className="!cursor-pointer" onClick={() => {fbFunctions.logOutUser().then(() => router.history.push("/"))}}>
        Log out
      </Button>
    </div>
  );
}
