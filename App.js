import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import CameraScreen from "./screens/CameraScreen";
import EditScreen from "./screens/EditScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "App Álbum" }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ title: "Câmera" }} />
        <Stack.Screen name="Edit" component={EditScreen} options={{ title: "Editar foto" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}