import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import MessageModal from '../components/MessageModal';

function hexToRgba(hex, alpha) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { loading, error, fetchProfile, updateProfileData } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phoneNumber: '',
  });
  const [profile, setProfile] = useState(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageIcon, setMessageIcon] = useState('info');
  const { colors, isDark } = useTheme();

  const showMessage = (title, text, icon = 'info', onButtonPress = null) => {
    setMessageTitle(title);
    setMessageText(text);
    setMessageIcon(icon);
    setMessageModalVisible(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const profileData = await fetchProfile();
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          surname: profileData.surname || '',
          phoneNumber: profileData.phoneNumber || '',
        });
      } catch (err) {
        showMessage('Hata', 'Profil bilgileri yüklenirken bir hata oluştu.', 'error', () => navigation.goBack());
      }
    })();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        Name: formData.name,
        Surname: formData.surname,
        PhoneNumber: formData.phoneNumber
      };
      
      await updateProfileData(updateData);
      showMessage('Başarılı', 'Profil bilgileriniz güncellendi.', 'check-circle', () => navigation.goBack());
    } catch (err) {
      const errorMessage = err.response?.data?.message || error || 'Profil güncellenirken bir hata oluştu.';
      showMessage('Hata', errorMessage, 'error');
    }
  };

  if (loading || !profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }] }>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: '#fff' }]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>Profili Düzenle</Text>
      </LinearGradient>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={{ height: 50 }} />
        <View style={styles.profileImageContainer}>
          <Image
            source={
              profile?.profilePicture
                ? { uri: `data:image/jpeg;base64,${profile.profilePicture}` }
                : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${profile?.name || ''}+${profile?.surname || ''}`) + '&background=2196F3&color=fff&size=120' }
            }
            style={[styles.profileImage, { backgroundColor: colors.card, borderColor: colors.background }]}
          />
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Ad</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
              ]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Adınız"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Soyad</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
              ]}
              value={formData.surname}
              onChangeText={(text) => setFormData(prev => ({ ...prev, surname: text }))}
              placeholder="Soyadınız"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Telefon Numarası</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
              ]}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
              placeholder="Telefon numaranız"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.text.startsWith('#') ? hexToRgba(colors.text, 0.1) : 'rgba(33,33,33,0.1)' }
            ]}
          >
            <Icon name="info" size={20} color={colors.info} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.info }] }>
              Ad, soyad ve telefon numarası bilgilerinizi değiştirebilirsiniz. Profil fotoğrafı değiştirilemez. Diğer bilgileriniz güvenlik nedeniyle değiştirilemez.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            <Text style={[styles.saveButtonText, { color: isDark ? '#111' : '#fff' }]}>
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Message Modal */}
      <MessageModal
        visible={messageModalVisible}
        title={messageTitle}
        message={messageText}
        icon={messageIcon}
        onClose={() => setMessageModalVisible(false)}
        onButtonPress={() => {
          setMessageModalVisible(false);
          if (messageIcon === 'check-circle') {
            navigation.goBack();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 38,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: -2,
  },
  gradientHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 160, 
  },
  profileImageContainer: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    zIndex: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  saveBtn: {
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    width: 320,
    elevation: 4,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    // Add any necessary styles for the disabled button
  },
});

export default EditProfileScreen; 