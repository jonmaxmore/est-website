import { GlobalConfig } from 'payload'
import { PageBlocksArray } from '../blocks/PageBlocks'
import { SEOGroup } from '../fields/SEOGroup'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: {
    en: 'Homepage (Page Builder)',
    th: 'หน้าแรก (Page Builder)',
  },
  access: {
    read: () => true,
  },
  fields: [
    SEOGroup,
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Blocks (Drag to Reorder)',
      minRows: 1,
      blocks: PageBlocksArray
    }
  ]
}
