import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal, FlatList, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useRentalHistories } from '../hooks/useRentalHistories';
import { useVehicles } from '../hooks/useVehicles';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { TransmissionTypeOptions, FuelTypeOptions } from '../enums/enum';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

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
    const { colors, isDark } = useTheme();

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
                <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>Araç Kirala</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 100 }}>
                <View style={[styles.container, { backgroundColor: colors.background }] }>
                    {vehicleLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 32 }} />
                    ) : vehicle ? (
                        <View style={[styles.vehicleCard, { backgroundColor: colors.card, shadowColor: colors.primary }] }>
                            <View style={[styles.imageWrapper, { backgroundColor: colors.imageBg }] }>
                                {photoUri ? (
                                    <Image 
                                        source={{ uri: photoUri }} 
                                        style={styles.vehicleImage}
                                    />
                                ) : (
                                    <View style={[styles.vehicleImage, { backgroundColor: colors.imageBg, justifyContent: 'center', alignItems: 'center' }] }>
                                        <Icon name="car" size={40} color={colors.textSecondary} />
                                    </View>
                                )}
                            </View>
                            <View style={[{ width: '100%', marginTop: 8, marginBottom: 8 }] }>
                                <View style={{ borderRadius: 14, backgroundColor: colors.altCard, overflow: 'hidden' }}>
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
                                        ];
                                        return infoData.map((item, idx) => (
                                            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: idx !== infoData.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                                                {item.icon === 'id-card-fa' ? (
                                                    <IconFA name="id-card" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                                                ) : (
                                                    <Icon name={item.icon} size={20} color={colors.primary} style={{ marginRight: 10 }} />
                                                )}
                                                <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 14 }}>{item.label}</Text>
                                                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15 }}>{item.value}</Text>
                                            </View>
                                        ));
                                    })()}
                                </View>
                            </View>
                            <View style={{
                                width: '100%',
                                alignItems: 'center',
                                marginTop: 8,
                                marginBottom: 8,
                            }}>
                                <View style={{
                                    backgroundColor: 'rgba(67, 160, 71, 0.1)',
                                    borderRadius: 22,
                                    paddingHorizontal: 28,
                                    paddingVertical: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 120,
                                }}>
                                    <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
                                        {vehicle.DailyPrice != null ? vehicle.DailyPrice + ' TL' : '-'}
                                    </Text>
                                    <Text style={{ color: colors.textSecondary, fontWeight: 'normal', fontSize: 15 }}>/ Günlük</Text>
                                </View>
                            </View>
                        </View>
                        
                    ) : null}
                    <Text style={[styles.title, { color: colors.text }]}>Kiralama Tarihleri</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity onPress={() => setShowStart(true)} style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.primary }] }>
                            <Text style={[styles.dateInputLabel, { color: colors.textSecondary }]}>Başlangıç:</Text>
                            <Text style={[styles.dateInputValue, { color: colors.primary }]}>{startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowEnd(true)} style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.primary }] }>
                            <Text style={[styles.dateInputLabel, { color: colors.textSecondary }]}>Bitiş:</Text>
                            <Text style={[styles.dateInputValue, { color: colors.primary }]}>{endDate.toLocaleDateString()}</Text>
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
                    <TouchableOpacity style={[styles.paymentButton, { backgroundColor: colors.card, borderColor: colors.primary }]} onPress={() => setShowPaymentModal(true)}>
                        <Text style={[styles.paymentButtonText, { color: colors.primary }]}>{selectedPaymentMethod ? 'Ödeme Yöntemini Değiştir' : 'Ödeme Yöntemi Seç'}</Text>
                    </TouchableOpacity>
                    {selectedPaymentMethod && (
                        <View style={[
                            styles.cardView,
                            isDark
                                ? { backgroundColor: '#23272F', borderWidth: 1, borderColor: colors.border, shadowColor: colors.primary }
                                : { backgroundColor: colors.paymentCard, shadowColor: colors.paymentCardShadow }
                        ]}>
                            <Text style={[styles.cardNumber, { color: '#fff' }]}>•••• •••• •••• {selectedPaymentMethod.Last4Digits}</Text>
                            <Text style={[styles.cardName, { color: '#fff' }]}>{selectedPaymentMethod.CardHolderName}</Text>
                            <Text style={[styles.cardInfo, { color: '#fff' }]}>{selectedPaymentMethod.ExpirationMonth.toString().padStart(2, '0')}/{selectedPaymentMethod.ExpirationYear.toString().slice(-2)}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleRent} disabled={loading}>
                        <Text style={[styles.rentButtonText, { color: colors.white }]}>{loading ? 'Gönderiliyor...' : 'Kirala'}</Text>
                    </TouchableOpacity>
                    <Modal visible={showPaymentModal} transparent animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { backgroundColor: colors.card }] }>
                                <Text style={[styles.modalTitle, { color: colors.primary }]}>Ödeme Yöntemi Seç</Text>
                                {paymentLoading ? (
                                    <ActivityIndicator size="large" color={colors.primary} />
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
                                                <Text style={[styles.paymentItemText, { color: colors.text }]}>{item.MethodName} •••• {item.Last4Digits}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                )}
                                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                    <Text style={[styles.modalClose, { color: colors.primary }]}>Kapat</Text>
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
                        <View style={[styles.errorModalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                            <Icon name="alert-circle" size={40} color={colors.error} style={styles.errorIcon} />
                            <Text style={[styles.errorTitle, { color: colors.error }] }>
                                {showAlternativeVehicle ? 'Tarih Çakışması' : 'Kiralama Hatası'}
                            </Text>
                            <Text style={[styles.errorMessage, { color: colors.textSecondary }] }>
                                {customApiError}
                            </Text>
                            {showAlternativeVehicle && (
                                <>
                                    <Text style={{ fontWeight: 'bold', marginTop: 12, color: colors.text }}>
                                        Müsait Tarih Aralığı: {conflictData.suggestedStartDate} - {conflictData.maxAvailableEndDate}
                                    </Text>
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 16 }}>
                                        <TouchableOpacity
                                            style={[styles.useDatesButton, { backgroundColor: colors.success, flex: 1, marginRight: 8 }]}
                                            onPress={() => {
                                                setStartDate(new Date(conflictData.suggestedStartDate));
                                                setEndDate(new Date(conflictData.maxAvailableEndDate));
                                                setShowErrorModal(false);
                                            }}
                                        >
                                            <Icon name="calendar-check" size={20} color={colors.white} style={styles.buttonIcon} />
                                            <Text style={[styles.buttonText, { color: colors.white }]}>Bu Tarihleri Kullan</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.viewVehicleButton, { backgroundColor: colors.primary, flex: 1, marginLeft: 8 }]}
                                            onPress={() => {
                                                navigation.navigate('VehicleDetails', { vehicleId: conflictData.alternativeVehicle.id });
                                                setShowErrorModal(false);
                                            }}
                                        >
                                            <Icon name="car" size={20} color={colors.white} style={styles.buttonIcon} />
                                            <Text style={[styles.buttonText, { color: colors.white }]}>Aracı Gör</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ marginTop: 16, width: '100%' }}>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 8, color: colors.text }}>Alternatif Araç:</Text>
                                        <View style={[styles.alternativeVehicleCard, { backgroundColor: colors.altCard, borderColor: colors.border }] }>
                                            <Text style={[styles.alternativeVehicleTitle, { color: colors.text }]}>
                                                {conflictData.alternativeVehicle.brand} {conflictData.alternativeVehicle.model}
                                            </Text>
                                            <Text style={[styles.alternativeVehiclePrice, { color: colors.primary }]}>
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
                                <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>Kapat</Text>
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
        alignItems: 'center',
        padding: 16,
    },
    vehicleCard: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 28,
        alignItems: 'center',
        width: 340,
        elevation: 8,
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
        marginBottom: 2,
    },
    vehicleSub: {
        fontSize: 16,
        marginBottom: 6,
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
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        marginVertical: 4,
    },
    chipText: {
        fontSize: 15,
        marginLeft: 5,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    dateInput: {
        borderRadius: 12,
        borderWidth: 2,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        minWidth: 120,
        marginHorizontal: 2,
    },
    dateInputLabel: {
        fontSize: 13,
        marginBottom: 2,
    },
    dateInputValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentButton: {
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    paymentButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardView: {
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        marginBottom: 8,
        width: 300,
        alignSelf: 'center',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    cardNumber: {
        fontSize: 20,
        letterSpacing: 2,
        marginBottom: 8,
    },
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardInfo: {
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 18,
        padding: 24,
        width: 320,
        maxHeight: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 18,
    },
    paymentItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        width: 260,
        alignItems: 'center',
    },
    paymentItemText: {
        fontSize: 16,
    },
    modalClose: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
    },
    rentButton: {
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
        width: 320,
        elevation: 4,
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    rentButtonText: {
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
        borderRadius: 20,
        padding: 24,
        width: '85%',
        alignItems: 'center',
        elevation: 5,
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
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    alternativeVehicleCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    alternativeVehicleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    alternativeVehiclePrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    useDatesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        marginTop: 12,
    },
    buttonText: {
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
        fontSize: 16,
    },
    viewVehicleButton: {
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
});

export default RentedScreen; 