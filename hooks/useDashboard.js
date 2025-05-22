import { useState, useEffect } from 'react';
import { getUserStats, getVehicleStats, getRentalStats } from '../api/dashboardApi';

export const useDashboard = () => {
    // State tanımlamaları
    const [userStats, setUserStats] = useState(null);
    const [vehicleStats, setVehicleStats] = useState(null);
    const [rentalStats, setRentalStats] = useState(null);
    const [loading, setLoading] = useState({
        userStats: false,
        vehicleStats: false,
        rentalStats: false
    });
    const [error, setError] = useState({
        userStats: null,
        vehicleStats: null,
        rentalStats: null
    });

    const fetchUserStats = async () => {
        setLoading(prev => ({ ...prev, userStats: true }));
        setError(prev => ({ ...prev, userStats: null }));
        try {
            const response = await getUserStats();
            setUserStats(response.data);
        } catch (err) {
            setError(prev => ({ ...prev, userStats: err.message }));
            console.error('Kullanıcı istatistikleri alınamadı:', err);
        } finally {
            setLoading(prev => ({ ...prev, userStats: false }));
        }
    };

    const fetchVehicleStats = async () => {
        setLoading(prev => ({ ...prev, vehicleStats: true }));
        setError(prev => ({ ...prev, vehicleStats: null }));
        try {
            const response = await getVehicleStats();
            setVehicleStats(response.data);
        } catch (err) {
            setError(prev => ({ ...prev, vehicleStats: err.message }));
            console.error('Araç istatistikleri alınamadı:', err);
        } finally {
            setLoading(prev => ({ ...prev, vehicleStats: false }));
        }
    };

    const fetchRentalStats = async () => {
        setLoading(prev => ({ ...prev, rentalStats: true }));
        setError(prev => ({ ...prev, rentalStats: null }));
        try {
            const response = await getRentalStats();
            setRentalStats(response.data);
        } catch (err) {
            setError(prev => ({ ...prev, rentalStats: err.message }));
            console.error('Kiralama istatistikleri alınamadı:', err);
        } finally {
            setLoading(prev => ({ ...prev, rentalStats: false }));
        }
    };

    const fetchAllStats = async () => {
        await Promise.all([
            fetchUserStats(),
            fetchVehicleStats(),
            fetchRentalStats()
        ]);
    };

    useEffect(() => {
        fetchAllStats();
    }, []);

    return {
        userStats,
        vehicleStats,
        rentalStats,
        loading,
        error,

        fetchUserStats,
        fetchVehicleStats,
        fetchRentalStats,
        fetchAllStats,

        isLoading: loading.userStats || loading.vehicleStats || loading.rentalStats,
        hasError: error.userStats || error.vehicleStats || error.rentalStats
    };
}; 