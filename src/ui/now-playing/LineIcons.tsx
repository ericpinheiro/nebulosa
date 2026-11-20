import Svg, { Path } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
  strokeWidth?: number;
}

/** Biblioteca em traço fino: duas lombadas e uma inclinada. */
export function LibraryLineIcon({ color, size = 26, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4v16M9.5 4v16M14 4.6l4.6 15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Aleatório em traço fino: duas linhas cruzadas com pontas de seta. */
export function ShuffleLineIcon({ color, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7h3c4.5 0 6.5 10 11 10h3.5M3 17h3c4.5 0 6.5-10 11-10h3.5M18 4l3 3-3 3M18 14l3 3-3 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Próxima em traço fino: só a seta aberta (›). */
export function NextLineIcon({ color, size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5l7 7-7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Anterior em traço fino: só a seta aberta (‹). */
export function PreviousLineIcon({ color, size = 24, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5l-7 7 7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
