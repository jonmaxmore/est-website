type MediaDoc = {
  url?: string | null
} | null | undefined

type WeaponDoc = {
  id: string | number
  name?: string | null
  descriptionEn?: string | null
  descriptionTh?: string | null
  portrait?: MediaDoc
  infoImage?: MediaDoc
  backgroundImage?: MediaDoc
  icon?: MediaDoc
  videoType?: string | null
  videoUrl?: string | null
  videoUpload?: MediaDoc
  sortOrder?: number | null
  visible?: boolean | null
}

function mediaUrl(media: MediaDoc) {
  return typeof media === 'object' && media ? media.url || null : null
}

export function serializePublicWeapon(doc: WeaponDoc) {
  return {
    id: doc.id,
    name: doc.name || '',
    descriptionEn: doc.descriptionEn || null,
    descriptionTh: doc.descriptionTh || null,
    portrait: mediaUrl(doc.portrait),
    infoImage: mediaUrl(doc.infoImage),
    backgroundImage: mediaUrl(doc.backgroundImage),
    icon: mediaUrl(doc.icon),
    videoType: doc.videoType || 'none',
    videoUrl: doc.videoUrl || null,
    videoUpload: mediaUrl(doc.videoUpload),
    sortOrder: doc.sortOrder || 0,
    visible: doc.visible ?? true,
  }
}
