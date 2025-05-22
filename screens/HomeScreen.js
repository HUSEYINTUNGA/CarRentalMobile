import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { useProfile } from '../hooks/useProfile';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';
import { useVehicles } from '../hooks/useVehicles';
import { useRentalHistories } from '../hooks/useRentalHistories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as jwtDecode from 'jwt-decode';

const HomeScreen = () => {
  const { fetchProfile } = useProfile();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { fetchVehicles, vehicles, loading: vehiclesLoading } = useVehicles();
  const { fetchRentalHistoriesByUserId, fetchPendingRentalHistories, rentalHistories, pendingRentalHistories, loading: rentalLoading, pendingLoading } = useRentalHistories();
  const [userId, setUserId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
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
      headerTitle: 'Ana Sayfa',
    });
  }, [navigation, menuVisible, profileData]);

  const latestVehicle = vehicles && vehicles.length > 0
    ? vehicles.reduce((latest, current) =>
        new Date(current.CreatedAt) > new Date(latest.CreatedAt) ? current : latest
      )
    : null;
  const firstFiveVehicles = vehicles
    ? [...vehicles]
        .sort((a, b) => (b.DailyPrice || 0) - (a.DailyPrice || 0))
        .slice(0, 3)
    : [];

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
        {latestVehicle && (
          <TouchableOpacity
            style={styles.adCard}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: latestVehicle.Id })}
          >
            <View style={styles.sectionHeaderBlue}><Text style={styles.sectionHeaderText}>Yeni aracımızı denedin mi?</Text></View>
            <Image
              source={latestVehicle.Photo ? { uri: `data:image/jpeg;base64,${latestVehicle.Photo}` } : undefined}
              style={styles.adImage}
            />
            <Text style={styles.adCarName}>{latestVehicle.Brand} {latestVehicle.Model}</Text>
            <View style={styles.greenPriceBadge}><Text style={styles.greenPriceBadgeText}>{latestVehicle.DailyPrice} TL / Günlük</Text></View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.listCard}
          onPress={() => navigation.navigate('VehicleListTab')}
        >
          <View style={styles.sectionHeaderBlue}><Text style={styles.sectionHeaderText}>Popüler Araçlar</Text></View>
          <View style={styles.vehicleListRow}>
            {firstFiveVehicles.map(vehicle => (
              <View key={vehicle.Id} style={styles.vehicleItem}>
                <Image
                  source={vehicle.Photo ? { uri: `data:image/jpeg;base64,${vehicle.Photo}` } : undefined}
                  style={styles.vehicleImage}
                />
                <Text style={styles.vehicleName}>{vehicle.Brand} {vehicle.Model}</Text>
                <View style={styles.greenPriceBadge}><Text style={styles.greenPriceBadgeText}>{vehicle.DailyPrice} TL</Text></View>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyCard}
          onPress={() => navigation.navigate('RentalHistoryTab')}
        >
          <View style={styles.sectionHeaderBlue}><Text style={styles.sectionHeaderText}>Kiralama Geçmişim</Text></View>
          {rentalLoading ? <ActivityIndicator /> : (
            rentalHistories.length === 0
              ? <Text style={styles.emptyText}>Onaylanmış kiralamanız yok.</Text>
              : rentalHistories.slice(0, 3).map(rental => (
                  <View key={rental.StartDate + rental.NumberPlate} style={styles.rentalItemRow}>
                    {rental.MainPhoto && (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${rental.MainPhoto}` }}
                        style={styles.rentalMiniImage}
                      />
                    )}
                    <Text style={styles.rentalCarBold}>{rental.Brand} {rental.Model}</Text>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>{rental.TotalPrice} TL</Text>
                    </View>
                  </View>
                ))
          )}
        </TouchableOpacity>

        <View style={styles.historyCard}>
          <TouchableOpacity onPress={() => navigation.navigate('PendingRequestsTab')}>
            <View style={styles.sectionHeaderBlue}><Text style={styles.sectionHeaderText}>Bekleyen Kiralama İsteklerim</Text></View>
            {pendingLoading ? <ActivityIndicator /> : (
              pendingRentalHistories.length === 0
                ? <Text style={styles.emptyText}>Bekleyen kiralama isteğiniz yok.</Text>
                : pendingRentalHistories.slice(0, 3).map(rental => (
                    <View key={rental.StartDate + rental.NumberPlate} style={styles.rentalItemRow}>
                      {rental.MainPhoto && (
                       <Image
                          source={{ uri: `data:image/jpeg;base64,${rental.MainPhoto}` }}
                          style={styles.rentalMiniImage}
                        />
                      )}
                      <Text style={styles.rentalCarBold}>{rental.Brand} {rental.Model}</Text>
                      <View style={styles.priceBadgePending}>
                        <Text style={styles.priceBadgePendingText}>{rental.TotalPrice} TL</Text>
                      </View>
                    </View>
                  ))
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#f4f6ff',
    flexGrow: 1,
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
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#1541e0',
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
});

export default HomeScreen;