import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import { useContext } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  ReferenceDataContext,
  ReferenceDataContextProvider,
} from "./components/share/ReferenceDataContext";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ReferenceDataContextProvider>
        <NativeBaseProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </NativeBaseProvider>
      </ReferenceDataContextProvider>
    );
  }
}
