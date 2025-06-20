import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, Animated, Dimensions} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import { Picker } from '@react-native-picker/picker';
import { FuelTypeOptions, TransmissionTypeOptions } from '../enums/enum';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import CustomDropdown from '../components/CustomDropdown';
import MessageModal from '../components/MessageModal';

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
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [messageTitle, setMessageTitle] = useState('');
    const [messageText, setMessageText] = useState('');
    const [messageIcon, setMessageIcon] = useState('info');
    const drawerAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const { colors, isDark } = useTheme();

    // Silme modalı için state
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

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
        setPendingDeleteId(vehicleId);
        setMessageTitle('Aracı Sil');
        setMessageText('Bu aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.\n\nNot: Bu aracı istediğin zaman geri yükleyebilirsin.');
        setMessageIcon('warning');
        setMessageModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (pendingDeleteId) {
            try {
                await removeVehicle(pendingDeleteId);
                setPendingDeleteId(null);
                setMessageTitle('Başarılı');
                setMessageText('Araç başarıyla silindi.');
                setMessageIcon('check-circle');
                setMessageModalVisible(true);
            } catch (err) {
                const errorMessage = err.response?.data?.Message || err.response?.data?.message || err.message || 'Araç silinirken bir hata oluştu.';
                setPendingDeleteId(null);
                setMessageTitle('Hata');
                setMessageText(errorMessage);
                setMessageIcon('error');
                setMessageModalVisible(true);
            }
        }
    };

    const handleCancelDelete = () => {
        setPendingDeleteId(null);
        setMessageModalVisible(false);
    };

    const handleRestore = (vehicleId) => {
        showMessage(
            'Aracı Geri Yükle',
            'Bu aracı geri yüklemek istediğinizden emin misiniz?',
            'info'
        );
        // TODO: Geri yükleme işlemi için onay butonu eklenebilir
    };

    const renderVehicleItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.cardGridContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
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
                        <Text style={[styles.vehicleBrandModelText, { color: colors.primary }]}>{item.Brand} {item.Model}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="check-circle" size={18} color={colors.success} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>Ücretsiz İptal</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="gas-pump" size={18} color={colors.primary} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>{getFuelTypeLabel(item.FuelType)}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="cogs" size={18} color={colors.primary} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>{getTransmissionTypeLabel(item.TransmissionType)}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="handshake" size={18} color={colors.primary} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>Karşılama</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="id-card" size={18} color={colors.primary} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.primary }]}>{formatPlate(item.NumberPlate)}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="car-side" size={18} color={colors.primary} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>{item.Category}</Text>
                    </View>
                    <View style={styles.infoRowModernGridFixed}>
                        <IconFA name="money-bill-wave" size={18} color={colors.success} style={styles.infoIconModern} />
                        <Text style={[styles.infoTextModernGridFixed, { color: colors.success, fontWeight: 'bold' }]}>{item.DailyPrice} TL / Gün</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const formatPlate = (plate) => {
        if (!plate) return '';
        const match = plate.match(/^([0-9]{2})([A-ZÇĞİÖŞÜ]{1,3})([0-9]{2,4})$/i);
        if (match) {
            return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
        }
        return plate.toUpperCase();
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
        
        const actionIcons = item.IsDeleted ? [
            { name: 'restore', color: colors.purple, bg: colors.purpleBg, mode: 'restore' }
        ] : [
            { name: 'eye', color: colors.primary, bg: colors.primaryBg, mode: 'view' },
            { name: 'pencil', color: colors.warning, bg: colors.warningBg, mode: 'edit' },
            { name: 'currency-try', color: colors.success, bg: colors.successBg, mode: 'price' },
            { name: 'wrench', color: colors.info, bg: colors.infoBg, mode: 'unavailable' },
            { name: 'delete', color: colors.error, bg: colors.errorBg, mode: 'delete' },
        ];

        return (
            <View style={[styles.cardGridContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                <View style={styles.cardGridRowFixed}>
                    <View style={styles.cardLeftColFixed}>
                        <Image
                            source={{ uri:item.Photo }}
                            style={styles.cardPhotoRoundedFixed}
                        />
                        {item.IsDeleted && (
                            <View style={[styles.deletedBadgeTopRight, { backgroundColor: colors.purple }] }>
                                <Text style={[styles.deletedBadgeText, { color: colors.white }]}>Silinmiş</Text>
                            </View>
                        )}
                        <View style={styles.badgeColumnBigCenteredFixed}>
                            {!item.IsDeleted && (
                                <>
                                    <View style={[styles.statusBadgeBig, item.IsAvailable ? { backgroundColor: colors.success } : { backgroundColor: colors.passive }] }>
                                        <Text style={styles.statusBadgeTextBig}>{item.IsAvailable ? 'Aktif' : 'Pasif'}</Text>
                                    </View>
                                    {item.IsRented && (
                                        <View style={[styles.statusBadgeBig, { backgroundColor: colors.error }] }>
                                            <Text style={styles.statusBadgeTextBig}>Kirada</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                    <View style={styles.cardRightColFixed}>
                        <View style={styles.infoRowModernGridFixed}>
                            <Text style={{ fontWeight: 'bold', fontSize: 17, color: colors.primary, marginBottom: 2 }}>
                                {item.Brand} {item.Model} <Text style={{ color: colors.textSecondary, fontWeight: 'normal' }}>({item.ModelYear})</Text>
                            </Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="gas-pump" size={18} color={colors.primary} style={styles.infoIconModern} />
                            <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>{getFuelTypeLabel(item.FuelType)}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="cogs" size={18} color={colors.primary} style={styles.infoIconModern} />
                            <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>{getTransmissionTypeLabel(item.TransmissionType)}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="id-card" size={18} color={colors.primary} style={styles.infoIconModern} />
                            <Text style={[styles.infoTextModernGridFixed, { color: colors.primary }]}>{formatPlate(item.NumberPlate)}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="car-side" size={18} color={colors.primary} style={styles.infoIconModern} />
                            <Text style={[styles.infoTextModernGridFixed, { color: colors.textSecondary }]}>{item.Category}</Text>
                        </View>
                        <View style={styles.infoRowModernGridFixed}>
                            <IconFA name="money-bill-wave" size={18} color={colors.success} style={styles.infoIconModern} />
                            <Text style={[styles.infoTextModernGridFixed, { color: colors.success, fontWeight: 'bold' }]}>{item.DailyPrice} TL / Gün</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardActionsAreaFixed}>
                    <TouchableOpacity
                        style={{
                            width: '96%',
                            alignSelf: 'center',
                            height: 42,
                            borderRadius: 24,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 2,
                            marginBottom: 2,
                            backgroundColor: 'rgba(33,150,243,0.1)',
                        }}
                        onPress={() => setExpandedCardId(isExpanded ? null : item.Id)}
                        activeOpacity={0.7}
                    >
                        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 17 }}>
                            {item.IsDeleted ? 'Geri Yükle' : 'İşlemler'}
                        </Text>
                        <Icon
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={colors.primary}
                            style={{ marginLeft: 6 }}
                        />
                    </TouchableOpacity>
                    {isExpanded && (
                        <View style={styles.actionIconsRowFixed}>
                            {actionIcons.map((icon, idx) => (
                                <TouchableOpacity
                                    key={icon.name}
                                    style={{
                                        width: 54,
                                        height: 54,
                                        borderRadius: 27,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor:
                                            icon.color === colors.primary ? 'rgba(33,150,243,0.1)'
                                            : icon.color === colors.warning ? 'rgba(255,193,7,0.1)'
                                            : icon.color === colors.success ? 'rgba(67,160,71,0.1)'
                                            : icon.color === colors.info ? 'rgba(3,169,244,0.1)'
                                            : icon.color === colors.error ? 'rgba(244,67,54,0.1)'
                                            : icon.color === colors.purple ? 'rgba(156,39,176,0.1)'
                                            : 'rgba(33,150,243,0.1)',
                                    }}
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
                <Animated.View style={[
                    styles.drawerContainer,
                    {
                        backgroundColor: colors.card,
                        shadowColor: colors.shadow,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderTopLeftRadius: 18,
                        borderBottomLeftRadius: 18,
                        elevation: 8,
                    }
                ]}>
                    <View style={styles.drawerHeader}>
                        <Text style={{
                            fontSize: 22,
                            fontWeight: 'bold',
                            color: colors.primary,
                            letterSpacing: 0.5,
                        }}>{drawerType === 'filter' ? 'Filtrele' : 'Sırala'}</Text>
                        <TouchableOpacity onPress={closeDrawer} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                            <Icon name="close" size={26} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.drawerContent}>
                        {drawerType === 'filter' ? (
                            <>
                                <CustomDropdown
                                    label="Yakıt Tipi"
                                    value={tempFilters.fuelType}
                                    options={[{ label: 'Tümü', value: null }, ...FuelTypeOptions]}
                                    onValueChange={value => setTempFilters(f => ({ ...f, fuelType: value }))}
                                    placeholder="Tümü"
                                />
                                <CustomDropdown
                                    label="Vites Tipi"
                                    value={tempFilters.transmissionType}
                                    options={[{ label: 'Tümü', value: null }, ...TransmissionTypeOptions]}
                                    onValueChange={value => setTempFilters(f => ({ ...f, transmissionType: value }))}
                                    placeholder="Tümü"
                                />
                                {role === 'Admin' && (
                                    <>
                                        <CustomDropdown
                                            label="Müsaitlik Durumu"
                                            value={tempFilters.isAvailable}
                                            options={[
                                                { label: 'Tümü', value: null },
                                                { label: 'Aktif', value: true },
                                                { label: 'Pasif', value: false },
                                            ]}
                                            onValueChange={value => setTempFilters(f => ({ ...f, isAvailable: value }))}
                                            placeholder="Tümü"
                                        />
                                        <CustomDropdown
                                            label="Kiralama Durumu"
                                            value={tempFilters.isRented}
                                            options={[
                                                { label: 'Tümü', value: null },
                                                { label: 'Kirada', value: true },
                                                { label: 'Kirada Değil', value: false },
                                            ]}
                                            onValueChange={value => setTempFilters(f => ({ ...f, isRented: value }))}
                                            placeholder="Tümü"
                                        />
                                        <CustomDropdown
                                            label="Silinme Durumu"
                                            value={tempFilters.isDeleted}
                                            options={[
                                                { label: 'Tümü', value: null },
                                                { label: 'Silinmiş', value: true },
                                                { label: 'Silinmemiş', value: false },
                                            ]}
                                            onValueChange={value => setTempFilters(f => ({ ...f, isDeleted: value }))}
                                            placeholder="Tümü"
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <CustomDropdown
                                label="Sıralama"
                                value={tempFilters.sort}
                                options={[
                                    { label: 'Sıralama Yok', value: null },
                                    ...sortOptions,
                                ]}
                                onValueChange={value => setTempFilters(f => ({ ...f, sort: value }))}
                                placeholder="Sıralama Yok"
                            />
                        )}
                    </View>
                    <TouchableOpacity style={{
                        borderRadius: 8,
                        paddingVertical: 14,
                        alignItems: 'center',
                        marginTop: 18,
                        width: '100%',
                        alignSelf: 'center',
                        backgroundColor: colors.primary,
                        shadowColor: colors.shadow,
                        shadowOpacity: 0.12,
                        shadowRadius: 4,
                        elevation: 2,
                    }} onPress={handleDrawerApply}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.white }}>Uygula</Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );

    const showMessage = (title, text, icon = 'info') => {
        setMessageTitle(title);
        setMessageText(text);
        setMessageIcon(icon);
        setMessageModalVisible(true);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Gradient Header */}
            <LinearGradient
                colors={[colors.headerGradientStart, colors.headerGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientHeader}
            >
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="car" size={28} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={[styles.gradientHeaderTitle, { textAlign: 'center' }]}>Araçlar</Text>
                </View>
            </LinearGradient>
            {role === 'Admin' && (
                <>
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('ManageVehicles', { mode: 'Add' })}
                        activeOpacity={0.85}
                    >
                        <Icon name="plus" size={28} color="#fff" />
                    </TouchableOpacity>
                </>
            )}
            {/* Add top padding to content to avoid overlap with header */}
            <View style={{ height: 100 }} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 10,
                borderWidth: 1,
                paddingHorizontal: 12,
                marginBottom: 12,
                marginTop: 18,
                alignSelf: 'center',
                width: '92%',
                height: 44,
                backgroundColor: colors.card,
                borderColor: colors.border,
            }}>
                <Icon name="magnify" size={24} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={{ flex: 1, height: '100%', fontSize: 16, color: colors.text }}
                    placeholder="Araç ara..."
                    placeholderTextColor={colors.textSecondary}
                    value={filters.search}
                    onChangeText={(text) => setFilters(f => ({ ...f, search: text }))}
                />
            </View>

            <View style={styles.filterButtonsContainer}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        marginHorizontal: 4,
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        shadowColor: colors.shadow,
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                    onPress={() => openDrawer('filter')}
                >
                    <Text style={{ color: isDark ? '#111' : '#fff', fontWeight: 'bold', fontSize: 16 }}>Filtrele</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        marginHorizontal: 4,
                        alignItems: 'center',
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        shadowColor: colors.shadow,
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                    onPress={() => openDrawer('sort')}
                >
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Sırala</Text>
                </TouchableOpacity>
            </View>

            {renderFilterDrawer()}

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
            ) : vehicles.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Kriterlere uygun araç bulunamadı.</Text>
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
            <MessageModal
                visible={messageModalVisible}
                title={messageTitle}
                message={messageText}
                icon={messageIcon}
                showCancel={!!pendingDeleteId}
                cancelText="İptal"
                onCancel={handleCancelDelete}
                showConfirm={!!pendingDeleteId}
                confirmText="Sil"
                onConfirm={handleConfirmDelete}
                reverseButtons={!!pendingDeleteId}
                onClose={handleCancelDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 18,
        paddingHorizontal: 20,
        zIndex: 10,
        elevation: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    gradientHeaderTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    filterContainer: {
        borderRadius: 16,
        margin: 16,
        padding: 16,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
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
    },
    pickerWrapper: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    listContainer: {
        padding: 16,
    },
    vehicleCard: {
        borderRadius: 16,
        marginBottom: 18,
        overflow: 'hidden',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    vehicleImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    vehicleInfo: {
        padding: 16,
    },
    vehicleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehiclePrice: {
        fontSize: 16,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 16,
    },
    emptyText: {
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
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    addButtonText: {
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
    },
    rentedBadge: {
    },
    passiveBadge: {
    },
    vehicleCardHorizontal: {
        flexDirection: 'row',
        borderRadius: 16,
        marginBottom: 18,
        overflow: 'hidden',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    vehicleImageWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 2,
    },
    vehiclePriceHorizontal: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 6,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 6,
    },
    expandButtonText: {
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
    },
    passiveText: {
    },
    rentedText: {
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
        fontWeight: 'bold',
        fontSize: 12,
    },
    availableBadge: {
        borderRadius: 20,
    },
    passiveBadge: {
        borderRadius: 20,
    },
    rentedBadgeModern: {
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
    },
    vehiclePriceModern: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    expandButtonModern: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8,
    },
    expandButtonTextModern: {
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
        fontWeight: 'bold',
        fontSize: 15,
    },
    vehicleTitleBig: {
        fontSize: 19,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoTextModernBig: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehiclePriceModernBig: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    plateText: {
        fontSize: 16,
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
        fontWeight: 'bold',
        fontSize: 13,
    },
    fullWidthActionBtn: {
        width: '100%',
        height: 30,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    fullWidthActionBtnText: {
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
        borderRadius: 18,
        marginBottom: 10,
        marginHorizontal: 8,
        padding: 0,
        elevation: 3,
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
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginBottom: 2,
    },
    fullWidthActionBtnTextGridFixed: {
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
        height: '100%',
        paddingTop: 0,
        paddingHorizontal: 20,
        paddingBottom: 20,
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
        marginBottom: 10,
    },
    drawerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    drawerContent: {
        flex: 1,
    },
    drawerLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 18,
        marginBottom: 4,
    },
    pickerBox: {
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 1,
        height: 48,
        justifyContent: 'center',
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
});

export default VehicleListScreen;
