import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal, FlatList, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useRentalHistories } from '../hooks/useRentalHistories';
import { useVehicles } from '../hooks/useVehicles';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { TransmissionTypeOptions, FuelTypeOptions } from '../enums/enum';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

function formatPlate(plate) {
    if (!plate) return '-';
    const match = plate.match(/^([0-9]{2})([A-ZÇĞİÖŞÜ]{1,3})([0-9]{2,4})$/i);
    if (match) {
        return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
    }
    return plate.toUpperCase();
}

const RentedScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { vehicleId } = route.params || {};
    const { createRental, loading } = useRentalHistories();
    const { fetchVehicleBasicById } = useVehicles();
    const { paymentMethods, fetchPaymentMethods, loading: paymentLoading } = usePaymentMethods();
    const [vehicle, setVehicle] = useState(null);
    const [vehicleLoading, setVehicleLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [customApiError, setCustomApiError] = useState(null);
    const [conflictData, setConflictData] = useState(null);

    useEffect(() => {
        if (vehicleId) {
            setVehicleLoading(true);
            fetchVehicleBasicById(vehicleId)
                .then(data => setVehicle(data))
                .catch(() => setVehicle(null))
                .finally(() => setVehicleLoading(false));
        }
    }, [vehicleId]);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (vehicleId) {
                setVehicleLoading(true);
                fetchVehicleBasicById(vehicleId)
                    .then(data => setVehicle(data))
                    .catch(() => setVehicle(null))
                    .finally(() => setVehicleLoading(false));
            }
        }, [vehicleId])
    );

    const handleRent = async () => {
        if (!vehicleId || !selectedPaymentMethod || endDate <= startDate) {
            setCustomApiError("Lütfen tüm bilgileri eksiksiz doldurun.");
            setConflictData(null);
            setShowErrorModal(true);
            return;
        }

        try {
            await createRental({
                VehicleId: vehicleId,
                StartDate: startDate.toISOString(),
                EndDate: endDate.toISOString()
            });
            navigation.goBack();
        } catch (err) {
            
            if (err?.message && err?.data) {
                setCustomApiError(err.message);
                setConflictData(err.data);
            } else {
                setCustomApiError('Bilinmeyen hata oluştu.');
                setConflictData(null);
            }
            setShowErrorModal(true);
        }
    };

    const transmissionTypeLabel = vehicle ? (TransmissionTypeOptions.find(opt => opt.value === vehicle.TransmissionType)?.label || '-') : '-';
    const fuelTypeLabel = vehicle ? (FuelTypeOptions.find(opt => opt.value === vehicle.FuelType)?.label || '-') : '-';
    const mainPhoto = vehicle?.Photos?.find(p => p.IsMain) || vehicle?.Photos?.[0];
    const photoUri = mainPhoto?.Photo ? mainPhoto.Photo : null;

    const isConflictDataValid = conflictData &&
        typeof conflictData.suggestedStartDate === 'string' &&
        typeof conflictData.maxAvailableEndDate === 'string';

    const showAlternativeVehicle = Boolean(conflictData?.alternativeVehicle?.id);

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafd' }}>
            <LinearGradient
                colors={["#0066cc", "#2196F3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={styles.gradientHeaderTitle}>Araç Kirala</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 100 }}>
                <View style={styles.container}>
                    {vehicleLoading ? (
                        <ActivityIndicator size="large" color="#2196F3" style={{ marginBottom: 32 }} />
                    ) : vehicle ? (
                        <View style={styles.vehicleCard}>
                            <View style={styles.imageWrapper}>
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
                            </View>
                            <Text style={styles.vehicleTitle}>{vehicle.Brand || '-'} {vehicle.Model || '-'}</Text>
                            <Text style={styles.vehicleSub}>{vehicle.ModelYear || '-'}</Text>
                            <Text style={styles.vehiclePrice}>
                                <Text style={{color:'#2196F3', fontWeight:'bold'}}>{vehicle.DailyPrice != null ? vehicle.DailyPrice + ' TL' : '-'}</Text>
                                <Text style={{color:'#888', fontWeight:'normal'}}> / Günlük</Text>
                            </Text>
                            <View style={styles.vehicleDetailsRow}>
                                <View style={styles.chip}><Icon name="car-cog" size={16} color="#2196F3" /><Text style={styles.chipText}>{transmissionTypeLabel}</Text></View>
                                <View style={styles.chip}><Icon name="fuel" size={16} color="#2196F3" /><Text style={styles.chipText}>{fuelTypeLabel}</Text></View>
                                <View style={styles.chip}><Icon name="car-key" size={16} color="#2196F3" /><Text style={styles.chipText}>{formatPlate(vehicle.NumberPlate)}</Text></View>
                            </View>
                        </View>
                    ) : null}
                    <Text style={styles.title}>Kiralama Tarihleri</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity onPress={() => setShowStart(true)} style={styles.dateInput}>
                            <Text style={styles.dateInputLabel}>Başlangıç:</Text>
                            <Text style={styles.dateInputValue}>{startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowEnd(true)} style={styles.dateInput}>
                            <Text style={styles.dateInputLabel}>Bitiş:</Text>
                            <Text style={styles.dateInputValue}>{endDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                    {showStart && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                setShowStart(false);
                                if (date) setStartDate(date);
                            }}
                        />
                    )}
                    {showEnd && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                setShowEnd(false);
                                if (date) setEndDate(date);
                            }}
                        />
                    )}
                    <TouchableOpacity style={styles.paymentButton} onPress={() => setShowPaymentModal(true)}>
                        <Text style={styles.paymentButtonText}>{selectedPaymentMethod ? 'Ödeme Yöntemini Değiştir' : 'Ödeme Yöntemi Seç'}</Text>
                    </TouchableOpacity>
                    {selectedPaymentMethod && (
                        <View style={styles.cardView}>
                            <Text style={styles.cardNumber}>•••• •••• •••• {selectedPaymentMethod.Last4Digits}</Text>
                            <Text style={styles.cardName}>{selectedPaymentMethod.CardHolderName}</Text>
                            <Text style={styles.cardInfo}>{selectedPaymentMethod.ExpirationMonth}/{selectedPaymentMethod.ExpirationYear}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.rentButton} onPress={handleRent} disabled={loading}>
                        <Text style={styles.rentButtonText}>{loading ? 'Gönderiliyor...' : 'Kirala'}</Text>
                    </TouchableOpacity>
                    <Modal visible={showPaymentModal} transparent animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Ödeme Yöntemi Seç</Text>
                                {paymentLoading ? (
                                    <ActivityIndicator size="large" color="#2196F3" />
                                ) : (
                                    <FlatList
                                        data={paymentMethods}
                                        keyExtractor={item => item.Id}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.paymentItem}
                                                onPress={() => {
                                                    setSelectedPaymentMethod(item);
                                                    setShowPaymentModal(false);
                                                }}
                                            >
                                                <Text style={styles.paymentItemText}>{item.MethodName} •••• {item.Last4Digits}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                )}
                                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                    <Text style={styles.modalClose}>Kapat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Özel Hata Modalı */}
                <Modal
                    visible={showErrorModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowErrorModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.errorModalContent}>
                            <Icon name="alert-circle" size={40} color="#FF6B6B" style={styles.errorIcon} />
                            <Text style={styles.errorTitle}>
                                {showAlternativeVehicle ? 'Tarih Çakışması' : 'Kiralama Hatası'}
                            </Text>
                            <Text style={styles.errorMessage}>
                                {customApiError}
                            </Text>
                            {showAlternativeVehicle && (
                                <>
                                    <Text style={{ fontWeight: 'bold', marginTop: 12 }}>
                                        Müsait Tarih Aralığı: {conflictData.suggestedStartDate} - {conflictData.maxAvailableEndDate}
                                    </Text>
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 16 }}>
                                        <TouchableOpacity
                                            style={[styles.useDatesButton, { flex: 1, marginRight: 8 }]}
                                            onPress={() => {
                                                setStartDate(new Date(conflictData.suggestedStartDate));
                                                setEndDate(new Date(conflictData.maxAvailableEndDate));
                                                setShowErrorModal(false);
                                            }}
                                        >
                                            <Icon name="calendar-check" size={20} color="#fff" style={styles.buttonIcon} />
                                            <Text style={styles.buttonText}>Bu Tarihleri Kullan</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.viewVehicleButton, { flex: 1, marginLeft: 8 }]}
                                            onPress={() => {
                                                navigation.navigate('VehicleDetails', { vehicleId: conflictData.alternativeVehicle.id });
                                                setShowErrorModal(false);
                                            }}
                                        >
                                            <Icon name="car" size={20} color="#fff" style={styles.buttonIcon} />
                                            <Text style={styles.buttonText}>Aracı Gör</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ marginTop: 16, width: '100%' }}>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Alternatif Araç:</Text>
                                        <View style={styles.alternativeVehicleCard}>
                                            <Text style={styles.alternativeVehicleTitle}>
                                                {conflictData.alternativeVehicle.brand} {conflictData.alternativeVehicle.model}
                                            </Text>
                                            <Text style={styles.alternativeVehiclePrice}>
                                                {conflictData.alternativeVehicle.dailyPrice} TL/gün
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowErrorModal(false)}
                            >
                                <Text style={styles.closeButtonText}>Kapat</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafd',
        alignItems: 'center',
        padding: 16,
    },
    vehicleCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 28,
        alignItems: 'center',
        width: 340,
        elevation: 8,
        shadowColor: '#2196F3',
        shadowOpacity: 0.10,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
    },
    imageWrapper: {
        width: 280,
        height: 140,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#eaeaea',
        resizeMode: 'contain',
    },
    vehicleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    vehicleTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
    },
    vehicleSub: {
        fontSize: 16,
        color: '#888',
        marginBottom: 6,
    },
    vehiclePrice: {
        fontSize: 22,
        marginBottom: 12,
    },
    vehicleDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
        marginBottom: 4,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eaf2ff',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        marginVertical: 4,
    },
    chipText: {
        fontSize: 15,
        color: '#2196F3',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 32,
        color: '#222',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    dateInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        minWidth: 120,
        marginHorizontal: 2,
    },
    dateInputLabel: {
        color: '#888',
        fontSize: 13,
        marginBottom: 2,
    },
    dateInputValue: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentButton: {
        backgroundColor: '#fff',
        borderColor: '#2196F3',
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    paymentButtonText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardView: {
        backgroundColor: '#232946',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        marginBottom: 8,
        width: 300,
        alignSelf: 'center',
        shadowColor: '#232946',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    cardNumber: {
        color: '#fff',
        fontSize: 20,
        letterSpacing: 2,
        marginBottom: 8,
    },
    cardName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardInfo: {
        color: '#fff',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 24,
        width: 320,
        maxHeight: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 18,
    },
    paymentItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        width: 260,
        alignItems: 'center',
    },
    paymentItemText: {
        fontSize: 16,
        color: '#222',
    },
    modalClose: {
        color: '#2196F3',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
    },
    rentButton: {
        backgroundColor: '#2196F3',
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
        width: 320,
        elevation: 4,
        shadowColor: '#2196F3',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    rentButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    errorIcon: {
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    alternativeVehicleCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    alternativeVehicleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    alternativeVehiclePrice: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: 'bold',
    },
    useDatesButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: 8,
    },
    closeButton: {
        marginTop: 8,
        padding: 8,
    },
    closeButtonText: {
        color: '#666',
        fontSize: 16,
    },
    viewVehicleButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        marginTop: 12,
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
});

export default RentedScreen; 