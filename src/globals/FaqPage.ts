import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'

export const FaqPage: GlobalConfig = {
  slug: 'faq-page',
  admin: {
    description: 'Manage FAQ page — questions and answers (bilingual)',
    group: 'Pages',
  },
  access: {
    read: allowPublicRead,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'titleEn',
      type: 'text',
      defaultValue: 'Frequently Asked Questions',
      label: 'Page Title (English)',
    },
    {
      name: 'titleTh',
      type: 'text',
      defaultValue: 'คำถามที่พบบ่อย',
      label: 'Page Title (Thai)',
    },
    {
      name: 'faqItems',
      type: 'array',
      label: 'FAQ Items',
      admin: {
        description: 'Add questions and answers in both languages',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'questionEn',
              type: 'text',
              required: true,
              label: 'Question (English)',
              admin: { width: '50%' },
            },
            {
              name: 'questionTh',
              type: 'text',
              required: true,
              label: 'Question (Thai)',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'answerEn',
              type: 'textarea',
              required: true,
              label: 'Answer (English)',
              admin: { width: '50%' },
            },
            {
              name: 'answerTh',
              type: 'textarea',
              required: true,
              label: 'Answer (Thai)',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
}
