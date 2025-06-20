import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile } from '../hooks/useProfile';
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native';
import { deleteAccount } from '../api/customerApi';
import { useAuth } from '../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToSignin } from '../RootNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import MessageModal from '../components/MessageModal';

const ProfileScreen = () => {
  const { loading, fetchProfile, updatePhoto } = useProfile();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageIcon, setMessageIcon] = useState('info');
  const [photoMessageVisible, setPhotoMessageVisible] = useState(false);
  const [photoMessageTitle, setPhotoMessageTitle] = useState('');
  const [photoMessageText, setPhotoMessageText] = useState('');
  const [photoMessageIcon, setPhotoMessageIcon] = useState('info');
  const [deleteInput, setDeleteInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { theme, setTheme, colors, isDark } = useTheme();
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const loadProfile = async () => {
    try {
      const [role, profileData] = await Promise.all([
        AsyncStorage.getItem('userRole'),
        fetchProfile()
      ]);
      setUserRole(role);
      setProfileData(profileData);
    } catch (err) {
      setErrorModalMessage('Profil bilgileri yüklenirken bir hata oluştu. Tekrar denemek ister misiniz?');
      setErrorModalVisible(true);
    }
  };

  // İlk yükleme için useEffect
  useEffect(() => {
    loadProfile();
  }, [retryCount]);

  // Her ekran odaklandığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const showMessage = (title, text, icon = 'info') => {
    setMessageTitle(title);
    setMessageText(text);
    setMessageIcon(icon);
    setMessageModalVisible(true);
  };

  const showPhotoMessage = (title, text, icon = 'info') => {
    setPhotoMessageTitle(title);
    setPhotoMessageText(text);
    setPhotoMessageIcon(icon);
    setPhotoMessageVisible(true);
  };

  const handlePhotoPick = async (type) => {
    setPhotoModalVisible(false);
    setPhotoLoading(true);
    try {
      let result;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showPhotoMessage('Kamera İzni Gerekli', 'Kamera izni verilmedi. Ayarlardan izin verebilirsiniz.', 'warning');
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
          showPhotoMessage('Galeri İzni Gerekli', 'Galeri izni verilmedi. Ayarlardan izin verebilirsiniz.', 'warning');
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
      showPhotoMessage('Başarılı', 'Profil fotoğrafı güncellendi.', 'check-circle');
      loadProfile();
    } catch (err) {
      showPhotoMessage('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu.', 'error');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteInput.trim().toLowerCase() !== 'delete') {
      showMessage('Uyarı', 'Lütfen kutuya delete yazınız.', 'warning');
      return;
    }

    // Delete yazıldıysa şifre modalını aç
    setDeleteModalVisible(false);
    setPasswordModalVisible(true);
  };

  const handlePasswordConfirm = async () => {
    if (!passwordInput.trim()) {
      showMessage('Uyarı', 'Lütfen şifrenizi giriniz.', 'warning');
      return;
    }

    setDeleteLoading(true);
    try {
      // Şifre doğrulaması ve hesap silme işlemi
      const response = await deleteAccount(passwordInput);
      
      if (response.data.Success) {
        setPasswordModalVisible(false);
        setDeleteInput('');
        setPasswordInput('');
        showMessage(
          'Başarılı',
          response.data.data?.Message || response.data.Message || 'Hesabınız başarıyla silindi. Uygulamadan çıkış yapılıyor...',
          'check-circle'
        );
        // 2 saniye sonra çıkış yap
        setTimeout(async () => {
          await logout();
          resetToSignin();
        }, 2000);
      } else {
        // Backend'den gelen hata mesajı
        showMessage('Hata', response.data.data?.Message || response.data.Message || 'Bir hata oluştu.', 'error');
      }
    } catch (err) {
      // Backend'den gelen response'u kontrol et
      const errorMessage = err.response?.data?.data?.Message || err.response?.data?.Message || err.response?.data?.message;
      
      if (errorMessage?.includes('Aktif kiralamalarınız bulunmaktadır')) {
        showMessage(
          'Aktif Kiralamalar Mevcut',
          'Hesabınızı silmek için önce aktif kiralamalarınızı sonlandırmanız gerekiyor.',
          'warning'
        );
        setPasswordModalVisible(false);
        setPasswordInput('');
        setDeleteInput('');
      } else {
        // Diğer hatalar için genel mesaj
        showMessage('Hata', errorMessage || 'Şifre yanlış veya hesap silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelPassword = () => {
    setPasswordModalVisible(false);
    setPasswordInput('');
    setDeleteInput('');
  };

  const handleLogout = async () => {
    await logout();
    resetToSignin();
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDeleteInput('');
    setPasswordInput('');
  };

  const handleRetry = () => {
    setErrorModalVisible(false);
    setRetryCount(prev => prev + 1);
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
  };

  if (loading || photoLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }] }>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }] }>
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8, zIndex: 20 }}
          onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {theme === 'light' ? '🌙 Koyu Mod' : '☀️ Açık Mod'}
          </Text>
        </TouchableOpacity>
        <View style={styles.profileImageContainer}>
          <Image
            source={
              profileData?.profilePicture
                ? { uri: `data:image/jpeg;base64,${profileData.profilePicture}` }
                : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${profileData?.name || ''}+${profileData?.surname || ''}`) + `&background=${colors.primary.replace('#','')}&color=fff&size=120` }
            }
            style={[styles.profileImage, { borderColor: '#fff' }]}
          />
          <TouchableOpacity style={[styles.editImageButton, { backgroundColor: colors.primary, borderColor: '#fff' }]} onPress={() => setPhotoModalVisible(true)}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.username, { color: '#fff' }]}>{profileData?.name} {profileData?.surname}</Text>
        <Text style={[styles.email, { color: 'rgba(255,255,255,0.9)' }]}>{profileData?.email}</Text>
        <View style={[styles.verifiedRow, { backgroundColor: 'rgba(255,255,255,0.2)' }] }>
          {profileData?.isVerified ? (
            <>
              <Icon name="check-circle" size={22} color={colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.verifiedText, { color: colors.success }]}>Doğrulanmış</Text>
            </>
          ) : (
            <Text style={[styles.notVerifiedText, { color: colors.error }]}>Doğrulanmamış</Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Kişisel Bilgiler</Text>
          <View style={styles.infoItem}>
            <Icon name="person" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Ad Soyad</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData ? `${profileData.name} ${profileData.surname}` : 'Belirtilmemiş'}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Icon name="phone" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Telefon</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData?.phoneNumber || 'Belirtilmemiş'}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Icon name="badge" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>TC Kimlik No</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData?.tcNo || 'Belirtilmemiş'}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Icon name="security" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Rol</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData?.role || 'Belirtilmemiş'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hesap İşlemleri</Text>
          {userRole !== 'Admin' && (
            <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('PaymentMethods')}>
              <Icon name="credit-card" size={24} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Ödeme Yöntemlerim</Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>Ödeme yöntemlerinizi yönetin</Text>
              </View>
              <Icon name="chevron-right" size={24} color={isDark ? '#fff' : colors.border} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('EditProfile', { profileData })}>
            <Icon name="edit" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Profili Düzenle</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>Kişisel bilgilerinizi güncelleyin</Text>
            </View>
            <Icon name="chevron-right" size={24} color={isDark ? '#fff' : colors.border} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem} onPress={() => navigation.navigate('ChangePassword')}>
            <Icon name="lock" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Şifre Değiştir</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>Şifrenizi güncelleyin</Text>
            </View>
            <Icon name="chevron-right" size={24} color={isDark ? '#fff' : colors.border} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem} onPress={() => setDeleteModalVisible(true)}>
            <Icon name="delete" size={24} color={colors.error} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.error }]}>Hesabı Sil</Text>
              <Text style={[styles.infoValue, { color: colors.error }]}>Hesabınızı kalıcı olarak silin</Text>
            </View>
            <Icon name="chevron-right" size={24} color={isDark ? '#fff' : colors.border} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profil fotoğrafı modalı */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }] }>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Profil Fotoğrafı</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>Fotoğrafı nasıl eklemek istersin?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalPhotoButton, { backgroundColor: colors.infoBoxBg, borderColor: colors.primary }]} onPress={() => handlePhotoPick('camera')}>
                <Icon name="photo-camera" size={22} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.modalPhotoText, { color: colors.primary }]}>Kameradan Çek</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalPhotoButton, { backgroundColor: colors.infoBoxBg, borderColor: colors.primary }]} onPress={() => handlePhotoPick('gallery')}>
                <Icon name="photo-library" size={22} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.modalPhotoText, { color: colors.primary }]}>Galeriden Seç</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.modalCancelButton, { backgroundColor: colors.background }]} onPress={() => setPhotoModalVisible(false)}>
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hesap silme modalı */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Icon name="delete" size={40} color={colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.error }]}>Hesabı Sil</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Hesabını silmek için kutuya <Text style={{ fontWeight: 'bold', color: colors.error }}>'delete'</Text> yazmalısın.
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
              placeholder="delete"
              placeholderTextColor={colors.textSecondary}
              value={deleteInput}
              onChangeText={setDeleteInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error }]}
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color={isDark ? '#111' : '#fff'} />
                ) : (
                  <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Hesabı Sil</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, marginLeft: 8 }]}
                onPress={cancelDelete}
                disabled={deleteLoading}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Şifre doğrulama modalı */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelPassword}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Icon name="lock" size={40} color={colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.error }]}>Şifre Doğrulama</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Hesabınızı silmek için şifrenizi giriniz.
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
              placeholder="Şifrenizi girin"
              placeholderTextColor={colors.textSecondary}
              value={passwordInput}
              onChangeText={setPasswordInput}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error }]}
                onPress={handlePasswordConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color={isDark ? '#111' : '#fff'} />
                ) : (
                  <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Hesabı Sil</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, marginLeft: 8 }]}
                onPress={cancelPassword}
                disabled={deleteLoading}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Icon 
              name={messageIcon} 
              size={40} 
              color={
                messageIcon === 'check-circle' ? '#43a047' :
                messageIcon === 'error' ? colors.error :
                messageIcon === 'warning' ? '#FFC107' : colors.primary
              } 
              style={styles.modalIcon} 
            />
            <Text style={[styles.modalTitle, { 
              color: messageIcon === 'check-circle' ? '#43a047' :
                     messageIcon === 'error' ? colors.error :
                     messageIcon === 'warning' ? '#FFC107' : colors.primary
            }]}>
              {messageTitle}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {messageText}
            </Text>
            <TouchableOpacity
              style={[styles.rentButton, { 
                backgroundColor: messageIcon === 'check-circle' ? '#43a047' :
                               messageIcon === 'error' ? colors.error :
                               messageIcon === 'warning' ? '#FFC107' : colors.primary,
                shadowColor: messageIcon === 'check-circle' ? '#43a047' :
                            messageIcon === 'error' ? colors.error :
                            messageIcon === 'warning' ? '#FFC107' : colors.primary
              }]}
              onPress={() => setMessageModalVisible(false)}
            >
              <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Message Modal */}
      <MessageModal
        visible={photoMessageVisible}
        title={photoMessageTitle}
        message={photoMessageText}
        icon={photoMessageIcon}
        onClose={() => setPhotoMessageVisible(false)}
      />

      <MessageModal
        visible={errorModalVisible}
        title="Hata"
        message={errorModalMessage}
        icon="error"
        showCancel={true}
        cancelText="İptal"
        onCancel={handleErrorModalClose}
        showConfirm={true}
        confirmText="Tekrar Dene"
        onConfirm={handleRetry}
        onClose={handleErrorModalClose}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  verifiedText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  notVerifiedText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 15,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
  },
  actionSection: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {},
  deleteButton: {},
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
  modalDesc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    padding: 12,
  },
  modalCancelText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalDeleteButton: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    padding: 12,
  },
  modalDeleteText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalPhotoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 6,
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalPhotoText: {
    fontWeight: 'bold',
    fontSize: 15,
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
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default ProfileScreen; 