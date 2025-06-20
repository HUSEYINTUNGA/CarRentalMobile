import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme/ThemeProvider';

const MessageModal = ({ 
  visible, 
  title, 
  message, 
  icon = 'info', 
  onClose, 
  buttonText = 'Tamam',
  onButtonPress,
  showCancel = false,
  cancelText = 'İptal',
  onCancel,
  showConfirm = false,
  confirmText = 'Sil',
  onConfirm,
  reverseButtons = false
}) => {
  const { colors, isDark } = useTheme();

  const getIconColor = () => {
    switch (icon) {
      case 'check-circle':
        return '#43a047';
      case 'error':
        return colors.error;
      case 'warning':
        return '#FFC107';
      case 'info':
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}> 
          <Icon 
            name={icon} 
            size={40} 
            color={getIconColor()} 
            style={[styles.modalIcon, { alignSelf: 'center' }]} 
          />
          <Text style={[styles.modalTitle, { color: getIconColor() }]}> {title} </Text>
          <View style={styles.modalMessage}> 
            {typeof message === 'string' ? <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{message}</Text> : message}
          </View>
          {(showCancel || showConfirm) ? (
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', width: '100%' }}>
              {reverseButtons ? (
                <>
                  {showCancel && (
                    <TouchableOpacity
                      style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, marginRight: 8 }]}
                      onPress={onCancel || onClose}
                    >
                      <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>{cancelText}</Text>
                    </TouchableOpacity>
                  )}
                  {showConfirm && (
                    <TouchableOpacity
                      style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error }]}
                      onPress={onConfirm}
                    >
                      <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>{confirmText}</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  {showCancel && (
                    <TouchableOpacity
                      style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary, marginRight: 8 }]}
                      onPress={onCancel || onClose}
                    >
                      <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>{cancelText}</Text>
                    </TouchableOpacity>
                  )}
                  {showConfirm && (
                    <TouchableOpacity
                      style={[styles.rentButton, { backgroundColor: colors.error, shadowColor: colors.error, marginRight: 8 }]}
                      onPress={onConfirm}
                    >
                      <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>{confirmText}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          ) : (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <TouchableOpacity
                style={[styles.rentButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={onButtonPress || onClose}
              >
                <Text style={[styles.rentButtonText, { color: isDark ? '#111' : '#fff' }]}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'stretch',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIcon: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'stretch',
  },
  rentButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    elevation: 3,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default MessageModal; 