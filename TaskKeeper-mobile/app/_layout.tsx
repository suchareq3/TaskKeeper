import { Slot } from "expo-router";
import { PortalHost } from '@rn-primitives/portal';
import { SessionProvider } from "@/components/AuthContext";
import { ErrorProvider, useError } from "@/components/ErrorContext";
import { setupErrorHandling } from "@/lib/errorUtils";
import "~/global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem("theme");
      if (!theme) {
        await AsyncStorage.setItem("theme", colorScheme); //"system" by default
        console.log("theme wasn't set, so it was set to: " + colorScheme);
      } else {
        setColorScheme(theme as "light"|"dark"|"system");
        console.log("theme was set to: " + theme);      }
      setIsColorSchemeLoaded(true);
    })().finally(async () => {
      await SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  // Set up the auth context and render our layout inside of it.
  return (<>
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} backgroundColor={isDarkColorScheme ? "black" : undefined} animated={true} translucent={false}/>
      <ErrorProvider>
        <ErrorHandlerInitializer />
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SessionProvider>
      </ErrorProvider>
    </ThemeProvider>
    <PortalHost/>
    </>
  );
}

// Component to initialize the error handling system
function ErrorHandlerInitializer() {
  const { showError } = useError();
  
  React.useEffect(() => {
    // Keep track of recent errors to avoid showing duplicates
    const recentErrors = new Set<string>();
    let lastErrorTime = 0;
    const ERROR_THROTTLE_MS = 2000; // Only show one error every 2 seconds
    
    // Set up global error handling
    setupErrorHandling((message, ...params) => {
      // Extract context if available
      let context = '';
      if (params.length > 0 && typeof params[0] === 'string' && params[0].startsWith('Error in ')) {
        context = params[0].replace('Error in ', '').replace(':', '');
      }
      
      // Create a unique key for this error
      const errorKey = `${context}:${message}`;
      
      // Check if we've shown this error recently
      if (recentErrors.has(errorKey)) {
        return;
      }
      
      // Check if we're showing errors too quickly
      const now = Date.now();
      if (now - lastErrorTime < ERROR_THROTTLE_MS) {
        return;
      }
      
      // Update tracking
      lastErrorTime = now;
      recentErrors.add(errorKey);
      
      // Clear this error from the recent set after a delay
      setTimeout(() => {
        recentErrors.delete(errorKey);
      }, 5000);
      
      // Show error dialog
      showError(message, context || 'Application Error');
    });
    
    // Set up global unhandled promise rejection handling
    const handlePromiseRejection = (event: any) => {
      console.error('Unhandled promise rejection:', event.reason);
    };
    
    // Add event listener for unhandled promise rejections
    if (Platform.OS === 'web') {
      window.addEventListener('unhandledrejection', handlePromiseRejection);
    }
    
    return () => {
      // Clean up event listener
      if (Platform.OS === 'web') {
        window.removeEventListener('unhandledrejection', handlePromiseRejection);
      }
    };
  }, [showError]);
  
  return null;
}
