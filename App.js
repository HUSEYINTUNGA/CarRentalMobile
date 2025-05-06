import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import VerifyAccountScreen from './screens/VerifyAccountScreen';
import HomeScreen from './screens/HomeScreen';
import { store } from './storage/store';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from './screens/DashboardScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const role = await AsyncStorage.getItem('userRole');
  
        if (!token || !role) return setInitialRoute('Signin');
  
        setInitialRoute(role === 'Admin' ? 'Dashboard' : 'Home');
      } catch (err) {
        setInitialRoute('Signin');
      }
    };
  
    checkAuth();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1541e0" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#fff' }
          }}
        >
          <Stack.Screen name="Signin" component={SigninScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
