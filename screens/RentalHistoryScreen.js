import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RentalHistoryScreen = () => {
  // Örnek kiralama geçmişi verileri
  const rentalHistory = [
    {
      id: '1',
      carBrand: 'BMW',
      carModel: '320i',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      totalPrice: '4800',
      status: 'completed',
    },
    {
      id: '2',
      carBrand: 'Mercedes',
      carModel: 'C200',
      startDate: '2024-03-10',
      endDate: '2024-03-15',
      totalPrice: '6500',
      status: 'active',
    },
    // Daha fazla kiralama geçmişi eklenebilir
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'active':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'active':
        return 'Aktif';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const renderRentalItem = ({ item }) => (
    <TouchableOpacity style={styles.rentalCard}>
      <View style={styles.rentalHeader}>
        <Text style={styles.carInfo}>{item.carBrand} {item.carModel}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.dateContainer}>
        <View style={styles.dateItem}>
          <Icon name="event" size={20} color="#666" />
          <Text style={styles.dateLabel}>Başlangıç</Text>
          <Text style={styles.dateValue}>{item.startDate}</Text>
        </View>
        <View style={styles.dateItem}>
          <Icon name="event" size={20} color="#666" />
          <Text style={styles.dateLabel}>Bitiş</Text>
          <Text style={styles.dateValue}>{item.endDate}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Icon name="attach-money" size={20} color="#2196F3" />
        <Text style={styles.priceText}>{item.totalPrice} ₺</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rentalHistory}
        renderItem={renderRentalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  listContainer: {
    padding: 15,
  },
  rentalCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  carInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateItem: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 8,
  },
});

export default RentalHistoryScreen; 