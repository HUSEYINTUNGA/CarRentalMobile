import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
import VerifyAccountScreen from './screens/VerifyAccountScreen';
import HomeScreen from './screens/HomeScreen';
import { StatusBar, ActivityIndicator, View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
import WebViewScreen from './screens/WebViewScreen';
import ARVehicleScreen from './screens/ARVehicleScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import DashboardScreen from './screens/DashboardScreen';
import { decode as atob, encode as btoa } from 'base-64';
import * as jwtDecode from 'jwt-decode';
import { useAuth } from './hooks/useAuth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigationRef} from './RootNavigation';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

if (!global.atob) {
  global.atob = atob;
}
if (!global.btoa) {
  global.btoa = btoa;
}

const TabNavigator = (props) => {
  const { logout } = useAuth();
  const { setIsLoggedIn, setRole } = props;
  const navigation = useNavigation();
  const route = useRoute();
  const role = route?.params?.role;
  const { colors, isDark } = useTheme();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    setIsLoggedIn(false);
    setRole(null);
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  useEffect(() => {
    if (role === 'Admin') {
      navigation.navigate('DashboardTab');
    } else {
      navigation.navigate('HomeTab');
    }
  }, [role]);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: colors.tabBarBorder,
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
                headerShown: false,
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
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Icon name="directions-car" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="RentalRequestsTab"
              component={RentalRequestsScreen}
              options={{
                title: 'Kiralama İstekleri',
                headerShown: false,
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
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Icon name="group" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="ProfileTab"
              component={ProfileScreen}
              options={{
                title: 'Profil',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Icon name="person" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="LogoutTab"
              component={View}
              options={{
                title: 'Çıkış',
                tabBarIcon: ({ color, size }) => (
                  <Icon name="logout" size={size} color="#F44336" />
                ),
                tabBarButton: (props) => (
                  <TouchableOpacity
                    {...props}
                    onPress={handleLogout}
                  />
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
                headerShown: false,
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
                title: 'Geçmiş Kiralama İstekleriniz',
                headerShown: false,
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
                title: 'Bekleyen Kiralama İstekleriniz',
                tabBarIcon: ({ color, size }) => (
                  <Icon name="schedule" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="ProfileTab"
              component={ProfileScreen}
              options={{
                title: 'Profil',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Icon name="person" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="LogoutTab"
              component={View}
              options={{
                title: 'Çıkış',
                tabBarIcon: ({ color, size }) => (
                  <Icon name="logout" size={size} color="#F44336" />
                ),
                tabBarButton: (props) => (
                  <TouchableOpacity
                    {...props}
                    onPress={handleLogout}
                  />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Icon name="logout" size={40} color={colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.error }]}>Çıkış Yap</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Çıkış yapmak istediğinizden emin misiniz?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error }]}
                onPress={confirmLogout}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Çıkış Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, marginLeft: 8 }]}
                onPress={cancelLogout}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  rentButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    elevation: 3,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

const App = () => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userRole = await AsyncStorage.getItem('userRole');

        if (token && userRole) {
          const decodedToken = jwtDecode.jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            setRole(userRole);
            setIsLoggedIn(true);
          } else {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userName');
            await AsyncStorage.removeItem('userSurname');
            setIsLoggedIn(false);
            setRole(null);
          }
        } else {
          setIsLoggedIn(false);
          setRole(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsLoggedIn(false);
        setRole(null);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  if (!isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1541e0" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <ThemeProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName={isLoggedIn ? (role === 'Admin' ? 'MainApp' : 'Home') : 'Signin'}
            screenOptions={{
              animation: 'fade',
              contentStyle: { backgroundColor: '#fff' }
            }}
          >
            {isLoggedIn ? (
              <Stack.Screen
                name="MainApp"
                options={{ headerShown: false }}
                initialParams={{ role }}
              >
                {props => (
                  <TabNavigator {...props} setIsLoggedIn={setIsLoggedIn} setRole={setRole} />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Signin" options={{ headerShown: false }}>
                  {props => <SigninScreen {...props} setIsLoggedIn={setIsLoggedIn} setRole={setRole} />}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
                <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ResendVerification" component={ResendVerificationScreen} options={{ headerShown: false }} />
              </>
            )}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentMethods" options={{ title: 'Ödeme Yöntemleriniz', headerShown: false }} component={PaymentMethodsScreen} />
            <Stack.Screen name="EditPaymentMethod" options={{ title: 'Kart Düzenle', headerShown: false }} component={EditPaymentMethodScreen} />
            <Stack.Screen name="ViewPaymentMethod" options={{ title: 'Kart Detayları', presentation: 'modal' }} component={ViewPaymentMethod} />
            <Stack.Screen name="VehicleDetails" options={{ headerShown: false }} component={VehicleDetailsScreen} />
            <Stack.Screen name="RentedScreen" options={{ title: 'Araç Kirala', headerShown: false }} component={RentedScreen} />
            <Stack.Screen name="ManageVehicles" options={{ title: 'Araç Yönetimi', headerShown: false }} component={ManageVehiclesScreen} />
            <Stack.Screen name="RentalRequests" options={{ title: 'Kiralama İstekleri', headerShown: true }} component={RentalRequestsScreen} />
            <Stack.Screen name="UsersList" options={{ title: 'Kullanıcılar', headerShown: true }} component={UsersListScreen} />
            <Stack.Screen name="ChangePassword" options={{ headerShown: true, title: 'Şifre Değiştir' }} component={ChangePasswordScreen} />
            <Stack.Screen name="WebView" options={{ headerShown: false }} component={WebViewScreen} />
            <Stack.Screen name="ARVehicleScreen" options={{ headerShown: false }} component={ARVehicleScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </PaperProvider>
  );
};

export default App;
