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
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
      clearError();
    }
  }, [error]);

  const handleSignUp = async () => {
    if (!formData.name || !formData.surname || !formData.email || 
        !formData.phoneNumber || !formData.username || 
        !formData.password || !formData.confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }
    if (!accepted) {
      Alert.alert('Hata', 'Devam etmek için şartları kabul etmelisin!');
      return;
    }
    const result = await signUp(formData);

    if (!result.success && result.error === 'Bu e-posta adresi zaten kullanımda.') {
      Alert.alert('Taklitler Aslını Yaşatır', 'Hmm... Bu e-posta sistemde zaten var. Taklitler aslını yaşatır diyorsan bilemedik 😎');
      return;
    }

    if (result.success) {
      Alert.alert(
        '🎉 Kayıt Başarılı!',
        'Hayırlı olsun, artık bir taksit ödemen var 💸\n\nHesabınızı doğrulamak için e-posta adresinize gönderilen kodu girin.\n\nMaili gelen kutunda göremezsen spam klasörüne göz atmayı unutma!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('VerifyAccount', { email: formData.email })
          }
        ]
      );
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
          <Text style={styles.title}>Hazırsan, yola çıkıyoruz!</Text>
          <Text style={styles.subtitle}>Ehliyetin yoksa da gel, biz zaten hayal satıyoruz...</Text>

          <Text style={styles.infoText}>Kayıt ol, sonra ya yükseliriz ya da bir yerlere toslarsın. Kısmet! 😎</Text>

          <TextInput
            style={styles.input}
            placeholder="Ne diyelim sana?"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Soyadını yaz, belki plaka basarız."
            placeholderTextColor="#999"
            value={formData.surname}
            onChangeText={text => setFormData({ ...formData, surname: text })}
            autoCapitalize="words"
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
            placeholder="Sakın 123456 olmasın!"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={text => setFormData({ ...formData, password: text })}
            secureTextEntry
            autoCorrect={false}
          />
          <Text style={styles.helperText}>Lütfen şifreni unutma. Unutursan, dram sayfasına düşersin.</Text>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAccepted(!accepted)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
            >
              <View style={[styles.checkboxBox, accepted && styles.checkboxBoxChecked]}>
                {accepted && <View style={styles.checkboxTick} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              <Text onPress={() => setAccepted(!accepted)}>
                {' '} 
              </Text>
              <Text onPress={() => Linking.openURL('https://example.com/terms')} style={styles.link}>Terms of Service</Text>
              {' '}and{' '}
              <Text onPress={() => Linking.openURL('https://example.com/privacy')} style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>

          <Text style={styles.policyText}>
            Kaydolurken 'Araba tıklanırken ağlamam' sözleşmesini, Gizlilik Politikasını ve içeride çok para döndüğünü ama sana dönmeyeceğini peşinen kabul ediyorsun.
          </Text>

          <Text style={styles.funText}>
            Bunu söylemeyi çok seviyorum: Boş kağıda bir parmağını bas.
          </Text>

          <Image
            source={require('../assets/signup.png')}
            style={styles.cartoon}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={[styles.button, !accepted && { opacity: 0.6 }]}
            onPress={handleSignUp}
            disabled={loadingStates.signUp || !accepted}
          >
            <Text style={styles.buttonText}>
              {loadingStates.signUp ? 'Yükleniyor...' : 'Boş Kağıt'}
            </Text>
          </TouchableOpacity>

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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#222',
    flex: 1,
    flexWrap: 'wrap',
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
    width: 120,
    height: 120,
    marginBottom: 10,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginTop: 8,
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
});

export default SignupScreen; 