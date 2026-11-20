import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { lastfmEnabled } from '@/services/lastfm/client';
import { useLibraryStore } from '@/state/library/sync';
import { useSessionStore } from '@/state/session';
import { colors } from '@/ui/theme';

import { MiniPlayerFooter } from './MiniPlayer';
import { TAB_LABELS, type LibraryRoute, type LibraryTab } from './routes';
import {
  AlbumDetail,
  AlbumsView,
  ArtistDetail,
  ArtistsView,
  FavoritesView,
  PlaylistDetail,
  PlaylistsView,
  SearchView,
  TracksView,
} from './views';

const TABS: LibraryTab[] = ['albums', 'tracks', 'artists', 'playlists', 'favorites'];

function AccountButton() {
  const userName = useSessionStore((s) => s.session?.userName);
  const signOut = useSessionStore((s) => s.signOut);
  const confirm = () =>
    Alert.alert(userName ?? 'Conta', 'Conectado ao brunoflix.', [
      ...(lastfmEnabled() ? [{ text: 'Last.fm', onPress: () => router.push('/lastfm') }] : []),
      {
        text: 'Sair da conta',
        style: 'destructive' as const,
        onPress: () =>
          Alert.alert('Sair?', 'A biblioteca local deste aparelho será apagada.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
          ]),
      },
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  return (
    <Pressable onPress={confirm} hitSlop={8} accessibilityRole="button" accessibilityLabel="Conta">
      <Ionicons name="person-circle-outline" size={28} color={colors.panelMuted} />
    </Pressable>
  );
}

function SyncBanner() {
  const progress = useLibraryStore((s) => s.progress);
  if (progress.phase === 'initial') {
    return (
      <Text style={styles.banner}>
        Sincronizando biblioteca… {progress.loaded} de {progress.total || '?'}
      </Text>
    );
  }
  if (progress.phase === 'error') {
    return <Text style={styles.banner}>Sem conexão com o servidor. Mostrando a biblioteca salva.</Text>;
  }
  return null;
}

interface Props {
  onChange?: (index: number) => void;
  /** Botão extra no mini player (ex.: favoritar). */
  miniPlayerExtra?: React.ReactNode;
  /** Conteúdo extra por faixa na lista de favoritos (ex.: coração). */
  renderFavoriteTrailing?: React.ComponentProps<typeof FavoritesView>['renderTrailing'];
}

/** Painel da biblioteca que sobe de baixo, com a galáxia visível atrás. */
export const LibrarySheet = forwardRef<BottomSheet, Props>(function LibrarySheet(
  { onChange, miniPlayerExtra, renderFavoriteTrailing },
  ref,
) {
  const snapPoints = useMemo(() => ['55%', '92%'], []);
  const [tab, setTab] = useState<LibraryTab>('albums');
  const [stack, setStack] = useState<LibraryRoute[]>([{ kind: 'tab' }]);
  const [query, setQuery] = useState('');
  const route = stack[stack.length - 1];

  const navigate = useCallback((r: LibraryRoute) => setStack((s) => [...s, r]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const selectTab = (t: LibraryTab) => {
    setTab(t);
    setStack([{ kind: 'tab' }]);
    setQuery('');
  };

  const searching = query.trim().length > 0 && route.kind === 'tab';

  let body: React.ReactNode;
  if (searching) body = <SearchView query={query} navigate={navigate} />;
  else if (route.kind === 'album') body = <AlbumDetail id={route.id} />;
  else if (route.kind === 'artist') body = <ArtistDetail id={route.id} navigate={navigate} />;
  else if (route.kind === 'playlist') body = <PlaylistDetail id={route.id} name={route.name} />;
  else if (tab === 'albums') body = <AlbumsView navigate={navigate} />;
  else if (tab === 'tracks') body = <TracksView />;
  else if (tab === 'artists') body = <ArtistsView navigate={navigate} />;
  else if (tab === 'playlists') body = <PlaylistsView navigate={navigate} />;
  else body = <FavoritesView renderTrailing={renderFavoriteTrailing} />;

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      onChange={onChange}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      keyboardBehavior="extend"
      footerComponent={(p) => <MiniPlayerFooter {...p} extra={miniPlayerExtra} />}
    >
      <BottomSheetView style={styles.header}>
        {route.kind !== 'tab' ? (
          <Pressable onPress={back} style={styles.back} hitSlop={8} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={20} color={colors.panelText} />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.searchRow}>
              <View style={styles.search}>
                <Ionicons name="search" size={16} color={colors.panelMuted} />
                <BottomSheetTextInput
                  style={styles.searchInput}
                  placeholder="Buscar música, álbum ou artista"
                  placeholderTextColor={colors.panelMuted}
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
              </View>
              <AccountButton />
            </View>
            {!searching ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                {TABS.map((t) => (
                  <Pressable key={t} onPress={() => selectTab(t)} style={styles.tab}>
                    <Text style={[styles.tabText, t === tab && styles.tabOn]}>{TAB_LABELS[t]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </>
        )}
        <SyncBanner />
      </BottomSheetView>
      <View style={styles.body}>{body}</View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  background: { backgroundColor: colors.panel, borderRadius: 22 },
  handle: { backgroundColor: 'rgba(0,0,0,0.2)', width: 40 },
  header: { paddingHorizontal: 16, paddingBottom: 4, gap: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.panelHairline,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, height: 38, fontSize: 15, color: colors.panelText },
  tabs: { gap: 18, paddingVertical: 4 },
  tab: { paddingVertical: 4 },
  tabText: { fontSize: 15, color: colors.panelMuted, fontWeight: '500' },
  tabOn: { color: colors.panelText, fontWeight: '700' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 6 },
  backText: { fontSize: 15, color: colors.panelText },
  banner: {
    fontSize: 12,
    color: colors.panelMuted,
    backgroundColor: colors.panelHairline,
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  body: { flex: 1 },
});
