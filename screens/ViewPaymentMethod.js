import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getPaymentMethodById } from '../api/paymentMethodsApi';

const { width } = Dimensions.get('window');

const ViewPaymentMethod = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const cardId = route.params?.cardId;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

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
      <Modal visible={true} transparent animationType="fade" onRequestClose={() => navigation.goBack()}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Modal>
    );
  }

  if (error || !card) {
    return (
      <Modal visible={true} transparent animationType="fade" onRequestClose={() => navigation.goBack()}>
        <View style={styles.modalContainer}>
          <Text>{error || 'Kart bilgisi bulunamadı.'}</Text>
        </View>
      </Modal>
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
    <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{card.MethodName}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardNumber}>{card.CardNumber}</Text>
        <Text style={styles.cardHolder}>{card.CardholderName}</Text>
        <Text style={styles.expiryDate}>
          {card.ExpirationMonth}/{card.ExpirationYear % 100}
        </Text>
      </View>
    </Animated.View>
  );

  const renderBackCard = () => (
    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
      <View style={styles.magneticStripe} />
      <View style={styles.signatureStrip}>
        <Text style={styles.cvvLabel}>CVV</Text>
        <Text style={styles.cvvValue}>{card.CVV}</Text>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => navigation.goBack()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Kart Detayları</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={flipCard} style={styles.cardContainer}>
            {renderFrontCard()}
            {renderBackCard()}
          </TouchableOpacity>

          <Text style={styles.flipText}>Kartı çevirmek için dokunun</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: width - 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    ...typography.h2,
  },
  closeButton: {
    padding: 4,
  },
  cardContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: colors.primary,
  },
  cardBack: {
    backgroundColor: colors.primary,
    transform: [{ rotateY: '180deg' }],
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardName: {
    ...typography.h3,
    color: colors.white,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardNumber: {
    ...typography.h2,
    color: colors.white,
    letterSpacing: 2,
  },
  cardHolder: {
    ...typography.body1,
    color: colors.white,
  },
  expiryDate: {
    ...typography.body1,
    color: colors.white,
  },
  magneticStripe: {
    height: 40,
    backgroundColor: colors.black,
    marginTop: 20,
  },
  signatureStrip: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginTop: 20,
    borderRadius: 8,
  },
  cvvLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  cvvValue: {
    ...typography.h3,
    color: colors.text,
  },
  flipText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 10,
  },
});

export default ViewPaymentMethod; 