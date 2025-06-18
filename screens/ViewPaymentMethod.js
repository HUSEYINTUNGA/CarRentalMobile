import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getPaymentMethodById } from '../api/paymentMethodsApi';
import { useTheme } from '../theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const typography = {
  h2: { fontSize: 22, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: 'bold' },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
};

const ViewPaymentMethod = ({ cardId, onClose }) => {
  const route = useRoute();
  const navigation = useNavigation();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (!cardId) {
      setError('Kart bilgisi bulunamadı.');
      setLoading(false);
      return;
    }
    const fetchCard = async () => {
      try {
        setLoading(true);
        const response = await getPaymentMethodById(cardId);
        setCard(response.data);
      } catch (err) {
        setError('Kart bilgisi alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [cardId]);

  if (loading) {
    return (
      <View style={[panelStyles.panelContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !card) {
    return (
      <View style={[panelStyles.panelContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <TouchableOpacity onPress={onClose} style={panelStyles.closeButton}>
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ color: colors.error, textAlign: 'center' }}>{error || 'Kart bilgisi bulunamadı.'}</Text>
      </View>
    );
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const renderFrontCard = () => (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor: colors.primary,
        backfaceVisibility: 'hidden',
        transform: [
          {
            rotateY: flipAnimation.interpolate({
              inputRange: [0, 180],
              outputRange: ['0deg', '180deg'],
            }),
          },
        ],
      },
    ]}>
      <View style={styles.cardHeader}>
        <Text style={{ ...typography.h3, color: isDark ? '#000' : '#fff' }}>{card.MethodName}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={{ ...typography.h2, color: isDark ? '#000' : '#fff', letterSpacing: 2 }}>
          {card.CardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
        </Text>
        <Text style={{ ...typography.body1, color: isDark ? '#000' : '#fff' }}>{card.CardholderName}</Text>
        <Text style={{ ...typography.body1, color: isDark ? '#000' : '#fff' }}>
          {card.ExpirationMonth}/{card.ExpirationYear % 100}
        </Text>
      </View>
    </Animated.View>
  );

  const renderBackCard = () => (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor: colors.primary,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        transform: [
          {
            rotateY: flipAnimation.interpolate({
              inputRange: [0, 180],
              outputRange: ['180deg', '360deg'],
            }),
          },
        ],
      },
    ]}>
      <View style={[styles.magneticStripe, { backgroundColor: isDark ? '#000' : '#333' }]} />
      <View style={[styles.signatureStrip, { backgroundColor: colors.white }] }>
        <Text style={{ ...typography.body2, color: isDark ? '#000' : '#fff' }}>CVV</Text>
        <Text style={{ ...typography.h3, color: isDark ? '#000' : '#fff' }}>{card.CVV}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={[panelStyles.panelContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={panelStyles.header}>
        <Text style={{ ...typography.h2, color: colors.primary }}>Kart Detayları</Text>
        <TouchableOpacity onPress={onClose} style={panelStyles.closeButton}>
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={flipCard} style={panelStyles.cardContainer}>
        {renderFrontCard()}
        {renderBackCard()}
      </TouchableOpacity>
      <Text style={{ ...typography.body2, color: colors.textSecondary, marginTop: 10, textAlign: 'center' }}>Kartı çevirmek için dokunun</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  magneticStripe: {
    height: 40,
    marginTop: 20,
  },
  signatureStrip: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 8,
  },
});

const panelStyles = StyleSheet.create({
  panelContainer: {
    width: width - 40,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
});

export default ViewPaymentMethod; 