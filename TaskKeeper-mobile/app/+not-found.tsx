import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import * as React from "react";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! 404: Not Found", headerShown: true, headerTitleAlign: 'center'}} />
      <View style={styles.container}>
        <Link
          href="/(tabs)/"
          style={styles.button}
        >
          Error! Press here to Go back to the main screen!
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
