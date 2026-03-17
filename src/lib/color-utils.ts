/**
 * Convert a hex color (e.g. "#FFD700") to an rgba() string with the given alpha.
 * Falls back to the original value if parsing fails.
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Strip leading #
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) {
    return hex; // not a valid hex color, return as-is
  }

  let r: number, g: number, b: number;

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
