import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import { Picker } from '@react-native-picker/picker';
import { FuelTypeOptions, TransmissionTypeOptions } from '../enums/enum';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';

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
    const [expandedCardId, setExpandedCardId] = useState(null);

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

    const handleDelete = (vehicleId) => {
        console.log('Silinecek araç ID:', vehicleId);
    };

    const renderVehicleItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardGridContainer}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.Id })}
        >
            <View style={styles.cardGridRowFixed}>
                <View style={styles.cardLeftColFixed}>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${item.Photo}` }}
                        style={styles.cardPhotoRoundedFixed}
                    />
                </View>
                <View style={styles.cardRightColFixed}>
                    <View style={styles.infoRowModernGridFixed}>
                        <Text style={styles.vehicleBrandModelText}>{item.Brand} {item.Model}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="check-circle" size={18} color="#43a047" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>Ücretsiz İptal</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="gas-pump" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>{item.FuelType}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="cogs" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>{item.TransmissionType}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="handshake" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>Karşılama</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="id-card" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>{formatPlate(item.NumberPlate)}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="car-side" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>{item.Category}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="money-bill-wave" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: '#1976d2', fontWeight: 'bold' }]}>{item.DailyPrice} TL / Gün</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const formatPlate = (plate) => {
        if (!plate) return '';
        const match = plate.match(/^(\d{2})([A-Z]+)(\d+)$/i);
        if (match) {
            return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
        }
        return plate;
    };

    const renderAdminVehicleItem = ({ item }) => {
        const isExpanded = expandedCardId === item.Id;
        const actionIcons = [
            { name: 'eye', color: '#2196F3', bg: 'rgba(33,150,243,0.15)', mode: 'view' },
            { name: 'pencil', color: '#FFC107', bg: 'rgba(255,193,7,0.15)', mode: 'edit' },
            { name: 'currency-try', color: '#4CAF50', bg: 'rgba(76,175,80,0.15)', mode: 'price' },
            { name: 'wrench', color: '#1976d2', bg: 'rgba(25,118,210,0.15)', mode: 'unavailable' },
            { name: 'delete', color: '#F44336', bg: 'rgba(244,67,54,0.15)', mode: 'delete' },
        ];
        return (
            <View style={styles.cardGridContainer}>
                <View style={styles.cardGridRowFixed}>
                    <View style={styles.cardLeftColFixed}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${item.Photo}` }}
                            style={styles.cardPhotoRoundedFixed}
                        />
                        <View style={styles.badgeColumnBigCenteredFixed}>
                            <View style={[styles.statusBadgeBig, item.IsAvailable ? styles.availableBadge : styles.passiveBadge]}>
                                <Text style={styles.statusBadgeTextBig}>{item.IsAvailable ? 'Aktif' : 'Pasif'}</Text>
                            </View>
                            {item.IsRented && (
                                <View style={[styles.statusBadgeBig, styles.rentedBadgeModern]}>
                                    <Text style={styles.statusBadgeTextBig}>Kirada</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.cardRightColFixed}>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="gas-pump" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={styles.infoTextModernGridFixed}>{item.FuelType}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="cogs" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={styles.infoTextModernGridFixed}>{item.TransmissionType}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="id-card" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={styles.infoTextModernGridFixed}>{formatPlate(item.NumberPlate)}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="car-side" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={styles.infoTextModernGridFixed}>{item.Category}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="money-bill-wave" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={[styles.infoTextModernGridFixed, { color: '#1976d2', fontWeight: 'bold' }]}>{item.DailyPrice} TL / Gün</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardActionsAreaFixed}>
                    <TouchableOpacity
                        style={styles.fullWidthActionBtnGridFixed}
                        onPress={() => setExpandedCardId(isExpanded ? null : item.Id)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.fullWidthActionBtnTextGridFixed}>İşlemler {'>'}</Text>
                    </TouchableOpacity>
                    {isExpanded && (
                        <View style={styles.actionIconsRowFixed}>
                            {actionIcons.map((icon, idx) => (
                                <TouchableOpacity
                                    key={icon.name}
                                    style={[styles.actionIconEllipseFixed, { backgroundColor: icon.bg }]}
                                    onPress={() => {
                                        if (icon.mode === 'delete') handleDelete(item.Id);
                                        else navigation.navigate('ManageVehiclesScreen', { mode: icon.mode, vehicleId: item.Id });
                                    }}
                                >
                                    <Icon name={icon.name} size={28} color={icon.color} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

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
        <View style={[
            styles.container,
            role === 'Admin' && { paddingTop: 0 }
        ]}>
            {role === 'Admin' && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('ManageVehiclesScreen', { mode: 'add' })}
                    activeOpacity={0.85}
                >
                    <Icon name="plus" size={32} color="#fff" />
                </TouchableOpacity>
            )}
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
                    contentContainerStyle={[
                        styles.listContainer,
                        role === 'Admin' && { paddingTop: 16, paddingBottom: 12 }
                    ]}
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
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#43a047',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    statusBadge: {
        position: 'absolute',
        left: 16,
        bottom: 16,
        zIndex: 2,
        paddingHorizontal: 18,
        paddingVertical: 5,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadgeText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
    },
    rentedBadge: {
        backgroundColor: '#F44336',
    },
    passiveBadge: {
        backgroundColor: '#9E9E9E',
    },
    vehicleCardHorizontal: {
        flexDirection: 'row',
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
    vehicleImageWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eaeaea',
    },
    vehicleImageHorizontal: {
        width: 110,
        height: 110,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    vehicleInfoHorizontal: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    vehicleDetailHorizontal: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    vehiclePriceHorizontal: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: 'bold',
        marginVertical: 6,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 6,
    },
    expandButtonText: {
        color: '#1976d2',
        fontWeight: 'bold',
        fontSize: 15,
        marginRight: 4,
    },
    adminActionsHorizontal: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    statusText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    availableText: {
        color: '#43a047',
    },
    passiveText: {
        color: '#9E9E9E',
    },
    rentedText: {
        color: '#F44336',
        fontWeight: 'bold',
        fontSize: 13,
        marginLeft: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    statusBadgeModern: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginHorizontal: 2,
    },
    statusBadgeTextModern: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    availableBadge: {
        backgroundColor: '#43a047',
        borderRadius: 20,
    },
    passiveBadge: {
        backgroundColor: '#9E9E9E',
        borderRadius: 20,
    },
    rentedBadgeModern: {
        backgroundColor: '#F44336',
        borderRadius: 20,
    },
    vehicleInfoModern: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    infoRowModern: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    infoIconModern: {
        marginRight: 8,
    },
    infoTextModern: {
        fontSize: 14,
        color: '#444',
    },
    vehiclePriceModern: {
        fontSize: 15,
        color: '#2196F3',
        fontWeight: 'bold',
    },
    expandButtonModern: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8,
    },
    expandButtonTextModern: {
        color: '#1976d2',
        fontWeight: 'bold',
        fontSize: 15,
        marginRight: 4,
    },
    badgeColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    statusBadgeModernBig: {
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 7,
        marginVertical: 2,
    },
    statusBadgeTextModernBig: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    vehicleTitleBig: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
    },
    infoTextModernBig: {
        fontSize: 16,
        color: '#222',
        fontWeight: 'bold',
    },
    vehiclePriceModernBig: {
        fontSize: 17,
        color: '#1976d2',
        fontWeight: 'bold',
    },
    plateText: {
        fontSize: 16,
        color: '#1976d2',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#43a047',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 20,
    },
    badgeRowOptimized: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    statusBadgeSmall: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginHorizontal: 2,
        minWidth: 60,
        alignItems: 'center',
    },
    statusBadgeTextSmall: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    fullWidthActionBtn: {
        width: '100%',
        height: 30,
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    fullWidthActionBtnText: {
        color: '#1976d2',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    actionIconsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 12,
        marginBottom: 2,
        gap: 8,
    },
    actionIconEllipse: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeColumnFixed: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
        gap: 4,
    },
    actionIconsRowFixed: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 2,
        gap: 8,
    },
    actionIconEllipseFixed: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeRowCardBottom: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 0,
    },
    cardGridContainer: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 10,
        marginHorizontal: 8,
        padding: 0,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
    },
    cardGridRowFixed: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
    },
    cardLeftColFixed: {
        alignItems: 'center',
        marginRight: 12,
        width: 110,
    },
    cardPhotoRoundedFixed: {
        width: 120,
        height: 100,
        borderRadius: 16,
        resizeMode: 'cover',
    },
    badgeColumnBigCenteredFixed: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    cardRightColFixed: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 2,
    },
    infoRowModernGridFixed: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    infoTextModernGridFixed: {
        fontSize: 15,
        color: '#222',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    cardActionsAreaFixed: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 10,
        paddingTop: 2,
    },
    fullWidthActionBtnGridFixed: {
        width: '96%',
        alignSelf: 'center',
        height: 42,
        backgroundColor: '#4dd0e1',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginBottom: 2,
    },
    fullWidthActionBtnTextGridFixed: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 17,
        textAlign: 'center',
    },
    statusBadgeBig: {
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 5,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadgeTextBig: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
    },
    vehicleBrandModelText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1976d2',
        marginBottom: 2,
    },
});

export default VehicleListScreen;
