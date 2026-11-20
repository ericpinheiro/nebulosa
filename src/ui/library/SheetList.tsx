import { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet';
import { FlashList, type FlashListProps } from '@shopify/flash-list';

/** FlashList integrada ao gesto do painel (rolar a lista vs. arrastar o painel). */
export function SheetList<T>(props: Omit<FlashListProps<T>, 'renderScrollComponent'>) {
  const scrollable = useBottomSheetScrollableCreator({ enableFooterMarginAdjustment: true });
  return (
    <FlashList<T>
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}
      renderScrollComponent={scrollable as never}
      contentContainerStyle={{ paddingBottom: 96, ...(props.contentContainerStyle as object) }}
    />
  );
}
