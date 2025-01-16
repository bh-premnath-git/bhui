export const useColorScheme = () => {
  const getColorSchemeColors = (scheme: string) => {
    switch (scheme) {
      case 'monochrome':
        return ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
      case 'colorful':
        return ['#ef4444', '#f59e0b', '#10b981', '#6366f1'];
      default:
        return ['#2563eb', '#16a34a', '#dc2626', '#ca8a04'];
    }
  };

  return { getColorSchemeColors };
};