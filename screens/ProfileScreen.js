import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile } from '../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';
import { deleteAccount } from '../api/customerApi';
import { useAuth } from '../hooks/useAuth';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const { loading, error, fetchProfile, updateProfileData, updatePhoto } = useProfile();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    loadProfile();
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

  const handleUpdateProfile = async () => {
    try {
      await updateProfileData({
        name: profileData.name,
        surname: profileData.surname,
        phoneNumber: profileData.phoneNumber
      });
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.');
    } catch (err) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handlePhotoPick = async (type) => {
    setPhotoModalVisible(false);
    setPhotoLoading(true);
    try {
      const options = { mediaType: 'photo', quality: 0.8 };
      let result;
      if (type === 'camera') {
        result = await launchCamera(options);
      } else {
        result = await launchImageLibrary(options);
      }
      if (result.didCancel || !result.assets || !result.assets[0]) {
        setPhotoLoading(false);
        return;
      }
      const imageData = {
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        name: result.assets[0].fileName || 'profile.jpg',
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
    setDeleteLoading(true);
    try {
      await deleteAccount();
      setDeleteModalVisible(false);
      setDeleteInput('');
      Alert.alert('Başarılı', 'Hesabınız silindi.');
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Signin' }] });
    } catch (err) {
      Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
    }
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

      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { profileData })}>
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.paymentButton} onPress={() => navigation.navigate('PaymentMethods')}>
          <Icon name="credit-card" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.paymentButtonText}>Ödeme Yöntemlerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
          <Icon name="delete" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 24,
    marginBottom: 10,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 14,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
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
});

export default ProfileScreen; 