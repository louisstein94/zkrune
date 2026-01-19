/**
 * zkRune Onboarding Screen
 * Beautiful first-time user experience
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Button } from '../components/ui';
import { secureStorage, STORAGE_KEYS } from '../services';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'shield-checkmark',
    title: 'Zero-Knowledge Privacy',
    description: 'Prove facts about yourself without revealing sensitive data. Your secrets stay yours.',
    gradient: ['#0EA5E9', '#14B8A6'], // zkRune cyan to teal
  },
  {
    id: '2',
    icon: 'flash',
    title: 'Instant Proof Generation',
    description: 'Generate cryptographic proofs in seconds, right on your device. No servers, no waiting.',
    gradient: ['#06B6D4', '#10B981'], // Cyan to emerald
  },
  {
    id: '3',
    icon: 'wallet',
    title: 'Solana Powered',
    description: 'Connect your Phantom or Solflare wallet. Verify proofs on-chain with minimal fees.',
    gradient: ['#14B8A6', '#0EA5E9'], // Teal to sky
  },
  {
    id: '4',
    icon: 'finger-print',
    title: 'Biometric Security',
    description: 'Protect your proofs with Face ID or fingerprint. Enterprise-grade security in your pocket.',
    gradient: ['#06B6D4', '#5EEAD4'], // Cyan to rune glow
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await secureStorage.set(STORAGE_KEYS.ONBOARDED, 'true');
    onComplete();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={styles.slide}>
        {/* Icon with gradient background */}
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
        >
          <Ionicons name={item.icon as any} size={64} color={colors.text.primary} />
        </LinearGradient>

        {/* Decorative glow */}
        <View style={[styles.glow, { backgroundColor: item.gradient[0] }]} />

        {/* Content */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: slides[currentIndex].gradient[0],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#050810', '#0a1020', '#0d1528']}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      {/* Dots */}
      {renderDots()}

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {currentIndex === slides.length - 1 ? (
          <Button
            title="Get Started"
            onPress={handleComplete}
            size="lg"
            style={styles.getStartedButton}
          />
        ) : (
          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.prevButton} onPress={handleSkip}>
              <Text style={styles.prevText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <LinearGradient
                colors={slides[currentIndex].gradient}
                style={styles.nextButtonGradient}
              >
                <Ionicons name="arrow-forward" size={24} color={colors.text.primary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Rune decoration */}
      <Text style={styles.runeDecoration}>ᚱ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: spacing[2],
  },
  skipText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingTop: height * 0.15,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  glow: {
    position: 'absolute',
    top: height * 0.15 + 20,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  description: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing[4],
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomSection: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[12],
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevButton: {
    padding: spacing[4],
  },
  prevText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
  },
  nextButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButton: {
    width: '100%',
  },
  runeDecoration: {
    position: 'absolute',
    bottom: height * 0.35,
    right: 30,
    fontSize: 120,
    color: colors.brand.primary,
    opacity: 0.03,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
