import create from 'zustand';

export interface ChartStyles {
  height: number;
  colorScheme: 'default' | 'monochrome' | 'colorful';
}

interface ChartStyleStore {
  styles: ChartStyles;
  setStyles: (styles: Partial<ChartStyles>) => void;
}

export const useChartStyles = create<ChartStyleStore>((set) => ({
  styles: {
    height: 400,
    colorScheme: 'default',
  },
  setStyles: (newStyles) =>
    set((state) => ({
      styles: { ...state.styles, ...newStyles },
    })),
}));