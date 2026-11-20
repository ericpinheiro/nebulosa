/** Esfera que envolve a nuvem, nas coordenadas normalizadas dos dados. */
export interface BoundingSphere {
  center: [number, number, number];
  radius: number;
}

/** Centro = média dos pontos; raio = maior distância até ele. Nuvem vazia: origem e raio 1. */
export function boundingSphere(positions: Float32Array): BoundingSphere {
  const n = Math.floor(positions.length / 3);
  if (n === 0) return { center: [0, 0, 0], radius: 1 };
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let i = 0; i < n; i++) {
    cx += positions[i * 3];
    cy += positions[i * 3 + 1];
    cz += positions[i * 3 + 2];
  }
  cx /= n;
  cy /= n;
  cz /= n;
  let r2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = positions[i * 3] - cx;
    const dy = positions[i * 3 + 1] - cy;
    const dz = positions[i * 3 + 2] - cz;
    r2 = Math.max(r2, dx * dx + dy * dy + dz * dz);
  }
  return { center: [cx, cy, cz], radius: Math.max(Math.sqrt(r2), 1e-3) };
}
