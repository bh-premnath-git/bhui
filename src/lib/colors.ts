export const COLORS = [
    "var(--chart-1-color)",
    "var(--chart-2-color)",
    "var(--chart-3-color)",
    "var(--chart-4-color)",
    "var(--chart-5-color)",
  ]
  
  export const COLORS_WITH_OPACITY = COLORS.map((color) => ({
    stroke: color,
    fill: `${color}33`,
  }))
  
  