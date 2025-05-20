import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ManageVehiclesScreen = () => {
    const route = useRoute();
    const { mode, vehicleId } = route.params || {};

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Araç Yönetimi</Text>
            <Text style={styles.info}>Mode: {mode}</Text>
            {vehicleId && <Text style={styles.info}>Araç ID: {vehicleId}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1976d2',
    },
    info: {
        fontSize: 18,
        marginBottom: 10,
        color: '#333',
    },
});

export default ManageVehiclesScreen; 