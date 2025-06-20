import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, Animated, Dimensions, Switch, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUsers } from '../hooks/useProfile';
import { useRentalHistories } from '../hooks/useRentalHistories';
import { useAuth } from '../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import CustomDropdown from '../components/CustomDropdown';
import { LinearGradient } from 'expo-linear-gradient';

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

  const { colors, isDark } = useTheme();

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

  const formatPlate = (plate) => {
    if (!plate) return '';
    const match = plate.match(/^([0-9]{2})([A-ZÇĞİÖŞÜ]{1,3})([0-9]{2,4})$/i);
    if (match) {
      return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
    }
    return plate.toUpperCase();
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => handleUserCardPress(item)}>
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
        <View style={styles.cardRow}>
          <MaterialIcons name="person" size={28} color={colors.info} style={{ marginRight: 10 }} />
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.Name} {item.Surname} ({item.UserName})</Text>
            <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>{item.Email}</Text>
            <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>Rol: {item.Role}</Text>
            <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>Kiralama: {item.RentalCount}</Text>
          </View>
        </View>
        {item.IsVerified ? (
          <View style={styles.verifiedRow}>
            <MaterialIcons name="check-circle" size={18} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[styles.verifiedText, { color: colors.success }]}>Doğrulanmış</Text>
          </View>
        ) : (
          <View style={styles.verifiedRow}>
            <MaterialIcons name="cancel" size={18} color={colors.error} style={{ marginRight: 4 }} />
            <Text style={[styles.unverifiedText, { color: colors.error }]}>Doğrulanmamış</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      {/* Sticky Header */}
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="account-group" size={28} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Kullanıcılar</Text>
        </View>
      </LinearGradient>
      <View style={{ height: 100 }} />
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }] }>
        <Icon name="magnify" size={24} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Ara (isim, kullanıcı adı, email...)"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Filter/Sort Buttons */}
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            marginHorizontal: 4,
            alignItems: 'center',
            backgroundColor: colors.primary,
            borderWidth: 1,
            borderColor: colors.primary,
            shadowColor: colors.shadow,
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => openDrawer('filter')}
        >
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Filtrele</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            marginHorizontal: 4,
            alignItems: 'center',
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.primary,
            shadowColor: colors.shadow,
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => openDrawer('sort')}
        >
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Sırala</Text>
        </TouchableOpacity>
      </View>
      {/* Drawer */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDrawer}
      >
        <TouchableOpacity style={styles.drawerOverlay} onPress={closeDrawer} activeOpacity={1}>
          <Animated.View style={[styles.drawerContainer, { backgroundColor: colors.card, shadowColor: colors.shadow, borderColor: colors.border, borderWidth: 1, borderTopLeftRadius: 18, borderBottomLeftRadius: 18, elevation: 8 }] }>
            <View style={styles.drawerHeader}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary, letterSpacing: 0.5 }}>{drawerType === 'filter' ? 'Filtrele' : 'Sırala'}</Text>
              <TouchableOpacity onPress={closeDrawer} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <MaterialIcons name="close" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.drawerContent}>
              {drawerType === 'filter' ? (
                <>
                  <CustomDropdown
                    label="Rol"
                    value={tempRole}
                    options={roleOptions}
                    onValueChange={setTempRole}
                    placeholder="Tümü"
                    itemTextColor={colors.primary}
                  />
                  <CustomDropdown
                    label="Doğrulama"
                    value={tempIsVerified}
                    options={verifyOptions}
                    onValueChange={setTempIsVerified}
                    placeholder="Tümü"
                    itemTextColor={colors.primary}
                  />
                </>
              ) : (
                <CustomDropdown
                  label="Sıralama"
                  value={tempSort}
                  options={sortOptions}
                  onValueChange={setTempSort}
                  placeholder="Sıralama Yok"
                  itemTextColor={colors.primary}
                />
              )}
            </View>
            <TouchableOpacity style={{
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 18,
              width: '100%',
              alignSelf: 'center',
              backgroundColor: colors.primary,
              shadowColor: colors.shadow,
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 2,
            }} onPress={handleDrawerApply}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.white }}>Uygula</Text>
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
          <View style={[styles.detailModalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.detailModalTitle, { color: colors.primary }]}>Kullanıcı Detayı</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <MaterialIcons name="close" size={26} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {selectedUser &&
              <>
                {/* Modern info table */}
                <View style={{ borderRadius: 14, backgroundColor: colors.altCard, marginBottom: 16, overflow: 'hidden' }}>
                  {/* Ad Soyad */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Icon name="account" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Ad Soyad</Text>
                    <Text style={{ flex: 1, color: colors.text, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>{selectedUser.Name} {selectedUser.Surname}</Text>
                  </View>
                  {/* Kullanıcı Adı */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Icon name="account-circle" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Kullanıcı Adı</Text>
                    <Text style={{ flex: 1, color: colors.text, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>{selectedUser.UserName}</Text>
                  </View>
                  {/* E-posta */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Icon name="email" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 15 }}>E-posta</Text>
                    <Text style={{ flex: 1, color: colors.text, fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>{selectedUser.Email}</Text>
                  </View>
                  {/* Rol + Switch */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Icon name="account-key" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 15 }}>Rol</Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, marginRight: 10 }}>{roleSwitchValue ? 'Admin' : 'Customer'}</Text>
                    <Switch
                      value={roleSwitchValue}
                      onValueChange={handleRoleSwitch}
                      disabled={roleSwitchLoading}
                      thumbColor={roleSwitchValue ? colors.primary : colors.border}
                      trackColor={{ true: colors.primaryLight, false: colors.border }}
                    />
                  </View>
                  {/* Doğrulama */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Icon name={selectedUser.IsVerified ? 'check-circle' : 'close-circle'} size={22} color={selectedUser.IsVerified ? colors.success : colors.error} style={{ marginRight: 10 }} />
                    <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 15 }}>Doğrulama</Text>
                    <Text style={{ color: selectedUser.IsVerified ? colors.success : colors.error, fontWeight: 'bold', fontSize: 16 }}>{selectedUser.IsVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}</Text>
                  </View>
                  {/* Kiralama Sayısı */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6 }}>
                    <Icon name="car" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 15 }}>Kiralama Sayısı</Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{selectedUser.RentalCount}</Text>
                  </View>
                </View>
                {/* Kiralama Geçmişi başlığı */}
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Kiralama Geçmişi</Text>
                {rentalLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
                ) : rentalHistories.length === 0 ? (
                  <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: 10 }}>Kiralama geçmişi yok.</Text>
                ) : (
                  <View style={styles.rentalHistoryScrollWrapper}>
                    <ScrollView
                      style={{ flex: 1 }}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ paddingRight: 0, marginRight: 0 }}
                    >
                      {rentalHistories.map(rental => (
                        <View key={rental.Id} style={[styles.rentalHistoryItem, { backgroundColor: colors.altCard }] }>
                          <Text style={[styles.rentalHistoryCar, { color: colors.primary }]}>{rental.Brand} {rental.Model}</Text>
                          <Text style={[styles.rentalHistoryPlate, { color: colors.textSecondary }]}>Plaka: {formatPlate(rental.NumberPlate)}</Text>
                          <Text style={[styles.rentalHistoryDate, { color: colors.textSecondary }]}>{new Date(rental.StartDate).toLocaleDateString()} - {new Date(rental.EndDate).toLocaleDateString()}</Text>
                          <Text style={[styles.rentalHistoryPrice, { color: colors.success }]}>{rental.TotalPrice} TL</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            }
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
          <View style={[styles.passwordModalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
            <Text style={[styles.passwordModalTitle, { color: colors.primary }]}>Rol Değişikliği İçin Şifrenizi Girin</Text>
            <TextInput
              style={[styles.passwordInput, { borderColor: colors.border, backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="Şifreniz"
              placeholderTextColor={colors.textSecondary}
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
              editable={!roleSwitchLoading}
            />
            {passwordError ? <Text style={[styles.passwordError, { color: colors.error }]}>{passwordError}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, minWidth: 120 }]}
                onPress={handlePasswordConfirm}
                disabled={roleSwitchLoading || !adminPassword}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>{roleSwitchLoading ? 'Onaylanıyor...' : 'Onayla'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error, marginLeft: 8 }]}
                onPress={() => { setPasswordModalVisible(false); setRoleSwitchValue(!pendingRoleValue); }}
                disabled={roleSwitchLoading}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Kullanıcı listesi */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.info} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={item => item.Id}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Kullanıcı bulunamadı.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 16
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
  },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
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
  },
  drawerBtn: { 
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  drawerBtnText: { 
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawerContainer: {
    width: Dimensions.get('window').width * 0.8,
    height: '100%',
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  drawerContent: {
    flex: 1,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 4,
  },
  pickerBox: {
    borderRadius: 8,
    borderWidth: 1,
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
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12, 
    marginHorizontal: 8,
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 2 
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardInfo: { fontSize: 13 },
  applyBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
    alignSelf: 'center',
  },
  applyBtnText: { fontWeight: 'bold', fontSize: 15 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 38 },
  verifiedText: { fontWeight: 'bold', fontSize: 13 },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '85%',
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 15,
    marginBottom: 2,
  },
  rentalHistoryItem: {
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
    fontSize: 14,
  },
  rentalHistoryPlate: {
    fontSize: 13,
  },
  rentalHistoryDate: {
    fontSize: 12,
  },
  rentalHistoryPrice: {
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
    borderRadius: 14,
    padding: 20,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  passwordModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 6,
  },
  passwordError: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },
  unverifiedText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  rentButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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

export default UsersListScreen; 