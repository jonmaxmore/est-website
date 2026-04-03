import path from 'node:path'

export type CmsDefaultMediaSpec = {
  alt: string;
  filePath: string;
  filenameHint: string;
}

type HomepageFeatureMediaDefault = {
  previewImage: CmsDefaultMediaSpec;
}

function imagePath(...parts: string[]) {
  return path.resolve(process.cwd(), 'public', 'images', ...parts)
}

export const SITE_LOGO_MEDIA: CmsDefaultMediaSpec = {
  alt: 'Eternal Tower Saga logo',
  filePath: imagePath('logo.webp'),
  filenameHint: 'logo',
}

export const DEFAULT_STORE_BUTTON_MEDIA: Partial<Record<'ios' | 'android' | 'pc' | 'steam', CmsDefaultMediaSpec>> = {
  ios: {
    alt: 'App Store badge',
    filePath: imagePath('badge-app-store.webp'),
    filenameHint: 'badge-app-store',
  },
  android: {
    alt: 'Google Play badge',
    filePath: imagePath('badge-google-play.webp'),
    filenameHint: 'badge-google-play',
  },
}

export const DEFAULT_HOMEPAGE_FEATURE_MEDIA: HomepageFeatureMediaDefault[] = [
  {
    previewImage: {
      alt: 'Combat system preview',
      filePath: imagePath('news-2.png'),
      filenameHint: 'news-2',
    },
  },
  {
    previewImage: {
      alt: 'World exploration preview',
      filePath: imagePath('news-3.png'),
      filenameHint: 'news-3',
    },
  },
  {
    previewImage: {
      alt: 'Tower ascent preview',
      filePath: imagePath('news-1.png'),
      filenameHint: 'news-1',
    },
  },
  {
    previewImage: {
      alt: 'Weapon progression preview',
      filePath: imagePath('characters', 'weapon-info-sword.png'),
      filenameHint: 'weapon-info-sword',
    },
  },
  {
    previewImage: {
      alt: 'Arena combat preview',
      filePath: imagePath('mercenary-companions.webp'),
      filenameHint: 'mercenary-companions',
    },
  },
  {
    previewImage: {
      alt: 'Guild and social play preview',
      filePath: imagePath('hero-bg.webp'),
      filenameHint: 'hero-bg',
    },
  },
]
