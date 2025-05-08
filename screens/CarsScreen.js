import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CarsScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Örnek araç verileri
  const cars = [
    {
      id: '1',
      brand: 'BMW',
      model: '320i',
      year: '2022',
      price: '1200',
      image: 'https://via.placeholder.com/300',
      available: true,
    },
    {
      id: '2',
      brand: 'Mercedes',
      model: 'C200',
      year: '2021',
      price: '1300',
      image: 'https://via.placeholder.com/300',
      available: true,
    },
    // Daha fazla araç eklenebilir
  ];

  const renderCarItem = ({ item }) => (
    <TouchableOpacity style={styles.carCard}>
      <Image source={{ uri: item.image }} style={styles.carImage} />
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>{item.brand} {item.model}</Text>
        <Text style={styles.carYear}>{item.year}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price} ₺</Text>
          <Text style={styles.pricePeriod}>/ gün</Text>
        </View>
        <View style={styles.availabilityContainer}>
          <Icon 
            name={item.available ? "check-circle" : "cancel"} 
            size={20} 
            color={item.available ? "#4CAF50" : "#F44336"} 
          />
          <Text style={[
            styles.availabilityText,
            { color: item.available ? "#4CAF50" : "#F44336" }
          ]}>
            {item.available ? "Müsait" : "Kirada"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Araç ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={cars}
        renderItem={renderCarItem}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  carCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  carImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  carInfo: {
    padding: 15,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  carYear: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  availabilityText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CarsScreen; 