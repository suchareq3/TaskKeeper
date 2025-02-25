import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Theme } from "@radix-ui/themes";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <Theme>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </Theme>
  );
}
