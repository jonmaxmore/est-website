/**
 * Convert hex color to rgba string
 * Handles both #RGB and #RRGGBB formats
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  // Remove # prefix
  let h = hex.replace('#', '');

  // Handle shorthand (#RGB -> #RRGGBB)
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(255, 215, 0, ${alpha})`; // fallback gold
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Darken a hex color by a percentage
 */
export function darkenHex(hex: string, percent: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  const r = Math.max(0, Math.floor(parseInt(h.substring(0, 2), 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(parseInt(h.substring(2, 4), 16) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor(parseInt(h.substring(4, 6), 16) * (1 - percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
