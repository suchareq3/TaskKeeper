import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import * as React from "react";
import i18n from "@/components/translations";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: i18n.t("app_notFound_stack_title"), headerShown: true, headerTitleAlign: 'center' }} />
      <View style={styles.container}>
        <Link
          href="/(tabs)/"
          style={styles.button}
        >
          {i18n.t("app_notFound_button_goToMainScreen")}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
