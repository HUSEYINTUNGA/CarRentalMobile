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
  ScrollView,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const SignupScreen = () => {
  const navigation = useNavigation();
  const { signUp, loadingStates, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    tcNo: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (error) {
      setMessage({ text: error, type: 'error' });
      clearError();
    }
  }, [error]);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasPunct = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    return hasUpper && hasLower && hasNumber && hasPunct;
  };

  const handleSignUp = async () => {
    if (!formData.name || !formData.surname || !formData.email || 
        !formData.phoneNumber || !formData.tcNo ||
        !formData.password || !formData.confirmPassword) {
      setMessage({ text: 'Lütfen tüm alanları doldurun', type: 'error' });
      return;
    }
    if (!validateEmail(formData.email)) {
      setMessage({ text: 'Lütfen geçerli bir e-posta adresi girin', type: 'error' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Şifreler eşleşmiyor', type: 'error' });
      return;
    }
    if (formData.password.length < 6) {
      setMessage({ text: 'Şifre en az 6 karakter olmalıdır', type: 'error' });
      return;
    }
    if (!validatePassword(formData.password)) {
      setMessage({ text: 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir noktalama işareti içermelidir', type: 'error' });
      return;
    }
    const payload = {
      Name: formData.name,
      Surname: formData.surname,
      Email: formData.email,
      Password: formData.password,
      TCNo: formData.tcNo,
      PhoneNumber: formData.phoneNumber
    };
    const result = await signUp(payload);

    if (!result.success && result.error === 'Bu e-posta adresi zaten kullanımda.') {
      setMessage({ text: 'Bu e-posta adresi zaten kullanımda', type: 'error' });
      return;
    }

    if (result.success) {
      setMessage({ text: 'Kayıt başarılı! Doğrulama sayfasına yönlendiriliyorsunuz...', type: 'success' });
      setTimeout(() => {
        navigation.navigate('VerifyAccount', { email: formData.email });
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 60}
    >
      <ScrollView contentContainerStyle={[styles.scrollContainer]} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Hazırsan, yola çıkıyoruz!</Text>
          <Text style={styles.subtitle}>Ehliyetin yoksa da gel, biz zaten hayal satıyoruz...</Text>

          <Text style={styles.infoText}>Kayıt ol, sonra ya yükseliriz ya da bir yerlere toslarsın. Kısmet! 😎</Text>

          <TextInput
            style={styles.input}
            placeholder="Ne diyelim sana?"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Soyadını yaz, belki plaka basarız."
            placeholderTextColor="#999"
            value={formData.surname}
            onChangeText={text => setFormData({ ...formData, surname: text })}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Buraya spam atmayacağız. Belki biraz fatura.."
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon numaran?"
            placeholderTextColor="#999"
            value={formData.phoneNumber}
            onChangeText={text => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="TC Kimlik Numaran?"
            placeholderTextColor="#999"
            value={formData.tcNo}
            onChangeText={text => setFormData({ ...formData, tcNo: text })}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={11}
          />
          <TextInput
            style={styles.input}
            placeholder="Sakın 123456 olmasın!"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={text => setFormData({ ...formData, password: text })}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifreyi tekrar gir"
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={text => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>Lütfen şifreni unutma. Unutursan, dram sayfasına düşersin.</Text>

          <Text style={styles.policyText}>
            Kaydolurken 'Araba tıklanırken ağlamam' sözleşmesini, Gizlilik Politikasını ve içeride çok para döndüğünü ama sana dönmeyeceğini peşinen kabul ediyorsun.
          </Text>

          <Image
            source={require('../assets/signup.png')}
            style={styles.cartoon}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loadingStates.signUp}
          >
            <Text style={styles.buttonText}>
              {loadingStates.signUp ? 'Yükleniyor...' : 'Boş Kağıt'}
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

          <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.bottomLink}>
              Zaten battıysan, gel seni bir tık daha gömelim 🤷‍♂️
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
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 13,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  helperText: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  policyText: {
    fontSize: 11,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  funText: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 6,
    textAlign: 'center',
  },
  cartoon: {
    width: 210,
    height:200,
    marginBottom: 0,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 0,
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
  bottomLink: {
    marginTop: 10,
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

export default SignupScreen; 