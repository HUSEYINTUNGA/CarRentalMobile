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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const ResendVerificationScreen = () => {
  const navigation = useNavigation();
  const { requestVerification, loadingStates, error, clearError } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
  }, [error]);

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresini gir!');
      return;
    }
    const result = await requestVerification(email);
    if (result.success) {
      Alert.alert('Başarılı', 'Kod tekrar gönderildi! Lütfen e-postanı (ve spam klasörünü) kontrol et.\n\nMaili gelen kutunda göremezsen spam klasörüne göz atmayı unutma!');
      navigation.navigate('VerifyAccount', { email });
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
          <Text style={styles.title}>Kodunu kaybettin mi?</Text>
          <Text style={styles.subtitle}>Üzülme, sistemin damadı olma yolunda bir kod daha gönderebiliriz! 😅</Text>

          <Image
            source={require('../assets/verification.png')}
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
            <Text style={styles.buttonText}>{loadingStates.signIn ? 'Gönderiliyor...' : 'Kodu tekrar gönder'}</Text>
          </TouchableOpacity>

          <Text style={styles.hintText}>
            Kod hala gelmediyse, spam klasörüne de bakmayı unutma!
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.backLink}>Giriş ekranına dön</Text>
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
    width: 120,
    height: 120,
    marginBottom: 10,
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
});

export default ResendVerificationScreen; 