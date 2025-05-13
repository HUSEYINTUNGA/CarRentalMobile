import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile } from '../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = ({ route }) => {
  const { profileData } = route.params;
  const { updateProfileData } = useProfile();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    surname: profileData?.surname || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await updateProfileData({
        name: formData.name.trim(),
        surname: formData.surname.trim(),
      });
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profili Düzenle</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileData?.profilePicture
                  ? { uri: `data:image/jpeg;base64,${profileData.profilePicture}` }
                  : { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${profileData?.name || ''}+${profileData?.surname || ''}`) + '&background=2196F3&color=fff&size=120' }
              }
              style={styles.profileImage}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Adınız"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput
              style={styles.input}
              value={formData.surname}
              onChangeText={(text) => setFormData(prev => ({ ...prev, surname: text }))}
              placeholder="Soyadınız"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.infoBox}>
            <Icon name="info" size={20} color="#2196F3" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Sadece ad ve soyad bilgilerinizi değiştirebilirsiniz. Profil fotoğrafı değiştirilemez. Diğer bilgileriniz güvenlik nedeniyle değiştirilemez.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  formContainer: {
    padding: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
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
    color: '#1976D2',
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 