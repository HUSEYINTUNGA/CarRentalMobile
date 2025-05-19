import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import { Picker } from '@react-native-picker/picker';
import { FuelTypeOptions, TransmissionTypeOptions } from '../enums/enum';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const VehicleListScreen = () => {
    const navigation = useNavigation();
    const {
        vehicles,
        fetchVehicles,
        fetchAllVehicles,
        loading,
        error
    } = useVehicles();

    const [filters, setFilters] = useState({
        fuelType: null,
        transmissionType: null
    });
    const [role, setRole] = useState(null);

    useEffect(() => {
        const getRole = async () => {
            const userRole = await AsyncStorage.getItem('userRole');
            setRole(userRole);
        };
        getRole();
    }, []);

    useEffect(() => {
        if (role === 'Admin') {
            fetchAllVehicles();
        } else if (role === 'Customer') {
            fetchVehicles({});
        }
    }, [role]);

    useEffect(() => {
        if (role === 'Customer') {
            const params = {};
            if (filters.fuelType !== null) params.FuelType = filters.fuelType;
            if (filters.transmissionType !== null) params.TransmissionType = filters.transmissionType;
            fetchVehicles(params);
        }
    }, [filters, role]);

    const renderVehicleItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.vehicleCard}
            onPress={() => {
                navigation.navigate('VehicleDetails', { vehicleId: item.Id });
            }}
            activeOpacity={0.85}
        >
            <Image 
                source={{ uri: `data:image/jpeg;base64,${item.Photo}` }}
                style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>{item.Brand} {item.Model} ({item.ModelYear})</Text>
                <Text style={styles.vehiclePrice}>{item.DailyPrice} TL / Gün</Text>
                <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleDetail}>{item.FuelType}</Text>
                    <Text style={styles.vehicleDetail}>{item.TransmissionType}</Text>
                    <Text style={styles.vehicleDetail}>{item.Color}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderAdminVehicleItem = ({ item }) => (
        <View style={styles.vehicleCard}>
            <Image 
                source={{ uri: `data:image/jpeg;base64,${item.Photo}` }}
                style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleTitle}>{item.Brand} {item.Model} ({item.ModelYear})</Text>
                <Text style={styles.vehiclePrice}>{item.DailyPrice} TL / Gün</Text>
                <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleDetail}>{item.FuelType}</Text>
                    <Text style={styles.vehicleDetail}>{item.TransmissionType}</Text>
                    <Text style={styles.vehicleDetail}>{item.Color}</Text>
                </View>
                <View style={styles.adminActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.Id })}>
                        <Icon name="eye" size={22} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('EditVehicle', { vehicleId: item.Id })}>
                        <Icon name="pencil" size={22} color="#FFC107" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('DeleteVehicle', { vehicleId: item.Id })}>
                        <Icon name="delete" size={22} color="#F44336" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('UpdatePrice', { vehicleId: item.Id })}>
                        <Icon name="currency-try" size={22} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderFilterBar = () => (
        <View style={styles.filterContainer}>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={filters.fuelType}
                    style={styles.picker}
                    onValueChange={value => setFilters(f => ({ ...f, fuelType: value }))}
                    dropdownIconColor="#2196F3"
                >
                    <Picker.Item label="Yakıt Tipi (Tümü)" value={null} />
                    {FuelTypeOptions.map((type, i) => (
                        <Picker.Item key={i} label={type.label} value={type.value} />
                    ))}
                </Picker>
            </View>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={filters.transmissionType}
                    style={styles.picker}
                    onValueChange={value => setFilters(f => ({ ...f, transmissionType: value }))}
                    dropdownIconColor="#2196F3"
                >
                    <Picker.Item label="Vites Tipi (Tümü)" value={null} />
                    {TransmissionTypeOptions.map((type, i) => (
                        <Picker.Item key={i} label={type.label} value={type.value} />
                    ))}
                </Picker>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {role === 'Customer' && renderFilterBar()}
            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 24 }} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : vehicles.length === 0 ? (
                <Text style={styles.emptyText}>Kriterlere uygun araç bulunamadı.</Text>
            ) : (
                <FlatList
                    data={vehicles}
                    renderItem={role === 'Admin' ? renderAdminVehicleItem : renderVehicleItem}
                    keyExtractor={item => (item.Id ? item.Id.toString() : Math.random().toString())}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    filterContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    pickerWrapper: {
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#222',
    },
    listContainer: {
        padding: 16,
    },
    vehicleCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 18,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    vehicleImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
        backgroundColor: '#eaeaea',
    },
    vehicleInfo: {
        padding: 16,
    },
    vehicleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    vehiclePrice: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    vehicleDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    vehicleDetail: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    errorText: {
        color: '#F44336',
        textAlign: 'center',
        marginTop: 24,
        fontSize: 16,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 32,
        fontSize: 16,
    },
    adminActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
    },
});

export default VehicleListScreen;
