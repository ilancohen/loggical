/**
 * Simplified universal color abstraction using kleur
 * Removes over-engineering while maintaining all current functionality
 */

import kleur from 'kleur';
import type { ColorLevelType } from '@/types/core.types';
import { ColorLevel } from '@/types/core.types';

export interface ColorFunction {
  (text: string, colorLevel?: ColorLevelType): string;
}

/**
 * Check if colors should be applied based on color level
 */
export const shouldApplyColors = (colorLevel?: ColorLevelType): boolean => {
  return colorLevel !== undefined && colorLevel !== ColorLevel.NONE;
};

// Simple helper to create color functions with colorLevel support
const createColorFunction = (colorFn: (text: string) => string): ColorFunction => {
  return (text: string, colorLevel?: ColorLevelType) =>
    shouldApplyColors(colorLevel) ? colorFn(text) : text;
};

// Create a function that can be chained with modifiers
const createChainableColorFunction = (colorFn: (text: string) => string) => {
  const fn = createColorFunction(colorFn) as ColorFunction & {
    dim: ColorFunction;
    bold: ColorFunction;
  };

  // Add chainable methods directly to the function
  fn.dim = createColorFunction((text: string) => kleur.dim(colorFn(text)));
  fn.bold = createColorFunction((text: string) => kleur.bold(colorFn(text)));

  return fn;
};

// Create dim function with special color combinations
const createDimFunction = () => {
  const fn = createColorFunction(kleur.dim) as ColorFunction & {
    dim: ColorFunction;
    cyan: ColorFunction;
    white: ColorFunction;
    bold: ColorFunction;
  };

  // Add the specific color combinations that are actually used
  fn.dim = createColorFunction(kleur.dim); // dim.dim = dim
  fn.cyan = createColorFunction((text: string) => kleur.dim(kleur.cyan(text)));
  fn.white = createColorFunction((text: string) => kleur.dim(kleur.white(text)));
  fn.bold = createColorFunction((text: string) => kleur.bold(kleur.dim(text)));

  return fn;
};

// Simplified color theme - just the colors you actually use
export const colors = {
  // Basic colors
  black: createColorFunction(kleur.black),
  red: createChainableColorFunction(kleur.red),
  green: createColorFunction(kleur.green),
  yellow: createChainableColorFunction(kleur.yellow),
  blue: createColorFunction(kleur.blue),
  magenta: createColorFunction(kleur.magenta),
  cyan: createChainableColorFunction(kleur.cyan),
  white: createChainableColorFunction(kleur.white),

  // Modifiers
  dim: createDimFunction(),
  bold: createColorFunction(kleur.bold),

  // Background colors
  bgRed: createColorFunction(kleur.bgRed),
  bgMagenta: createColorFunction(kleur.bgMagenta),
} as const;
