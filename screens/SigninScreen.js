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
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

export const SigninScreen = () => {
  const navigation = useNavigation();
  const { signIn, loadingStates, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (error) {
      setMessage({ text: error, type: 'error' });
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage({ text: 'Lütfen tüm alanları doldurun', type: 'error' });
      return;
    }

    const result = await signIn({ emailOrUsername: email, password });

    if (result.success) {
      setMessage({ text: 'Giriş başarılı! Yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => {
        if (result.role === 'admin') {
          navigation.navigate('Dashboard');
        } else {
          navigation.navigate('Home');
        }
      }, 1000);
    } else {
      if (result.error && typeof result.error === 'string' && result.error.includes('Hesabınız doğrulanmadı')) {
        setMessage({ text: 'Hesabınız doğrulanmadı. Doğrulama sayfasına yönlendiriliyorsunuz...', type: 'error' });
        setTimeout(() => {
          navigation.navigate('ResendVerification', { email });
        }, 1500);
      } else {
        setMessage({ text: 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.', type: 'error' });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.card}>
        <Image
          source={require('../assets/signin.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Sen de beni özledin mi?</Text>
        <Text style={styles.subtitle}>
          Şifren aklındaysa sorun yok, değilse dram başlar 🥲
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta, kullanıcı adı ya da telefon"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          autoComplete="username"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre de lazım!"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>
            🤯 Hafıza 404 mü verdi? Şifreyi sıfırla, yola devam!
          </Text>
        </TouchableOpacity>

        <Text style={styles.info}>
          Gel içeri, kredi borcum kapıya dayanmıştı… iyi yetiştin.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loadingStates.signIn}
        >
          <Text style={styles.buttonText}>
            {loadingStates.signIn ? 'Yükleniyor...' : 'Tıkla da borçlarım biraz erisin 😭'}
          </Text>
        </TouchableOpacity>

        {message.text ? (
          <Text style={[
            styles.message,
            message.type === 'success' ? styles.successMessage : styles.errorMessage
          ]}>
            {message.text}
          </Text>
        ) : null}

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.bottomLink}>Taze cüzdan mı geldi? Hemen tanışalım 😎</Text>
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 14,
    fontSize: 13,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  link: {
    color: '#2c4fff',
    fontSize: 14,
    marginBottom: 12,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#444',
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1541e0',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
  bottomLink: {
    marginTop: 18,
    fontSize: 14,
    color: '#7b3fd3',
    textAlign: 'center',
    textDecorationLine: 'underline',
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

export default SigninScreen;