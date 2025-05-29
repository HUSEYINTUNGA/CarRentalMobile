import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import { Picker } from '@react-native-picker/picker';
import { FuelTypeOptions, TransmissionTypeOptions } from '../enums/enum';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';

const sortOptions = [
    { label: 'Model Yılı (Artan)', value: 'modelYearAsc' },
    { label: 'Model Yılı (Azalan)', value: 'modelYearDesc' },
    { label: 'Fiyat (Artan)', value: 'priceAsc' },
    { label: 'Fiyat (Azalan)', value: 'priceDesc' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

const VehicleListScreen = () => {
    const navigation = useNavigation();
    const {
        vehicles,
        fetchVehicles,
        fetchAllVehicles,
        loading,
        error,
        removeVehicle,
        restoreVehicle
    } = useVehicles();

    const [filters, setFilters] = useState({
        fuelType: null,
        transmissionType: null,
        search: '',
        sort: null,
        isAvailable: null,
        isRented: null,
        isDeleted: null
    });
    const [role, setRole] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerType, setDrawerType] = useState('filter');
    const [tempFilters, setTempFilters] = useState(filters);
    const drawerAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

    useEffect(() => {
        const getRole = async () => {
            const userRole = await AsyncStorage.getItem('userRole');
            setRole(userRole);
        };
        getRole();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (role === 'Admin') {
                fetchAllVehicles();
            } else if (role === 'Customer') {
                fetchVehicles({});
            }
        }, [role])
    );

    useEffect(() => {
        if (role === 'Admin') {
            const params = {};
            if (filters.fuelType !== null) params.FuelType = filters.fuelType;
            if (filters.transmissionType !== null) params.TransmissionType = filters.transmissionType;
            if (filters.search) params.Search = filters.search;
            if (filters.sort) params.Sort = filters.sort;
            if (filters.isAvailable !== null) params.IsAvailable = filters.isAvailable;
            if (filters.isRented !== null) params.IsRented = filters.isRented;
            if (filters.isDeleted !== null) params.IsDeleted = filters.isDeleted;
            fetchAllVehicles(params);
        } else if (role === 'Customer') {
            const params = {};
            if (filters.fuelType !== null) params.FuelType = filters.fuelType;
            if (filters.transmissionType !== null) params.TransmissionType = filters.transmissionType;
            if (filters.search) params.Search = filters.search;
            if (filters.sort) params.Sort = filters.sort;
            fetchVehicles(params);
        }
    }, [filters, role]);

    const openDrawer = (type) => {
        setDrawerType(type);
        setTempFilters(filters);
        setDrawerVisible(true);
        Animated.timing(drawerAnim, {
            toValue: SCREEN_WIDTH - DRAWER_WIDTH,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const closeDrawer = () => {
        Animated.timing(drawerAnim, {
            toValue: SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: false,
        }).start(() => setDrawerVisible(false));
    };

    const handleDrawerApply = () => {
        setFilters(tempFilters);
        closeDrawer();
    };

    const handleDelete = (vehicleId) => {
        Alert.alert(
            'Aracı Sil',
            'Bu aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil', style: 'destructive', onPress: async () => {
                        try {
                            await removeVehicle(vehicleId);
                        } catch (err) {}
                    }
                }
            ]
        );
    };

    const handleRestore = (vehicleId) => {
        Alert.alert(
            'Aracı Geri Yükle',
            'Bu aracı geri yüklemek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Geri Yükle',
                    onPress: async () => {
                        try {
                            await restoreVehicle(vehicleId);
                        } catch (err) {}
                    }
                }
            ]
        );
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
                        source={{ uri: item.Photo }}
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
                        <Text style={styles.infoTextModernGridFixed}>{getFuelTypeLabel(item.FuelType)}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="cogs" size={18} color="#1976d2" style={styles.infoIconModern} />
                        <Text style={styles.infoTextModernGridFixed}>{getTransmissionTypeLabel(item.TransmissionType)}</Text>
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

    const getTransmissionTypeLabel = (value) => {
        const intValue = typeof value === 'string' ? parseInt(value, 10) : value;
        return TransmissionTypeOptions.find(opt => opt.value === intValue)?.label || '-';
    };
    const getFuelTypeLabel = (value) => {
        const intValue = typeof value === 'string' ? parseInt(value, 10) : value;
        return FuelTypeOptions.find(opt => opt.value === intValue)?.label || '-';
    };

    const renderAdminVehicleItem = ({ item }) => {
        const isExpanded = expandedCardId === item.Id;
        
        // Define action icons based on whether the vehicle is deleted
        const actionIcons = item.IsDeleted ? [
            { name: 'restore', color: '#9C27B0', bg: 'rgba(156,39,176,0.15)', mode: 'restore' }
        ] : [
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
                            source={{ uri:item.Photo }}
                            style={styles.cardPhotoRoundedFixed}
                        />
                        {item.IsDeleted && (
                            <View style={styles.deletedBadgeTopRight}>
                                <Text style={styles.deletedBadgeText}>Silinmiş</Text>
                            </View>
                        )}
                        <View style={styles.badgeColumnBigCenteredFixed}>
                            {!item.IsDeleted && (
                                <>
                                    <View style={[styles.statusBadgeBig, item.IsAvailable ? styles.availableBadge : styles.passiveBadge]}>
                                        <Text style={styles.statusBadgeTextBig}>{item.IsAvailable ? 'Aktif' : 'Pasif'}</Text>
                                    </View>
                                    {item.IsRented && (
                                        <View style={[styles.statusBadgeBig, styles.rentedBadgeModern]}>
                                            <Text style={styles.statusBadgeTextBig}>Kirada</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                    <View style={styles.cardRightColFixed}>
                        <View style={styles.infoRowModernGridFixed}>
                            <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#222', marginBottom: 2 }}>{item.Brand} {item.Model}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="gas-pump" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={styles.infoTextModernGridFixed}>{getFuelTypeLabel(item.FuelType)}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="cogs" size={18} color="#1976d2" style={styles.infoIconModern} />
                            <Text style={styles.infoTextModernGridFixed}>{getTransmissionTypeLabel(item.TransmissionType)}</Text>
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
                        <Text style={styles.fullWidthActionBtnTextGridFixed}>
                            {item.IsDeleted ? 'Geri Yükle' : 'İşlemler'}
                        </Text>
                        <Icon
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#000000"
                            fontWeight='bold'
                            style={{ marginLeft: 6 }}
                        />
                    </TouchableOpacity>
                    {isExpanded && (
                        <View style={styles.actionIconsRowFixed}>
                            {actionIcons.map((icon, idx) => (
                                <TouchableOpacity
                                    key={icon.name}
                                    style={[styles.actionIconEllipseFixed, { backgroundColor: icon.bg }]}
                                    onPress={() => {
                                        if (icon.mode === 'view') {
                                            navigation.navigate('VehicleDetails', { vehicleId: item.Id });
                                        } else if (icon.mode === 'delete') {
                                            handleDelete(item.Id);
                                        } else if (icon.mode === 'restore') {
                                            handleRestore(item.Id);
                                        } else {
                                            let navMode = icon.mode;
                                            if (icon.mode === 'edit') navMode = 'Edit';
                                            navigation.navigate('ManageVehicles', { mode: navMode, vehicleId: item.Id });
                                        }
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

    const renderFilterDrawer = () => (
        <Modal
            visible={drawerVisible}
            animationType="slide"
            transparent
            onRequestClose={closeDrawer}
        >
            <TouchableOpacity style={styles.drawerOverlay} onPress={closeDrawer} activeOpacity={1}>
                <Animated.View style={styles.drawerContainer}>
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>{drawerType === 'filter' ? 'Filtrele' : 'Sırala'}</Text>
                        <TouchableOpacity onPress={closeDrawer} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                            <Icon name="close" size={26} color="#1976d2" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.drawerContent}>
                        {drawerType === 'filter' ? (
                            <>
                                <Text style={styles.drawerLabel}>Yakıt Tipi</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={tempFilters.fuelType}
                                        onValueChange={value => setTempFilters(f => ({ ...f, fuelType: value }))}
                                        style={styles.picker}
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="Tümü" value={null} />
                                        {FuelTypeOptions.map((type, i) => (
                                            <Picker.Item key={i} label={type.label} value={type.value} />
                                        ))}
                                    </Picker>
                                </View>
                                <Text style={styles.drawerLabel}>Vites Tipi</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={tempFilters.transmissionType}
                                        onValueChange={value => setTempFilters(f => ({ ...f, transmissionType: value }))}
                                        style={styles.picker}
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="Tümü" value={null} />
                                        {TransmissionTypeOptions.map((type, i) => (
                                            <Picker.Item key={i} label={type.label} value={type.value} />
                                        ))}
                                    </Picker>
                                </View>
                                {role === 'Admin' && (
                                    <>
                                        <Text style={styles.drawerLabel}>Müsaitlik Durumu</Text>
                                        <View style={styles.pickerBox}>
                                            <Picker
                                                selectedValue={tempFilters.isAvailable}
                                                onValueChange={value => setTempFilters(f => ({ ...f, isAvailable: value }))}
                                                style={styles.picker}
                                                mode="dropdown"
                                            >
                                                <Picker.Item label="Tümü" value={null} />
                                                <Picker.Item label="Aktif" value={true} />
                                                <Picker.Item label="Pasif" value={false} />
                                            </Picker>
                                        </View>
                                        <Text style={styles.drawerLabel}>Kiralama Durumu</Text>
                                        <View style={styles.pickerBox}>
                                            <Picker
                                                selectedValue={tempFilters.isRented}
                                                onValueChange={value => setTempFilters(f => ({ ...f, isRented: value }))}
                                                style={styles.picker}
                                                mode="dropdown"
                                            >
                                                <Picker.Item label="Tümü" value={null} />
                                                <Picker.Item label="Kirada" value={true} />
                                                <Picker.Item label="Kirada Değil" value={false} />
                                            </Picker>
                                        </View>
                                        <Text style={styles.drawerLabel}>Silinme Durumu</Text>
                                        <View style={styles.pickerBox}>
                                            <Picker
                                                selectedValue={tempFilters.isDeleted}
                                                onValueChange={value => setTempFilters(f => ({ ...f, isDeleted: value }))}
                                                style={styles.picker}
                                                mode="dropdown"
                                            >
                                                <Picker.Item label="Tümü" value={null} />
                                                <Picker.Item label="Silinmiş" value={true} />
                                                <Picker.Item label="Silinmemiş" value={false} />
                                            </Picker>
                                        </View>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Text style={styles.drawerLabel}>Sıralama</Text>
                                <View style={styles.pickerBox}>
                                    <Picker
                                        selectedValue={tempFilters.sort}
                                        onValueChange={value => setTempFilters(f => ({ ...f, sort: value }))}
                                        style={styles.picker}
                                        mode="dropdown"
                                    >
                                        <Picker.Item label="Sıralama Yok" value={null} />
                                        {sortOptions.map((opt, i) => (
                                            <Picker.Item key={i} label={opt.label} value={opt.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </>
                        )}
                    </View>
                    <TouchableOpacity style={styles.applyBtn} onPress={handleDrawerApply}>
                        <Text style={styles.applyBtnText}>Uygula</Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={[
            styles.container,
            role === 'Admin' && { paddingTop: 0}
        ]}>
            {role === 'Admin' && (
                <>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('ManageVehicles', { mode: 'Add' })}
                        activeOpacity={0.85}
                    >
                        <Icon name="plus" size={32} color="#fff" />
                    </TouchableOpacity>
                </>
            )}
            
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={24} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Araç ara..."
                    value={filters.search}
                    onChangeText={(text) => setFilters(f => ({ ...f, search: text }))}
                />
            </View>

            <View style={styles.filterButtonsContainer}>
                <TouchableOpacity style={styles.drawerBtn} onPress={() => openDrawer('filter')}>
                    <Text style={styles.drawerBtnText}>Filtrele</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerBtn} onPress={() => openDrawer('sort')}>
                    <Text style={styles.drawerBtnText}>Sırala</Text>
                </TouchableOpacity>
            </View>

            {renderFilterDrawer()}

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
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 12,
        marginBottom: 12,
        height: 50,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#222',
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
        backgroundColor: 'rgba(77, 208, 225, 0.1)',
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
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    drawerOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        flexDirection: 'row', 
        justifyContent: 'flex-end' 
    },
    drawerContainer: {
        width: DRAWER_WIDTH,
        backgroundColor: '#fafbfc',
        height: '100%',
        paddingTop: 0,
        paddingHorizontal: 20,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 10,
    },
    drawerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    drawerContent: {
        flex: 1,
    },
    drawerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginTop: 18,
        marginBottom: 4,
    },
    pickerBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 1,
        height: 48,
        justifyContent: 'center',
    },
    applyBtn: {
        backgroundColor: '#1976d2',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 18,
        width: '100%',
        alignSelf: 'center',
    },
    applyBtnText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 15 
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    drawerBtn: {
        flex: 1,
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    drawerBtnText: {
        color: '#1976d2',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deletedBadge: {
        backgroundColor: '#9C27B0',
        borderRadius: 20,
    },
    deletedBadgeTopRight: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#9C27B0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 2,
    },
    deletedBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default VehicleListScreen;
