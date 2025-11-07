import { allRoutes } from '@/constants/Routes';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { useThemeColor } from '@/hooks/useThemeColor';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  
  const backgroundColor = useThemeColor({light: 'white', dark: 'grey'}, 'background')
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }



  return (
    <GestureHandlerRootView style = {{backgroundColor: backgroundColor, flex: 1}}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{ 
          headerShadowVisible: false,
          contentStyle: { backgroundColor: backgroundColor },
          headerStyle: {backgroundColor: backgroundColor},
          headerTitle: '',
          headerShown: false
      }}>
        <Stack.Screen name = 'index' options={{title: '', }}/>

        {
          allRoutes.map(route => (
            <Stack.Screen
              key={route.name}
              name={route.name}
              options={{
                title: '',
                headerShown: !route.title.includes('Slides'),
              }}
            />
          ))
        }

      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
    </ThemeProvider>
  </GestureHandlerRootView>
  );
}
