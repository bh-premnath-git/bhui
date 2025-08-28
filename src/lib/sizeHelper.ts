/**
 * Supported size unit types
 */
type SizeUnit = 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax';

/**
 * Size value can be number (pixels), string with unit, or CSS calc expression
 */
type SizeValue = number | string;

/**
 * Configuration for size conversion context
 */
interface SizeContext {
  containerSize: number;
  fontSize?: number; // for rem/em calculations (default: 16)
  viewportWidth?: number; // for vw calculations
  viewportHeight?: number; // for vh calculations
}

/**
 * Enhanced size conversion with support for multiple units and caching
 */
export const sizeToPixels = (() => {
  const cache = new Map<string, number>();
  const maxCacheSize = 100;

  return (size: SizeValue, context: SizeContext): number => {
    if (typeof size === 'number') {
      return Math.max(0, size);
    }

    const sizeStr = size.toString().trim();
    if (!sizeStr) return 0;

    // Create cache key
    const cacheKey = `${sizeStr}-${context.containerSize}-${context.fontSize || 16}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    let result: number;

    // Handle CSS calc() expressions
    if (sizeStr.includes('calc(')) {
      result = evaluateCalcExpression(sizeStr, context);
    } else {
      result = parseSimpleSize(sizeStr, context);
    }

    // Cache management
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(cacheKey, result);
    return result;
  };
})();

/**
 * Parse simple size values (no calc)
 */
const parseSimpleSize = (sizeStr: string, context: SizeContext): number => {
  const { containerSize, fontSize = 16, viewportWidth = 1920, viewportHeight = 1080 } = context;

  // Extract number and unit
  const match = sizeStr.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  if (!match) {
    console.warn(`Invalid size format: ${sizeStr}`);
    return 0;
  }

  const [, valueStr, unitRaw] = match;
  const value = parseFloat(valueStr);
 
  if (isNaN(value)) return 0;

  // Normalize empty unit to 'px' so switch only handles valid SizeUnit values
  const unit = (unitRaw === '' ? 'px' : unitRaw) as SizeUnit;

  switch (unit) {
    case 'px':
      return Math.max(0, value);
    
    case '%':
      return Math.max(0, Math.round(containerSize * (value / 100)));
    
    case 'rem':
      return Math.max(0, value * fontSize);
    
    case 'em':
      return Math.max(0, value * fontSize);
    
    case 'vw':
      return Math.max(0, Math.round(viewportWidth * (value / 100)));
    
    case 'vh':
      return Math.max(0, Math.round(viewportHeight * (value / 100)));
    
    case 'vmin':
      return Math.max(0, Math.round(Math.min(viewportWidth, viewportHeight) * (value / 100)));
    
    case 'vmax':
      return Math.max(0, Math.round(Math.max(viewportWidth, viewportHeight) * (value / 100)));
    
    default:
      console.warn(`Unsupported unit: ${unit}`);
      return Math.max(0, value);
  }
};

/**
 * Basic calc() expression evaluator
 * Supports +, -, *, / with different units
 */
const evaluateCalcExpression = (expr: string, context: SizeContext): number => {
  // Remove calc() wrapper and whitespace
  const cleaned = expr.replace(/calc\(|\)/g, '').replace(/\s+/g, '');
  
  // Simple expression parser for basic operations
  // This is a simplified version - for production, consider using a proper expression parser
  try {
    // Replace size values with pixel equivalents
    const processed = cleaned.replace(/(-?\d*\.?\d+)([a-z%]*)/gi, (match, value, unit) => {
      const pixelValue = parseSimpleSize(value + unit, context);
      return pixelValue.toString();
    });

    // Evaluate the mathematical expression
    // Note: In production, use a safer expression evaluator
    return Math.max(0, Function(`"use strict"; return (${processed})`)());
  } catch (error) {
    console.error(`Error evaluating calc expression: ${expr}`, error);
    return 0;
  }
};

/**
 * Enhanced easing functions with additional curves
 */
export const easingFunctions = {
  // Existing
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  // Additional common easing functions
  easeInQuad: (t: number): number => t * t,
  
  easeOutQuad: (t: number): number => 1 - (1 - t) * (1 - t),
  
  easeInOutQuad: (t: number): number => 
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  easeInCubic: (t: number): number => t * t * t,
  
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  
  // Bounce easing
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  
  // Elastic easing
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : 
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

/**
 * Backward compatibility - keep original function name
 */
export const easeInOutCubic = easingFunctions.easeInOutCubic;

/**
 * Enhanced layout configuration with responsive breakpoints
 */
export interface LayoutConfig {
  sizes: SizeValue[];
  breakpoints?: {
    mobile?: SizeValue[];
    tablet?: SizeValue[];
    desktop?: SizeValue[];
  };
  gap?: SizeValue;
  minSize?: SizeValue;
  maxSize?: SizeValue;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  sizes: ['230px', 'auto'],
  breakpoints: {
    mobile: ['100%'],
    tablet: ['200px', 'auto'],
    desktop: ['230px', 'auto']
  },
  gap: '16px'
};

/**
 * Responsive layout calculator
 */
export const calculateResponsiveLayout = (
  config: LayoutConfig,
  containerSize: number,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): number[] => {
  const sizes = config.breakpoints?.[breakpoint] || config.sizes;
  const context: SizeContext = { containerSize };
  
  return sizes.map(size => sizeToPixels(size, context));
};

/**
 * Utility for creating size contexts
 */
export const createSizeContext = (
  containerSize: number,
  options?: Partial<Omit<SizeContext, 'containerSize'>>
): SizeContext => ({
  containerSize,
  fontSize: 16,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  ...options
});

/**
 * Type guards and validation
 */
export const isSizeValue = (value: unknown): value is SizeValue => {
  return typeof value === 'number' || typeof value === 'string';
};

export const validateSize = (size: SizeValue): boolean => {
  if (typeof size === 'number') {
    return !isNaN(size) && isFinite(size);
  }
  
  if (typeof size === 'string') {
    const trimmed = size.trim();
    return trimmed.length > 0 && /^(-?\d*\.?\d+)([a-z%]*|calc\(.+\))$/i.test(trimmed);
  }
  
  return false;
};