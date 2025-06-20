import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getRentalRequests, approveRentalRequest, rejectRentalRequest } from '../api/rentalHistoriesApi';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import MessageModal from '../components/MessageModal';

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
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageIcon, setMessageIcon] = useState('info');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { colors, isDark } = useTheme();

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
      showMessage('Hata', 'İstekler yüklenemedi.', 'error');
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
      const response = await approveRentalRequest({ rentalId: id });
      setMessageTitle('Başarılı');
      setMessageText(response?.data?.message || 'Kiralama isteği onaylandı.');
      setMessageIcon('check-circle');
      setMessageModalVisible(true);
      fetchRequests();
    } catch (err) {
      setMessageTitle('Hata');
      setMessageText(
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || err.message || 'Onaylama işlemi başarısız.'
      );
      setMessageIcon('error');
      setMessageModalVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setMessageTitle('Hata');
      setMessageText('Lütfen red sebebini girin.');
      setMessageIcon('warning');
      setMessageModalVisible(true);
      return;
    }
    try {
      setActionLoading(true);
      if (!selectedRequest || typeof selectedRequest !== 'string' || selectedRequest.length !== 36 || !/^[0-9a-fA-F-]{36}$/.test(selectedRequest)) {
        setMessageTitle('Hata');
        setMessageText('Geçersiz veya eksik ID!');
        setMessageIcon('error');
        setMessageModalVisible(true);
        setActionLoading(false);
        return;
      }
      const response = await rejectRentalRequest({
        rentalId: selectedRequest,
        rejectionReason: rejectReason.trim()
      });
      setMessageTitle('Başarılı');
      setMessageText(response?.data?.message || 'Kiralama isteği reddedildi.');
      setMessageIcon('check-circle');
      setMessageModalVisible(true);
      setRejectReason('');
      setShowRejectModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      setMessageTitle('Hata');
      setMessageText(
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || error.message || 'İstek reddedilirken bir hata oluştu.'
      );
      setMessageIcon('error');
      setMessageModalVisible(true);
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

  const showMessage = (title, text, icon = 'info') => {
    setMessageTitle(title);
    setMessageText(text);
    setMessageIcon(icon);
    setMessageModalVisible(true);
  };

  const openRejectModal = (id) => {
    setSelectedRequest(id);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const renderCard = ({ item }) => {
    // Prepare info table data
    const infoData = [
      { icon: 'car', label: 'Araç', value: `${item.Brand} ${item.Model}`, iconColor: colors.primary },
      { icon: 'card-bulleted', label: 'Plaka', value: formatPlate(item.NumberPlate), iconColor: colors.primary, valueColor: colors.primary },
      { icon: 'account', label: 'Kullanıcı', value: item.UserName, iconColor: colors.info },
      { icon: 'email', label: 'E-posta', value: item.Email, iconColor: colors.info, valueColor: colors.textSecondary },
      { icon: 'play-circle-outline', label: 'Başlangıç', value: `${new Date(item.StartDate).toLocaleDateString('tr-TR')} ${new Date(item.StartDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`, iconColor: colors.success, valueColor: colors.textSecondary },
      { icon: 'stop-circle-outline', label: 'Bitiş', value: `${new Date(item.EndDate).toLocaleDateString('tr-TR')} ${new Date(item.EndDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`, iconColor: colors.error, valueColor: colors.textSecondary },
    ];

    return (
      <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
        {infoData.map((row, idx) => (
          <View key={row.label} style={[
            styles.infoRowModern,
            idx !== infoData.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
          ]}>
            <MaterialCommunityIcons name={row.icon} size={22} color={row.iconColor || colors.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.infoLabelModern, { color: colors.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.infoValueModern, { color: row.valueColor || colors.text }]}>{row.value}</Text>
          </View>
        ))}
        <View style={{
          width: '100%',
          backgroundColor: 'rgba(67, 160, 71, 0.1)',
          paddingVertical: 10,
          marginTop: 8,
          marginBottom: 4,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
            ₺{item.TotalPrice.toLocaleString('tr-TR')}
          </Text>
        </View>
        <View style={[styles.priceAndButtonsRow, { justifyContent: 'flex-end' }] }>
          <View style={[styles.buttonRowInline, { justifyContent: 'flex-end' }] }>
            <TouchableOpacity 
              style={[styles.approveBtnSmall, { backgroundColor: colors.success }, actionLoading && styles.disabledButton]} 
              onPress={() => handleApprove(item.Id)} 
              disabled={actionLoading}
            >
              <MaterialIcons name="check" size={18} color={colors.white} />
              <Text style={[styles.btnText, { color: colors.white }]}>{actionLoading ? 'Onaylanıyor...' : 'Onayla'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.rejectBtnSmall, { backgroundColor: colors.error }, actionLoading && styles.disabledButton]} 
              onPress={() => openRejectModal(item.Id)} 
              disabled={actionLoading}
            >
              <MaterialIcons name="close" size={18} color={colors.white} />
              <Text style={[styles.btnText, { color: colors.white }]}>Reddet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="clipboard-text-clock-outline" size={28} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>
            Kiralama İstekleri
          </Text>
        </View>
      </LinearGradient>
      <View style={{ height: 100 }} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.info} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderCard}
          keyExtractor={item => item.Id}
          contentContainerStyle={{ paddingBottom: 30, marginTop: 48 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-clock-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Bekleyen istek yok.</Text>
            </View>
          }
        />
      )}
      <MessageModal
        visible={showRejectModal}
        title="Red Sebebi"
        message={
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text,
                minHeight: 120,
                maxHeight: 200,
                textAlignVertical: 'top',
                marginBottom: 10,
                marginTop: 8,
                fontSize: 17,
                borderWidth: 1.5,
                borderRadius: 12,
                padding: 14,
              }
            ]}
            placeholder="Red sebebini girin..."
            placeholderTextColor={colors.textSecondary}
            value={rejectReason}
            onChangeText={setRejectReason}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            editable={!actionLoading}
          />
        }
        icon="error"
        showCancel={true}
        cancelText="İptal"
        onCancel={() => { setShowRejectModal(false); setRejectReason(''); setSelectedRequest(null); }}
        showConfirm={true}
        confirmText={actionLoading ? 'Gönderiliyor...' : 'Gönder'}
        onConfirm={handleReject}
        onClose={() => setShowRejectModal(false)}
      />
      <MessageModal
        visible={messageModalVisible}
        title={messageTitle}
        message={messageText}
        icon={messageIcon}
        onClose={() => setMessageModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 70,
    paddingBottom: 30,
    marginBottom: 5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  infoCard: {
    borderRadius: 14,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginHorizontal: 8,
  },
  infoRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    justifyContent: 'space-between',
  },
  infoLabelModern: {
    flex: 1,
    fontSize: 13,
    marginLeft: 2,
  },
  infoValueModern: {
    fontWeight: 'bold',
    fontSize: 14,
    minWidth: 60,
    textAlign: 'right',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  approveBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 10 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  btnText: { fontWeight: 'bold', marginLeft: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 12, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top', marginBottom: 10, fontSize: 15 },
  plateText: { fontSize: 15, fontWeight: 'bold', letterSpacing: 1, marginBottom: 0 },
  priceAndButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8, flexWrap: 'wrap' },
  priceBadgeLarge: { 
    borderRadius: 18, 
    paddingHorizontal: 22, 
    paddingVertical: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8, 
    width: PRICE_BADGE_WIDTH
  },
  priceBadgeTextLarge: { fontWeight: 'bold', fontSize: 20 },
  buttonRowInline: { flexDirection: 'row', gap: 8 },
  approveBtnSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, marginRight: 6 },
  rejectBtnSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  rentButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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

export default RentalRequestsScreen; 