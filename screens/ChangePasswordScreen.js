import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { changePassword } from '../api/customerApi';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors, isDark } = useTheme();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Uyarı', 'Tüm alanları doldurmalısınız.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Uyarı', 'Yeni şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword });
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      let msg = 'Şifre değiştirilirken bir hata oluştu.';
      if (err.response?.data) {
        if (Array.isArray(err.response.data)) {
          msg = err.response.data.map(e => e.errorMessage || e.ErrorMessage || e.message).join('\n');
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        }
      }
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>Şifre Değiştir</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }] }>
            <Icon name="lock" size={20} color={colors.primary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Mevcut Şifre"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }] }>
            <Icon name="lock-outline" size={20} color={colors.primary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Yeni Şifre"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }] }>
            <Icon name="lock-outline" size={20} color={colors.primary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Yeni Şifre (Tekrar)"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.changePasswordBtn, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} 
            onPress={handleChangePassword} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { color: isDark ? '#111' : '#fff' }]}>Şifreyi Değiştir</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 100,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  changePasswordBtn: {
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChangePasswordScreen; 