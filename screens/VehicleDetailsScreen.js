import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TransmissionTypeOptions, FuelTypeOptions } from '../enums/enum';
import { LinearGradient } from 'expo-linear-gradient';

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
    const { fetchVehicleBasicById, fetchVehicleById, loading, error } = useVehicles();
    const [vehicle, setVehicle] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [role, setRole] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const userRole = await AsyncStorage.getItem('userRole');
                setRole(userRole);
            } catch (error) {
                console.error('Error fetching role:', error);
            }
        };
        fetchRole();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (vehicleId) {
                if (role === 'Admin') {
                    fetchVehicleById(vehicleId)
                        .then(data => {
                            // Admin verisi için VehiclePhotos'u Photos olarak normalize et
                            const normalizedData = {
                                ...data,
                                Photos: data.VehiclePhotos?.map(photo => ({
                                    Photo: photo.Photo || photo.photo,
                                    IsMain: photo.IsMain
                                })) || []
                            };
                            setVehicle(normalizedData);
                        })
                        .catch((error) => {
                            console.error('Error fetching vehicle details:', error);
                            setVehicle(null);
                        });
                } else {
                    fetchVehicleBasicById(vehicleId)
                        .then(data => {
                            // Customer verisi için Photos'u VehiclePhotos olarak normalize et
                            const normalizedData = {
                                ...data,
                                VehiclePhotos: data.Photos?.map(photo => ({
                                    Photo: photo.Photo || photo.photo,
                                    IsMain: photo.IsMain
                                })) || [],
                                IsAvailable: true, // Customer için varsayılan değerler
                                IsRented: false
                            };
                            setVehicle(normalizedData);
                        })
                        .catch((error) => {
                            console.error('Error fetching basic vehicle details:', error);
                            setVehicle(null);
                        });
                }
            }
        }, [vehicleId, role])
    );

    const handlePreviousPhoto = () => {
        if (photoList.length <= 1) return;
        setCurrentPhotoIndex((prevIndex) => 
            prevIndex === 0 ? photoList.length - 1 : prevIndex - 1
        );
    };

    const handleNextPhoto = () => {
        if (photoList.length <= 1) return;
        setCurrentPhotoIndex((prevIndex) => 
            prevIndex === photoList.length - 1 ? 0 : prevIndex + 1
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
    
    let photoList = [];
    if (vehicle.VehiclePhotos && Array.isArray(vehicle.VehiclePhotos)) {
        const mainPhoto = vehicle.VehiclePhotos.find(photo => photo.IsMain);
        const otherPhotos = vehicle.VehiclePhotos.filter(photo => !photo.IsMain);
        photoList = mainPhoto ? [mainPhoto, ...otherPhotos] : vehicle.VehiclePhotos;
    } else if (vehicle.Photos && Array.isArray(vehicle.Photos)) {
        const mainPhoto = vehicle.Photos.find(photo => photo.IsMain);
        const otherPhotos = vehicle.Photos.filter(photo => !photo.IsMain);
        photoList = mainPhoto ? [mainPhoto, ...otherPhotos] : vehicle.Photos;
    }
    
    const currentPhoto = photoList[currentPhotoIndex] || null;
    const photoUri = currentPhoto?.Photo || currentPhoto?.photo || undefined;

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
            <LinearGradient
                colors={['#0066cc', '#0052a3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={styles.gradientHeaderTitle}>Araç Detayları</Text>
            </LinearGradient>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 100 }}>
                <View style={{ height: 8 }} />
                <View style={styles.photoContainer}>
                    {photoUri ? (
                        <Image 
                            source={{ uri: photoUri }}
                            style={styles.vehicleImage}
                        />
                    ) : (
                        <View style={[styles.vehicleImage, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}> 
                            <Icon name="car" size={40} color="#666" />
                        </View>
                    )}
                    {photoList.length > 1 && (
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
                                {photoList.map((_, index) => (
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
                <View style={{ minHeight: 40 }} />
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
                        {role === 'Admin' && (
                            <>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailItem}>
                                        <Icon name="check-circle" size={24} color={vehicle.IsAvailable ? "#4CAF50" : "#9E9E9E"} />
                                        <Text style={styles.detailLabel}>Müsaitlik</Text>
                                        <Text style={styles.detailValue}>{vehicle.IsAvailable ? 'Aktif' : 'Pasif'}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Icon name="car-side" size={24} color={vehicle.IsRented ? "#F44336" : "#4CAF50"} />
                                        <Text style={styles.detailLabel}>Durum</Text>
                                        <Text style={styles.detailValue}>{vehicle.IsRented ? 'Kirada' : 'Boşta'}</Text>
                                    </View>
                                </View>
                                {vehicle.RentalHistories && vehicle.RentalHistories.length > 0 && (
                                    <View style={styles.rentalHistoryContainer}>
                                        <Text style={styles.rentalHistoryTitle}>Kiralama Geçmişi</Text>
                                        {vehicle.RentalHistories.map((rental, index) => (
                                            <View key={rental.Id} style={styles.rentalHistoryItem}>
                                                <View style={styles.rentalHistoryHeader}>
                                                    <Icon 
                                                        name={rental.IsActive ? "clock-check" : "clock-check-outline"} 
                                                        size={24} 
                                                        color={rental.IsActive ? "#4CAF50" : "#9E9E9E"} 
                                                    />
                                                    <Text style={styles.rentalHistoryStatus}>
                                                        {rental.IsActive ? 'Aktif Kiralama' : 'Tamamlanmış Kiralama'}
                                                    </Text>
                                                </View>
                                                <View style={styles.rentalHistoryDetails}>
                                                    <View style={styles.rentalHistoryRow}>
                                                        <Text style={styles.rentalHistoryLabel}>Kiralama Tarihi:</Text>
                                                        <Text style={styles.rentalHistoryValue}>
                                                            {new Date(rental.RentalDate).toLocaleDateString('tr-TR')}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.rentalHistoryRow}>
                                                        <Text style={styles.rentalHistoryLabel}>İade Tarihi:</Text>
                                                        <Text style={styles.rentalHistoryValue}>
                                                            {new Date(rental.ReturnDate).toLocaleDateString('tr-TR')}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.rentalHistoryRow}>
                                                        <Text style={styles.rentalHistoryLabel}>Toplam Tutar:</Text>
                                                        <Text style={styles.rentalHistoryValue}>{rental.TotalPrice} TL</Text>
                                                    </View>
                                                    <View style={styles.rentalHistoryRow}>
                                                        <Text style={styles.rentalHistoryLabel}>Müşteri:</Text>
                                                        <Text style={styles.rentalHistoryValue}>
                                                            {rental.User.Name} {rental.User.Surname}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.rentalHistoryRow}>
                                                        <Text style={styles.rentalHistoryLabel}>E-posta:</Text>
                                                        <Text style={styles.rentalHistoryValue}>{rental.User.Email}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </View>

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
        padding: 0,
        backgroundColor: 'transparent',
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    historyCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyUserName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    historyUserUsername: {
        fontSize: 13,
        color: '#3393dc',
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
    },
    completedBadge: {
        backgroundColor: '#FFEBEE',
    },
    statusBadgeText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    activeBadgeText: {
        color: '#43a047',
    },
    completedBadgeText: {
        color: '#e53935',
    },
    historyCardBody: {
        marginTop: 2,
    },
    historyLabel: {
        fontSize: 13,
        color: '#888',
        marginTop: 6,
    },
    historyValue: {
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
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
        resizeMode: 'contain',
        // alignSelf: 'center',
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
    headerLogo: {
        width: 48,
        height: 32,
        resizeMode: 'contain',
        position: 'absolute',
        right: 18,
        top: 38,
    },
    rentalHistoryContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rentalHistoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    rentalHistoryItem: {
        marginBottom: 15,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    rentalHistoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    rentalHistoryStatus: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    rentalHistoryDetails: {
        marginLeft: 32,
    },
    rentalHistoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    rentalHistoryLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    rentalHistoryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
});

export default VehicleDetailsScreen;
