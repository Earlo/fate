export const createDefaultColorPalette = () => ({
  primary: '209 213 219',
  secondary: '156 163 175',
  tertiary: '107 114 128',
});

export const createBlankAspects = (count = 5) =>
  Array.from({ length: count }, () => ({
    name: '',
    visibleIn: [],
  }));
