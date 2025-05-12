import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';

const HomeScreen = () => {
  const { user, token, logout } = useAuth();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = async () => {
    try {
      setMenuVisible(false);
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Signin' }],
      });
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const handleDrawerNavigate = (screen) => {
    setDrawerVisible(false);
    navigation.navigate(screen);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setDrawerVisible(true)} style={{ marginLeft: 16 }}>
          <Icon name="menu" size={28} color="#333" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 16 }}>
              <Icon name="account-circle" size={28} color="#1541e0" />
            </TouchableOpacity>
          }
        >
          <Menu.Item title={user?.fullName || 'Kullanıcı'} disabled />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Profile');
            }}
            title="Profilim"
          />
          <Menu.Item
            onPress={handleLogout}
            title="Çıkış Yap"
          />
        </Menu>
      ),
      headerTitle: 'Ana Sayfa',
    });
  }, [navigation, menuVisible, user]);

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
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('Cars')}>
            <Icon name="car" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Araçlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('RentalHistory')}>
            <Icon name="history" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Kiralama Geçmişim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem} onPress={() => handleDrawerNavigate('Settings')}>
            <Icon name="cog" size={22} color="#1541e0" />
            <Text style={styles.drawerItemText}>Ayarlar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcome}>Hoş geldin, {user?.fullName || 'Kullanıcı'}!</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hızlı İşlemler</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Yeni Randevu Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Randevularımı Görüntüle</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profil İşlemleri</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Profilimi Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Şifremi Değiştir</Text>
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
  welcome: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444'
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
});

export default HomeScreen;
