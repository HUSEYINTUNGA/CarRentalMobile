import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomDropdown = ({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Seçiniz',
  style = {},
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label && (
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>{label}</Text>
      )}
      <TouchableOpacity
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.altCard || colors.card,
          height: 48,
          justifyContent: 'center',
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={{ color: value ? colors.primary : colors.textSecondary, fontSize: 16, flex: 1 }}>
          {selectedLabel}
        </Text>
        <Icon name="chevron-down" size={22} color={colors.primary} />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={{
            position: 'absolute',
            top: '30%',
            left: '5%',
            right: '5%',
            backgroundColor: colors.card,
            borderRadius: 14,
            paddingVertical: 8,
            shadowColor: colors.shadow,
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 8,
          }}>
            <FlatList
              data={options}
              keyExtractor={item => item.value?.toString() ?? item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    backgroundColor: value === item.value ? colors.primary : 'transparent',
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    onValueChange(item.value);
                  }}
                >
                  <Text style={{
                    color: value === item.value ? colors.white : colors.primary,
                    fontWeight: value === item.value ? 'bold' : 'normal',
                    fontSize: 16,
                  }}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 8 }} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown; 