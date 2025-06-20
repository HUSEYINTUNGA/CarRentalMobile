import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    TextInput,
    Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useVehicles } from '../hooks/useVehicles';
import { Picker } from '@react-native-picker/picker';
import { FuelTypeOptions, TransmissionTypeOptions } from '../enums/enum';
import * as ImagePicker from 'expo-image-picker';
import { deleteVehiclePhoto, addVehiclePhoto } from '../api/vehiclePhotosApi';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import MessageModal from '../components/MessageModal';

const fieldIcons = {
    Brand: 'car',
    Model: 'car-info',
    ModelYear: 'calendar',
    Category: 'tag',
    Color: 'palette',
    DailyPrice: 'currency-try',
    TransmissionType: 'car-cog',
    FuelType: 'fuel',
    NumberPlate: 'car-key',
    IsAvailable: 'check-circle',
    IsRented: 'car-side',
};

const ManageVehiclesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { mode, vehicleId } = route.params || {};
    const { fetchVehicleById, editVehicle, addVehicle, loading } = useVehicles();
    const { colors } = useTheme();

    const showMessage = (title, text, icon = 'info', onButtonPress = null) => {
        setMessageTitle(title);
        setMessageText(text);
        setMessageIcon(icon);
        setMessageModalVisible(true);
    };

    const isAddMode = mode === 'Add';
    const isEditMode = mode === 'Edit';
    const isPriceMode = mode === 'price';
    const isUnavailableMode = mode === 'unavailable';

    const initialFormData = {
        Brand: '',
        Model: '',
        ModelYear: '',
        Category: '',
        Color: '',
        DailyPrice: '',
        TransmissionType: '',
        FuelType: '',
        NumberPlate: '',
        IsAvailable: true,
        IsRented: false,
        VehiclePhotos: [],
    };

    const [vehicle, setVehicle] = useState(null);
    const [formData, setFormData] = useState(isAddMode ? initialFormData : {});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [messageTitle, setMessageTitle] = useState('');
    const [messageText, setMessageText] = useState('');
    const [messageIcon, setMessageIcon] = useState('info');
    const dailyPriceRef = useRef(null);
    const scrollViewRef = useRef(null);
    const isAvailableRef = useRef(null);
    const isRentedRef = useRef(null);

    useEffect(() => {
        if (!isAddMode && vehicleId) {
            loadVehicleData();
        }
    }, [vehicleId, isAddMode]);

    useLayoutEffect(() => {
        if (isPriceMode && dailyPriceRef.current) {
            setTimeout(() => {
                dailyPriceRef.current.focus();
            }, 350);
        }
        if (isUnavailableMode && scrollViewRef.current) {
            setTimeout(() => {
                if (isAvailableRef.current) {
                    isAvailableRef.current.measureLayout(
                        scrollViewRef.current.getInnerViewNode(),
                        (x, y) => {
                            scrollViewRef.current.scrollTo({ y: y - 16, animated: true });
                        }
                    );
                } else if (isRentedRef.current) {
                    isRentedRef.current.measureLayout(
                        scrollViewRef.current.getInnerViewNode(),
                        (x, y) => {
                            scrollViewRef.current.scrollTo({ y: y - 16, animated: true });
                        }
                    );
                }
            }, 350);
        }
    }, [isPriceMode, isUnavailableMode, formData]);

    const loadVehicleData = async () => {
        try {
            const data = await fetchVehicleById(vehicleId);
            const vehicleData = {
                Id: data.Id,
                Brand: data.Brand,
                Model: data.Model,
                ModelYear: data.ModelYear,
                Category: data.Category,
                Color: data.Color,
                DailyPrice: data.DailyPrice,
                TransmissionType: data.TransmissionType,
                FuelType: data.FuelType,
                NumberPlate: data.NumberPlate,
                IsAvailable: data.IsAvailable,
                IsRented: data.IsRented,
                VehiclePhotos: data.VehiclePhotos
            };
            setVehicle(vehicleData);
            setFormData(vehicleData);
        } catch (err) {
            const errorMessage = err.response?.data?.Message || err.response?.data?.message || err.message || 'Araç bilgileri yüklenirken bir hata oluştu.';
            showMessage('Hata', errorMessage, 'error', () => navigation.goBack());
        }
    };

    const validateForm = () => {
        const newErrors = {};
        // Brand
        if (!formData.Brand || formData.Brand.length > 50 || !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/.test(formData.Brand)) {
            newErrors.Brand = 'Marka zorunlu ve sadece harf olmalı (max 50 karakter)';
        }
        // Model
        if (!formData.Model || formData.Model.length > 50) {
            newErrors.Model = 'Model zorunlu (max 50 karakter)';
        }
        // ModelYear
        if (!formData.ModelYear || !/^[0-9]{4}$/.test(formData.ModelYear) || parseInt(formData.ModelYear) < 1900 || parseInt(formData.ModelYear) > new Date().getFullYear()) {
            newErrors.ModelYear = `Geçerli bir model yılı giriniz (1900-${new Date().getFullYear()})`;
        }
        // Category
        if (!formData.Category) {
            newErrors.Category = 'Kategori zorunlu';
        }
        // Color
        if (!formData.Color || formData.Color.length > 50 || !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/.test(formData.Color)) {
            newErrors.Color = 'Renk zorunlu ve sadece harf olmalı (max 50 karakter)';
        }
        // DailyPrice
        if (!formData.DailyPrice || isNaN(formData.DailyPrice) || Number(formData.DailyPrice) <= 0 || Number(formData.DailyPrice) >= 1000000) {
            newErrors.DailyPrice = 'Günlük fiyat zorunlu, 0-1000000 arası olmalı';
        }
        // TransmissionType
        if (formData.TransmissionType === '' || formData.TransmissionType === undefined || formData.TransmissionType === null) {
            newErrors.TransmissionType = 'Vites tipi zorunlu';
        }
        // FuelType
        if (formData.FuelType === '' || formData.FuelType === undefined || formData.FuelType === null) {
            newErrors.FuelType = 'Yakıt tipi zorunlu';
        }
        // NumberPlate
        if (!formData.NumberPlate || formData.NumberPlate.length > 10 || !/^[0-9]{2}[A-Z]{1,3}[0-9]{2,4}$/.test(formData.NumberPlate)) {
            newErrors.NumberPlate = 'Geçersiz plaka formatı. Örnek: 34ABC123';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleSubmit = async () => {
        if (!hasChanges && !isAddMode) {
            showMessage('Bilgi', 'Değişiklik yapılmadı.', 'info');
            return;
        }
        if (!isUnavailableMode && !validateForm()) {
            showMessage('Hata', 'Lütfen formu doğru doldurun.', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            if (isAddMode) {
                const newVehicle = await addVehicle({
                    Brand: formData.Brand,
                    Model: formData.Model,
                    ModelYear: formData.ModelYear,
                    Category: formData.Category,
                    Color: formData.Color,
                    DailyPrice: Number(formData.DailyPrice),
                    TransmissionType: formData.TransmissionType,
                    FuelType: formData.FuelType,
                    NumberPlate: formData.NumberPlate
                });
                if (selectedPhotos.length > 0 && newVehicle && newVehicle.Id) {
                    for (const photo of selectedPhotos) {
                        await addVehiclePhoto(newVehicle.Id, photo.base64);
                    }
                }
                showMessage('Başarılı', 'Araç başarıyla eklendi.', 'check-circle', () => navigation.goBack());
            } else {
                if (isUnavailableMode) {
                    const updateData = {
                        Id: vehicleId,
                        Brand: vehicle.Brand,
                        Model: vehicle.Model,
                        ModelYear: vehicle.ModelYear,
                        Category: vehicle.Category,
                        Color: vehicle.Color,
                        DailyPrice: vehicle.DailyPrice,
                        TransmissionType: vehicle.TransmissionType,
                        FuelType: vehicle.FuelType,
                        NumberPlate: vehicle.NumberPlate,
                        IsAvailable: formData.IsAvailable,
                        IsRented: vehicle.IsRented
                    };
                    await editVehicle(vehicleId, updateData);
                } else {
                    await editVehicle(vehicleId, {
                        Id: vehicleId,
                        Brand: formData.Brand,
                        Model: formData.Model,
                        ModelYear: formData.ModelYear,
                        Category: formData.Category,
                        Color: formData.Color,
                        DailyPrice: Number(formData.DailyPrice),
                        TransmissionType: formData.TransmissionType,
                        FuelType: formData.FuelType,
                        NumberPlate: formData.NumberPlate,
                        IsAvailable: formData.IsAvailable,
                        IsRented: formData.IsRented
                    });
                }
                if (selectedPhotos.length > 0) {
                    for (const photo of selectedPhotos) {
                        await addVehiclePhoto(vehicleId, photo.base64);
                    }
                    setSelectedPhotos([]);
                    await loadVehicleData();
                }
                showMessage('Başarılı', 'Araç bilgileri güncellendi.', 'check-circle', () => navigation.goBack());
            }
        } catch (err) {
            const errorMessage = err.response?.data?.Message || err.response?.data?.message || err.message || (isAddMode ? 'Araç eklenemedi.' : 'Güncelleme sırasında bir hata oluştu.');
            showMessage('Hata', errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        try {
            await deleteVehiclePhoto(photoId);
            setVehicle(prev => ({
                ...prev,
                VehiclePhotos: prev.VehiclePhotos.filter(p => p.PhotoId !== photoId)
            }));
            setFormData(prev => ({
                ...prev,
                VehiclePhotos: prev.VehiclePhotos.filter(p => p.PhotoId !== photoId)
            }));
        } catch (err) {
            showMessage('Hata', 'Fotoğraf silinemedi.', 'error');
        }
    };

    const handleAddPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showMessage('Galeri İzni Gerekli', 'Galeri izni verilmedi. Ayarlardan izin verebilirsiniz.', 'warning');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
            base64: true,
        });
        if (!result.canceled && result.assets) {
            const newPhotos = result.assets.map(asset => ({
                base64: asset.base64,
                uri: asset.uri
            }));
            setSelectedPhotos(prev => [...prev, ...newPhotos]);
        }
    };

    const handleRemoveSelectedPhoto = (idx) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== idx));
    };

    const isFieldEditable = (field) => {
        if (isAddMode) return true;
        if (isEditMode) return true;
        if (isPriceMode) return field === 'DailyPrice';
        if (isUnavailableMode) return field === 'IsAvailable';
        return false;
    };

    const renderField = (field, label, type = 'text') => {
        const value = formData[field];
        const error = errors[field];
        const iconName = fieldIcons[field];
        const editable = isFieldEditable(field);

        const inputProps = {};
        if (field === 'DailyPrice' && isPriceMode) {
            inputProps.ref = dailyPriceRef;
        }

        switch (type) {
            case 'boolean':
                const refProp = (field === 'IsAvailable' && isUnavailableMode) ? { ref: isAvailableRef } : 
                               (field === 'IsRented' && isUnavailableMode) ? { ref: isRentedRef } : {};
                return (
                    <View style={[styles.fieldContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] } {...refProp}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color={colors.primary} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                        </View>
                        <View style={styles.switchContainer}>
                            <Switch
                                value={value}
                                onValueChange={editable ? (newValue) => {
                                    setFormData(prev => ({ ...prev, [field]: newValue }));
                                    setHasChanges(true);
                                } : undefined}
                                trackColor={{ false: colors.border, true: colors.success }}
                                thumbColor={value ? colors.card : colors.backgroundCard}
                                disabled={!editable}
                            />
                            <Text style={[styles.switchLabel, { color: value ? colors.success : colors.textSecondary }]}>
                                {value ? 'Aktif' : 'Pasif'}
                            </Text>
                        </View>
                        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                    </View>
                );
            case 'enum':
                const options = field === 'FuelType' ? FuelTypeOptions : TransmissionTypeOptions;
                return (
                    <View style={[styles.fieldContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color={colors.primary} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                        </View>
                        <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.backgroundCard }] }>
                            <Picker
                                selectedValue={value}
                                onValueChange={editable ? (value) => handleInputChange(field, value) : undefined}
                                style={[styles.picker, { color: colors.text }]}
                                enabled={editable}
                            >
                                <Picker.Item label={`Seçiniz`} value={''} />
                                {options.map(option => (
                                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                                ))}
                            </Picker>
                        </View>
                        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                    </View>
                );
            case 'year':
                return (
                    <View style={[styles.fieldContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color={colors.primary} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: colors.border, backgroundColor: colors.backgroundCard, color: colors.text },
                                error && { borderColor: colors.error }
                            ]}
                            value={value?.toString()}
                            onChangeText={editable ? (text) => handleInputChange(field, text.replace(/[^0-9]/g, '')) : undefined}
                            keyboardType="numeric"
                            placeholder={`${label} giriniz`}
                            placeholderTextColor={colors.textSecondary}
                            maxLength={4}
                            editable={editable}
                        />
                        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                    </View>
                );
            case 'plate':
                return (
                    <View style={[styles.fieldContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color={colors.primary} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: colors.border, backgroundColor: colors.backgroundCard, color: colors.text },
                                error && { borderColor: colors.error }
                            ]}
                            value={value}
                            onChangeText={editable ? (text) => {
                                if (/^[0-9]{0,2}[A-Z]{0,3}[0-9]{0,4}$/.test(text.toUpperCase())) {
                                    handleInputChange(field, text.toUpperCase());
                                }
                            } : undefined}
                            placeholder="34ABC123"
                            autoCapitalize="characters"
                            placeholderTextColor={colors.textSecondary}
                            editable={editable}
                        />
                        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                    </View>
                );
            case 'number':
                return (
                    <View style={[styles.fieldContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color={colors.primary} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: colors.border, backgroundColor: colors.backgroundCard, color: colors.text },
                                error && { borderColor: colors.error }
                            ]}
                            value={value !== undefined && value !== null ? value.toString() : ''}
                            onChangeText={editable ? (text) => handleInputChange(field, text.replace(/[^0-9.]/g, '')) : undefined}
                            keyboardType="numeric"
                            placeholder={`${label} giriniz`}
                            placeholderTextColor={colors.textSecondary}
                            editable={editable}
                            {...inputProps}
                            ref={field === 'DailyPrice' && isPriceMode ? dailyPriceRef : undefined}
                        />
                        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                    </View>
                );
            default:
                return (
                    <View style={[styles.fieldContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color={colors.primary} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                { borderColor: colors.border, backgroundColor: colors.backgroundCard, color: colors.text },
                                error && { borderColor: colors.error }
                            ]}
                            value={value}
                            onChangeText={editable ? (text) => {
                                setFormData(prev => ({ ...prev, [field]: text }));
                                setHasChanges(true);
                            } : undefined}
                            placeholder={`${label} giriniz`}
                            placeholderTextColor={colors.textSecondary}
                            editable={editable}
                        />
                        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
                    </View>
                );
        }
    };

    if (loading || (!isAddMode && !vehicle)) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }] }>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Gradient Header */}
            <LinearGradient
                colors={[colors.headerGradientStart, colors.headerGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backIcon, { color: '#fff' }]}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={[styles.gradientHeaderTitle, { color: '#fff' }]}>Araç Yönetimi</Text>
            </LinearGradient>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 100 }}>
                {(isAddMode || isEditMode) && (
                    <View style={styles.photoContainer}>
                        {formData.VehiclePhotos?.map((photo) => (
                            <View key={photo.PhotoId} style={styles.photoItem}>
                                <Image source={{ uri: photo.Photo }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.deletePhotoButton}
                                    onPress={() => handleDeletePhoto(photo.PhotoId)}
                                >
                                    <Icon name="close-circle" size={24} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {selectedPhotos.map((photo, index) => (
                            <View key={index} style={styles.photoItem}>
                                <Image source={{ uri: photo.uri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.deletePhotoButton}
                                    onPress={() => handleRemoveSelectedPhoto(index)}
                                >
                                    <Icon name="close-circle" size={24} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: colors.infoBoxBg }]} onPress={handleAddPhoto}>
                            <MaterialCommunityIcons name="camera-plus" size={32} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                )}
                {renderField('Brand', 'Marka')}
                {renderField('Model', 'Model')}
                {renderField('ModelYear', 'Model Yılı', 'year')}
                {renderField('Category', 'Kategori')}
                {renderField('Color', 'Renk')}
                {renderField('DailyPrice', 'Günlük Ücret', 'number')}
                {renderField('FuelType', 'Yakıt Tipi', 'enum')}
                {renderField('TransmissionType', 'Vites Tipi', 'enum')}
                {renderField('NumberPlate', 'Plaka', 'plate')}
                {renderField('IsAvailable', 'Müsaitlik Durumu', 'boolean')}
                {isEditMode && renderField('IsRented', 'Kirada', 'boolean')}
            </ScrollView>
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }] }>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { backgroundColor: colors.error }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.buttonText, { color: colors.white }]}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }, (!hasChanges || isSubmitting) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!hasChanges || isSubmitting}
                >
                    <Text style={[styles.buttonText, { color: colors.white }]}>Kaydet</Text>
                </TouchableOpacity>
            </View>

            {/* Message Modal */}
            <MessageModal
                visible={messageModalVisible}
                title={messageTitle}
                message={messageText}
                icon={messageIcon}
                onClose={() => setMessageModalVisible(false)}
                onButtonPress={() => {
                    setMessageModalVisible(false);
                    if (messageIcon === 'check-circle') {
                        navigation.goBack();
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fieldContainer: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 4,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    disabledText: {
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    cancelButton: {},
    saveButton: {},
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    switchLabel: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    photoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    photoItem: {
        width: 100,
        height: 100,
        margin: 4,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    deletePhotoButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
    },
    addPhotoButton: {
        width: 100,
        height: 100,
        margin: 4,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    inputError: {},
});

export default ManageVehiclesScreen; 