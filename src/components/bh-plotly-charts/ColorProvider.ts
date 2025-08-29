
import { IColorProvider, ColorScheme } from "@/types/plotly/systemtype";

export class ColorProvider implements IColorProvider {
    private schemes = {
      default: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      viridis: ['#440154', '#31688e', '#35b779', '#fde725'],
      plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89441'],
      blues: ['#08519c', '#3182bd', '#6baed6', '#c6dbef'],
      greens: ['#00441b', '#238b45', '#66c2a4', '#b2e2e2']
    };
    
    getColors(scheme: ColorScheme, customColor = '#667eea'): string[] {
      if (scheme === 'custom') {
        return [customColor, customColor + 'CC', customColor + '99', customColor + '66'];
      }
      return this.schemes[scheme] || this.schemes.default;
    }
  }