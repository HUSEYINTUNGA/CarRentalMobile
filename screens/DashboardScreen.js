import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';

const medalColors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    blue: '#0066cc',
};

const getMedalColor = (index) => {
    if (index === 0) return medalColors.gold;
    if (index === 1) return medalColors.silver;
    if (index === 2) return medalColors.bronze;
    return medalColors.blue;
};

const getMedalBgColor = (index) => getMedalColor(index);

const formatPlate = (plate) => {
    if (!plate) return '';
    const cleaned = plate.replace(/\s+/g, '').toUpperCase();
    const match = cleaned.match(/^(\d{2})([A-ZÇĞİÖŞÜ]+)(\d{2,4})$/);
    if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return plate;
};

const statCardColors = [
    '#0066cc',
    '#1a7dd4',
    '#3393dc',
    '#4da9e3',
    '#66bfea',
    '#80d5f2',
    '#99eaf9',
    '#b3ffff',
];

const StatCard = ({ title, value, icon, color, colors }) => (
    <View style={[styles.statCard, { borderLeftColor: color, shadowColor: color, backgroundColor: colors.card }]}> 
        <View style={[styles.statIconContainer, { backgroundColor: colors.backgroundCard }]}> 
            {icon === 'garage' ? (
                <MaterialCommunityIcons name="garage" size={24} color={color} />
            ) : (
                <MaterialIcons name={icon} size={24} color={color} />
            )}
        </View>
        <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        </View>
    </View>
);

const VehicleCard = ({ vehicle, colors }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: colors.primary, backgroundColor: colors.card, shadowColor: colors.shadow }]}> 
        <View style={[styles.vehicleImageWrapper, { backgroundColor: colors.backgroundCard }]}> 
            {vehicle.MainPhotoUrl ? (
                <Image source={{ uri: vehicle.MainPhotoUrl }} style={styles.vehicleImage} />
            ) : (
                <MaterialIcons name="directions-car" size={32} color={colors.primary} />
            )}
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="directions-car" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleTitle, { color: colors.text }]}>{vehicle.Brand} {vehicle.Model}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="confirmation-number" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>{formatPlate(vehicle.NumberPlate)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="event" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>
                    {new Date(vehicle.CreatedAt).toLocaleDateString()} {new Date(vehicle.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    </View>
);

const UserInfoCard = ({ user, colors }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: colors.info, backgroundColor: colors.card, shadowColor: colors.shadow }]}> 
        <View style={[styles.vehicleImageWrapper, { backgroundColor: colors.backgroundCard }]}> 
            <MaterialIcons name="person" size={32} color={colors.info} />
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="person" size={18} color={colors.info} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleTitle, { color: colors.text }]}>{user.UserName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="email" size={16} color={colors.info} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>{user.Email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name={user.Role === 'Admin' ? 'admin-panel-settings' : 'person-outline'} size={16} color={colors.info} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>{user.Role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="event" size={16} color={colors.info} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>
                    {new Date(user.CreatedAt).toLocaleDateString()} {new Date(user.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {user.IsVerified ? (
                    <MaterialIcons name="check-circle" size={16} color={colors.success} style={{ marginRight: 6 }} />
                ) : (
                    <MaterialIcons name="cancel" size={16} color={colors.error} style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.vehicleDetailHorizontal, { color: user.IsVerified ? colors.success : colors.error }]}>{user.IsVerified ? 'Doğrulandı' : 'Doğrulanmadı'}</Text>
            </View>
        </View>
    </View>
);

const MostRentedVehicleCard = ({ vehicle, index, isDark, colors }) => (
    <View style={[
        styles.vehicleCardHorizontal,
        {
            borderLeftWidth: 6,
            borderLeftColor: getMedalColor(index),
            position: 'relative',
            backgroundColor: isDark ? '#23272F' : colors.card,
            shadowColor: colors.shadow
        }
    ]}>
        <View style={[styles.rankNumberWrapper, { backgroundColor: getMedalBgColor(index) }]}> 
            <Text style={[styles.rankNumber, { color: '#fff' }]}>{index + 1}</Text>
        </View>
        <View style={styles.vehicleImageWrapperCentered}>
            {vehicle.MainPhotoUrl ? (
                <Image source={{ uri: vehicle.MainPhotoUrl }} style={styles.vehicleImage} />
            ) : (
                <MaterialIcons name="directions-car" size={40} color={getMedalColor(index)} />
            )}
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="directions-car" size={18} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleTitle, { color: colors.text }]}>{vehicle.Brand} {vehicle.Model}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="confirmation-number" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>{formatPlate(vehicle.NumberPlate)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="event" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>
                    {vehicle.CreatedAt ? `${new Date(vehicle.CreatedAt).toLocaleDateString()} ${new Date(vehicle.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="star" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>Kiralama Sayısı: {vehicle.RentalCount}</Text>
            </View>
        </View>
        <View style={styles.totalAmountBoxLeft}>
            <MaterialIcons name="attach-money" size={18} color="#43a047" />
            <Text style={styles.totalAmountText}>₺{vehicle.TotalRentalAmount?.toLocaleString('tr-TR') || '0'}</Text>
        </View>
    </View>
);

const MostActiveUserCard = ({ user, index, isDark, colors }) => (
    <View style={[
        styles.vehicleCardHorizontal,
        {
            borderLeftWidth: 6,
            borderLeftColor: getMedalColor(index),
            position: 'relative',
            backgroundColor: isDark ? '#23272F' : colors.card,
            shadowColor: colors.shadow
        }
    ]}>
        <View style={[styles.rankNumberWrapper, { backgroundColor: getMedalBgColor(index) }]}> 
            <Text style={[styles.rankNumber, { color: '#fff' }]}>{index + 1}</Text>
        </View>
        <View style={styles.vehicleImageWrapperCentered}>
            <MaterialIcons name="person" size={40} color={getMedalColor(index)} />
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="person" size={18} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleTitle, { color: colors.text }]}>{user.UserName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="email" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>{user.Email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name={user.Role === 'Admin' ? 'admin-panel-settings' : 'person-outline'} size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>{user.Role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="event" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>
                    {new Date(user.CreatedAt).toLocaleDateString()} {new Date(user.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="star" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>Kiralama Sayısı: {user.RentalCount}</Text>
            </View>
        </View>
        <View style={styles.totalAmountBoxLeft}>
            <MaterialIcons name="attach-money" size={18} color="#43a047" />
            <Text style={styles.totalAmountText}>₺{user.TotalRentalAmount?.toLocaleString('tr-TR') || '0'}</Text>
        </View>
    </View>
);

const MonthlyStatCard = ({ item, index, colors }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: colors.primary, backgroundColor: colors.card, shadowColor: colors.shadow }]}> 
        <View style={styles.vehicleInfoHorizontal}>
            <Text style={[styles.vehicleTitle, { color: colors.text }]}>{item.Year}/{item.Month}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <MaterialIcons name="attach-money" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>Toplam Gelir: <Text style={{ fontWeight: 'bold', color: colors.text }}>{'₺' + item.TotalIncome.toLocaleString()}</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="directions-car" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>Kiralama Sayısı: <Text style={{ fontWeight: 'bold', color: colors.text }}>{item.RentalCount}</Text></Text>
            </View>
        </View>
    </View>
);

const DashboardScreen = () => {
    const {
        userStats,
        vehicleStats,
        rentalStats,
        fetchAllStats,
        isLoading,
        hasError
    } = useDashboard();
    const isFocused = useIsFocused();
    const { colors, isDark } = useTheme();

    useEffect(() => {
        if (isFocused) {
            fetchAllStats();
        }
    }, [isFocused]);

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }] }>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (hasError) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.background }] }>
                <MaterialIcons name="error-outline" size={48} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>Veriler yüklenirken bir hata oluştu</Text>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchAllStats}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchAllStats} />
            }
        >
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
                <LinearGradient
                    colors={[colors.headerGradientStart, colors.headerGradientEnd]}
                    style={styles.header}
                >
                    <Text style={[styles.headerTitleCentered, { color: '#fff' }]}>Dashboard</Text>
                    <Text style={[styles.headerSubtitleCentered, { color: '#fff' }]}>Araç Kiralama Yönetimi</Text>
                </LinearGradient>
            </View>
            <View style={{ height: 100 }} />
            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <StatCard
                        title="Toplam Araç"
                        value={vehicleStats?.TotalVehicleCount || 0}
                        icon="directions-car"
                        color={statCardColors[0]}
                        colors={colors}
                    />
                    <StatCard
                        title="Kiralanmış Araç"
                        value={vehicleStats?.RentedVehicleCount || 0}
                        icon="car-rental"
                        color={statCardColors[1]}
                        colors={colors}
                    />
                    <StatCard
                        title="Kirada Olmayan Araç"
                        value={vehicleStats?.NotRentedVehicleCount || 0}
                        icon="garage"
                        color={statCardColors[2]}
                        colors={colors}
                    />
                    <StatCard
                        title="Müsait Araç"
                        value={vehicleStats?.AvailableVehicleCount || 0}
                        icon="event-available"
                        color={statCardColors[3]}
                        colors={colors}
                    />
                    <StatCard
                        title="Müsait Olmayan Araç"
                        value={vehicleStats?.UnavailableVehicleCount || 0}
                        icon="car-repair"
                        color={statCardColors[4]}
                        colors={colors}
                    />
                    <StatCard
                        title="Toplam Kullanıcı"
                        value={userStats?.TotalUserCount || 0}
                        icon="people"
                        color={statCardColors[5]}
                        colors={colors}
                    />
                    <StatCard
                        title="Admin Sayısı"
                        value={userStats?.AdminCount || 0}
                        icon="admin-panel-settings"
                        color={statCardColors[6]}
                        colors={colors}
                    />
                    <StatCard
                        title="Bekleyen Kiralama Talebi"
                        value={rentalStats?.PendingRentalRequestsCount || 0}
                        icon="hourglass-empty"
                        color={statCardColors[7]}
                        colors={colors}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Eklenen Araçlar</Text>
                    <FlatList
                        data={vehicleStats?.LastAddedVehicles || []}
                        renderItem={({ item }) => <VehicleCard vehicle={item} colors={colors} />}
                        keyExtractor={item => item.NumberPlate}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Eklenen Kullanıcılar</Text>
                    <FlatList
                        data={userStats?.LastAddedUsers || []}
                        renderItem={({ item }) => <UserInfoCard user={item} colors={colors} />}
                        keyExtractor={item => item.UserName}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>En Aktif Kullanıcılar</Text>
                    <FlatList
                        data={userStats?.MostActiveUsers || []}
                        renderItem={({ item, index }) => <MostActiveUserCard user={item} index={index} isDark={isDark} colors={colors} />}
                        keyExtractor={item => item.UserName}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>En Çok Kiralanan Araçlar</Text>
                    <FlatList
                        data={vehicleStats?.MostRentedVehicles || []}
                        renderItem={({ item, index }) => <MostRentedVehicleCard vehicle={item} index={index} isDark={isDark} colors={colors} />}
                        keyExtractor={item => item.NumberPlate}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Aylık İstatistikler</Text>
                    <FlatList
                        data={rentalStats?.MonthlyStats || []}
                        renderItem={({ item, index }) => <MonthlyStatCard item={item} index={index} colors={colors} />}
                        keyExtractor={item => `${item.Year}-${item.Month}`}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Bugün İade Edilecek Araçlar</Text>
                    <FlatList
                        data={rentalStats?.UpcomingReturns || []}
                        renderItem={({ item }) => (
                            <View style={[styles.vehicleCardHorizontal, { backgroundColor: colors.card, shadowColor: colors.shadow }] }>
                                <View style={[styles.vehicleImageWrapper, { backgroundColor: colors.backgroundCard }] }>
                                    <MaterialIcons name="directions-car" size={32} color={colors.primary} />
                                </View>
                                <View style={styles.vehicleInfoHorizontal}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                        <MaterialIcons name="directions-car" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                                        <Text style={[styles.vehicleTitle, { color: colors.text }]}>{item.VehicleBrand} {item.VehicleModel}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                        <MaterialIcons name="confirmation-number" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                                        <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>Plaka: {formatPlate(item.NumberPlate)}</Text>
                                    </View>
                                    <Text style={[styles.vehicleDetailHorizontal, { color: colors.textSecondary }]}>İade Tarihi: {new Date(item.ReturnDate).toLocaleString()}</Text>
                                </View>
                            </View>
                        )}
                        keyExtractor={item => item.Id.toString()}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 30,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitleCentered: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    headerSubtitleCentered: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 5,
    },
    content: {
        padding: 15,
        paddingTop: 20,
    },
    statsContainer: {
        marginTop: 15,
        marginBottom: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderLeftWidth: 4,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 5,
    },
    statTitle: {
        fontSize: 14,
        color: '#666666',
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginTop: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 15,
    },
    vehicleCardHorizontal: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    vehicleImageWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    vehicleInfoHorizontal: {
        flex: 1,
        justifyContent: 'center',
    },
    vehicleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 5,
    },
    vehicleDetailHorizontal: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 3,
    },
    rankNumberWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginLeft: 2,
    },
    rankNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    vehicleImageWrapperCentered: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalAmountBox: {
        position: 'absolute',
        right: 16,
        bottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        elevation: 1,
    },
    totalAmountBoxLeft: {
        position: 'absolute',
        left: 16,
        bottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        elevation: 1,
    },
    totalAmountText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#388e3c',
        marginLeft: 2,
    },
    vehicleImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
});

export default DashboardScreen;
