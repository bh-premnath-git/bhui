import { ColorScheme } from '@/store/slices/dataops/dashboardSlice';

export const COLOR_PALETTES: Record<Exclude<ColorScheme, 'custom'>, string[]> = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'],
  viridis: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'],
  plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
  inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fba60a', '#fcffa4'],
  magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
  blues: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
  greens: ['#e5f5e0', '#a1d99b', '#74c476', '#31a354', '#006d2c'],
  reds: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
  rainbow: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'],
  sinebow: ['#ff3333', '#ff33ff', '#3333ff', '#33ffff', '#33ff33', '#ffff33'],
  turbo: ['#30123b', '#444ce6', '#29cebf', '#95d445', '#fee91f', '#ff5e4d'],
};

export const getColorPalette = (
  scheme: ColorScheme,
  customPalette?: string[]
): string[] => {
  if (scheme === 'custom') {
    return customPalette && customPalette.length > 0
      ? customPalette
      : COLOR_PALETTES.default;
  }
  return COLOR_PALETTES[scheme];
};