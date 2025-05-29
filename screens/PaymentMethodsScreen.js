import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LinearGradient } from 'expo-linear-gradient';


const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { paymentMethods, loading, error, fetchPaymentMethods, removePaymentMethod } = usePaymentMethods();
  const [deleteLoading, setDeleteLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchPaymentMethods();
    }, [navigation])
  );

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
              await removePaymentMethod(Id);
              fetchPaymentMethods();
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
      {/* Gradient Header */}
      <LinearGradient
        colors={["#0066cc", "#2196F3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.gradientHeaderTitle}>Ödeme Yöntemleriniz</Text>
      </LinearGradient>
      <View style={{ height: 8 }} />
      <FlatList
        data={paymentMethods}
        renderItem={renderCard}
        keyExtractor={(item) => item.Id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingTop: 112 }]}
      />
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
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
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: -2,
  },
  gradientHeaderTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
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