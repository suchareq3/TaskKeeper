import { Slot, Stack } from "expo-router";
import { SessionProvider } from "@/components/AuthContext";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
  // Set up the auth context and render our layout inside of it.
  return (
    <GluestackUIProvider>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </GluestackUIProvider>

    // <Stack>
    //   <Stack.Screen name="index"/>
    // </Stack>

    // <Stack>
    //   <Stack.Screen name="(tabs)" options={{headerShown: false}} />
    //   <Stack.Screen name="+not-found" />
    // </Stack>
  );
}
