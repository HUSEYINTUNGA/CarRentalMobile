import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resetPassword, loadingStates, error, clearError } = useAuth();
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (error) {
      setMessage({ text: error, type: 'error' });
      clearError();
    }
  }, [error]);

  const handleReset = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      setMessage({ text: 'Lütfen tüm alanları doldurun', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Yeni şifreler eşleşmiyor', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Yeni şifre en az 6 karakter olmalı', type: 'error' });
      return;
    }
    const result = await resetPassword({ email, verificationCode: code, newPassword });
    if (result.success) {
      setMessage({ text: 'Şifre başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => {
        navigation.navigate('Signin');
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image
            source={require('../assets/boskagit.png')}
            style={styles.topCartoon}
            resizeMode="contain"
          />

          <Text style={styles.title}>Şifreyi Sıfırla</Text>
          <Text style={styles.subtitle}>Sistemin damadı olmaya bir adım kaldı! Kodunu ve yeni şifreni gir, borçlar silinsin.</Text>

          <TextInput
            style={styles.input}
            placeholder="E-posta adresin"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!route.params?.email ? true : false}
          />

          <TextInput
            style={styles.input}
            placeholder="6 haneli kod"
            placeholderTextColor="#888"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TextInput
            style={styles.input}
            placeholder="Yeni şifre"
            placeholderTextColor="#888"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Yeni şifre (tekrar)"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleReset}
            disabled={loadingStates.signIn}
          >
            <Text style={styles.buttonText}>{loadingStates.signIn ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}</Text>
          </TouchableOpacity>

          {message.text ? (
            <Text style={[
              styles.message,
              message.type === 'success' ? styles.successMessage : styles.errorMessage
            ]}>
              {message.text}
            </Text>
          ) : null}

          <Text style={styles.footerText}>
            Kod gelmediyse spam klasörüne bakmayı unutma!
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6ff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2c4fff',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e7ff',
    marginTop: 20,
    marginBottom: 20,
  },
  topCartoon: {
    width: 110,
    height: 110,
    marginBottom: 8,
    marginTop: -10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#e07a1a',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 2,
    width: '100%',
    marginBottom: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  signinLink: {
    marginTop: 6,
    fontSize: 14,
    color: '#2563eb',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  message: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    width: '100%',
  },
  successMessage: {
    backgroundColor: '#e6f4ea',
    color: '#1e7e34',
  },
  errorMessage: {
    backgroundColor: '#fde7e7',
    color: '#d32f2f',
  }
});

export default ResetPasswordScreen; 