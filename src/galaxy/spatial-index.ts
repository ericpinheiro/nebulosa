/**
 * Índice espacial em grade uniforme para pontos em [-1, 1]^3.
 * Usado pelo rádio (vizinhos mais próximos) e pelas capas no zoom.
 */
export class SpatialIndex {
  private readonly cells = new Map<number, number[]>();
  private readonly res: number;

  constructor(
    private readonly positions: Float32Array,
    cellSize = 0.08,
  ) {
    this.res = Math.ceil(2 / cellSize);
    const n = positions.length / 3;
    for (let i = 0; i < n; i++) {
      const key = this.keyOf(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      let cell = this.cells.get(key);
      if (!cell) this.cells.set(key, (cell = []));
      cell.push(i);
    }
  }

  get size(): number {
    return this.positions.length / 3;
  }

  private coord(v: number): number {
    return Math.min(this.res - 1, Math.max(0, Math.floor(((v + 1) / 2) * this.res)));
  }

  private keyOf(x: number, y: number, z: number): number {
    return (this.coord(x) * this.res + this.coord(y)) * this.res + this.coord(z);
  }

  private dist2(i: number, x: number, y: number, z: number): number {
    const dx = this.positions[i * 3] - x;
    const dy = this.positions[i * 3 + 1] - y;
    const dz = this.positions[i * 3 + 2] - z;
    return dx * dx + dy * dy + dz * dz;
  }

  /** Índices dentro do raio, ordenados do mais perto ao mais longe. */
  withinRadius(x: number, y: number, z: number, radius: number): number[] {
    const r2 = radius * radius;
    const cx = this.coord(x);
    const cy = this.coord(y);
    const cz = this.coord(z);
    const span = Math.ceil((radius / 2) * this.res);
    const found: [number, number][] = [];
    for (let ix = Math.max(0, cx - span); ix <= Math.min(this.res - 1, cx + span); ix++) {
      for (let iy = Math.max(0, cy - span); iy <= Math.min(this.res - 1, cy + span); iy++) {
        for (let iz = Math.max(0, cz - span); iz <= Math.min(this.res - 1, cz + span); iz++) {
          const cell = this.cells.get((ix * this.res + iy) * this.res + iz);
          if (!cell) continue;
          for (const i of cell) {
            const d = this.dist2(i, x, y, z);
            if (d <= r2) found.push([i, d]);
          }
        }
      }
    }
    found.sort((a, b) => a[1] - b[1]);
    return found.map((f) => f[0]);
  }

  /** Os `k` vizinhos mais próximos do ponto, aumentando o raio até achar o suficiente. */
  nearest(x: number, y: number, z: number, k: number, exclude?: (i: number) => boolean): number[] {
    let radius = 2 / this.res;
    const max = this.size;
    while (true) {
      const hits = this.withinRadius(x, y, z, radius).filter((i) => !exclude?.(i));
      if (hits.length >= k || radius > 3.5 || hits.length >= max) return hits.slice(0, k);
      radius *= 1.6;
    }
  }
}
