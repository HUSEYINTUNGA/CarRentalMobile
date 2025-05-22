import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
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
    const dailyPriceRef = useRef(null);
    const scrollViewRef = useRef(null);
    const isAvailableRef = useRef(null);

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
        if (isUnavailableMode && scrollViewRef.current && isAvailableRef.current) {
            setTimeout(() => {
                isAvailableRef.current.measureLayout(
                    scrollViewRef.current.getInnerViewNode(),
                    (x, y) => {
                        scrollViewRef.current.scrollTo({ y: y - 16, animated: true });
                    }
                );
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
            Alert.alert('Hata', 'Araç bilgileri yüklenirken bir hata oluştu.');
            navigation.goBack();
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
            Alert.alert('Bilgi', 'Değişiklik yapılmadı.');
            return;
        }
        if (!validateForm()) {
            Alert.alert('Hata', 'Lütfen formu doğru doldurun.');
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
                Alert.alert('Başarılı', 'Araç başarıyla eklendi.');
                navigation.goBack();
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
                if (selectedPhotos.length > 0) {
                    for (const photo of selectedPhotos) {
                        await addVehiclePhoto(vehicleId, photo.base64);
                    }
                    setSelectedPhotos([]);
                    await loadVehicleData();
                }
                Alert.alert('Başarılı', 'Araç bilgileri güncellendi.');
                navigation.goBack();
            }
        } catch (err) {
            Alert.alert('Hata', isAddMode ? 'Araç eklenemedi.' : 'Güncelleme sırasında bir hata oluştu.');
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
            Alert.alert('Hata', 'Fotoğraf silinemedi.');
        }
    };

    const handleAddPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Galeri izni gerekli!');
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
                const refProp = (field === 'IsAvailable' && isUnavailableMode) ? { ref: isAvailableRef } : {};
                return (
                    <View style={styles.fieldContainer} {...refProp}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color="#2196F3" style={{ marginRight: 8 }} />
                            )}
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <View style={styles.switchContainer}>
                            <Switch
                                value={value}
                                onValueChange={editable ? (newValue) => {
                                    setFormData(prev => ({ ...prev, [field]: newValue }));
                                    setHasChanges(true);
                                } : undefined}
                                trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                                thumbColor={value ? '#fff' : '#f4f3f4'}
                                disabled={!editable}
                            />
                            <Text style={[styles.switchLabel, { color: value ? '#4CAF50' : '#9e9e9e' }]}>
                                {value ? 'Aktif' : 'Pasif'}
                            </Text>
                        </View>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );
            case 'enum':
                const options = field === 'FuelType' ? FuelTypeOptions : TransmissionTypeOptions;
                return (
                    <View style={styles.fieldContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color="#2196F3" style={{ marginRight: 8 }} />
                            )}
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={value}
                                onValueChange={editable ? (value) => handleInputChange(field, value) : undefined}
                                style={styles.picker}
                                enabled={editable}
                            >
                                <Picker.Item label={`Seçiniz`} value={''} />
                                {options.map(option => (
                                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                                ))}
                            </Picker>
                        </View>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );
            case 'year':
                return (
                    <View style={styles.fieldContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color="#2196F3" style={{ marginRight: 8 }} />
                            )}
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            value={value?.toString()}
                            onChangeText={editable ? (text) => handleInputChange(field, text.replace(/[^0-9]/g, '')) : undefined}
                            keyboardType="numeric"
                            placeholder={`${label} giriniz`}
                            maxLength={4}
                            editable={editable}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );
            case 'plate':
                return (
                    <View style={styles.fieldContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color="#2196F3" style={{ marginRight: 8 }} />
                            )}
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            value={value}
                            onChangeText={editable ? (text) => {
                                if (/^[0-9]{0,2}[A-Z]{0,3}[0-9]{0,4}$/.test(text.toUpperCase())) {
                                    handleInputChange(field, text.toUpperCase());
                                }
                            } : undefined}
                            placeholder="34ABC123"
                            autoCapitalize="characters"
                            editable={editable}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );
            case 'number':
                return (
                    <View style={styles.fieldContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color="#2196F3" style={{ marginRight: 8 }} />
                            )}
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            value={value !== undefined && value !== null ? value.toString() : ''}
                            onChangeText={editable ? (text) => handleInputChange(field, text.replace(/[^0-9.]/g, '')) : undefined}
                            keyboardType="numeric"
                            placeholder={`${label} giriniz`}
                            editable={editable}
                            {...inputProps}
                            ref={field === 'DailyPrice' && isPriceMode ? dailyPriceRef : undefined}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );
            default:
                return (
                    <View style={styles.fieldContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            {iconName && (
                                <MaterialCommunityIcons name={iconName} size={22} color="#2196F3" style={{ marginRight: 8 }} />
                            )}
                            <Text style={styles.label}>{label}</Text>
                        </View>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            value={value}
                            onChangeText={editable ? (text) => {
                                setFormData(prev => ({ ...prev, [field]: text }));
                                setHasChanges(true);
                            } : undefined}
                            placeholder={`${label} giriniz`}
                            placeholderTextColor="#999"
                            editable={editable}
                        />
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </View>
                );
        }
    };

    if (loading || (!isAddMode && !vehicle)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} ref={scrollViewRef}>
                {(isAddMode || isEditMode) && (
                    <View style={styles.photoContainer}>
                        {formData.VehiclePhotos?.map((photo) => (
                            <View key={photo.PhotoId} style={styles.photoItem}>
                                <Image source={{ uri: `data:image/jpeg;base64,${photo.Photo}` }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.deletePhotoButton}
                                    onPress={() => handleDeletePhoto(photo.PhotoId)}
                                >
                                    <Icon name="close-circle" size={24} color="#F44336" />
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
                                    <Icon name="close-circle" size={24} color="#F44336" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                            <MaterialCommunityIcons name="camera-plus" size={32} color="#2196F3" />
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
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.saveButton, (!hasChanges || isSubmitting) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={!hasChanges || isSubmitting}
                >
                    <Text style={styles.buttonText}>Kaydet</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 8,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    disabledText: {
        fontSize: 16,
        color: '#999',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f44336',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
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
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
    inputError: {
        borderColor: 'red',
    },
});

export default ManageVehiclesScreen; 