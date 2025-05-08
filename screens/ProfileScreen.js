import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile } from '../hooks/useProfile';

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const { loading, error, fetchProfile, updateProfileData, updatePhoto } = useProfile();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchProfile();
      setProfileData(data);
    } catch (err) {
      Alert.alert('Hata', 'Profil bilgileri yüklenirken bir hata oluştu.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfileData({
        name: profileData.name,
        surname: profileData.surname,
        phone: profileData.phone,
        address: profileData.address
      });
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.');
    } catch (err) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleUpdatePhoto = async () => {
    try {
      // Burada image picker kullanılabilir
      const imageData = {
        uri: 'image_uri_here',
        type: 'image/jpeg',
        name: 'profile.jpg'
      };
      await updatePhoto(imageData);
      Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi.');
      loadProfile(); // Profili yeniden yükle
    } catch (err) {
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={
              profileData?.profilePicture
                ? { uri: `data:image/jpeg;base64,${profileData.profilePicture}` }
                : { uri: 'https://via.placeholder.com/150' }
            }
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={handleUpdatePhoto}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{profileData?.username || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{profileData?.email || 'email@example.com'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        <View style={styles.infoItem}>
          <Icon name="person" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>{profileData?.fullName || 'Belirtilmemiş'}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Icon name="phone" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <Text style={styles.infoValue}>{profileData?.phone || 'Belirtilmemiş'}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Icon name="location-on" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Adres</Text>
            <Text style={styles.infoValue}>{profileData?.address || 'Belirtilmemiş'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleUpdateProfile}>
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: '#2196F3',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 