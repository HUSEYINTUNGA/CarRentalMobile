import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import ViewPaymentMethod from './ViewPaymentMethod';

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { paymentMethods, loading, error, fetchPaymentMethods, deletePaymentMethod } = usePaymentMethods();
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
    }
  }, [error]);

  const handleDelete = async (Id) => {
    Alert.alert(
      'Kartı Sil',
      'Bu kartı silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleteLoading(true);
              await deletePaymentMethod(Id);
              Alert.alert('Başarılı', 'Kart başarıyla silindi.');
            } catch (err) {
              Alert.alert('Hata', 'Kart silinirken bir hata oluştu.');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (card) => {
    navigation.navigate('EditPaymentMethod', {
      mode: 'update',
      cardId: card.Id,
    });
  };

  const handleView = (card) => {
    navigation.navigate('ViewPaymentMethod', { cardId: card.Id });
  };

  const handleAddNew = () => {
    navigation.navigate('EditPaymentMethod', { mode: 'create' });
  };

  const renderCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.MethodName}</Text>
        <Text style={styles.cardNumber}>**** **** **** {item.Last4Digits}</Text>
        <Text style={styles.cardHolder}>{item.CardHolderName}</Text>
        <Text style={styles.expiryDate}>
          {item.ExpirationMonth}/{item.ExpirationYear}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleView(item)}
        >
          <Ionicons name="eye-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.Id)}
          disabled={deleteLoading}
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNew}
        >
          <Text style={styles.addButtonText}>Yeni Kart Ekle</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={paymentMethods}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: colors.white,
    marginLeft: 8,
    ...typography.button,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    ...typography.h3,
    marginBottom: 4,
  },
  cardNumber: {
    ...typography.body1,
    color: colors.text,
    marginBottom: 4,
  },
  cardHolder: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  expiryDate: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  cardExpiry: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
export default PaymentMethodsScreen; 