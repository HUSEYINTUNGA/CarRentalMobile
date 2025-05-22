import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile } from '../hooks/useProfile';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { deleteAccount } from '../api/customerApi';
import { useAuth } from '../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToSignin } from '../RootNavigation';

const ProfileScreen = () => {
  const { loading, fetchProfile, updatePhoto } = useProfile();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadProfile();
    AsyncStorage.getItem('userRole').then(setUserRole);
  }, [retryCount]);

  const loadProfile = async () => {
    try {
      const data = await fetchProfile();
      setProfileData(data);
    } catch (err) {
      Alert.alert(
        'Hata',
        'Profil bilgileri yüklenirken bir hata oluştu. Tekrar denemek ister misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Tekrar Dene',
            onPress: () => setRetryCount(prev => prev + 1)
          }
        ]
      );
    }
  };

  const handlePhotoPick = async (type) => {
    setPhotoModalVisible(false);
    setPhotoLoading(true);
    try {
      let result;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Kamera izni gerekli!');
          setPhotoLoading(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Galeri izni gerekli!');
          setPhotoLoading(false);
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: true,
        });
      }
      if (result.canceled || !result.assets || !result.assets[0]) {
        setPhotoLoading(false);
        return;
      }
      const asset = result.assets[0];
      const imageData = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'profile.jpg',
        base64: asset.base64,
      };
      await updatePhoto(imageData);
      Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi.');
      loadProfile();
    } catch (err) {
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput.trim().toLowerCase() !== 'delete') {
      Alert.alert('Uyarı', 'Lütfen kutuya delete yazınız.');
      return;
    }

    Alert.alert(
      'Hesap Silme Onayı',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Evet, Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteAccount();
              setDeleteModalVisible(false);
              setDeleteInput('');
              Alert.alert(
                'Başarılı',
                'Hesabınız başarıyla silindi. Uygulamadan çıkış yapılıyor...',
                [{ text: 'Tamam' }]
              );
              await logout();
              resetToSignin();
            } catch (err) {
              console.error('Hesap silme hatası:', err);
              Alert.alert(
                'Hata',
                err.response?.data?.message || 'Hesap silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
              );
            } finally {
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    resetToSignin();
  };

  if (loading || photoLoading) {
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
                : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${profileData?.name || ''}+${profileData?.surname || ''}`) + '&background=2196F3&color=fff&size=120' }
            }
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={() => setPhotoModalVisible(true)}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{profileData?.userName || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{profileData?.email || 'email@example.com'}</Text>
        <View style={styles.verifiedRow}>
          {profileData?.isVerified ? (
            <>
              <Icon name="check-circle" size={18} color="#4CAF50" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Doğrulanmış</Text>
            </>
          ) : (
            <Text style={styles.notVerifiedText}>Doğrulanmamış</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        <View style={styles.infoItem}>
          <Icon name="person" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>{profileData ? `${profileData.name} ${profileData.surname}` : 'Belirtilmemiş'}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Icon name="phone" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <Text style={styles.infoValue}>{profileData?.phoneNumber || 'Belirtilmemiş'}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Icon name="badge" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>TC Kimlik No</Text>
            <Text style={styles.infoValue}>{profileData?.tcNo || 'Belirtilmemiş'}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Icon name="security" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{profileData?.role || 'Belirtilmemiş'}</Text>
          </View>
        </View>
      </View>

      {/* Aksiyon Satırları */}
      <View style={styles.actionSection}>
        {userRole !== 'Admin' && (
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('PaymentMethods')}>
            <Icon name="credit-card" size={22} color="#2196F3" style={{ marginRight: 12 }} />
            <Text style={styles.actionLabel}>Ödeme Yöntemlerim</Text>
            <Icon name="chevron-right" size={22} color="#bbb" />
          </TouchableOpacity>
        )}
        {userRole !== 'Admin' && <View style={styles.divider} />}
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('EditProfile', { profileData })}>
          <Icon name="edit" size={22} color="#2196F3" style={{ marginRight: 12 }} />
          <Text style={styles.actionLabel}>Profili Düzenle</Text>
          <Icon name="chevron-right" size={22} color="#bbb" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={[styles.actionRow, styles.deleteRow]} onPress={() => setDeleteModalVisible(true)}>
          <View style={styles.deleteContent}>
            <Icon name="delete" size={22} color="#F44336" style={{ marginRight: 8 }} />
            <Text style={styles.deleteLabel}>Hesabı Sil</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Profil fotoğrafı modalı */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profil Fotoğrafı</Text>
            <Text style={styles.modalDesc}>Fotoğrafı nasıl eklemek istersin?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalPhotoButton} onPress={() => handlePhotoPick('camera')}>
                <Icon name="photo-camera" size={22} color="#2196F3" style={{ marginRight: 8 }} />
                <Text style={styles.modalPhotoText}>Kameradan Çek</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPhotoButton} onPress={() => handlePhotoPick('gallery')}>
                <Icon name="photo-library" size={22} color="#2196F3" style={{ marginRight: 8 }} />
                <Text style={styles.modalPhotoText}>Galeriden Seç</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setPhotoModalVisible(false)}>
              <Text style={styles.modalCancelText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hesap silme modalı */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hesabını silmek istediğine emin misin?</Text>
            <Text style={styles.modalDesc}>Hesabını silmek için kutuya <Text style={{ fontWeight: 'bold', color: '#F44336' }}>'delete'</Text> yazmalısın.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="delete"
              value={deleteInput}
              onChangeText={setDeleteInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setDeleteModalVisible(false)} disabled={deleteLoading}>
                <Text style={styles.modalCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteButton} onPress={handleDeleteAccount} disabled={deleteLoading}>
                <Text style={styles.modalDeleteText}>{deleteLoading ? 'Siliniyor...' : 'Hesabı Sil'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#e0e0e0',
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
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  verifiedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notVerifiedText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
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
  actionSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 24,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 55,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 18,
    backgroundColor: '#f9f9f9',
    color: '#000',
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalPhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6ff',
    padding: 12,
    borderRadius: 8,
    margin: 6,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  modalPhotoText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  deleteLabel: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 