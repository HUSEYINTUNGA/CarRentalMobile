import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import VerifyAccountScreen from './screens/VerifyAccountScreen';
import HomeScreen from './screens/HomeScreen';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ResendVerificationScreen from './screens/ResendVerificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import EditPaymentMethodScreen from './screens/EditPaymentMethodScreen';
import ViewPaymentMethod from './screens/ViewPaymentMethod';
import VehicleDetailsScreen from './screens/VehicleDetailsScreen';
import VehicleListScreen from './screens/VehicleListScreen';
import RentalHistoriesScreen from './screens/RentalHistoriesScreen';
import RentedScreen from './screens/RentedScreen';
import ManageVehiclesScreen from './screens/ManageVehiclesScreen';
import RentalRequestsScreen from './screens/RentalRequestsScreen';
import UsersListScreen from './screens/UsersListScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import DashboardScreen from './screens/DashboardScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({ role }) => {
  return (
    <Tab.Navigator
      initialRouteName={role === 'Admin' ? 'DashboardTab' : 'HomeTab'}
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
      {role === 'Admin' ? (
        <>
          <Tab.Screen
            name="DashboardTab"
            component={DashboardScreen}
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="VehicleListTab"
            component={VehicleListScreen}
            options={{
              title: 'Araçlar',
              tabBarIcon: ({ color, size }) => (
                <Icon name="directions-car" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="RentalRequestsTab"
            component={RentalRequestsScreen}
            options={{
              title: 'İstekler',
              tabBarIcon: ({ color, size }) => (
                <Icon name="list" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="UsersListTab"
            component={UsersListScreen}
            options={{
              title: 'Kullanıcılar',
              tabBarIcon: ({ color, size }) => (
                <Icon name="group" size={size} color={color} />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="HomeTab"
            component={HomeScreen}
            options={{
              title: 'Anasayfa',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="VehicleListTab"
            component={VehicleListScreen}
            options={{
              title: 'Araçlar',
              tabBarIcon: ({ color, size }) => (
                <Icon name="directions-car" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="RentalHistoryTab"
            component={RentalHistoriesScreen}
            initialParams={{ type: 'history' }}
            options={{
              title: 'Geçmiş',
              tabBarIcon: ({ color, size }) => (
                <Icon name="history" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="PendingRequestsTab"
            component={RentalHistoriesScreen}
            initialParams={{ type: 'pending' }}
            options={{
              title: 'Bekleyen',
              tabBarIcon: ({ color, size }) => (
                <Icon name="schedule" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRole = await AsyncStorage.getItem('userRole');
        setRole(userRole);
        if (!token || !userRole) {
          setInitialRoute('Signin');
        } else {
          setInitialRoute('MainApp');
        }
      } catch (err) {
        setInitialRoute('Signin');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading || !initialRoute || !role) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1541e0" />
      </View>
    );
  }

  return (
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
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResendVerification" component={ResendVerificationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Ödeme Yöntemleri' }} />
          <Stack.Screen name="EditPaymentMethod" component={EditPaymentMethodScreen} options={{ title: 'Kart Düzenle' }} />
          <Stack.Screen name="ViewPaymentMethod" component={ViewPaymentMethod} options={{ title: 'Kart Detayları', presentation: 'modal' }} />
          <Stack.Screen name="MainApp" options={{ headerShown: false }}>
            {() => <TabNavigator role={role} />}
          </Stack.Screen>
          <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} options={{ title: 'Araç Detayları', headerShown: true }} />
          <Stack.Screen name="RentedScreen" component={RentedScreen} options={{ title: 'Araç Kirala', headerShown: true }} />
          <Stack.Screen name="ManageVehiclesScreen" component={ManageVehiclesScreen} options={{ title: 'Araç Yönetimi', headerShown: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
