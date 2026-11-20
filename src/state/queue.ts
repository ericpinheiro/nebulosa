/**
 * Lógica pura da fila. A fila guarda os itens na ordem original da lista
 * e uma permutação `order` (identidade sem shuffle). `cursor` aponta para `order`.
 */
export interface QueueState<T> {
  items: T[];
  order: number[];
  cursor: number;
  shuffle: boolean;
}

export type Random = () => number;

export function emptyQueue<T>(): QueueState<T> {
  return { items: [], order: [], cursor: -1, shuffle: false };
}

function identity(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function shuffled(values: number[], random: Random): number[] {
  const a = values.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cria a fila a partir de uma lista e do índice tocado. */
export function createQueue<T>(
  items: T[],
  startIndex: number,
  shuffle: boolean,
  random: Random = Math.random,
): QueueState<T> {
  if (items.length === 0) return emptyQueue();
  const start = Math.min(Math.max(startIndex, 0), items.length - 1);
  if (!shuffle) return { items, order: identity(items.length), cursor: start, shuffle };
  const rest = shuffled(
    identity(items.length).filter((i) => i !== start),
    random,
  );
  return { items, order: [start, ...rest], cursor: 0, shuffle };
}

export function currentItem<T>(q: QueueState<T>): T | undefined {
  const idx = q.order[q.cursor];
  return idx == null ? undefined : q.items[idx];
}

/** Índice na lista original da faixa atual. */
export function currentIndex<T>(q: QueueState<T>): number {
  return q.order[q.cursor] ?? -1;
}

export function hasNext<T>(q: QueueState<T>): boolean {
  return q.cursor >= 0 && q.cursor < q.order.length - 1;
}

export function hasPrevious<T>(q: QueueState<T>): boolean {
  return q.cursor > 0;
}

export function next<T>(q: QueueState<T>): QueueState<T> {
  return hasNext(q) ? { ...q, cursor: q.cursor + 1 } : q;
}

export function previous<T>(q: QueueState<T>): QueueState<T> {
  return hasPrevious(q) ? { ...q, cursor: q.cursor - 1 } : q;
}

/** Os próximos `count` itens depois da atual (janela de pré-carregamento). */
export function upcoming<T>(q: QueueState<T>, count: number): T[] {
  return q.order.slice(q.cursor + 1, q.cursor + 1 + count).map((i) => q.items[i]);
}

/**
 * Liga/desliga shuffle mantendo a faixa atual.
 * Ligar: as já tocadas ficam para trás, o resto é embaralhado.
 * Desligar: volta à ordem original a partir da faixa atual.
 */
export function setShuffle<T>(q: QueueState<T>, on: boolean, random: Random = Math.random): QueueState<T> {
  if (q.shuffle === on || q.items.length === 0) return { ...q, shuffle: on };
  const cur = currentIndex(q);
  if (on) {
    const played = q.order.slice(0, q.cursor);
    const playedSet = new Set(played);
    const rest = shuffled(
      identity(q.items.length).filter((i) => i !== cur && !playedSet.has(i)),
      random,
    );
    return { ...q, shuffle: true, order: [...played, cur, ...rest], cursor: played.length };
  }
  return { ...q, shuffle: false, order: identity(q.items.length), cursor: cur };
}
