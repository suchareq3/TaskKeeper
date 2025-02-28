import { Box, Flex } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/protected/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="flex flex-col items-center justify-center mt-5">
        <p className="text-2xl font-bold">Welcome to the TaskKeeper admin panel! If you can see this screen, you're logged into an admin account.</p>
      </div>
    </>
  );
}
