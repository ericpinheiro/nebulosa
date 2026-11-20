import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { imageUrl } from '@/services/player/urls';

interface Props {
  itemId: string | null | undefined;
  tag?: string | null;
  size: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Largura pedida ao servidor (padrão: 2x o tamanho). */
  requestWidth?: number;
}

/** Capa com cache em disco (expo-image) e placeholder neutro. */
export function Cover({ itemId, tag, size, radius = 6, style, requestWidth }: Props) {
  const uri = imageUrl(itemId, tag, requestWidth ?? Math.round(size * 2));
  return (
    <View style={[{ width: size, height: size, borderRadius: radius }, styles.box, style]}>
      {uri ? (
        <Image
          source={{ uri, cacheKey: `${itemId}:${tag ?? ''}:${requestWidth ?? Math.round(size * 2)}` }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="disk"
          transition={150}
          recyclingKey={itemId ?? undefined}
        />
      ) : (
        <Ionicons name="musical-notes" size={size * 0.4} color="rgba(0,0,0,0.25)" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
