import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Modal, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import { getVehicle3DModel } from '../api/vehicleApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { TransmissionTypeOptions, FuelTypeOptions } from '../enums/enum';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { Linking } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
    const [models3D, setModels3D] = useState(null);
    const [selectedModelIndex, setSelectedModelIndex] = useState(0);
    const [loading3DModel, setLoading3DModel] = useState(false);
    const { colors, isDark } = useTheme();
    const [showModelSelection, setShowModelSelection] = useState(false);
    const [foundModels, setFoundModels] = useState([]);
    const [modelSearchStats, setModelSearchStats] = useState(null);
    const [modelSearchError, setModelSearchError] = useState(null);
    const [selected3DModel, setSelected3DModel] = useState(null);
    const [show3DModel, setShow3DModel] = useState(false);

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

    const load3DModel = async (brand, model, year, category) => {
        if (!brand || !model || !year) return;
        
        setLoading3DModel(true);
        try {
            const modelData = await getVehicle3DModel(brand, model, year, category);
            setModels3D(modelData);
            setSelectedModelIndex(0); // İlk modeli seç
        } catch (error) {
            console.error('3D model yükleme hatası:', error);
        } finally {
            setLoading3DModel(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (vehicleId) {
                if (role === 'Admin') {
                    fetchVehicleById(vehicleId)
                        .then(data => {
                            const normalizedData = {
                                ...data,
                                Photos: data.VehiclePhotos?.map(photo => ({
                                    Photo: photo.Photo || photo.photo,
                                    IsMain: photo.IsMain
                                })) || []
                            };
                            setVehicle(normalizedData);
                            load3DModel(data.Brand, data.Model, data.ModelYear, data.Category);
                        })
                        .catch((error) => {
                            console.error('Error fetching vehicle details:', error);
                            setVehicle(null);
                        });
                } else {
                    fetchVehicleBasicById(vehicleId)
                        .then(data => {
                            const normalizedData = {
                                ...data,
                                VehiclePhotos: data.Photos?.map(photo => ({
                                    Photo: photo.Photo || photo.photo,
                                    IsMain: photo.IsMain
                                })) || [],
                                IsAvailable: true, 
                                IsRented: false
                            };
                            setVehicle(normalizedData);
                            load3DModel(data.Brand, data.Model, data.ModelYear, data.Category);
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

    const handle3DModelSearch = async () => {
        if (!vehicle) return;
        
        setLoading3DModel(true);
        setModelSearchError(null);
        setModelSearchStats(null);
        
        try {
            const result = await getVehicle3DModel(
                vehicle.Brand,
                vehicle.Model,
                vehicle.ModelYear.toString(),
                vehicle.Category
            );
            
            if (result && result.models && result.models.length > 0) {
                setFoundModels(result.models);
                setModelSearchStats(result.searchStats);
                setShowModelSelection(true);
            } else {
                setModelSearchError('Bu araç için 3D model bulunamadı');
                setModelSearchStats(result?.searchStats || null);
            }
        } catch (error) {
            console.error('3D model arama hatası:', error);
            setModelSearchError('3D model arama sırasında bir hata oluştu');
        } finally {
            setLoading3DModel(false);
        }
    };

    const handleModelSelect = (model) => {
        setSelected3DModel(model);
        setShowModelSelection(false);
        setShow3DModel(true);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || localError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background }}>
                <Icon name="alert-circle" size={48} color={colors.error} />
                <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 12, marginBottom: 20, color: colors.error }}>{error || localError}</Text>
                <TouchableOpacity 
                    style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.white }}>Geri Dön</Text>
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

    const renderNoModelFound = () => (
        <View style={[styles.noModelContainer, { backgroundColor: colors.background }]}>
            <View style={styles.noModelContent}>
                <View style={[styles.noModelIconContainer, { backgroundColor: colors.card }]}>
                    <MaterialIcons name="3d-rotation" size={48} color={colors.textSecondary} />
                </View>
                
                <Text style={[styles.noModelTitle, { color: colors.text }]}>3D Model Bulunamadı</Text>
            </View>
        </View>
    );

    const renderModelSelection = () => (
        <Modal
            visible={showModelSelection}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>3D Model Seçin</Text>
                    <TouchableOpacity onPress={() => setShowModelSelection(false)}>
                        <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent}>
                    {modelSearchStats && (
                        <View style={styles.searchSummary}>
                            <Text style={styles.searchSummaryText}>
                                {foundModels.length} model bulundu • 
                                {modelSearchStats.totalSearches} arama yapıldı
                            </Text>
                        </View>
                    )}
                    
                    {foundModels.map((model, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.modelCard}
                            onPress={() => handleModelSelect(model)}
                        >
                            <View style={styles.modelCardHeader}>
                                <Text style={styles.modelTitle} numberOfLines={2}>
                                    {model.title}
                                </Text>
                            </View>
                            
                            {model.thumbnailUrl && (
                                <Image
                                    source={{ uri: model.thumbnailUrl }}
                                    style={styles.modelThumbnail}
                                    resizeMode="cover"
                                />
                            )}
                            
                            <View style={styles.modelDetails}>
                                <View style={styles.modelMeta}>
                                    <Text style={styles.modelAuthor}>👤 {model.author}</Text>
                                    <Text style={styles.modelDownloads}>⬇️ {model.downloadCount || 0}</Text>
                                    <Text style={styles.modelViews}>👁️ {model.viewCount || 0}</Text>
                                </View>
                                
                                <View style={styles.modelStrategy}>
                                    <Text style={styles.strategyLabel}>Arama:</Text>
                                    <Text style={styles.strategyText}>"{model.searchStrategy}"</Text>
                                </View>
                            </View>
                            
                            <View style={styles.modelActions}>
                                <TouchableOpacity
                                    style={[styles.viewModelButton, { backgroundColor: '#007AFF' }]}
                                    onPress={() => handleModelSelect(model)}
                                >
                                    <MaterialIcons name="visibility" size={18} color="#fff" />
                                    <Text style={styles.viewModelButtonText}>Görüntüle</Text>
                                </TouchableOpacity>
                                
                                {model.downloadUrl && (
                                    <TouchableOpacity
                                        style={[styles.downloadButton, { borderColor: '#007AFF' }]}
                                        onPress={() => Linking.openURL(model.downloadUrl)}
                                    >
                                        <MaterialIcons name="download" size={18} color="#007AFF" />
                                        <Text style={[styles.downloadButtonText, { color: '#007AFF' }]}>İndir</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LinearGradient
                colors={[colors.headerGradientStart, colors.headerGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backIcon, { color: '#fff' }]}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>Araç Detayları</Text>
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
                        <View style={[styles.vehicleImage, { backgroundColor: colors.imageBg, justifyContent: 'center', alignItems: 'center' }]}> 
                            <Icon name="car" size={40} color={colors.textSecondary} />
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
                                            index === currentPhotoIndex && { backgroundColor: colors.white, width: 10, height: 10, borderRadius: 5 }
                                        ]}
                                    />
                                ))}
                            </View>
                        </>
                    )}
                </View>
                <View style={{ minHeight: 40 }} />
                <View style={styles.content}>
                    {(() => {
                        const infoData = [
                            { icon: 'car', label: 'Marka', value: vehicle.Brand || '-' },
                            { icon: 'car-info', label: 'Model', value: vehicle.Model || '-' },
                            { icon: 'calendar', label: 'Yıl', value: vehicle.ModelYear || '-' },
                            { icon: 'tag', label: 'Kategori', value: vehicle.Category || '-' },
                            { icon: 'palette', label: 'Renk', value: vehicle.Color || '-' },
                            { icon: 'car-cog', label: 'Vites', value: transmissionTypeLabel },
                            { icon: 'fuel', label: 'Yakıt', value: fuelTypeLabel },
                            { icon: 'id-card-fa', label: 'Plaka', value: formatPlate(vehicle.NumberPlate) },
                            { icon: 'cash', label: 'Fiyat', value: (vehicle.DailyPrice != null ? vehicle.DailyPrice + ' TL' : '-'), iconColor: colors.success, valueColor: colors.success },
                        ];
                        if (role === 'Admin') {
                            infoData.push(
                                { icon: 'check-circle', label: 'Müsaitlik', value: vehicle.IsAvailable ? 'Aktif' : 'Pasif', iconColor: vehicle.IsAvailable ? colors.success : colors.textSecondary, valueColor: vehicle.IsAvailable ? colors.success : colors.textSecondary },
                                { icon: 'car-side', label: 'Durum', value: vehicle.IsRented ? 'Kirada' : 'Boşta', iconColor: vehicle.IsRented ? colors.error : colors.success, valueColor: vehicle.IsRented ? colors.error : colors.success }
                            );
                        }
                        return (
                            <View style={[styles.infoCard, { backgroundColor: colors.card }] }>
                                {infoData.map((item, idx) => (
                                    <View key={item.label} style={[
                                        styles.infoRowModern,
                                        idx !== infoData.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                    ]}>
                                        {item.icon === 'id-card-fa' ? (
                                            <IconFA name="id-card" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                                        ) : (
                                            <Icon name={item.icon} size={22} color={item.iconColor || colors.primary} style={{ marginRight: 10 }} />
                                        )}
                                        <Text style={[styles.infoLabelModern, { color: colors.textSecondary }]}>{item.label}</Text>
                                        <Text style={[styles.infoValueModern, { color: item.valueColor || colors.text }]}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        );
                    })()}

                    {role === 'Admin' && vehicle.RentalHistories && vehicle.RentalHistories.length > 0 && (
                        <View style={[styles.infoCard, { backgroundColor: colors.card, marginTop: 18 }] }>
                            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Kiralama Geçmişi</Text>
                            {vehicle.RentalHistories.map((rental, idx) => {
                                const historyData = [
                                    { icon: 'clock-check', label: 'Kiralama Tarihi', value: new Date(rental.RentalDate).toLocaleDateString('tr-TR') },
                                    { icon: 'clock-end', label: 'İade Tarihi', value: new Date(rental.ReturnDate).toLocaleDateString('tr-TR') },
                                    { icon: 'cash', label: 'Toplam Tutar', value: rental.TotalPrice + ' TL', valueColor: colors.success },
                                    { icon: 'account', label: 'Müşteri', value: rental.User.Name + ' ' + rental.User.Surname },
                                    { icon: 'email', label: 'E-posta', value: rental.User.Email },
                                ];
                                return (
                                    <View key={rental.Id} style={{ marginBottom: idx !== vehicle.RentalHistories.length - 1 ? 18 : 0 }}>
                                        {historyData.map((item, hidx) => (
                                            <View key={item.label} style={[
                                                styles.infoRowModern,
                                                hidx !== historyData.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                                                idx !== vehicle.RentalHistories.length - 1 && hidx === historyData.length - 1 && {
                                                    borderBottomWidth: 2,
                                                    borderBottomColor: isDark ? '#fff' : '#111',
                                                }
                                            ]}>
                                                {item.icon === 'id-card-fa' ? (
                                                    <IconFA name="id-card" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                                                ) : (
                                                    <Icon name={item.icon} size={22} color={item.iconColor || colors.primary} style={{ marginRight: 10 }} />
                                                )}
                                                <Text style={[styles.infoLabelModern, { color: colors.textSecondary }]}>{item.label}</Text>
                                                <Text style={[styles.infoValueModern, { color: item.valueColor || colors.text }]}>{item.value}</Text>
                                            </View>
                                        ))}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* 3D Model Bölümü */}
                    <View style={[styles.infoCard, { backgroundColor: colors.card, marginTop: 18 }] }>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>3D Model İnceleme</Text>
                        
                        {loading3DModel ? (
                            <View style={styles.modelLoadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={[styles.modelLoadingText, { color: colors.textSecondary }]}>3D modeller aranıyor...</Text>
                            </View>
                        ) : models3D && models3D.length > 0 ? (
                            <View>
                                {/* Model Seçici */}
                                <View style={styles.modelSelector}>
                                    <Text style={[styles.modelSelectorTitle, { color: colors.text }]}>
                                        {models3D.length} model bulundu
                                    </Text>
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.modelThumbnailList}
                                    >
                                        {models3D.map((model, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.modelThumbnailItem,
                                                    selectedModelIndex === index && { borderColor: colors.primary, borderWidth: 2 }
                                                ]}
                                                onPress={() => setSelectedModelIndex(index)}
                                            >
                                                <Image 
                                                    source={{ uri: model.thumbnailUrl }} 
                                                    style={styles.modelThumbnailSmall}
                                                />
                                                <Text style={[styles.modelThumbnailScore, { color: colors.textSecondary }]}>
                                                    {model.score} puan
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Seçili Model Detayları */}
                                <View style={styles.modelContainer}>
                                    <Image 
                                        source={{ uri: models3D[selectedModelIndex].thumbnailUrl }} 
                                        style={styles.modelThumbnail}
                                    />
                                    <View style={styles.modelInfo}>
                                        <Text style={[styles.modelTitle, { color: colors.text }]}>
                                            {models3D[selectedModelIndex].title}
                                        </Text>
                                        <Text style={[styles.modelAuthor, { color: colors.textSecondary }]}>
                                            Yazar: {models3D[selectedModelIndex].author}
                                        </Text>
                                        <Text style={[styles.modelStats, { color: colors.textSecondary }]}>
                                            📥 {models3D[selectedModelIndex].downloadCount} • 👁️ {models3D[selectedModelIndex].viewCount}
                                        </Text>
                                        {models3D[selectedModelIndex].searchStrategy && (
                                            <Text style={[styles.modelStrategy, { color: colors.textSecondary }]}>
                                                Bulunan: {models3D[selectedModelIndex].searchStrategy}
                                            </Text>
                                        )}
                                        <TouchableOpacity 
                                            style={[styles.view3DButton, { backgroundColor: colors.primary }]}
                                            onPress={() => {
                                                navigation.navigate('WebView', { 
                                                    url: models3D[selectedModelIndex].modelUrl, 
                                                    title: '3D Model İnceleme' 
                                                });
                                            }}
                                        >
                                            <Icon name="cube-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={[styles.view3DButtonText, { color: '#fff' }]}>3D Modeli İncele</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            renderNoModelFound()
                        )}
                    </View>

                    {role === 'Customer' && (
                        <TouchableOpacity
                            style={[styles.rentButton, { backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('RentedScreen', { vehicleId: vehicle.Id })}
                        >
                            <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>Kiralama İsteği Oluştur</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
            {renderModelSelection()}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    retryButton: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    },
    subtitle: {
        fontSize: 18,
        marginTop: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
        marginTop: 12,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    priceLabel: {
        fontSize: 16,
        marginLeft: 4,
    },
    infoTable: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoCellLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        marginLeft: 8,
        color: '#888',
        fontSize: 15,
    },
    infoValue: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 16,
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
    },
    unavailableBadge: {
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    availableText: {
    },
    unavailableText: {
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
        marginBottom: 15,
    },
    historyCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyUserName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyUserUsername: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    activeBadge: {
    },
    completedBadge: {
    },
    statusBadgeText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    activeBadgeText: {
    },
    completedBadgeText: {
    },
    historyCardBody: {
        marginTop: 2,
    },
    historyLabel: {
        fontSize: 13,
        marginTop: 6,
    },
    historyValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    historyEmpty: {
        textAlign: 'center',
        marginTop: 16,
    },
    rentButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    rentButtonText: {
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
        marginHorizontal: 4,
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
        borderRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rentalHistoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    rentalHistoryItem: {
        marginBottom: 15,
        padding: 12,
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
        flex: 1,
    },
    rentalHistoryValue: {
        fontSize: 14,
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    infoCard: {
        borderRadius: 18,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginBottom: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    infoRowModern: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        justifyContent: 'space-between',
    },
    infoLabelModern: {
        flex: 1,
        fontSize: 15,
        marginLeft: 2,
    },
    infoValueModern: {
        fontWeight: 'bold',
        fontSize: 16,
        minWidth: 80,
        textAlign: 'right',
    },
    modelLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    modelLoadingText: {
        fontSize: 16,
        marginLeft: 8,
    },
    modelSelector: {
        marginBottom: 16,
    },
    modelSelectorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    modelThumbnailList: {
        flex: 1,
    },
    modelThumbnailItem: {
        width: 80,
        height: 80,
        borderWidth: 2,
        borderColor: 'transparent',
        borderRadius: 8,
        marginRight: 12,
        overflow: 'hidden',
    },
    modelThumbnailSmall: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    modelThumbnailScore: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    modelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    modelThumbnail: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    modelInfo: {
        flex: 1,
    },
    modelTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    modelAuthor: {
        fontSize: 14,
        color: '#666',
    },
    modelStats: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 8,
    },
    view3DButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    view3DButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    noModelContainer: {
        flex: 1,
        padding: 20,
    },
    noModelContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noModelIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    noModelTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    noModelSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    vehicleInfoGrid: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vehicleInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    vehicleInfoLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    vehicleInfoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    searchStatsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchStatsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    searchStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    strategyList: {
        marginTop: 15,
    },
    strategyListTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    strategyItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    strategyQuery: {
        fontSize: 14,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    strategyMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    strategyStatus: {
        fontSize: 12,
        fontWeight: '500',
    },
    strategySuccess: {
        color: '#28a745',
    },
    strategyError: {
        color: '#dc3545',
    },
    strategyScore: {
        fontSize: 12,
        color: '#666',
    },
    noModelActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    searchSummary: {
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    searchSummaryText: {
        fontSize: 14,
        color: '#1976d2',
        textAlign: 'center',
    },
    modelCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modelCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 12,
    },
    modelTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    modelThumbnail: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    modelDetails: {
        padding: 16,
    },
    modelMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modelDownloads: {
        fontSize: 14,
        color: '#666',
    },
    modelViews: {
        fontSize: 14,
        color: '#666',
    },
    modelStrategy: {
        marginBottom: 12,
    },
    strategyLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    strategyText: {
        fontSize: 14,
        color: '#333',
        fontStyle: 'italic',
    },
    modelActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        paddingTop: 0,
    },
    viewModelButton: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    viewModelButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    downloadButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
    },
    downloadButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default VehicleDetailsScreen;
