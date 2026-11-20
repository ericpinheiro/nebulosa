import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { toggleFavorite, useIsFavorite } from '@/state/favorites';
import { colors } from '@/ui/theme';

export function FavoriteButton({ id, color, size = 22 }: { id: string; color: string; size?: number }) {
  const fav = useIsFavorite(id);
  return (
    <Pressable
      hitSlop={8}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => undefined);
        void toggleFavorite(id);
      }}
      accessibilityRole="button"
      accessibilityLabel={fav ? 'Remover dos favoritos' : 'Favoritar'}
      style={{ padding: 4 }}
    >
      <Ionicons name={fav ? 'heart' : 'heart-outline'} size={size} color={fav ? colors.favorite : color} />
    </Pressable>
  );
}
