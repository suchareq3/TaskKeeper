import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./main.css";
import { auth, fbFunctions } from "../../shared/firebaseFunctions";
import "../../shared/firebaseFunctions";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"; 

// Set up a Router instance
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// register ag-grid features
ModuleRegistry.registerModules([AllCommunityModule]);

function AuthWrapper() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  if (!authReady) return <div className="loading">Initializing app...</div>;

  return <RouterProvider router={router} />;
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthWrapper />
    </React.StrictMode>
  );
}