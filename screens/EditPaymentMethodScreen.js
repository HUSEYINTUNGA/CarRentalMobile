import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { createPaymentMethod, updatePaymentMethod, getPaymentMethodById } from '../api/paymentMethodsApi';
import { useTheme } from '../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  inputError: {
    // borderColor will be set inline
  },
  errorText: {
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
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
  logoFab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 48,
    height: 36,
    zIndex: 20,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBtn: {
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
});

export default function EditPaymentMethod() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, cardId } = route.params || { mode: 'create' };

  const [formData, setFormData] = useState({
    methodName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'update');
  const [errors, setErrors] = useState({});

  const { colors, isDark } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      if (mode === 'update' && cardId) {
        fetchCardDetails();
      } else {
        setFormData({
          methodName: '',
          cardNumber: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardholderName: '',
        });
        setErrors({});
      }
    }, [mode, cardId])
  );

  const fetchCardDetails = async () => {
    try {
      setInitialLoading(true);
      const response = await getPaymentMethodById(cardId);
      const card = response.data;
      
      setFormData({
        methodName: card.MethodName || '',
        cardNumber: card.CardNumber || '',
        expiryMonth: card.ExpirationMonth?.toString() || '',
        expiryYear: card.ExpirationYear?.toString() || '',
        cvv: card.CVV || '',
        cardholderName: card.CardholderName || '',
      });
    } catch (error) {
      console.error('Error fetching card details:', error);
      Alert.alert('Error', 'Failed to load card details');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = 'Expiry date is required';
    } else {
      const month = parseInt(formData.expiryMonth);
      const year = parseInt(formData.expiryYear);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiryMonth = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryMonth = 'Card has expired';
      }
    }

    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!formData.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = {
        MethodName: formData.methodName,
        CardNumber: formData.cardNumber,
        CardHolderName: formData.cardholderName,
        ExpirationMonth: parseInt(formData.expiryMonth),
        ExpirationYear: parseInt(formData.expiryYear)+2000,
        CVV: formData.cvv,
      };
      if (mode === 'create') {
        await createPaymentMethod(data);
        Alert.alert('Başarılı', 'Ödeme yöntemi başarıyla eklendi');
      } else {
        await updatePaymentMethod({ 
          ...data, 
          PaymentMethodId: cardId
        });
        Alert.alert('Başarılı', 'Ödeme yöntemi başarıyla güncellendi');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving payment method:', error);
      let errorMsg = 'Ödeme yöntemi kaydedilemedi';
      if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          if (data.includes('FluentValidation.AsyncValidatorInvokedSynchronouslyException')) {
            errorMsg = 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.';
          } else {
            errorMsg = data;
          }
        } else if (typeof data === 'object') {
          if (data.errors) {
            errorMsg = Object.values(data.errors).flat().join('\n');
          } else {
            errorMsg = JSON.stringify(data);
          }
        }
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }] }>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }] }>
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: '#fff' }]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>{mode === 'create' ? 'Yeni Kart Ekle' : 'Kartı Düzenle'}</Text>
      </LinearGradient>
      <View style={{ height: 100 }} />
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Kart Adı</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.card, color: colors.text },
              errors.methodName && { borderColor: colors.error }
            ]}
            value={formData.methodName}
            onChangeText={(text) => setFormData({ ...formData, methodName: text })}
            placeholder="Örneğin: Maaş Kartım"
            placeholderTextColor={colors.textSecondary}
            editable={true}
          />
          {errors.methodName && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.methodName === 'Card number is required' ? 'Kart adı zorunludur' : errors.methodName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Kart Numarası</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.card, color: colors.text },
              errors.cardNumber && { borderColor: colors.error }
            ]}
            value={formData.cardNumber}
            onChangeText={(text) => {
              const formatted = text.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
              setFormData({ ...formData, cardNumber: formatted });
            }}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={19}
            editable={true}
          />
          {errors.cardNumber && (
            <Text style={[styles.errorText, { color: colors.error }]}> {
              errors.cardNumber === 'Card number is required' ? 'Kart numarası zorunludur' :
              errors.cardNumber === 'Invalid card number' ? 'Geçersiz kart numarası' :
              errors.cardNumber
            }</Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderWidth: 1 }]}
            placeholder={mode === 'update' ? '' : 'S.K. Ay'}
            placeholderTextColor={isDark ? '#fff' : colors.textSecondary}
            value={formData.expiryMonth}
            onChangeText={(text) => {
              const month = text.replace(/\D/g, '').slice(0, 2);
              setFormData({ ...formData, expiryMonth: month });
            }}
            keyboardType="numeric"
            maxLength={2}
            editable={true}
          />
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderWidth: 1 }]}
            placeholder={mode === 'update' ? '' : 'S.K. Yıl'}
            placeholderTextColor={isDark ? '#fff' : colors.textSecondary}
            value={formData.expiryYear ? String(formData.expiryYear).slice(-2) : ''}
            onChangeText={(text) => {
              const year = text.replace(/\D/g, '').slice(-2);
              setFormData({ ...formData, expiryYear: year });
            }}
            keyboardType="numeric"
            maxLength={2}
            editable={true}
          />
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderWidth: 1 }]}
            placeholder={mode === 'update' ? '' : 'CVV'}
            placeholderTextColor={isDark ? '#fff' : colors.textSecondary}
            value={formData.cvv}
            onChangeText={(text) => {
              const cvv = text.replace(/\D/g, '').slice(0, 4);
              setFormData({ ...formData, cvv });
            }}
            keyboardType="numeric"
            maxLength={4}
            editable={true}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Kart Sahibi Adı</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.card, color: colors.text },
              errors.cardholderName && { borderColor: colors.error }
            ]}
            value={formData.cardholderName}
            onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
            placeholder="Ad Soyad"
            placeholderTextColor={colors.textSecondary}
            editable={true}
          />
          {errors.cardholderName && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.cardholderName === 'Cardholder name is required' ? 'Kart sahibi adı zorunludur' : errors.cardholderName}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.updateBtn,
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.white }]}>
              {mode === 'create' ? 'Kartı Ekle' : 'Kartı Güncelle'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 