import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, Animated, Dimensions, Switch, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUsers } from '../hooks/useProfile';
import { useRentalHistories } from '../hooks/useRentalHistories';
import { useAuth } from '../hooks/useAuth';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const roleOptions = [
  { label: 'Tümü', value: '' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Customer', value: 'Customer' },
];
const verifyOptions = [
  { label: 'Tümü', value: '' },
  { label: 'Doğrulanmış', value: true },
  { label: 'Doğrulanmamış', value: false },
];
const sortOptions = [
  { label: 'Kullanıcı Adına Göre', value: '' },
  { label: 'İsme Göre', value: 'name' },
  { label: 'Kiralama Sayısına Göre', value: 'rentalCount' },
  { label: 'Oluşturulma Tarihine Göre', value: 'created' },
  { label: 'Rolüne Göre', value: 'role' },
];

const UsersListScreen = () => {
  const { users, loading, error, fetchUsers } = useUsers();
  const { rentalHistories, fetchRentalHistoriesByUserId, loading: rentalLoading } = useRentalHistories();
  const { changeUserRole } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isVerified, setIsVerified] = useState('');
  const [sort, setSort] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [roleSwitchValue, setRoleSwitchValue] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState('filter');
  const [tempRole, setTempRole] = useState(role);
  const [tempIsVerified, setTempIsVerified] = useState(isVerified);
  const [tempSort, setTempSort] = useState(sort);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [pendingRoleValue, setPendingRoleValue] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    fetchUsers(params);
  }, [search]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [])
  );

  const openDrawer = (type) => {
    setDrawerType(type);
    setTempRole(role);
    setTempIsVerified(isVerified);
    setTempSort(sort);
    setDrawerVisible(true);
  };
  const closeDrawer = () => setDrawerVisible(false);
  const handleDrawerApply = () => {
    if (drawerType === 'filter') {
      setRole(tempRole);
      setIsVerified(tempIsVerified);
      handleApplyFilters(tempRole, tempIsVerified, sort);
    } else {
      setSort(tempSort);
      handleApplyFilters(role, isVerified, tempSort);
    }
    setDrawerVisible(false);
  };

  const handleApplyFilters = (roleParam = role, isVerifiedParam = isVerified, sortParam = sort) => {
    const params = {};
    if (search) params.search = search;
    if (roleParam) params.role = roleParam;
    if (isVerifiedParam !== '') params.isVerified = isVerifiedParam;
    if (sortParam) params.sort = sortParam;
    fetchUsers(params);
  };

  const handleUserCardPress = async (user) => {
    setSelectedUser(user);
    setRoleSwitchValue(user.Role === 'Admin');
    setDetailModalVisible(true);
    await fetchRentalHistoriesByUserId(user.Id);
  };

  const handleRoleSwitch = (value) => {
    setPendingRoleValue(value);
    setPasswordModalVisible(true);
    setPasswordError('');
    setAdminPassword('');
  };

  const handlePasswordConfirm = async () => {
    setRoleSwitchLoading(true);
    try {
      const result = await changeUserRole({
        TargetUserId: selectedUser.Id,
        NewRole: pendingRoleValue ? 'Admin' : 'Customer',
        AdminPassword: adminPassword
      });
      if (result.success) {
        setRoleSwitchValue(pendingRoleValue);
        setPasswordModalVisible(false);
      } else {
        setPasswordError('Şifre yanlış veya işlem başarısız.');
        setRoleSwitchValue(!pendingRoleValue);
      }
    } catch (err) {
      setPasswordError('Şifre yanlış veya işlem başarısız.');
      setRoleSwitchValue(!pendingRoleValue);
    }
    setRoleSwitchLoading(false);
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => handleUserCardPress(item)}>
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <MaterialIcons name="person" size={28} color="#3393dc" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.cardTitle}>{item.Name} {item.Surname} ({item.UserName})</Text>
            <Text style={styles.cardInfo}>{item.Email}</Text>
            <Text style={styles.cardInfo}>Rol: {item.Role}</Text>
            <Text style={styles.cardInfo}>Kiralama: {item.RentalCount}</Text>
          </View>
        </View>
        {item.IsVerified ? (
          <View style={styles.verifiedRow}>
            <MaterialIcons name="check-circle" size={18} color="#43a047" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedText}>Doğrulanmış</Text>
          </View>
        ) : (
          <View style={styles.verifiedRow}>
            <MaterialIcons name="cancel" size={18} color="#d32f2f" style={{ marginRight: 4 }} />
            <Text style={styles.unverifiedText}>Doğrulanmamış</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Ara (isim, kullanıcı adı, email...)"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity style={styles.drawerBtn} onPress={() => openDrawer('filter')}>
          <Text style={styles.drawerBtnText}>Filtrele</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerBtn} onPress={() => openDrawer('sort')}>
          <Text style={styles.drawerBtnText}>Sırala</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDrawer}
      >
        <TouchableOpacity style={styles.drawerOverlay} onPress={closeDrawer} activeOpacity={1}>
          <Animated.View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{drawerType === 'filter' ? 'Filtrele' : 'Sırala'}</Text>
              <TouchableOpacity onPress={closeDrawer} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <MaterialIcons name="close" size={26} color="#1976d2" />
              </TouchableOpacity>
            </View>
            <View style={styles.drawerContent}>
              {drawerType === 'filter' ? (
                <>
                  <Text style={styles.drawerLabel}>Rol</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={tempRole} onValueChange={setTempRole} style={styles.picker} mode="dropdown">
                      {roleOptions.map(opt => <Picker.Item key={opt.value} label={opt.label} value={opt.value} />)}
                    </Picker>
                  </View>
                  <Text style={styles.drawerLabel}>Doğrulama</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={tempIsVerified} onValueChange={setTempIsVerified} style={styles.picker} mode="dropdown">
                      {verifyOptions.map(opt => <Picker.Item key={String(opt.value)} label={opt.label} value={opt.value} />)}
                    </Picker>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.drawerLabel}>Sırala</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={tempSort} onValueChange={setTempSort} style={styles.picker} mode="dropdown">
                      {sortOptions.map(opt => <Picker.Item key={opt.value} label={opt.label} value={opt.value} />)}
                    </Picker>
                  </View>
                </>
              )}
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={handleDrawerApply}>
              <Text style={styles.applyBtnText}>Uygula</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.detailModalTitle}>Kullanıcı Detayı</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <MaterialIcons name="close" size={26} color="#1976d2" />
              </TouchableOpacity>
            </View>
            {selectedUser && (
              <>
                <Text style={styles.detailLabel}>Ad Soyad</Text>
                <Text style={styles.detailValue}>{selectedUser.Name} {selectedUser.Surname}</Text>
                <Text style={styles.detailLabel}>Kullanıcı Adı</Text>
                <Text style={styles.detailValue}>{selectedUser.UserName}</Text>
                <Text style={styles.detailLabel}>E-posta</Text>
                <Text style={styles.detailValue}>{selectedUser.Email}</Text>
                <Text style={styles.detailLabel}>Rol</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.detailValue, { marginRight: 10 }]}>{roleSwitchValue ? 'Admin' : 'Customer'}</Text>
                  <Switch
                    value={roleSwitchValue}
                    onValueChange={handleRoleSwitch}
                    disabled={roleSwitchLoading}
                    thumbColor={roleSwitchValue ? '#1976d2' : '#ccc'}
                    trackColor={{ true: '#90caf9', false: '#e0e0e0' }}
                  />
                </View>
                <Text style={styles.detailLabel}>Doğrulama</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {selectedUser.IsVerified ? (
                    <>
                      <MaterialIcons name="check-circle" size={18} color="#43a047" style={{ marginRight: 4 }} />
                      <Text style={styles.verifiedText}>Doğrulanmış</Text>
                    </>
                  ) : (
                    <Text style={[styles.detailValue, { color: '#e53935' }]}>Doğrulanmamış</Text>
                  )}
                </View>
                <Text style={styles.detailLabel}>Kiralama Geçmişi</Text>
                {rentalLoading ? (
                  <ActivityIndicator size="small" color="#1976d2" style={{ marginTop: 10 }} />
                ) : rentalHistories.length === 0 ? (
                  <Text style={{ color: '#888', fontStyle: 'italic', marginBottom: 10 }}>Kiralama geçmişi yok.</Text>
                ) : (
                  <View style={styles.rentalHistoryScrollWrapper}>
                    <ScrollView
                      style={{ flex: 1 }}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ paddingRight: 0, marginRight: 0 }}
                    >
                      {rentalHistories.map(rental => (
                        <View key={rental.Id} style={styles.rentalHistoryItem}>
                          <Text style={styles.rentalHistoryCar}>{rental.Brand} {rental.Model}</Text>
                          <Text style={styles.rentalHistoryPlate}>{rental.NumberPlate}</Text>
                          <Text style={styles.rentalHistoryDate}>{new Date(rental.StartDate).toLocaleDateString()} - {new Date(rental.EndDate).toLocaleDateString()}</Text>
                          <Text style={styles.rentalHistoryPrice}>{rental.TotalPrice} TL</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={passwordModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.passwordModalOverlay}>
          <View style={styles.passwordModalContent}>
            <Text style={styles.passwordModalTitle}>Rol Değişikliği İçin Şifrenizi Girin</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Şifreniz"
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
              editable={!roleSwitchLoading}
            />
            {passwordError ? <Text style={styles.passwordError}>{passwordError}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.passwordBtn, { backgroundColor: '#e0e0e0', marginRight: 10 }]}
                onPress={() => { setPasswordModalVisible(false); setRoleSwitchValue(!pendingRoleValue); }}
                disabled={roleSwitchLoading}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.passwordBtn, { backgroundColor: '#1976d2' }]}
                onPress={handlePasswordConfirm}
                disabled={roleSwitchLoading || !adminPassword}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{roleSwitchLoading ? 'Onaylanıyor...' : 'Onayla'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Kullanıcı listesi */}
      {loading ? (
        <ActivityIndicator size="large" color="#3393dc" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={item => item.Id}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>Kullanıcı bulunamadı.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 16
  },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
    marginTop: 0,
    marginHorizontal: 0
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#222',
  },
  drawerBtn: { 
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  drawerBtnText: { 
    color: '#1976d2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawerContainer: {
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#fafbfc',
    height: '100%',
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  drawerContent: {
    flex: 1,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 18,
    marginBottom: 4,
  },
  pickerBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    height: 48,
    justifyContent: 'center',
  },
  filterButtonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 0, 
    marginBottom: 10,
    marginHorizontal: 8
  },
  picker: {
    height: 48,
    width: '100%',
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12, 
    marginHorizontal: 8,
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 2 
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardInfo: { fontSize: 13, color: '#444' },
  applyBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    alignSelf: 'center',
  },
  applyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 38 },
  verifiedText: { color: '#43a047', fontWeight: 'bold', fontSize: 13 },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '85%',
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 10,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  rentalHistoryItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 7,
  },
  rentalHistoryScrollWrapper: {
    height: 180,
    borderRadius: 8,
    overflow: 'scroll',
    marginBottom: 4,
  },
  rentalHistoryCar: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 14,
  },
  rentalHistoryPlate: {
    color: '#555',
    fontSize: 13,
  },
  rentalHistoryDate: {
    color: '#888',
    fontSize: 12,
  },
  rentalHistoryPrice: {
    color: '#43a047',
    fontWeight: 'bold',
    fontSize: 13,
  },
  passwordModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  passwordModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 6,
    backgroundColor: '#fafbfc',
  },
  passwordBtn: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  passwordError: {
    color: '#e53935',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },
  unverifiedText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default UsersListScreen; 