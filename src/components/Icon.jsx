const PATHS = {
  search: ['M11 11 L16 16', 'M7.5 12.5 a5 5 0 1 0 0 -10 a5 5 0 0 0 0 10'],
  close: ['M5 5 L15 15', 'M15 5 L5 15'],
  chevronLeft: ['M12.5 4 L6.5 10 L12.5 16'],
  chevronRight: ['M7.5 4 L13.5 10 L7.5 16'],
  chevronDown: ['M4 7.5 L10 13.5 L16 7.5'],
  chevronUp: ['M4 12.5 L10 6.5 L16 12.5'],
  arrowRight: ['M4 10 L16 10', 'M11 5 L16 10 L11 15'],
  arrowLeft: ['M16 10 L4 10', 'M9 5 L4 10 L9 15'],
  play: ['M7 4.5 L16 10 L7 15.5 Z'],
  pause: ['M6.5 4.5 V15.5', 'M13.5 4.5 V15.5'],
  skip: ['M5 4.5 L13 10 L5 15.5 Z', 'M15.5 4.5 V15.5'],
  volume: ['M4 8 H7 L11 4.5 V15.5 L7 12 H4 Z', 'M14 7.5 a4 4 0 0 1 0 5'],
  mute: ['M4 8 H7 L11 4.5 V15.5 L7 12 H4 Z', 'M13.5 7.5 L17 11', 'M17 7.5 L13.5 11'],
  fullscreen: ['M4 8 V4 H8', 'M16 8 V4 H12', 'M4 12 V16 H8', 'M16 12 V16 H12'],
  exitFullscreen: ['M8 4 V8 H4', 'M12 4 V8 H16', 'M8 16 V12 H4', 'M12 16 V12 H16'],
  settings: ['M10 12.5 a2.5 2.5 0 1 0 0 -5 a2.5 2.5 0 0 0 0 5', 'M10 3.2 L11 5.1 L13.2 4.6 L14.1 6.6 L16.2 7.4 L15.9 9.6 L17 11.6 L15.4 13.1 L15 15.3 L12.8 15.4 L11.6 17.2 L9.7 16.2 L7.7 16.9 L6.5 15.1 L4.3 14.6 L4.5 12.4 L3.2 10.6 L4.6 8.9 L4.8 6.7 L7 6.4 L8 4.5 Z'],
  list: ['M4 6 H16', 'M4 10 H16', 'M4 14 H16'],
  graph: ['M5 14.5 L9 7 L13 11 L16 5', 'M4 15.5 a1.6 1.6 0 1 0 0.1 0', 'M9 7 a1.6 1.6 0 1 0 0.1 0', 'M13 11 a1.6 1.6 0 1 0 0.1 0', 'M16 5 a1.6 1.6 0 1 0 0.1 0'],
  map: ['M3.5 5.5 L8 4 L12 5.5 L16.5 4 V14.5 L12 16 L8 14.5 L3.5 16 Z', 'M8 4 V14.5', 'M12 5.5 V16'],
  user: ['M10 10 a3 3 0 1 0 0 -6 a3 3 0 0 0 0 6', 'M4 16.5 Q5 11.5 10 11.5 Q15 11.5 16 16.5'],
  grid: ['M3.5 3.5 H9 V9 H3.5 Z', 'M11 3.5 H16.5 V9 H11 Z', 'M3.5 11 H9 V16.5 H3.5 Z', 'M11 11 H16.5 V16.5 H11 Z'],
  external: ['M9 4 H4 V16 H16 V11', 'M11 4 H16 V9', 'M16 4 L8 12'],
  lock: ['M5.5 9 H14.5 V16 H5.5 Z', 'M7.5 9 V6.5 a2.5 2.5 0 0 1 5 0 V9'],
  eye: ['M2.5 10 Q10 3.5 17.5 10 Q10 16.5 2.5 10 Z', 'M10 12.2 a2.2 2.2 0 1 0 0 -4.4 a2.2 2.2 0 0 0 0 4.4'],
  eyeOff: ['M3 17 L17 3', 'M6.5 6.8 Q3 8.8 2.5 10 Q10 16.5 17.5 10 Q16 8.3 13.8 7.4'],
  book: ['M10 5.5 Q6 3.8 3.5 5 V15.5 Q6 14.3 10 16 Q14 14.3 16.5 15.5 V5 Q14 3.8 10 5.5 Z', 'M10 5.5 V16'],
  check: ['M4 10.5 L8 14.5 L16 5.5'],
  plus: ['M10 4 V16', 'M4 10 H16'],
  minus: ['M4 10 H16'],
  reset: ['M4 10 a6 6 0 1 1 2 4.5', 'M4 5.5 V10 H8.5'],
  info: ['M10 17 a7 7 0 1 0 0 -14 a7 7 0 0 0 0 14', 'M10 9 V14', 'M10 6.2 V6.6'],
  clock: ['M10 17 a7 7 0 1 0 0 -14 a7 7 0 0 0 0 14', 'M10 6 V10.5 L13 12'],
  pin: ['M10 17 Q16 10.5 16 7.5 a6 6 0 1 0 -12 0 Q4 10.5 10 17', 'M10 9 a1.6 1.6 0 1 0 0 -3.2 a1.6 1.6 0 0 0 0 3.2'],
  layers: ['M10 3 L17 7 L10 11 L3 7 Z', 'M3 10.5 L10 14.5 L17 10.5'],
  music: ['M7 14.5 a2 2 0 1 0 0 -4 a2 2 0 0 0 0 4', 'M9 12.5 V4.5 L16 3 V11.5', 'M14 13.5 a2 2 0 1 0 0 -4 a2 2 0 0 0 0 4'],
  image: ['M3.5 4.5 H16.5 V15.5 H3.5 Z', 'M3.5 12 L7.5 8 L11 11.5 L13 9.5 L16.5 13', 'M13 7 a1 1 0 1 0 0 -2 a1 1 0 0 0 0 2'],
  filter: ['M3 5 H17', 'M5.5 10 H14.5', 'M8 15 H12'],
  bookmark: ['M6 3.5 H14 V17 L10 13.8 L6 17 Z'],
  doc: ['M5 3.5 H12 L15 6.5 V16.5 H5 Z', 'M12 3.5 V6.5 H15', 'M7.5 9.5 H12.5', 'M7.5 12 H12.5'],
  fullscreenExit: ['M8 4 V8 H4', 'M12 4 V8 H16', 'M8 16 V12 H4', 'M12 16 V12 H16'],
  drop: ['M10 3 Q15 9 15 12 a5 5 0 0 1 -10 0 Q5 9 10 3 Z'],
  spark: ['M10 3 V17', 'M3 10 H17', 'M5.5 5.5 L14.5 14.5', 'M14.5 5.5 L5.5 14.5'],
  menu: ['M3 6 H17', 'M3 10 H17', 'M3 14 H17'],
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.5, ...rest }) {
  const paths = PATHS[name]
  if (!paths) return null
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
