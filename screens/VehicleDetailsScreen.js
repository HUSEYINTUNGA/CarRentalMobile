import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TransmissionTypeOptions, FuelTypeOptions } from '../enums/enum';

function formatPlate(plate) {
    if (!plate) return '-';
    const match = plate.match(/^([0-9]{2})([A-ZÇĞİÖŞÜ]{1,3})([0-9]{2,4})$/i);
    if (match) {
        return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
    }
    return plate.toUpperCase();
}

const VehicleDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { vehicleId } = route.params || {};
    const { fetchVehicleBasicById, loading, error } = useVehicles();
    const [vehicle, setVehicle] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [role, setRole] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        AsyncStorage.getItem('userRole').then(setRole);
    }, []);

    useEffect(() => {
        if (!vehicleId) {
            setLocalError('Araç ID bulunamadı.');
            return;
        }
        fetchVehicleBasicById(vehicleId)
            .then(setVehicle)
            .catch(() => setVehicle(null));
    }, [vehicleId]);

    const handlePreviousPhoto = () => {
        if (!vehicle?.Photos) return;
        setCurrentPhotoIndex((prevIndex) => 
            prevIndex === 0 ? vehicle.Photos.length - 1 : prevIndex - 1
        );
    };

    const handleNextPhoto = () => {
        if (!vehicle?.Photos) return;
        setCurrentPhotoIndex((prevIndex) => 
            prevIndex === vehicle.Photos.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    if (error || localError) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error || localError}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!vehicle) {
        return null;
    }

    const transmissionTypeLabel = TransmissionTypeOptions.find(opt => opt.value === vehicle.TransmissionType)?.label || '-';
    const fuelTypeLabel = FuelTypeOptions.find(opt => opt.value === vehicle.FuelType)?.label || '-';
    const sortedPhotos = vehicle.Photos ? [...vehicle.Photos] : [];
    const currentPhoto = sortedPhotos[currentPhotoIndex];
    const photoUri = currentPhoto?.Photo ? `data:image/jpeg;base64,${currentPhoto.Photo}` : undefined;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.photoContainer}>
                {photoUri && (
                    <Image 
                        source={{ uri: photoUri }}
                        style={styles.vehicleImage}
                    />
                )}
                {vehicle.Photos && vehicle.Photos.length > 1 && (
                    <>
                        <TouchableOpacity 
                            style={[styles.navButton, styles.leftButton]} 
                            onPress={handlePreviousPhoto}
                        >
                            <Icon name="chevron-left" size={32} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.navButton, styles.rightButton]} 
                            onPress={handleNextPhoto}
                        >
                            <Icon name="chevron-right" size={32} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.pagination}>
                            {vehicle.Photos.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === currentPhotoIndex && styles.paginationDotActive
                                    ]}
                                />
                            ))}
                        </View>
                    </>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{vehicle.Brand || '-'} {vehicle.Model || '-'}</Text>
                    <Text style={styles.subtitle}>{vehicle.ModelYear || '-'}</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{vehicle.DailyPrice != null ? vehicle.DailyPrice : '-'} TL</Text>
                    <Text style={styles.priceLabel}>/ Günlük</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Icon name="car" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Marka</Text>
                            <Text style={styles.detailValue}>{vehicle.Brand || '-'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Icon name="car-info" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Model</Text>
                            <Text style={styles.detailValue}>{vehicle.Model || '-'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Icon name="calendar" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Yıl</Text>
                            <Text style={styles.detailValue}>{vehicle.ModelYear || '-'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Icon name="tag" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Kategori</Text>
                            <Text style={styles.detailValue}>{vehicle.Category || '-'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Icon name="palette" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Renk</Text>
                            <Text style={styles.detailValue}>{vehicle.Color || '-'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Icon name="car-cog" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Vites</Text>
                            <Text style={styles.detailValue}>{transmissionTypeLabel}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Icon name="fuel" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Yakıt</Text>
                            <Text style={styles.detailValue}>{fuelTypeLabel}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Icon name="car-key" size={24} color="#2196F3" />
                            <Text style={styles.detailLabel}>Plaka</Text>
                            <Text style={styles.detailValue}>{formatPlate(vehicle.NumberPlate)}</Text>
                        </View>
                    </View>
                </View>
                {role === 'Admin' && (
                    <View style={styles.historyContainer}>
                        <Text style={styles.sectionTitle}>Kiralama Geçmişi</Text>
                        {vehicle.RentalHistories && vehicle.RentalHistories.length > 0 ? (
                            vehicle.RentalHistories.map((history, idx) => (
                                <View key={history.Id || idx} style={styles.historyItem}>
                                    <Text style={styles.historyLabel}>Kiralayan:</Text>
                                    <Text style={styles.historyValue}>{history.User?.Name || '-'} {history.User?.Surname || '-'}</Text>
                                    <Text style={styles.historyLabel}>Kullanıcı Adı:</Text>
                                    <Text style={styles.historyValue}>{history.User?.UserName || '-'}</Text>
                                    <Text style={styles.historyLabel}>E-posta:</Text>
                                    <Text style={styles.historyValue}>{history.User?.Email || '-'}</Text>
                                    <Text style={styles.historyLabel}>Kiralama Tarihi:</Text>
                                    <Text style={styles.historyValue}>{history.RentalDate ? new Date(history.RentalDate).toLocaleDateString() : '-'}</Text>
                                    <Text style={styles.historyLabel}>İade Tarihi:</Text>
                                    <Text style={styles.historyValue}>{history.ReturnDate ? new Date(history.ReturnDate).toLocaleDateString() : '-'}</Text>
                                    <Text style={styles.historyLabel}>Toplam Fiyat:</Text>
                                    <Text style={styles.historyValue}>{history.TotalPrice != null ? history.TotalPrice + ' TL' : '-'}</Text>
                                    <Text style={styles.historyLabel}>Durum:</Text>
                                    <Text style={styles.historyValue}>{history.IsActive ? 'Aktif' : 'Tamamlandı'}</Text>
                                    <View style={styles.historyDivider} />
                                </View>
                            ))
                        ) : (
                            <Text style={styles.historyEmpty}>Bu araca ait kiralama kaydı yok.</Text>
                        )}
                    </View>
                )}

                {role === 'Customer' && (
                    <TouchableOpacity
                        style={styles.rentButton}
                        onPress={() => navigation.navigate('RentedScreen', { vehicleId: vehicle.Id })}
                    >
                        <Text style={styles.rentButtonText}>Kiralama İsteği Oluştur</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
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
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#F44336',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
        marginLeft: 4,
    },
    detailsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    availableBadge: {
        backgroundColor: '#E8F5E9',
    },
    unavailableBadge: {
        backgroundColor: '#FFEBEE',
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    availableText: {
        color: '#4CAF50',
    },
    unavailableText: {
        color: '#F44336',
    },
    historyContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    historyItem: {
        marginBottom: 16,
    },
    historyLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    historyValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    historyDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 16,
    },
    historyEmpty: {
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
    },
    rentButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    rentButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    photoContainer: {
        width: '100%',
        height: 250,
        position: 'relative',
    },
    vehicleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -20 }],
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftButton: {
        left: 10,
    },
    rightButton: {
        right: 10,
    },
    pagination: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

export default VehicleDetailsScreen;
