import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRentalHistories } from '../hooks/useRentalHistories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import MessageModal from '../components/MessageModal';

const RentalHistoriesScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const {
        rentalHistories,
        pendingRentalHistories,
        fetchRentalHistoriesByUserId,
        fetchPendingRentalHistories,
        loading,
        pendingLoading,
        removePendingRentalRequest
    } = useRentalHistories();
    const { type = 'history' } = route.params || {};
    const [userId, setUserId] = useState(null);
    const { colors } = useTheme();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelItem, setCancelItem] = useState(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerTransparent: true,
        });
    }, [navigation]);

    useEffect(() => {
        const loadUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
        };
        loadUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            loadRentalHistory();
        }
    }, [type, userId]);

    const loadRentalHistory = async () => {
        try {
            if (type === 'pending') {
                await fetchPendingRentalHistories();
            } else {
                if (userId) {
                    await fetchRentalHistoriesByUserId(userId);
                }
            }
        } catch (error) {
            console.error('Error loading rental history:', error);
        }
    };

    const formatPlate = (plate) => {
        if (!plate) return '';
        const match = plate.match(/^(\d{2})([a-zA-Z]+)(\d+)$/);
        if (match) {
            return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
        }
        return plate;
    };

    const handleCancel = (item) => {
        setCancelItem(item);
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        if (cancelItem) {
            removePendingRentalRequest(cancelItem.Id);
        }
        setShowCancelModal(false);
        setCancelItem(null);
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setCancelItem(null);
    };

    const renderRentalItem = ({ item }) => {
        return (
            <View style={[styles.rentalCard, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                {item.MainPhotoUrl ? (
                    <Image 
                        source={{ uri: item.MainPhotoUrl }} 
                        style={styles.rentalImage}
                    />
                ) : null}
                <View style={styles.rentalInfo}>
                    <Text style={[styles.rentalTitle, { color: colors.text }]}>{item.Brand} {item.Model}</Text>
                    <Text style={[styles.rentalDate, { color: colors.textSecondary }] }>
                        {new Date(item.StartDate).toLocaleDateString()} - {new Date(item.EndDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.infoRow}>
                        <View style={[styles.plateContainer, { backgroundColor: colors.infoBoxBg }] }>
                            <IconFA name="id-card" size={18} color={colors.primary} style={{ marginRight: 4 }} />
                            <Text style={[styles.plateText, { color: colors.primary }]}>{formatPlate(item.NumberPlate)}</Text>
                        </View>
                        <View style={[styles.priceBadge, type === 'pending' ? { backgroundColor: colors.success } : { backgroundColor: colors.error }] }>
                            <Text style={[styles.priceBadgeText, { color: colors.white }]}>{item.TotalPrice} TL</Text>
                        </View>
                    </View>
                    {type === 'pending' && (
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: colors.error }]}
                            onPress={() => handleCancel(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.white }]}>İsteği İptal Et</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                loadRentalHistory();
            }
        }, [userId, type])
    );

    if ((type === 'pending' ? pendingLoading : loading)) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }] }>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }] }>
            <LinearGradient
                colors={[colors.headerGradientStart, colors.headerGradientEnd]}
                style={styles.header}
            >
                <Text style={[styles.headerTitle, { color: '#fff' }] }>
                    {type === 'pending' ? 'Bekleyen İsteklerim' : 'Kiralama Geçmişim'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }] }>
                    {type === 'pending' 
                        ? 'Bekleyen kiralama isteklerinizi görüntüleyin'
                        : 'Tüm kiralama geçmişinizi görüntüleyin'}
                </Text>
            </LinearGradient>

            <FlatList
                data={type === 'pending' ? pendingRentalHistories : rentalHistories}
                renderItem={renderRentalItem}
                keyExtractor={item => item.Id?.toString() || item.id?.toString() || (item.StartDate + item.NumberPlate)}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }] }>
                            {type === 'pending' ? 'Bekleyen kiralama isteğiniz yok.' : 'Henüz kiralama geçmişiniz bulunmuyor.'}
                        </Text>
                    </View>
                }
            />
            <MessageModal
                visible={showCancelModal}
                title="İsteği İptal Et"
                message="İsteği iptal etmek istediğinize emin misiniz?"
                icon="error"
                showCancel={true}
                cancelText="Hayır"
                onCancel={closeCancelModal}
                showConfirm={true}
                confirmText="Evet"
                onConfirm={confirmCancel}
                reverseButtons={true}
                onClose={closeCancelModal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    rentalCard: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    rentalImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    rentalInfo: {
        padding: 16,
    },
    rentalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    rentalDate: {
        fontSize: 14,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    plateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 10,
    },
    plateText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    priceBadge: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceBadgeText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    cancelButton: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 7,
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    cancelButtonText: {
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 0.2,
    },
});

export default RentalHistoriesScreen;
