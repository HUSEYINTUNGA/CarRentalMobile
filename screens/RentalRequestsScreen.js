import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getRentalRequests, approveRentalRequest, rejectRentalRequest } from '../api/rentalHistoriesApi';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_PADDING = 32; // 16px left + 16px right
const CARD_MARGIN = 32; // 16px left + 16px right
const CARD_WIDTH = width - CARD_PADDING - CARD_MARGIN;
const PRICE_BADGE_WIDTH = CARD_WIDTH - 5;

const RentalRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getRentalRequests();
      if (response && response.data) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      Alert.alert('Hata', 'İstekler yüklenemedi.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveRentalRequest({ rentalId: id });
      fetchRequests();
    } catch (err) {
      Alert.alert('Hata', 'Onaylama işlemi başarısız.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Hata', 'Lütfen red sebebini girin.');
      return;
    }
    try {
      setActionLoading(true);
      if (!selectedRequest || typeof selectedRequest !== 'string' || selectedRequest.length !== 36 || !/^[0-9a-fA-F-]{36}$/.test(selectedRequest)) {
        Alert.alert('Hata', 'Geçersiz veya eksik ID!');
        setActionLoading(false);
        return;
      }
      await rejectRentalRequest({
        rentalId: selectedRequest,
        rejectionReason: rejectReason.trim()
      });
      Alert.alert('Başarılı', 'Kiralama isteği reddedildi.');
      setRejectReason('');
      setModalVisible(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      Alert.alert('Hata', error.message || 'İstek reddedilirken bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPlate = (plate) => {
    if (!plate) return '';
    const match = plate.match(/^([0-9]{2})\s*([A-ZÇĞİÖŞÜ]{1,3})\s*([0-9]{2,4})$/i);
    if (match) {
      return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
    }
    const match2 = plate.match(/^([0-9]{2})([A-ZÇĞİÖŞÜ]{1,3})([0-9]{2,4})$/i);
    if (match2) {
      return `${match2[1]} ${match2[2].toUpperCase()} ${match2[3]}`;
    }
    return plate.toUpperCase();
  };

  const renderCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="car" size={22} color="#0066cc" style={{ marginRight: 7 }} />
          <Text style={styles.cardTitle}>{item.Brand} {item.Model}</Text>
        </View>
        <View style={styles.cardSecondaryRow}>
          <MaterialIcons name="confirmation-number" size={16} color="#0066cc" style={{ marginRight: 7 }} />
          <Text style={styles.plateText}>{formatPlate(item.NumberPlate)}</Text>
        </View>
        <View style={styles.cardRow}>
          <MaterialIcons name="person" size={22} color="#3393dc" style={{ marginRight: 7 }} />
          <Text style={styles.cardTitle}>{item.UserName}</Text>
        </View>
        <View style={styles.cardSecondaryRow}>
          <MaterialIcons name="mail" size={16} color="#3393dc" style={{ marginRight: 7 }} />
          <Text style={styles.cardInfo}>{item.Email}</Text>
        </View>
        <View style={styles.cardRow}>
          <MaterialCommunityIcons name="clipboard-text-clock-outline" size={22} color="#000000" style={{ marginRight: 7 }} />
          <Text style={styles.cardTitle}>Kiralama Tarihleri</Text>
        </View>
        <View style={styles.cardSecondaryRow}>
          <MaterialIcons name="play-circle-outline" size={16} color="#43a047" style={{ marginRight: 7 }} />
          <Text style={styles.cardInfo}>
            {new Date(item.StartDate).toLocaleDateString('tr-TR')} {new Date(item.StartDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.cardSecondaryRow}>
          <MaterialCommunityIcons name="stop-circle-outline" size={16} color="#e53935" style={{ marginRight: 7 }} />
          <Text style={styles.cardInfo}>
            {new Date(item.EndDate).toLocaleDateString('tr-TR')} {new Date(item.EndDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.priceAndButtonsRow}>
          <View style={styles.priceBadgeLarge}>
            <Text style={styles.priceBadgeTextLarge}>₺{item.TotalPrice.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={styles.buttonRowInline}>
            <TouchableOpacity 
              style={[styles.approveBtnSmall, actionLoading && styles.disabledButton]} 
              onPress={() => handleApprove(item.Id)} 
              disabled={actionLoading}
            >
              <MaterialIcons name="check" size={18} color="#fff" />
              <Text style={styles.btnText}>{actionLoading ? 'Onaylanıyor...' : 'Onayla'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.rejectBtnSmall, actionLoading && styles.disabledButton]} 
              onPress={() => { setSelectedRequest(item.Id); setModalVisible(true); }} 
              disabled={actionLoading}
            >
              <MaterialIcons name="close" size={18} color="#fff" />
              <Text style={styles.btnText}>Reddet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0066cc', '#0052a3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="clipboard-text-clock-outline" size={28} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Kiralama İstekleri</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3393dc" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderCard}
          keyExtractor={item => item.Id}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-clock-outline" size={48} color="#888" />
              <Text style={styles.emptyText}>Bekleyen istek yok.</Text>
            </View>
          }
        />
      )}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Red Sebebi</Text>
            <TextInput
              style={styles.input}
              placeholder="Red sebebini girin..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} disabled={actionLoading}>
                <Text style={styles.btnText}>Gönder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setRejectReason(''); setSelectedRequest(null); }}>
                <Text style={styles.btnText}>İptal</Text>
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
    backgroundColor: '#f5f5f5'
  },
  headerGradient: {
    paddingTop: 70,
    paddingBottom: 30,
    marginBottom:5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 12, 
    marginHorizontal: 16,
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 2 
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardSecondaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, marginLeft: 14 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardInfo: { fontSize: 13, color: '#444', marginBottom: 0 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  approveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#43a047', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 10 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e53935', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#888', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#e53935', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top', marginBottom: 10, fontSize: 15 },
  plateText: { fontSize: 15, color: '#1976d2', fontWeight: 'bold', letterSpacing: 1, marginBottom: 0 },
  priceAndButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8, flexWrap: 'wrap' },
  priceBadgeLarge: { 
    backgroundColor: '#e8f5e9', 
    borderRadius: 18, 
    paddingHorizontal: 22, 
    paddingVertical: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8, 
    width: PRICE_BADGE_WIDTH
  },
  priceBadgeTextLarge: { color: '#43a047', fontWeight: 'bold', fontSize: 20 },
  buttonRowInline: { flexDirection: 'row', gap: 8 },
  approveBtnSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#43a047', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, marginRight: 6 },
  rejectBtnSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e53935', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#888',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default RentalRequestsScreen; 