import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
import ResendVerificationScreen from './screens/ResendVerificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import EditPaymentMethodScreen from './screens/EditPaymentMethodScreen';
import ViewPaymentMethod from './screens/ViewPaymentMethod';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#333',
        },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

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
      <PaperProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              animation: 'fade',
              contentStyle: { backgroundColor: '#fff' }
            }}
          >
            <Stack.Screen name="Signin" component={SigninScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResendVerification" component={ResendVerificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Ödeme Yöntemleri' }} />
            <Stack.Screen name="EditPaymentMethod" component={EditPaymentMethodScreen} options={{ title: 'Kart Düzenle' }} />
            <Stack.Screen name="ViewPaymentMethod" component={ViewPaymentMethod} options={{ title: 'Kart Detayları', presentation: 'modal' }} />
            <Stack.Screen name="MainApp" component={TabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

export default App;
