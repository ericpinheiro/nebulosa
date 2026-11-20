import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { tuning } from '@/config/tuning';
import { estimatePosition, usePlayerStore } from '@/state/player';
import { formatDuration } from '@/ui/color';

import { NextLineIcon, PreviousLineIcon } from './LineIcons';
import {
  angleOf,
  armedAction,
  classifyTouch,
  rubberBand,
  scrubFraction,
  swipeAction,
  swipeProgress,
  type OrbZone,
  type SwipeAction,
} from './orb-math';

const o = tuning.ui.orb;
const SIZE = o.size;
const RADIUS = (SIZE - o.ringWidth) / 2 - 1;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICK_MS = 250;
const MAIN_ICON = 32;
const SIDE_ICON = 16;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  color: string;
  /** Avisado quando um gesto começa/termina (a interface não some no meio do arrasto). */
  onInteraction?: (active: boolean) => void;
}

/**
 * Botão orbital: tocar no centro = tocar/pausar; arrastar o centro para a direita/esquerda =
 * próxima/anterior; o anel mostra o progresso e, arrastado em volta, faz seek.
 */
export function OrbControl({ color, onInteraction }: Props) {
  const status = usePlayerStore((s) => s.status);
  const duration = usePlayerStore((s) => s.duration);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const seek = usePlayerStore((s) => s.seek);
  const playing = status === 'playing' || status === 'loading';

  const progress = useSharedValue(0);
  const offsetX = useSharedValue(0);
  /** -1..1: quanto do arrasto para anterior (-) ou próxima (+) já foi feito. */
  const swipe = useSharedValue(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [now, setNow] = useState(() => estimatePosition(usePlayerStore.getState()));

  const scrubRef = useRef<number | null>(null);
  scrubRef.current = scrub;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  // Anel andando: lê a posição estimada 4x/s e anima linearmente até ela.
  useEffect(() => {
    const id = setInterval(() => {
      const s = usePlayerStore.getState();
      const pos = estimatePosition(s);
      setNow(pos);
      if (scrubRef.current != null) return;
      const f = s.duration > 0 ? Math.max(0, Math.min(1, pos / s.duration)) : 0;
      const jump = Math.abs(f - progress.value) > 0.05;
      progress.value = jump ? f : withTiming(f, { duration: TICK_MS, easing: Easing.linear });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [progress]);

  // Estado do gesto num ref: os callbacks podem vir de cópias diferentes do objeto do gesto
  // (re-render/StrictMode), então variáveis locais da closure não são compartilhadas entre eles.
  const gs = useRef<{ zone: OrbZone; fraction: number; lastAngle: number; armed: SwipeAction; started: boolean }>({
    zone: 'none',
    fraction: 0,
    lastAngle: 0,
    armed: null,
    started: false,
  }).current;

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(4)
      .hitSlop(o.ringSlop)
      .onStart((e) => {
        // Ponto onde o dedo encostou = posição atual menos o deslocamento até a ativação.
        const x0 = e.x - e.translationX;
        const y0 = e.y - e.translationY;
        gs.zone = classifyTouch(x0, y0, SIZE, o.innerRatio, o.ringSlop);
        // Seek relativo: parte do ângulo inicial para não perder o começo do giro.
        gs.lastAngle = angleOf(x0 - SIZE / 2, y0 - SIZE / 2);
        if (gs.zone === 'none') return;
        gs.started = true;
        onInteraction?.(true);
        if (gs.zone === 'ring') {
          const s = usePlayerStore.getState();
          gs.fraction = s.duration > 0 ? Math.max(0, Math.min(1, estimatePosition(s) / s.duration)) : 0;
          progress.value = gs.fraction;
          setScrub(gs.fraction * durationRef.current);
          void Haptics.selectionAsync();
        } else {
          gs.armed = null;
        }
      })
      .onUpdate((e) => {
        if (gs.zone === 'ring') {
          const raw = angleOf(e.x - SIZE / 2, e.y - SIZE / 2);
          const nextFraction = scrubFraction(gs.fraction, gs.lastAngle, raw);
          gs.lastAngle = raw;
          // Vibração leve ao bater no começo ou no fim.
          if ((nextFraction === 0 || nextFraction === 1) && nextFraction !== gs.fraction) {
            void Haptics.selectionAsync();
          }
          gs.fraction = nextFraction;
          progress.value = gs.fraction;
          setScrub(gs.fraction * durationRef.current);
        } else if (gs.zone === 'center') {
          offsetX.value = rubberBand(e.translationX, o.swipeMaxPx);
          swipe.value = swipeProgress(e.translationX, o.swipeThresholdPx);
          const a = armedAction(e.translationX, o.swipeThresholdPx);
          if (a !== gs.armed) {
            gs.armed = a;
            if (a) void Haptics.selectionAsync();
          }
        }
      })
      .onEnd((e) => {
        if (gs.zone === 'ring') {
          void seek(gs.fraction * durationRef.current);
        } else if (gs.zone === 'center') {
          const action = swipeAction(e.translationX, e.velocityX, o.swipeThresholdPx, o.swipeVelocity);
          if (action) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            void (action === 'next' ? next() : previous());
          }
        }
      })
      .onFinalize(() => {
        if (gs.started) onInteraction?.(false);
        gs.started = false;
        offsetX.value = withSpring(0, { damping: 20, stiffness: 260, overshootClamping: true });
        swipe.value = withTiming(0, { duration: 180 });
        gs.armed = null;
        setScrub(null);
        gs.zone = 'none';
      });

    // Toque rápido em qualquer parte do botão: tocar/pausar (o anel só faz seek girando).
    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDistance(8)
      .hitSlop(o.ringSlop)
      .onEnd((e, ok) => {
        if (!ok) return;
        if (classifyTouch(e.x, e.y, SIZE, o.innerRatio, o.ringSlop) !== 'none') void toggle();
      });

    return Gesture.Race(pan, tap);
  }, [gs, next, offsetX, onInteraction, previous, progress, seek, swipe, toggle]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    strokeOpacity: progress.value > 0.002 ? 1 : 0,
  }));
  // Repouso: ⏮ ▶ ⏭. Arrastando: os três somem e o ícone da ação ocupa o centro.
  const iconsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offsetX.value }] }));
  const restStyle = useAnimatedStyle(() => {
    const k = Math.abs(swipe.value);
    return { opacity: 1 - k, transform: [{ scale: 1 - 0.25 * k }] };
  });
  const sideStyle = useAnimatedStyle(() => ({ opacity: o.sideIconOpacity * (1 - Math.abs(swipe.value)) }));
  const nextStyle = useAnimatedStyle(() => {
    const k = Math.max(0, swipe.value);
    return { opacity: k, transform: [{ scale: 0.75 + 0.25 * k }] };
  });
  const prevStyle = useAnimatedStyle(() => {
    const k = Math.max(0, -swipe.value);
    return { opacity: k, transform: [{ scale: 0.75 + 0.25 * k }] };
  });

  const position = scrub ?? now;
  const onAction = (e: AccessibilityActionEvent) => {
    const s = estimatePosition(usePlayerStore.getState());
    switch (e.nativeEvent.actionName) {
      case 'activate':
      case 'magicTap':
        void toggle();
        break;
      case 'increment':
        void seek(Math.min(duration, s + o.seekStepS));
        break;
      case 'decrement':
        void seek(Math.max(0, s - o.seekStepS));
        break;
      case 'next':
        void next();
        break;
      case 'previous':
        void previous();
        break;
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.time, { opacity: scrub != null ? 1 : 0 }]} pointerEvents="none">
        <Text style={[styles.timeText, { color }]}>
          {formatDuration(position * 1000)} / {formatDuration(duration * 1000)}
        </Text>
      </View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={styles.orb}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={playing ? 'Pausar' : 'Tocar'}
          accessibilityHint="Arraste para os lados para trocar de música; gire o dedo em volta do anel para avançar ou voltar"
          accessibilityValue={{ text: `${formatDuration(now * 1000)} de ${formatDuration(duration * 1000)}` }}
          accessibilityActions={[
            { name: 'activate', label: playing ? 'Pausar' : 'Tocar' },
            { name: 'magicTap' },
            { name: 'increment', label: `Avançar ${o.seekStepS} segundos` },
            { name: 'decrement', label: `Voltar ${o.seekStepS} segundos` },
            { name: 'next', label: 'Próxima' },
            { name: 'previous', label: 'Anterior' },
          ]}
          onAccessibilityAction={onAction}
        >
          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={color}
              strokeOpacity={0.22}
              strokeWidth={o.ringWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={color}
              strokeWidth={o.ringWidth}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              fill="none"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              animatedProps={ringProps}
            />
          </Svg>
          <Animated.View style={[styles.icons, iconsStyle]} pointerEvents="none">
            <Animated.View style={[styles.side, styles.sideLeft, sideStyle]}>
              <PreviousLineIcon color={color} size={SIDE_ICON} strokeWidth={2.4} />
            </Animated.View>
            <Animated.View style={[styles.side, styles.sideRight, sideStyle]}>
              <NextLineIcon color={color} size={SIDE_ICON} strokeWidth={2.4} />
            </Animated.View>
            <Animated.View style={[styles.centerIcon, restStyle]}>
              <Ionicons
                name={playing ? 'pause' : 'play'}
                size={MAIN_ICON}
                color={color}
                style={playing ? null : styles.playNudge}
              />
            </Animated.View>
            <Animated.View style={[styles.centerIcon, prevStyle]}>
              <PreviousLineIcon color={color} size={MAIN_ICON} />
            </Animated.View>
            <Animated.View style={[styles.centerIcon, nextStyle]}>
              <NextLineIcon color={color} size={MAIN_ICON} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  orb: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  playNudge: { marginLeft: 3 },
  icons: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  centerIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  side: { position: 'absolute', top: SIZE / 2 - SIDE_ICON / 2 },
  sideLeft: { left: SIZE / 2 - o.sideIconOffset - SIDE_ICON / 2 },
  sideRight: { left: SIZE / 2 + o.sideIconOffset - SIDE_ICON / 2 },
  time: { position: 'absolute', bottom: SIZE + 6, alignSelf: 'center' },
  timeText: { fontSize: 12, fontVariant: ['tabular-nums'], minWidth: 90, textAlign: 'center' },
});
