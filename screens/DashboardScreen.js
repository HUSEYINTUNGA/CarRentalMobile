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
} from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';


const formatPlate = (plate) => {
    if (!plate) return '';
    const match = plate.match(/^(\d{2})([A-Z]+)(\d+)$/i);
    if (match) {
        return `${match[1]} ${match[2].toUpperCase()} ${match[3]}`;
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

const getMedalColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#0066cc';
};

const getMedalBgColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#3393dc';
};

const StatCard = ({ title, value, icon, color}) => (
    <View style={[styles.statCard, { borderLeftColor: color, shadowColor: color }]}> 
        <View style={styles.statIconContainer}>
            {icon === 'garage' ? (
                <MaterialCommunityIcons name="garage" size={24} color={color} />
            ) : (
                <MaterialIcons name={icon} size={24} color={color} />
            )}
        </View>
        <View style={styles.statContent}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    </View>
);

const VehicleCard = ({ vehicle }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: '#0066cc' }]}>
        <View style={styles.vehicleImageWrapper}>
            <MaterialIcons name="directions-car" size={32} color="#0066cc" />
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="directions-car" size={18} color="#0066cc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleTitle}>{vehicle.Brand} {vehicle.Model}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="confirmation-number" size={16} color="#0066cc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>{formatPlate(vehicle.NumberPlate)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="event" size={16} color="#0066cc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>
                    {new Date(vehicle.CreatedAt).toLocaleDateString()} {new Date(vehicle.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    </View>
);

const UserInfoCard = ({ user }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: '#3393dc' }]}> 
        <View style={styles.vehicleImageWrapper}>
            <MaterialIcons name="person" size={32} color="#3393dc" />
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="person" size={18} color="#3393dc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleTitle}>{user.UserName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="email" size={16} color="#3393dc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>{user.Email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name={user.Role === 'Admin' ? 'admin-panel-settings' : 'person-outline'} size={16} color="#3393dc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>{user.Role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="event" size={16} color="#3393dc" style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>
                    {new Date(user.CreatedAt).toLocaleDateString()} {new Date(user.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {user.IsVerified ? (
                    <MaterialIcons name="check-circle" size={16} color="#43a047" style={{ marginRight: 6 }} />
                ) : (
                    <MaterialIcons name="cancel" size={16} color="#e53935" style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.vehicleDetailHorizontal, { color: user.IsVerified ? '#43a047' : '#e53935' }]}>{user.IsVerified ? 'Doğrulandı' : 'Doğrulanmadı'}</Text>
            </View>
        </View>
    </View>
);

const MostRentedVehicleCard = ({ vehicle, index }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: getMedalColor(index), position: 'relative' }]}> 
        <View style={[styles.rankNumberWrapper, { backgroundColor: getMedalBgColor(index) }]}> 
            <Text style={[styles.rankNumber, { color: '#fff' }]}>{index + 1}</Text>
        </View>
        <View style={styles.vehicleImageWrapperCentered}>
            <MaterialIcons name="directions-car" size={40} color={getMedalColor(index)} />
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="directions-car" size={18} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleTitle}>{vehicle.Brand} {vehicle.Model}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="confirmation-number" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>{formatPlate(vehicle.NumberPlate)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="event" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>
                    {vehicle.CreatedAt ? `${new Date(vehicle.CreatedAt).toLocaleDateString()} ${new Date(vehicle.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="star" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>Kiralanma Sayısı: {vehicle.RentalCount}</Text>
            </View>
        </View>
        <View style={styles.totalAmountBoxLeft}>
            <MaterialIcons name="attach-money" size={18} color="#43a047" />
            <Text style={styles.totalAmountText}>₺{vehicle.TotalRentalAmount?.toLocaleString('tr-TR') || '0'}</Text>
        </View>
    </View>
);

const MostActiveUserCard = ({ user, index }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: getMedalColor(index), position: 'relative' }]}> 
        <View style={[styles.rankNumberWrapper, { backgroundColor: getMedalBgColor(index) }]}> 
            <Text style={[styles.rankNumber, { color: '#fff' }]}>{index + 1}</Text>
        </View>
        <View style={styles.vehicleImageWrapperCentered}>
            <MaterialIcons name="person" size={40} color={getMedalColor(index)} />
        </View>
        <View style={styles.vehicleInfoHorizontal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="person" size={18} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleTitle}>{user.UserName}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="email" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>{user.Email}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name={user.Role === 'Admin' ? 'admin-panel-settings' : 'person-outline'} size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>{user.Role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <MaterialIcons name="event" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>
                    {new Date(user.CreatedAt).toLocaleDateString()} {new Date(user.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="star" size={16} color={getMedalColor(index)} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>Kiralama Sayısı: {user.RentalCount}</Text>
            </View>
        </View>
        <View style={styles.totalAmountBoxLeft}>
            <MaterialIcons name="attach-money" size={18} color="#43a047" />
            <Text style={styles.totalAmountText}>₺{user.TotalRentalAmount?.toLocaleString('tr-TR') || '0'}</Text>
        </View>
    </View>
);

const MonthlyStatCard = ({ item, index }) => (
    <View style={[styles.vehicleCardHorizontal, { borderLeftWidth: 6, borderLeftColor: statCardColors[index % statCardColors.length] }]}> 
        <View style={styles.vehicleInfoHorizontal}>
            <Text style={styles.vehicleTitle}>{item.Year}/{item.Month}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <MaterialIcons name="attach-money" size={18} color={statCardColors[index % statCardColors.length]} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>Toplam Gelir: <Text style={{ fontWeight: 'bold', color: '#222' }}>₺{item.TotalIncome.toLocaleString()}</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="directions-car" size={16} color={statCardColors[index % statCardColors.length]} style={{ marginRight: 6 }} />
                <Text style={styles.vehicleDetailHorizontal}>Kiralama Sayısı: <Text style={{ fontWeight: 'bold', color: '#222' }}>{item.RentalCount}</Text></Text>
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

    useEffect(() => {
        if (isFocused) {
            fetchAllStats();
        }
    }, [isFocused]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
            </View>
        );
    }

    if (hasError) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#ff4444" />
                <Text style={styles.errorText}>Veriler yüklenirken bir hata oluştu</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchAllStats}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={fetchAllStats} />
            }
        >
            <LinearGradient
                colors={['#0066cc', '#0052a3']}
                style={styles.header}
            >
                <Text style={styles.headerTitleCentered}>Dashboard</Text>
                <Text style={styles.headerSubtitleCentered}>Araç Kiralama Yönetimi</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <StatCard
                        title="Toplam Araç"
                        value={vehicleStats?.TotalVehicleCount || 0}
                        icon="directions-car"
                        color={statCardColors[0]}
                    />
                    <StatCard
                        title="Kiralanmış Araç"
                        value={vehicleStats?.RentedVehicleCount || 0}
                        icon="car-rental"
                        color={statCardColors[1]}
                    />
                    <StatCard
                        title="Kirada Olmayan Araç"
                        value={vehicleStats?.NotRentedVehicleCount || 0}
                        icon="garage"
                        color={statCardColors[2]}
                    />
                    <StatCard
                        title="Müsait Araç"
                        value={vehicleStats?.AvailableVehicleCount || 0}
                        icon="event-available"
                        color={statCardColors[3]}
                    />
                    <StatCard
                        title="Müsait Olmayan Araç"
                        value={vehicleStats?.UnavailableVehicleCount || 0}
                        icon="car-repair"
                        color={statCardColors[4]}
                    />
                    <StatCard
                        title="Toplam Kullanıcı"
                        value={userStats?.TotalUserCount || 0}
                        icon="people"
                        color={statCardColors[5]}
                    />
                    <StatCard
                        title="Admin Sayısı"
                        value={userStats?.AdminCount || 0}
                        icon="admin-panel-settings"
                        color={statCardColors[6]}
                    />
                    <StatCard
                        title="Bekleyen Kiralama Talebi"
                        value={rentalStats?.PendingRentalRequestsCount || 0}
                        icon="hourglass-empty"
                        color={statCardColors[7]}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Son Eklenen Araçlar</Text>
                    <FlatList
                        data={vehicleStats?.LastAddedVehicles || []}
                        renderItem={({ item }) => <VehicleCard vehicle={item} />}
                        keyExtractor={item => item.NumberPlate}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Son Eklenen Kullanıcılar</Text>
                    <FlatList
                        data={userStats?.LastAddedUsers || []}
                        renderItem={({ item }) => <UserInfoCard user={item} />}
                        keyExtractor={item => item.UserName}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>En Aktif Kullanıcılar</Text>
                    <FlatList
                        data={userStats?.MostActiveUsers || []}
                        renderItem={({ item, index }) => <MostActiveUserCard user={item} index={index} />}
                        keyExtractor={item => item.UserName}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>En Çok Kiralanan Araçlar</Text>
                    <FlatList
                        data={vehicleStats?.MostRentedVehicles || []}
                        renderItem={({ item, index }) => <MostRentedVehicleCard vehicle={item} index={index} />}
                        keyExtractor={item => item.NumberPlate}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aylık İstatistikler</Text>
                    <FlatList
                        data={rentalStats?.MonthlyStats || []}
                        renderItem={({ item, index }) => <MonthlyStatCard item={item} index={index} />}
                        keyExtractor={item => `${item.Year}-${item.Month}`}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bugün İade Edilecek Araçlar</Text>
                    <FlatList
                        data={rentalStats?.UpcomingReturns || []}
                        renderItem={({ item }) => (
                            <View style={styles.vehicleCardHorizontal}>
                                <View style={styles.vehicleInfoHorizontal}>
                                    <Text style={styles.vehicleTitle}>{item.VehicleBrand} {item.VehicleModel}</Text>
                                    <Text style={styles.vehicleDetailHorizontal}>Plaka: {item.NumberPlate}</Text>
                                    <Text style={styles.vehicleDetailHorizontal}>İade Tarihi: {new Date(item.ReturnDate).toLocaleString()}</Text>
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
        marginTop: -30,
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
});

export default DashboardScreen;
