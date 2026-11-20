import type BottomSheet from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tuning } from '@/config/tuning';
import { usePlayerStore } from '@/state/player';
import { backgroundGradient, luminance } from '@/ui/color';
import { GalaxyView, type GalaxyViewProps } from '@/ui/galaxy/GalaxyView';
import { useAutoHide } from '@/ui/hooks/useAutoHide';
import { useCoverColor } from '@/ui/hooks/useCoverColor';
import { LibrarySheet } from '@/ui/library/LibrarySheet';

import { Background } from './Background';
import { ExpandedAlbum } from './ExpandedAlbum';
import { Header } from './Header';
import { LibraryLineIcon, ShuffleLineIcon } from './LineIcons';
import { OrbControl } from './OrbControl';
import { RadioButton } from './RadioButton';

export interface NowPlayingExtras {
  /** Props extras para a galáxia (rastro, pulsação, capas). */
  galaxy?: Partial<GalaxyViewProps>;
  /** Ações extras no cabeçalho (ex.: favoritar), recebendo a cor do texto. */
  headerAccessory?: (color: string) => React.ReactNode;
  miniPlayerExtra?: React.ReactNode;
  renderFavoriteTrailing?: React.ComponentProps<typeof LibrarySheet>['renderFavoriteTrailing'];
}

/** Tela principal: capa e título no topo, galáxia no centro, controles embaixo. */
export function NowPlayingScreen({
  galaxy,
  headerAccessory,
  miniPlayerExtra,
  renderFavoriteTrailing,
}: NowPlayingExtras) {
  const current = usePlayerStore((s) => s.current);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const sheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [orbActive, setOrbActive] = useState(false);
  const [screenH, setScreenH] = useState(0);
  const [free, setFree] = useState<{ y: number; height: number } | null>(null);
  const viewInsets = useMemo(
    () => (free && screenH > 0 ? { top: free.y, bottom: Math.max(0, screenH - free.y - free.height) } : undefined),
    [free, screenH],
  );
  const coverColor = useCoverColor(current?.imageItemId, current?.imageTag);
  const { visible, poke } = useAutoHide(sheetOpen || expanded || interacting || orbActive);

  const [top] = backgroundGradient(coverColor, tuning.ui.backgroundDarkMix);
  const fg = luminance(top) > 0.62 ? '#1d1d22' : '#ffffff';

  const uiOpacity = useSharedValue(1);
  useEffect(() => {
    uiOpacity.value = withTiming(visible ? 1 : 0, { duration: visible ? 200 : 700 });
  }, [visible, uiOpacity]);
  const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

  const galaxyOpacity = useSharedValue(1);
  useEffect(() => {
    galaxyOpacity.value = withTiming(expanded ? 0 : 1, { duration: 250 });
  }, [expanded, galaxyOpacity]);
  const galaxyStyle = useAnimatedStyle(() => ({ opacity: galaxyOpacity.value }));

  // Sem música, não há o que expandir.
  useEffect(() => {
    if (!current) setExpanded(false);
  }, [current]);

  const openLibrary = () => {
    poke();
    sheetRef.current?.snapToIndex(0);
  };

  return (
    <View style={styles.fill} onTouchStart={poke} onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}>
      <Background color={coverColor} />

      <Animated.View style={[StyleSheet.absoluteFill, galaxyStyle]} pointerEvents={expanded ? 'none' : 'auto'}>
        <GalaxyView
          currentId={current?.id ?? null}
          {...galaxy}
          viewInsets={viewInsets}
          onTap={(x, y) => {
            poke();
            galaxy?.onTap?.(x, y);
          }}
          onInteraction={setInteracting}
        />
      </Animated.View>

      <SafeAreaView style={styles.fill} pointerEvents="box-none">
        <Animated.View style={[styles.top, uiStyle]} pointerEvents={visible ? 'box-none' : 'none'}>
          {current ? (
            <View style={styles.headerRow}>
              <View style={styles.fill}>
                <Header track={current} color={fg} coverHidden={expanded} onCoverPress={() => setExpanded((e) => !e)} />
              </View>
              {headerAccessory?.(fg)}
              <RadioButton color={fg} />
            </View>
          ) : null}
        </Animated.View>

        <View
          style={styles.center}
          pointerEvents="box-none"
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            setFree((f) => (f && f.y === y && f.height === height ? f : { y, height }));
          }}
        >
          {expanded && current ? <ExpandedAlbum track={current} color={fg} onClose={() => setExpanded(false)} /> : null}
        </View>

        <Animated.View style={[styles.bottom, uiStyle]} pointerEvents={visible ? 'box-none' : 'none'}>
          <View style={styles.side}>
            <Pressable
              onPress={openLibrary}
              hitSlop={10}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Abrir biblioteca"
            >
              <LibraryLineIcon color={fg} />
            </Pressable>
          </View>
          <View style={styles.middle}>{current ? <OrbControl color={fg} onInteraction={setOrbActive} /> : null}</View>
          <View style={styles.side}>
            {current ? (
              <Pressable
                onPress={() => void toggleShuffle()}
                hitSlop={10}
                style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : shuffle ? 1 : 0.4 }]}
                accessibilityRole="switch"
                accessibilityState={{ checked: shuffle }}
                accessibilityLabel="Aleatório"
              >
                <ShuffleLineIcon color={fg} />
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </SafeAreaView>

      <LibrarySheet
        ref={sheetRef}
        onChange={(i) => setSheetOpen(i >= 0)}
        miniPlayerExtra={miniPlayerExtra}
        renderFavoriteTrailing={renderFavoriteTrailing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { paddingHorizontal: 20, paddingTop: 8, minHeight: 64 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  center: { flex: 1 },
  bottom: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  side: { flex: 1, alignItems: 'center' },
  middle: {
    width: tuning.ui.orb.size + 64,
    height: tuning.ui.orb.size,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
