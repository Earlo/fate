export const defaultPalette = () => ({
  primary: '209 213 219',
  secondary: '156 163 175',
  tertiary: '107 114 128',
});

export const defaultGroupDimensions = () => ({ w: 3, h: 3 });

export const defaultStress = () => ({
  physical: { boxes: [false, false], visibleIn: [] as string[] },
  mental: { boxes: [false, false], visibleIn: [] as string[] },
});

export const defaultConsequences = () => ({
  mild: { name: '', visibleIn: [] as string[] },
  moderate: { name: '', visibleIn: [] as string[] },
  severe: { name: '', visibleIn: [] as string[] },
});

export const blankAspects = (count = 5) =>
  Array.from({ length: count }, () => ({
    name: '',
    visibleIn: [],
  }));
