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

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { forgotPassword, loadingStates, error, clearError } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
  }, [error]);

  const handleForgot = async () => {
    if (!email) {
      Alert.alert('Unutkanlık Seviyesi: Yüksek', 'E-posta adresini yazmadan bu iş olmaz!');
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      Alert.alert(
        'Kod Gönderildi!',
        'Şifre sıfırlama kodun e-posta adresine gönderildi. Maili gelen kutunda göremezsen spam klasörüne göz atmayı unutma!'
      );
      navigation.navigate('ResetPassword', { email });
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
            source={require('../assets/ohcomeon.png')}
            style={styles.topCartoon}
            resizeMode="contain"
          />

          <Text style={styles.title}>Şifreni mi unuttun? Gerçekten mi?</Text>
          <Text style={styles.subtitle}>Şifreni nasıl unuttun, sakın endişelenme, allahtan ben varım!</Text>
          <Text style={styles.descText}>
            Endişelenme, bu iş sadece iki dakikanı alacak! Rica etsem, o değerli e-posta adresini aşağıdaki kutucuğa bir zahmet yazar mısın?
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-posta adresin buraya yazman lazım, şaşırmayasın!"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.hintText}>
            Bu işin tek bir yolu var: E-posta adresini yazdıysan, aşağıdaki boş kağıda bir parmağını bas.
          </Text>

          <Image
            source={require('../assets/boskagit.png')}
            style={styles.bottomCartoon}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleForgot}
            disabled={loadingStates.signIn}
          >
            <Text style={styles.buttonText}>{loadingStates.signIn ? 'Gönderiliyor...' : 'Boş kağıt'}</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Seni şakacı, az daha akıl sağlığından şüphe edecektim.
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
    width: 90,
    height: 90,
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
  descText: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    marginBottom: 10,
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
  hintText: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  bottomCartoon: {
    width: 110,
    height: 110,
    marginBottom: 8,
    marginTop: 2,
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
});

export default ForgotPasswordScreen; 