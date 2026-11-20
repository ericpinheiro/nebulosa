/** Paleta clara e suave inspirada na referência (estudo/ref-aura-galaxia.png). */
export const colors = {
  background: '#cfcfd2',
  backgroundTop: '#a9a9ad',
  backgroundBottom: '#dcdcdf',
  text: '#ffffff',
  textOnLight: '#1d1d22',
  textMuted: 'rgba(255,255,255,0.72)',
  textMutedOnLight: 'rgba(29,29,34,0.6)',
  hairline: 'rgba(255,255,255,0.35)',
  control: 'rgba(255,255,255,0.92)',
  panel: '#f5f5f7',
  panelText: '#18181b',
  panelMuted: '#6b6b73',
  panelHairline: 'rgba(0,0,0,0.08)',
  accent: '#1d1d22',
  danger: '#c0392b',
  favorite: '#e0457b',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  brand: { fontSize: 13, letterSpacing: 6, fontWeight: '500' as const },
  title: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15 },
  caption: { fontSize: 12 },
};
