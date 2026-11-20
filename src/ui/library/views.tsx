import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlaySource } from '@/state/player';
import { usePlayerStore } from '@/state/player';
import { toPlayerTrack } from '@/state/player-track';
import type { AlbumRow, TrackRow, TrackSort } from '@/state/library/types';
import { Cover } from '@/ui/components/Cover';
import { formatDuration } from '@/ui/color';
import {
  useAlbum,
  useAlbumTracks,
  useAlbums,
  useArtist,
  useArtistAlbums,
  useArtists,
  useFavoriteTracks,
  useHasGenres,
  usePlaylists,
  usePlaylistTracks,
  useSearch,
  useTracks,
} from '@/ui/hooks/useLibrary';
import { colors } from '@/ui/theme';

import type { LibraryRoute } from './routes';
import { AlbumTile, ArtistItem, Empty, PlaylistItem, SectionTitle, TrackItem } from './rows';
import { SheetList } from './SheetList';

type Navigate = (route: LibraryRoute) => void;

/** Toca a faixa `index` e enfileira o resto da lista na ordem exibida. */
function usePlayFrom(source: PlaySource) {
  const playList = usePlayerStore((s) => s.playList);
  return (tracks: TrackRow[], index: number) => void playList(tracks.map(toPlayerTrack), index, source);
}

function useCurrentId() {
  return usePlayerStore((s) => s.current?.id ?? null);
}

// ---------- abas ----------

export function AlbumsView({ navigate }: { navigate: Navigate }) {
  const { data = [] } = useAlbums();
  return (
    <SheetList
      data={data}
      numColumns={3}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => <AlbumTile album={item} onPress={() => navigate({ kind: 'album', id: item.id })} />}
      ListEmptyComponent={<Empty>Nenhum álbum ainda</Empty>}
    />
  );
}

const SORT_LABELS: Record<TrackSort, string> = { name: 'A–Z', album: 'Álbum', genre: 'Gênero' };

export function TracksView() {
  const [sort, setSort] = useState<TrackSort>('name');
  const { data: hasGenres } = useHasGenres();
  const { data = [] } = useTracks(sort);
  const play = usePlayFrom({ kind: 'tracks' });
  const currentId = useCurrentId();
  const sorts: TrackSort[] = hasGenres ? ['name', 'album', 'genre'] : ['name', 'album'];
  return (
    <SheetList
      data={data}
      keyExtractor={(t) => t.id}
      extraData={currentId}
      ListHeaderComponent={
        <View style={styles.chips}>
          {sorts.map((s) => (
            <Pressable key={s} onPress={() => setSort(s)} style={[styles.chip, sort === s && styles.chipOn]}>
              <Text style={[styles.chipText, sort === s && styles.chipTextOn]}>{SORT_LABELS[s]}</Text>
            </Pressable>
          ))}
          <Text style={styles.count}>{data.length} músicas</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <TrackItem track={item} active={item.id === currentId} onPress={() => play(data, index)} />
      )}
      ListEmptyComponent={<Empty>Nenhuma música ainda</Empty>}
    />
  );
}

export function ArtistsView({ navigate }: { navigate: Navigate }) {
  const { data = [] } = useArtists();
  return (
    <SheetList
      data={data}
      keyExtractor={(a) => a.id}
      renderItem={({ item }) => <ArtistItem artist={item} onPress={() => navigate({ kind: 'artist', id: item.id })} />}
      ListEmptyComponent={<Empty>Nenhum artista ainda</Empty>}
    />
  );
}

export function PlaylistsView({ navigate }: { navigate: Navigate }) {
  const { data = [] } = usePlaylists();
  return (
    <SheetList
      data={data}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <PlaylistItem playlist={item} onPress={() => navigate({ kind: 'playlist', id: item.id, name: item.name })} />
      )}
      ListEmptyComponent={<Empty>Nenhuma playlist</Empty>}
    />
  );
}

export function FavoritesView({ renderTrailing }: { renderTrailing?: (t: TrackRow) => React.ReactNode }) {
  const { data = [] } = useFavoriteTracks();
  const play = usePlayFrom({ kind: 'favorites' });
  const currentId = useCurrentId();
  return (
    <SheetList
      data={data}
      keyExtractor={(t) => t.id}
      extraData={currentId}
      renderItem={({ item, index }) => (
        <TrackItem
          track={item}
          active={item.id === currentId}
          onPress={() => play(data, index)}
          trailing={renderTrailing?.(item)}
        />
      )}
      ListEmptyComponent={<Empty>Nenhum favorito ainda</Empty>}
    />
  );
}

// ---------- detalhes ----------

function DetailHeader({ album, onPlay }: { album: AlbumRow; onPlay: () => void }) {
  return (
    <View style={styles.detailHeader}>
      <Cover itemId={album.id} tag={album.imageTag} size={140} radius={12} requestWidth={400} />
      <View style={styles.detailTexts}>
        <Text style={styles.detailTitle} numberOfLines={3}>
          {album.name}
        </Text>
        <Text style={styles.detailSub} numberOfLines={1}>
          {album.albumArtist}
        </Text>
        {album.year ? <Text style={styles.detailSub}>{album.year}</Text> : null}
        <Pressable
          style={styles.playButton}
          onPress={onPlay}
          accessibilityRole="button"
          accessibilityLabel="Tocar álbum"
        >
          <Ionicons name="play" size={18} color={colors.panel} />
          <Text style={styles.playText}>Tocar</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function AlbumDetail({ id }: { id: string }) {
  const { data: album } = useAlbum(id);
  const { data: tracks = [] } = useAlbumTracks(id);
  const play = usePlayFrom({ kind: 'album', id });
  const currentId = useCurrentId();
  const total = tracks.reduce((acc, t) => acc + t.durationMs, 0);
  return (
    <SheetList
      data={tracks}
      keyExtractor={(t) => t.id}
      extraData={currentId}
      ListHeaderComponent={
        album ? (
          <View>
            <DetailHeader album={album} onPlay={() => play(tracks, 0)} />
            <Text style={styles.summary}>
              {tracks.length} faixas · {formatDuration(total)}
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <TrackItem track={item} showCover={false} active={item.id === currentId} onPress={() => play(tracks, index)} />
      )}
    />
  );
}

export function ArtistDetail({ id, navigate }: { id: string; navigate: Navigate }) {
  const { data: artist } = useArtist(id);
  const { data = [] } = useArtistAlbums(id);
  return (
    <SheetList
      data={data}
      numColumns={3}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      ListHeaderComponent={<Text style={styles.bigTitle}>{artist?.name ?? ''}</Text>}
      renderItem={({ item }) => <AlbumTile album={item} onPress={() => navigate({ kind: 'album', id: item.id })} />}
      ListEmptyComponent={<Empty>Nenhum álbum deste artista</Empty>}
    />
  );
}

export function PlaylistDetail({ id, name }: { id: string; name: string }) {
  const { data = [], isLoading, isError } = usePlaylistTracks(id);
  const play = usePlayFrom({ kind: 'playlist', id });
  const currentId = useCurrentId();
  return (
    <SheetList
      data={data}
      keyExtractor={(t, i) => `${t.id}:${i}`}
      extraData={currentId}
      ListHeaderComponent={<Text style={styles.bigTitle}>{name}</Text>}
      renderItem={({ item, index }) => (
        <TrackItem track={item} active={item.id === currentId} onPress={() => play(data, index)} />
      )}
      ListEmptyComponent={
        <Empty>{isLoading ? 'Carregando…' : isError ? 'Não foi possível abrir a playlist' : 'Playlist vazia'}</Empty>
      }
    />
  );
}

// ---------- busca ----------

type SearchItem =
  | { type: 'section'; title: string }
  | { type: 'artist'; artist: import('@/state/library/types').ArtistRow }
  | { type: 'album'; album: AlbumRow }
  | { type: 'track'; track: TrackRow; index: number };

export function SearchView({ query, navigate }: { query: string; navigate: Navigate }) {
  const { data } = useSearch(query);
  const play = usePlayFrom({ kind: 'search' });
  const currentId = useCurrentId();
  const items: SearchItem[] = [];
  if (data?.artists.length) {
    items.push({ type: 'section', title: 'Artistas' });
    data.artists.slice(0, 8).forEach((artist) => items.push({ type: 'artist', artist }));
  }
  if (data?.albums.length) {
    items.push({ type: 'section', title: 'Álbuns' });
    data.albums.slice(0, 12).forEach((album) => items.push({ type: 'album', album }));
  }
  if (data?.tracks.length) {
    items.push({ type: 'section', title: 'Músicas' });
    data.tracks.forEach((track, index) => items.push({ type: 'track', track, index }));
  }
  const tracks = data?.tracks ?? [];
  return (
    <SheetList
      data={items}
      extraData={currentId}
      keyExtractor={(it, i) => (it.type === 'section' ? `s:${it.title}` : `${it.type}:${i}`)}
      getItemType={(it) => it.type}
      renderItem={({ item }) => {
        switch (item.type) {
          case 'section':
            return <SectionTitle>{item.title}</SectionTitle>;
          case 'artist':
            return <ArtistItem artist={item.artist} onPress={() => navigate({ kind: 'artist', id: item.artist.id })} />;
          case 'album':
            return (
              <Pressable style={styles.albumRow} onPress={() => navigate({ kind: 'album', id: item.album.id })}>
                <Cover itemId={item.album.id} tag={item.album.imageTag} size={44} radius={8} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.albumName} numberOfLines={1}>
                    {item.album.name}
                  </Text>
                  <Text style={styles.albumArtist} numberOfLines={1}>
                    {item.album.albumArtist}
                  </Text>
                </View>
              </Pressable>
            );
          case 'track':
            return (
              <TrackItem
                track={item.track}
                active={item.track.id === currentId}
                onPress={() => play(tracks, item.index)}
              />
            );
        }
      }}
      ListEmptyComponent={data ? <Empty>Nada encontrado</Empty> : null}
    />
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.panelHairline },
  chipOn: { backgroundColor: colors.accent },
  chipText: { fontSize: 13, color: colors.panelText },
  chipTextOn: { color: colors.panel, fontWeight: '600' },
  count: { marginLeft: 'auto', fontSize: 12, color: colors.panelMuted },
  detailHeader: { flexDirection: 'row', gap: 16, padding: 16, alignItems: 'flex-end' },
  detailTexts: { flex: 1, gap: 2 },
  detailTitle: { fontSize: 20, fontWeight: '700', color: colors.panelText },
  detailSub: { fontSize: 14, color: colors.panelMuted },
  playButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  playText: { color: colors.panel, fontWeight: '600' },
  summary: { fontSize: 12, color: colors.panelMuted, paddingHorizontal: 16, paddingBottom: 8 },
  bigTitle: { fontSize: 22, fontWeight: '700', color: colors.panelText, padding: 16 },
  albumRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 16 },
  albumName: { fontSize: 15, color: colors.panelText, fontWeight: '500' },
  albumArtist: { fontSize: 12, color: colors.panelMuted, marginTop: 2 },
});
