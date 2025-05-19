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
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPaymentMethod, updatePaymentMethod, getPaymentMethodById } from '../api/paymentMethodsApi';
import { colors } from '../theme/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
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

  useEffect(() => {
    if (mode === 'update' && cardId) {
      fetchCardDetails();
    }
  }, [mode, cardId]);

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
        ExpirationYear: parseInt(formData.expiryYear),
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>
          {mode === 'create' ? 'Yeni Kart Ekle' : 'Kartı Düzenle'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kart Adı</Text>
          <TextInput
            style={[styles.input, errors.methodName && styles.inputError]}
            value={formData.methodName}
            onChangeText={(text) => setFormData({ ...formData, methodName: text })}
            placeholder="Örneğin: Maaş Kartım"
            editable={true}
          />
          {errors.methodName && (
            <Text style={styles.errorText}>{errors.methodName === 'Card number is required' ? 'Kart adı zorunludur' : errors.methodName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kart Numarası</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            value={formData.cardNumber}
            onChangeText={(text) => {
              const formatted = text.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
              setFormData({ ...formData, cardNumber: formatted });
            }}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
            editable={true}
          />
          {errors.cardNumber && (
            <Text style={styles.errorText}>{
              errors.cardNumber === 'Card number is required' ? 'Kart numarası zorunludur' :
              errors.cardNumber === 'Invalid card number' ? 'Geçersiz kart numarası' :
              errors.cardNumber
            }</Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Son Kullanma Ayı</Text>
            <TextInput
              style={[styles.input, errors.expiryMonth && styles.inputError]}
              value={formData.expiryMonth}
              onChangeText={(text) => {
                const month = text.replace(/\D/g, '').slice(0, 2);
                setFormData({ ...formData, expiryMonth: month });
              }}
              placeholder="AA"
              keyboardType="numeric"
              maxLength={2}
              editable={true}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Son Kullanma Yılı</Text>
            <TextInput
              style={[styles.input, errors.expiryYear && styles.inputError]}
              value={formData.expiryYear}
              onChangeText={(text) => {
                const year = text.replace(/\D/g, '').slice(0, 2);
                setFormData({ ...formData, expiryYear: year });
              }}
              placeholder="YY"
              keyboardType="numeric"
              maxLength={2}
              editable={true}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={[styles.input, errors.cvv && styles.inputError]}
              value={formData.cvv}
              onChangeText={(text) => {
                const cvv = text.replace(/\D/g, '').slice(0, 4);
                setFormData({ ...formData, cvv });
              }}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              editable={true}
            />
            {errors.cvv && (
              <Text style={styles.errorText}>{
                errors.cvv === 'CVV is required' ? 'CVV zorunludur' :
                errors.cvv === 'Invalid CVV' ? 'Geçersiz CVV' :
                errors.cvv
              }</Text>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kart Sahibi Adı</Text>
          <TextInput
            style={[styles.input, errors.cardholderName && styles.inputError]}
            value={formData.cardholderName}
            onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
            placeholder="Ad Soyad"
            editable={true}
          />
          {errors.cardholderName && (
            <Text style={styles.errorText}>{errors.cardholderName === 'Cardholder name is required' ? 'Kart sahibi adı zorunludur' : errors.cardholderName}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'create' ? 'Kartı Ekle' : 'Kartı Güncelle'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 