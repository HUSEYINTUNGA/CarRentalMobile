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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const ResendVerificationScreen = () => {
  const navigation = useNavigation();
  const { requestVerification, loadingStates, error: globalError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (globalError) {
      setMessage({ text: globalError, type: 'error' });
      clearError();
    }
  }, [globalError]);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ text: 'Lütfen e-posta adresinizi girin', type: 'error' });
      return;
    }
    if (!validateEmail(email)) {
      setMessage({ text: 'Lütfen geçerli bir e-posta adresi girin', type: 'error' });
      return;
    }
    const result = await requestVerification(email);
    if (result.success) {
      setMessage({ text: 'Kod tekrar gönderildi! Doğrulama sayfasına yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => {
        navigation.navigate('VerifyAccount', { email });
      }, 1500);
    } else if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 60}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Kodunu mu kaybettin?</Text>
        <Text style={styles.subtitle}>Üzülme, sistemin damadı olma yolunda bir kod daha gönderebiliriz! 😅</Text>

        <Image
          source={require('../assets/resend.png')}
          style={styles.cartoon}
          resizeMode="contain"
        />

        <TextInput
          style={styles.input}
          placeholder="E-posta adresini yaz, kodu uçuralım!"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResend}
          disabled={loadingStates.signIn}
        >
          <Text style={styles.buttonText}>{loadingStates.signIn ? 'Gönderiliyor...' : 'Boş Kağıt'}</Text>
        </TouchableOpacity>

        {message.text ? (
          <Text style={[
            styles.message,
            message.type === 'success' ? styles.successMessage : styles.errorMessage
          ]}>
            {message.text}
          </Text>
        ) : null}

        <Text style={styles.hintText}>
          Kod hala gelmediyse, spam klasörüne de bakmayı unutma!
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
          <Text style={styles.backLink}>Giriş ekranına dön</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
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
    minHeight: 350,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  cartoon: {
    width: 280,
    height: 280,
    marginBottom: 1,
    marginTop: 2,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
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
  hintText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  backLink: {
    marginTop: 12,
    fontSize: 13,
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

export default ResendVerificationScreen; 