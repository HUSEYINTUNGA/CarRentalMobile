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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useTheme } from '../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import ViewPaymentMethod from './ViewPaymentMethod';


const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { paymentMethods, loading, error, fetchPaymentMethods, removePaymentMethod } = usePaymentMethods();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { colors, isDark } = useTheme();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

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

  const handleDelete = (card) => {
    setCardToDelete(card);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await removePaymentMethod(cardToDelete.Id);
      fetchPaymentMethods();
      Alert.alert('Başarılı', 'Kart başarıyla silindi.');
    } catch (err) {
      Alert.alert('Hata', 'Kart silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setCardToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setCardToDelete(null);
  };

  const handleEdit = (card) => {
    navigation.navigate('EditPaymentMethod', {
      mode: 'update',
      cardId: card.Id,
    });
  };

  const handleView = (card) => {
    setSelectedCardId(card.Id);
  };

  const handleAddNew = () => {
    navigation.navigate('EditPaymentMethod', { mode: 'create' });
  };

  const renderCard = ({ item }) => (
    <View style={[styles.cardContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]}>{item.MethodName}</Text>
        <Text style={[styles.cardNumber, { color: colors.textSecondary }]}>**** **** **** {item.Last4Digits}</Text>
        <Text style={[styles.cardHolder, { color: colors.textSecondary }]}>{item.CardHolderName}</Text>
        <Text style={[styles.expiryDate, { color: colors.textSecondary }] }>
          {item.ExpirationMonth}/{item.ExpirationYear % 100}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleView(item)}
        >
          <Ionicons name="eye" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil-outline" size={24} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
          disabled={deleteLoading}
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }] }>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }] }>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: '#fff' }]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>Ödeme Yöntemleriniz</Text>
      </LinearGradient>
      <View style={{ height: 8 }} />
      {selectedCardId && (
        <ViewPaymentMethod cardId={selectedCardId} onClose={() => setSelectedCardId(null)} />
      )}
      <FlatList
        data={paymentMethods}
        renderItem={renderCard}
        keyExtractor={(item) => item.Id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingTop: 100 }]}
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleAddNew}>
        <Text style={[styles.fabIcon, { color: isDark ? '#111' : '#fff' }]}>＋</Text>
      </TouchableOpacity>
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Icon name="delete" size={40} color={colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.error }]}>Kartı Sil</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Bu kartı silmek istediğinizden emin misiniz?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error }]}
                onPress={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color={isDark ? '#111' : '#fff'} />
                ) : (
                  <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Sil</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, marginLeft: 8 }]}
                onPress={cancelDelete}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: -2,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: 14,
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 14,
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
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  cardExpiry: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  rentButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    elevation: 3,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
export default PaymentMethodsScreen; 