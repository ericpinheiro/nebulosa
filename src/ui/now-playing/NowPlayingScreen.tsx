import { Ionicons } from '@expo/vector-icons';
import type BottomSheet from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
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
import { Controls } from './Controls';
import { ExpandedAlbum } from './ExpandedAlbum';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
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
  const sheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const coverColor = useCoverColor(current?.imageItemId, current?.imageTag);
  const { visible, poke } = useAutoHide(sheetOpen || expanded || interacting);

  const [top] = backgroundGradient(coverColor, tuning.ui.backgroundWhiteMix);
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
    <View style={styles.fill} onTouchStart={poke}>
      <Background color={coverColor} />

      <Animated.View style={[StyleSheet.absoluteFill, galaxyStyle]} pointerEvents={expanded ? 'none' : 'auto'}>
        <GalaxyView
          currentId={current?.id ?? null}
          {...galaxy}
          onTap={() => {
            poke();
            galaxy?.onTap?.();
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

        <View style={styles.center} pointerEvents="box-none">
          {expanded && current ? <ExpandedAlbum track={current} color={fg} onClose={() => setExpanded(false)} /> : null}
        </View>

        <Animated.View style={[styles.bottom, uiStyle]} pointerEvents={visible ? 'box-none' : 'none'}>
          {current ? (
            <>
              <ProgressBar color={fg} />
              <Controls color={fg} />
            </>
          ) : null}
          <Pressable
            onPress={openLibrary}
            style={({ pressed }) => [styles.libraryButton, { borderColor: fg, opacity: pressed ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Abrir biblioteca"
          >
            <Ionicons name="library-outline" size={22} color={fg} />
          </Pressable>
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
  bottom: { paddingHorizontal: 24, paddingBottom: 8, gap: 10, alignItems: 'stretch' },
  libraryButton: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 6,
  },
});
