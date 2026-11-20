import { usePlayerStore } from '@/state/player';
import { startRadio } from '@/state/radio';
import { FavoriteButton } from '@/ui/components/FavoriteButton';
import { colors } from '@/ui/theme';
import { SESSION_EPOCH } from '@/ui/galaxy/epoch';
import { useGalaxyCovers } from '@/ui/galaxy/GalaxyCovers';
import { useBeat } from '@/ui/galaxy/useBeat';
import { useTrail } from '@/ui/galaxy/useTrail';
import { NowPlayingScreen } from '@/ui/now-playing/NowPlayingScreen';

export default function MainScreen() {
  const played = useTrail(SESSION_EPOCH);
  const getBeat = useBeat();
  // Toque na galáxia acha a capa pela posição; 2º toque numa capa: toca a música com as vizinhas na fila (rádio).
  const covers = useGalaxyCovers((id) => void startRadio(id));
  const currentId = usePlayerStore((s) => s.current?.id);

  return (
    <NowPlayingScreen
      galaxy={{
        played,
        epoch: SESSION_EPOCH,
        getBeat,
        onFrame: covers.onFrame,
        onTap: covers.handleTap,
        children: covers.element,
      }}
      headerAccessory={(fg) => (currentId ? <FavoriteButton id={currentId} color={fg} /> : null)}
      miniPlayerExtra={currentId ? <FavoriteButton id={currentId} color={colors.panelText} /> : null}
      renderFavoriteTrailing={(t) => <FavoriteButton id={t.id} color={colors.panelMuted} size={20} />}
    />
  );
}
