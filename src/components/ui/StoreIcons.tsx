import React from 'react';
import { Sword, Target, Sparkles, Wand2, Swords, Map, Castle, Shield, Users } from 'lucide-react';

export const STORE_ICONS: Record<string, React.ReactElement> = {
  ios: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z"/><path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
  android: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814 13.792 12 3.609 22.186a.996.996 0 0 1-.609-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.707L15.6 8.9l-8.428-4.883 10.525 6.083zm.689.4 2.5 1.448c.68.394.68 1.036 0 1.43l-2.5 1.448L16.19 12l2.198-2.6z"/></svg>,
  pc: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>,
};

export const WEAPON_ICONS: Record<string, React.ReactElement> = {
  sword: <Sword size={18} />,
  bow: <Target size={18} />,
  'crystal-orb': <Sparkles size={18} />,
  wand: <Wand2 size={18} />,
  SWORD: <Sword size={18} />,
  BOW: <Target size={18} />,
  'CRYSTAL ORB': <Sparkles size={18} />,
  WAND: <Wand2 size={18} />,
};

export const CLASS_COLORS: Record<string, string> = {
  sword: '#FFD700', bow: '#4CAF50', 'crystal-orb': '#2196F3', wand: '#E1BEE7',
};

export const CATEGORY_COLORS: Record<string, string> = {
  event: '#F5A623',
  update: '#5BC0EB',
  media: '#9B59B6',
  maintenance: '#E74C3C',
  announcement: '#2ECC71',
};

export const FEATURE_ICONS: Record<string, React.ReactElement> = {
  mercenary: <Swords size={18} />,
  explore: <Map size={18} />,
  tower: <Castle size={18} />,
  upgrade: <Sparkles size={18} />,
  pvp: <Shield size={18} />,
  guilds: <Users size={18} />,
};
