import React, { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { useProfile } from '../hooks/useProfile';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';
import { useVehicles } from '../hooks/useVehicles';
import { useRentalHistories } from '../hooks/useRentalHistories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  const { fetchProfile } = useProfile();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { fetchVehicles, vehicles, loading: vehiclesLoading } = useVehicles();
  const { fetchRentalHistoriesByUserId, fetchPendingRentalHistories, rentalHistories, pendingRentalHistories, loading: rentalLoading, pendingLoading } = useRentalHistories();
  const [userId, setUserId] = useState(null);
  const [latestVehicle, setLatestVehicle] = useState(null);
  const [popularVehicles, setPopularVehicles] = useState([]);

  const processVehicleData = useCallback((vehicles) => {
    if (!vehicles || vehicles.length === 0) {
      setLatestVehicle(null);
      setPopularVehicles([]);
      return;
    }

    // En son eklenen araç
    const latest = vehicles.reduce((latest, current) =>
      new Date(current.CreatedAt) > new Date(latest.CreatedAt) ? current : latest
    );
    setLatestVehicle(latest);

    // Popüler araçlar (fiyata göre sıralı ilk 3 araç)
    const popular = [...vehicles]
      .sort((a, b) => (b.DailyPrice || 0) - (a.DailyPrice || 0))
      .slice(0, 3);
    setPopularVehicles(popular);
  }, []);

  useEffect(() => {
    if (vehicles) {
      processVehicleData(vehicles);
    }
  }, [vehicles, processVehicleData]);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode.jwtDecode(token);
        setUserId(decodedToken.nameid);
        
        const profileData = await fetchProfile();
        setProfileData(profileData);
        
        await fetchVehicles({});
        await fetchRentalHistoriesByUserId(decodedToken.nameid);
        await fetchPendingRentalHistories();
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    }
  };

  // İlk yükleme için useEffect
  useEffect(() => {
    loadData();
  }, []);

  // Her ekran odaklandığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleDrawerNavigate = (screen, params = {}) => {
    setDrawerVisible(false);
    if (screen === 'VehicleList') {
      navigation.navigate('VehicleListTab');
    } else if (screen === 'RentalHistory') {
      navigation.navigate('RentalHistoryTab', params);
    } else if (screen === 'PendingRequests') {
      navigation.navigate('PendingRequestsTab', params);
    } else {
      navigation.navigate(screen, params);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              onPress={() => setMenuVisible(true)} 
              style={styles.profileButton}
            >
              <Image
                source={
                  profileData?.profilePicture
                    ? { uri: `data:image/jpeg;base64,${profileData.profilePicture}` }
                    : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${profileData?.name || ''}+${profileData?.surname || ''}`) + '&background=2196F3&color=fff&size=120' }
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          <View style={styles.menuProfileTop}>
            <Image
              source={
                profileData?.profilePicture
                  ? { uri: `data:image/jpeg;base64,${profileData.profilePicture}` }
                  : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${profileData?.name || ''}+${profileData?.surname || ''}`) + '&background=2196F3&color=fff&size=120' }
              }
              style={styles.menuProfileImageLarge}
            />
            <Text style={styles.menuUserNameCenter}>{profileData?.name} {profileData?.surname}</Text>
            <Text style={styles.menuUserNameCenter}>{profileData?.email}</Text>
            <View style={styles.menuVerifiedRowCenter}>
              {profileData?.isVerified ? (
                <>
                  <Icon name="check-circle" size={15} color="#4CAF50" style={{ marginRight: 4 }} />
                  <Text style={styles.menuVerifiedTextCenter}>Doğrulanmış</Text>
                </>
              ) : (
                <Text style={styles.menuNotVerifiedTextCenter}>Doğrulanmamış</Text>
              )}
            </View>
          </View>
        </Menu>
      ),
      headerTitle: '',
      headerTransparent: true,
    });
  }, [navigation, menuVisible, profileData]);

  if (vehiclesLoading || rentalLoading) {
    return <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 40 }} />;
  }

  return (
    <>
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerVisible(false)}
      >
        <TouchableOpacity style={styles.drawerOverlay} onPress={() => setDrawerVisible(false)} activeOpacity={1} />
        <View style={styles.drawerMenu}>
          <Text style={styles.drawerTitle}>Menü</Text>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('Home')}>
            <Icon name="home" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Anasayfa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('VehicleList')}>
            <Icon name="car" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Araçlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('RentalHistory', { type: 'history' })}>
            <Icon name="history" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Kiralama Geçmişim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('RentalHistory', { type: 'pending' })}>
            <Icon name="clock-outline" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Bekleyen Kiralama İsteklerim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('Settings')}>
            <Icon name="cog" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Ayarlar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={['#0066cc', '#0052a3']}
          style={styles.header}
        >
          <Text style={styles.headerTitleCentered}>Hoş Geldin, {profileData?.name}!</Text>
          <Text style={styles.headerSubtitleCentered}>Bugün hangi aracı kiralamak istersin?</Text>
        </LinearGradient>

        <View style={styles.content}>
          {latestVehicle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Yeni Eklenen Araç</Text>
              <TouchableOpacity
                style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: '#0066cc' }]}
                onPress={() => navigation.navigate('VehicleDetails', { vehicleId: latestVehicle.Id })}
              >
                <View style={styles.vehicleImageWrapper}>
                  {latestVehicle.Photo ? (
                    <Image
                      source={{ uri: latestVehicle.Photo }}
                      style={styles.vehicleImage}
                    />
                  ) : (
                    <Icon name="car" size={32} color="#0066cc" />
                  )}
                </View>
                <View style={styles.vehicleInfoHorizontal}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Icon name="car" size={18} color="#0066cc" style={{ marginRight: 6 }} />
                    <Text style={styles.vehicleTitle}>{latestVehicle.Brand} {latestVehicle.Model}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Icon name="tag" size={16} color="#0066cc" style={{ marginRight: 6 }} />
                    <Text style={styles.vehicleDetailHorizontal}>Günlük: {latestVehicle.DailyPrice} TL</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="calendar" size={16} color="#0066cc" style={{ marginRight: 6 }} />
                    <Text style={styles.vehicleDetailHorizontal}>
                      {new Date(latestVehicle.CreatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popüler Araçlar</Text>
            {popularVehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.Id}
                style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: '#3393dc' }]}
                onPress={() => navigation.navigate('VehicleDetails', { vehicleId: vehicle.Id })}
              >
                <View style={styles.vehicleImageWrapper}>
                  {vehicle.Photo ? (
                    <Image
                      source={{ uri: vehicle.Photo }}
                      style={styles.vehicleImage}
                    />
                  ) : (
                    <Icon name="car" size={32} color="#3393dc" />
                  )}
                </View>
                <View style={styles.vehicleInfoHorizontal}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Icon name="car" size={18} color="#3393dc" style={{ marginRight: 6 }} />
                    <Text style={styles.vehicleTitle}>{vehicle.Brand} {vehicle.Model}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Icon name="tag" size={16} color="#3393dc" style={{ marginRight: 6 }} />
                    <Text style={styles.vehicleDetailHorizontal}>Günlük: {vehicle.DailyPrice} TL</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="calendar" size={16} color="#3393dc" style={{ marginRight: 6 }} />
                    <Text style={styles.vehicleDetailHorizontal}>
                      {new Date(vehicle.CreatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kiralama Geçmişim</Text>
            {rentalLoading ? (
              <ActivityIndicator size="large" color="#0066cc" />
            ) : rentalHistories.length === 0 ? (
              <Text style={styles.emptyText}>Onaylanmış kiralamanız yok.</Text>
            ) : (
              rentalHistories.slice(0, 3).map(rental => (
                <View
                  key={rental.StartDate + rental.NumberPlate}
                  style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: '#e53935' }]}
                >
                  <View style={styles.vehicleImageWrapper}>
                    {rental.MainPhotoUrl ? (
                      <Image
                        source={{ uri: rental.MainPhotoUrl }}
                        style={styles.vehicleImage}
                      />
                    ) : (
                      <Icon name="car" size={32} color="#e53935" />
                    )}
                  </View>
                  <View style={styles.vehicleInfoHorizontal}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Icon name="car" size={18} color="#e53935" style={{ marginRight: 6 }} />
                      <Text style={styles.vehicleTitle}>{rental.Brand} {rental.Model}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Icon name="calendar" size={16} color="#e53935" style={{ marginRight: 6 }} />
                      <Text style={styles.vehicleDetailHorizontal}>
                        {new Date(rental.StartDate).toLocaleDateString()} - {new Date(rental.EndDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="cash" size={16} color="#e53935" style={{ marginRight: 6 }} />
                      <Text style={styles.vehicleDetailHorizontal}>Toplam: {rental.TotalPrice} TL</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bekleyen Kiralama İsteklerim</Text>
            {pendingLoading ? (
              <ActivityIndicator size="large" color="#0066cc" />
            ) : pendingRentalHistories.length === 0 ? (
              <Text style={styles.emptyText}>Bekleyen kiralama isteğiniz yok.</Text>
            ) : (
              pendingRentalHistories.slice(0, 3).map(rental => (
                <View
                  key={rental.StartDate + rental.NumberPlate}
                  style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: '#2196F3' }]}
                >
                  <View style={styles.vehicleImageWrapper}>
                    {rental.MainPhotoUrl ? (
                      <Image
                        source={{ uri: rental.MainPhotoUrl }}
                        style={styles.vehicleImage}
                      />
                    ) : (
                      <Icon name="car" size={32} color="#2196F3" />
                    )}
                  </View>
                  <View style={styles.vehicleInfoHorizontal}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Icon name="car" size={18} color="#2196F3" style={{ marginRight: 6 }} />
                      <Text style={styles.vehicleTitle}>{rental.Brand} {rental.Model}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Icon name="calendar" size={16} color="#2196F3" style={{ marginRight: 6 }} />
                      <Text style={styles.vehicleDetailHorizontal}>
                        {new Date(rental.StartDate).toLocaleDateString()} - {new Date(rental.EndDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="cash" size={16} color="#2196F3" style={{ marginRight: 6 }} />
                      <Text style={styles.vehicleDetailHorizontal}>Toplam: {rental.TotalPrice} TL</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f6ff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitleCentered: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitleCentered: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    padding: 15,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#1541e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14
  },
  buttonIcon: {
    marginRight: 8
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 10
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  drawerMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 260,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 18,
    zIndex: 2,
    elevation: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1541e0',
    textAlign: 'left',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  drawerItemText: {
    marginLeft: 14,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  profileButton: {
    marginRight: 16,
    zIndex: 1000,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minWidth: 240,
    paddingVertical: 8,
    paddingHorizontal: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  menuProfileTop: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuProfileImageLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  menuUserNameCenter: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 2,
  },
  menuVerifiedRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  menuVerifiedTextCenter: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: 'bold',
  },
  menuNotVerifiedTextCenter: {
    color: '#F44336',
    fontSize: 13,
    fontWeight: 'bold',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 2,
  },
  menuProfileItem: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  menuProfileItemText: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  menuLogoutItem: {
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  menuLogoutItemText: {
    fontSize: 15,
    color: '#F44336',
    fontWeight: 'bold',
  },
  adCard: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
  },
  adImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 14,
  },
  adCarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  adCarPrice: {
    fontSize: 14,
    color: '#666',
  },
  listCard: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
  },
  vehicleListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleItem: {
    width: '30%',
    alignItems: 'center',
  },
  vehicleImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vehiclePrice: {
    fontSize: 14,
    color: '#666',
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  rentalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rentalCarBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceBadge: {
    backgroundColor: '#e53935',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  rentalMiniImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  priceBadgePending: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadgePendingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionHeaderBlue: {
    backgroundColor: '#1976d2',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  greenPriceBadge: {
    backgroundColor: '#43a047',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  greenPriceBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  vehicleCardHorizontal: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  vehicleImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  vehicleInfoHorizontal: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  vehicleDetailHorizontal: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 3,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default HomeScreen;