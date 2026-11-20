import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tuning } from '@/config/tuning';
import { backgroundGradient } from '@/ui/color';

/**
 * Degradê escuro com a cor da capa. Duas camadas: a nova aparece por cima
 * da anterior com fade, e depois vira a base.
 */
export function Background({ color }: { color: string | null }) {
  const [base, setBase] = useState<[string, string]>(() => backgroundGradient(null, tuning.ui.backgroundDarkMix));
  const [top, setTop] = useState<[string, string]>(base);
  const opacity = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const next = backgroundGradient(color, tuning.ui.backgroundDarkMix);
    setTop(next);
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: tuning.ui.backgroundTransitionMs });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setBase(next);
      opacity.value = 0;
    }, tuning.ui.backgroundTransitionMs + 50);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [color, opacity]);

  const topStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={base} style={[StyleSheet.absoluteFill, { opacity: tuning.ui.backgroundOpacity }]} />
      <Animated.View style={[StyleSheet.absoluteFill, topStyle]}>
        <LinearGradient colors={top} style={[StyleSheet.absoluteFill, { opacity: tuning.ui.backgroundOpacity }]} />
      </Animated.View>
    </View>
  );
}
