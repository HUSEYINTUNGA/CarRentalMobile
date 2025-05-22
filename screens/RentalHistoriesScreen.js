import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useRentalHistories } from '../hooks/useRentalHistories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RentalHistoriesScreen = () => {
    const route = useRoute();
    const {
        rentalHistories,
        pendingRentalHistories,
        fetchRentalHistoriesByUserId,
        fetchPendingRentalHistories,
        loading,
        pendingLoading,
        removePendingRentalRequest
    } = useRentalHistories();
    const { type = 'history' } = route.params || {};
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loadUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
        };
        loadUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            loadRentalHistory();
        }
    }, [type, userId]);

    const loadRentalHistory = async () => {
        try {
            if (type === 'pending') {
                await fetchPendingRentalHistories();
            } else {
                if (userId) {
                    await fetchRentalHistoriesByUserId(userId);
                }
            }
        } catch (error) {
            console.error('Error loading rental history:', error);
        }
    };

    const formatPlate = (plate) => {
        if (!plate) return '';
        const match = plate.match(/^(\d{2})([a-zA-Z]+)(\d+)$/);
        if (match) {
            return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
        }
        return plate;
    };

    const renderRentalItem = ({ item }) => {
        const handleCancel = () => {
            Alert.alert(
                'İsteği İptal Et',
                'Bu isteği iptal etmek istediğinize emin misiniz?',
                [
                    { text: 'Hayır', style: 'cancel' },
                    { text: 'Evet', style: 'destructive', onPress: () => removePendingRentalRequest(item.Id) }
                ]
            );
        };
        return (
            <View style={styles.rentalCard}>
                {item.MainPhoto ? (
                    <Image 
                        source={{ uri: `data:image/jpeg;base64,${item.MainPhoto}` }} 
                        style={styles.rentalImage}
                    />
                ) : null}
                <View style={styles.rentalInfo}>
                    <Text style={styles.rentalTitle}>{item.Brand} {item.Model}</Text>
                    <Text style={styles.rentalDate}>
                        {new Date(item.StartDate).toLocaleDateString()} - {new Date(item.EndDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.infoRow}>
                        <View style={styles.plateContainer}>
                            <Icon name="car" size={18} color="#1976d2" style={{ marginRight: 4 }} />
                            <Text style={styles.plateText}>{formatPlate(item.NumberPlate)}</Text>
                        </View>
                        <View style={[styles.priceBadge, type === 'pending' ? styles.priceBadgeGreen : styles.priceBadgeRed]}>
                            <Text style={styles.priceBadgeText}>{item.TotalPrice} TL</Text>
                        </View>
                    </View>
                    {type === 'pending' && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelButtonText}>İsteği İptal Et</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            // fetchRentalHistoriesByUserId && fetchRentalHistoriesByUserId();
        }, [])
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
                keyExtractor={item => item.Id?.toString() || item.id?.toString() || (item.StartDate + item.NumberPlate)}
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    plateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 10,
    },
    plateText: {
        color: '#1976d2',
        fontWeight: 'bold',
        fontSize: 14,
    },
    priceBadge: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceBadgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    priceBadgeGreen: {
        backgroundColor: '#43a047',
    },
    priceBadgeRed: {
        backgroundColor: '#e53935',
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
    cancelButton: {
        backgroundColor: '#e53935',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 7,
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 0.2,
    },
});

export default RentalHistoriesScreen;
