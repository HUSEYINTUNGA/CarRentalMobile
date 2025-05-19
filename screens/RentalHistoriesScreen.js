import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRentalHistories } from '../hooks/useRentalHistories';
import { useAuth } from '../hooks/useAuth';

const RentalHistoriesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const {
        rentalHistories,
        pendingRentalHistories,
        fetchRentalHistoriesByUserId,
        fetchPendingRentalHistories,
        loading,
        pendingLoading
    } = useRentalHistories();
    const { type = 'history' } = route.params || {};

    useEffect(() => {
        loadRentalHistory();
    }, [type, user]);

    const loadRentalHistory = async () => {
        try {
            if (type === 'pending') {
                await fetchPendingRentalHistories();
            } else {
                if (user?.id) {
                    await fetchRentalHistoriesByUserId(user.id);
                }
            }
        } catch (error) {
            console.error('Error loading rental history:', error);
        }
    };

    const renderRentalItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.rentalCard}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.vehicle.id })}
        >
            <Image 
                source={{ uri: item.vehicle.photo }} 
                style={styles.rentalImage}
            />
            <View style={styles.rentalInfo}>
                <Text style={styles.rentalTitle}>{item.vehicle.brand} {item.vehicle.model}</Text>
                <Text style={styles.rentalDate}>
                    {new Date(item.rentalDate).toLocaleDateString()} - {new Date(item.returnDate).toLocaleDateString()}
                </Text>
                <Text style={styles.rentalPrice}>{item.totalPrice} TL</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.isActive ? '#4CAF50' : '#FFC107' }
                ]}>
                    <Text style={styles.statusText}>
                        {item.isActive ? 'Aktif' : 'Tamamlandı'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if ((type === 'pending' ? pendingLoading : loading)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={type === 'pending' ? pendingRentalHistories : rentalHistories}
                renderItem={renderRentalItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {type === 'pending' ? 'Bekleyen kiralama isteğiniz yok.' : 'Henüz kiralama geçmişiniz bulunmuyor.'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    rentalCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    rentalImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    rentalInfo: {
        padding: 16,
    },
    rentalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    rentalDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    rentalPrice: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default RentalHistoriesScreen;
