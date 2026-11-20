import { useCallback, useEffect, useRef, useState } from 'react';

import { tuning } from '@/config/tuning';

/**
 * Esconde a interface depois de `hideUiAfterMs` sem toque.
 * `poke()` reexibe e reinicia a contagem. Com `hold` verdadeiro, nunca esconde.
 */
export function useAutoHide(hold: boolean, delayMs: number = tuning.ui.hideUiAfterMs) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (hold) return;
    timer.current = setTimeout(() => setVisible(false), delayMs);
  }, [hold, delayMs]);

  const poke = useCallback(() => {
    setVisible(true);
    schedule();
  }, [schedule]);

  useEffect(() => {
    if (hold) setVisible(true);
    schedule();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [hold, schedule]);

  return { visible, poke };
}
