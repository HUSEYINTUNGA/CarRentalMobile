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
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

export const SigninScreen = (props) => {
  const navigation = useNavigation();
  const { signIn, loadingStates, error, clearError, user } = useAuth();
  const { setIsLoggedIn, setRole } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    if (error) {
      if (error.includes('doğrulanmadı')) {
        setTimeout(() => {
          navigation.navigate('ResendVerification', { email });
        }, 1500);
      }
      setMessage({ text: error, type: 'error' });
      clearError();
    }
  }, [error]);

  const handleSignIn = async () => {
    try {
      const result = await signIn({ emailOrUsername: email, password: password });
      if (result.success) {
        setRole(result.role);
        setIsLoggedIn(true);
      } else {
        Alert.alert('Hata', result.error);
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
    }
  };

  const handleVerifyAccount = () => {
    setShowVerificationModal(false);
    navigation.navigate('ResendVerification', { email });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 60}
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
          autoCapitalize="none"
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
          onPress={handleSignIn}
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

      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hesap Doğrulanmamış</Text>
            <Text style={styles.modalText}>
              Hesabınız henüz doğrulanmamış. Doğrulama işlemini tamamlamak için e-posta adresinize gönderilen doğrulama bağlantısını kullanabilir veya yeni bir doğrulama e-postası talep edebilirsiniz. Spam kutunuzu kontrol edin.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.verifyButton]}
                onPress={handleVerifyAccount}
              >
                <Text style={styles.modalButtonText}>Doğrula</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowVerificationModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  verifyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
  },
  verifyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1541e0',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#374151',
  },
});

export default SigninScreen;