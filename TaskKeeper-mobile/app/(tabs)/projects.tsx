import { Link } from "expo-router";
import {  View, StyleSheet, Button } from "react-native";
import { fbFunctions } from "../../../shared/firebaseFunctions";
import { useSession } from "@/components/AuthContext";
import { useState } from "react";
import { Text } from "@/components/ui/text";

export default function ProjectsScreen() {
  return (
    <View className="flex-1 justifyitems-center bg-[#25292e] p-5">
      <View>
        <Text className="text-2xl" >Your projects: </Text>
      </View>
      {/* TODO: take info from firebase and loop over it */}
      
    </View>
  );
}