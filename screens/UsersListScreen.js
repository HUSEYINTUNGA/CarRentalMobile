import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UsersListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcılar Listesi</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6ff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
  },
});

export default UsersListScreen; 