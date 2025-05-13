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

const VerifyAccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { verifyAccount, requestVerification, loadingStates, error: globalError, clearError } = useAuth();

  const [email] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (globalError) {
      setMessage({ text: globalError, type: 'error' });
      clearError();
    }
  }, [globalError]);

  const handleVerify = async () => {
    if (!email || !code) {
      setMessage({ text: 'Lütfen doğrulama kodunu girin', type: 'error' });
      return;
    }
    const result = await verifyAccount({ Email: email, VerificationCode: code });
    if (result.success) {
      setMessage({ text: 'Hesabınız doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => {
        navigation.navigate('Signin');
      }, 1500);
    } else if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ text: 'E-posta adresi boş olamaz', type: 'error' });
      return;
    }
    const result = await requestVerification(email);
    if (result.success) {
      setMessage({ text: 'Kod tekrar gönderildi! Lütfen e-postanızı kontrol edin.', type: 'success' });
    } else if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image
            source={require('../assets/verification.png')}
            style={styles.cartoon}
            resizeMode="contain"
          />

          <Text style={styles.bigTitle}>Bu bataklığa düşmek için neden bu kadar ısrarcı ve kararlısın, anlamış değilim...</Text>

          <Text style={styles.descText}>
            Ama madem geldin, bari kart numaranı şey... pardon, doğrulama kodunu gir de şu yarım kalan hikayemizi tamamlayalım.
          </Text>

          <Text style={styles.hintText}>
            Kod hala gelmediyse, spam klasörüne de bir göz at. Belki orada bekliyor, utangaç olabilir...
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Bu kod sadece sana özel, FBI bile bilmesin."
            placeholderTextColor="#888"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleVerify}
            disabled={!code || loadingStates.signIn}
          >
            <Text style={styles.buttonText}>{loadingStates.signIn ? 'Doğrulanıyor...' : 'Sisteme damat ol! 👰'}</Text>
          </TouchableOpacity>

          {message.text ? (
            <Text style={[
              styles.message,
              message.type === 'success' ? styles.successMessage : styles.errorMessage
            ]}>
              {message.text}
            </Text>
          ) : null}

          <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
            <Text style={styles.resendText}>Kodu tekrar gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.backLink}>Geri kaçmak da bir stratejidir.</Text>
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
  infoBox: {
    backgroundColor: '#f4f8ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoBoxText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  cartoon: {
    width: 220,
    height: 220,
    marginBottom: 10,
    marginTop: 2,
  },
  bigTitle: {
    fontSize: 17,
    color: '#e07a1a',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  descText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#888',
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
  resendBtn: {
    marginTop: 8,
    marginBottom: 2,
  },
  resendText: {
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
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

export default VerifyAccountScreen; 