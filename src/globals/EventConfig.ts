import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdmin } from '@/lib/cms-access'

export const EventConfig: GlobalConfig = {
  slug: 'event-config',
  admin: {
    description: 'Pre-registration event settings — countdown, milestones, referral system',
    group: 'Event',
  },
  access: {
    read: allowPublicRead,
    update: isAdmin,
  },
  fields: [
    // ═══════════════════════════════════════
    //  TAB 1: General Settings
    // ═══════════════════════════════════════
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          description: 'Core event settings — toggle, countdown, registration',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Event Active',
              admin: { description: 'Master switch for the entire event page' },
            },
            {
              name: 'registrationOpen',
              type: 'checkbox',
              defaultValue: true,
              label: 'Registration Open',
              admin: { description: 'If unchecked, form is disabled but page is still visible' },
            },
            {
              name: 'countdownTarget',
              type: 'date',
              required: true,
              label: 'Countdown Target Date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description: 'The date/time the countdown counts down to',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'countMultiplier',
                  type: 'number',
                  defaultValue: 1,
                  label: 'Count Multiplier',
                  admin: {
                    width: '33%',
                    description: 'Multiply real count (e.g. 2 = double)',
                  },
                },
                {
                  name: 'countOffset',
                  type: 'number',
                  defaultValue: 0,
                  label: 'Count Offset',
                  admin: {
                    width: '33%',
                    description: 'Add to multiplied count',
                  },
                },
                {
                  name: 'countOverride',
                  type: 'number',
                  label: 'Count Override',
                  admin: {
                    width: '33%',
                    description: 'If set, shows this exact number. Leave blank for formula.',
                  },
                },
              ],
            },
          ],
        },
        // ═══════════════════════════════════════
        //  TAB 2: Copy / Text
        // ═══════════════════════════════════════
        {
          label: 'Copy & Text',
          description: 'All text shown on the event page (EN/TH)',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'titleEn', type: 'text', defaultValue: 'Join the pre-registration', label: 'Event Title (EN)', admin: { width: '50%' } },
                { name: 'titleTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้า', label: 'Event Title (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'descriptionEn', type: 'textarea', label: 'Description (EN)', admin: { width: '50%' } },
                { name: 'descriptionTh', type: 'textarea', label: 'Description (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'ctaButtonEn', type: 'text', defaultValue: 'Join the pre-registration', label: 'CTA Button (EN)', admin: { width: '50%' } },
                { name: 'ctaButtonTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้าเลย', label: 'CTA Button (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'modalTitleEn', type: 'text', defaultValue: 'Registration form', label: 'Modal Title (EN)', admin: { width: '50%' } },
                { name: 'modalTitleTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้า', label: 'Modal Title (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'emailPlaceholderEn', type: 'text', defaultValue: 'Enter your email address', label: 'Email Placeholder (EN)', admin: { width: '50%' } },
                { name: 'emailPlaceholderTh', type: 'text', defaultValue: 'กรอก Email ของท่าน', label: 'Email Placeholder (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'storeLabelEn', type: 'text', defaultValue: 'Choose your platform', label: 'Store Label (EN)', admin: { width: '50%' } },
                { name: 'storeLabelTh', type: 'text', defaultValue: 'เลือกสโตร์ที่ต้องการ', label: 'Store Label (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'submitButtonEn', type: 'text', defaultValue: 'Register and continue', label: 'Submit Button (EN)', admin: { width: '50%' } },
                { name: 'submitButtonTh', type: 'text', defaultValue: 'ลงทะเบียนและไปที่สโตร์', label: 'Submit Button (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'successTitleEn', type: 'text', defaultValue: 'Registration complete', label: 'Success Title (EN)', admin: { width: '50%' } },
                { name: 'successTitleTh', type: 'text', defaultValue: 'ลงทะเบียนสำเร็จ!', label: 'Success Title (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'badgeTextEn', type: 'text', defaultValue: 'PRE-REGISTER', label: 'Badge Text (EN)', admin: { width: '50%' } },
                { name: 'badgeTextTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้า', label: 'Badge Text (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'milestoneBadgeEn', type: 'text', defaultValue: 'MILESTONE REWARDS', label: 'Milestone Badge (EN)', admin: { width: '50%' } },
                { name: 'milestoneBadgeTh', type: 'text', defaultValue: 'รางวัลสะสม', label: 'Milestone Badge (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'milestoneTitleEn', type: 'text', defaultValue: 'Milestone Rewards', label: 'Milestone Title (EN)', admin: { width: '50%' } },
                { name: 'milestoneTitleTh', type: 'text', defaultValue: 'รางวัลสะสม Pre-Register', label: 'Milestone Title (TH)', admin: { width: '50%' } },
              ],
            },
            {
              name: 'footerText',
              type: 'text',
              defaultValue: '© 2026 Eternal Tower Saga. All rights reserved.',
              label: 'Footer Text',
            },
          ],
        },
        // ═══════════════════════════════════════
        //  TAB 3: Media
        // ═══════════════════════════════════════
        {
          label: 'Media',
          description: 'Background images for each section',
          fields: [
            // ── Section 1: Hero ──
            {
              name: 'backgroundVideo',
              type: 'upload',
              relationTo: 'media',
              label: 'Section 1: Hero Video (optional)',
              admin: { description: 'Fullscreen looping video for hero background. If uploaded, takes priority over image. Recommended: MP4, 1080p, under 15MB.' },
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Section 1: Hero Background Image',
              admin: { description: 'Fallback image if no video, or poster frame while video loads (parallax)' },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Hero Image (optional)',
              admin: { description: 'Overlay image in the hero section' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'descriptionImageEn',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Tagline Image EN (optional)',
                  admin: {
                    width: '50%',
                    description: 'If uploaded, replaces description text (EN) with this image',
                  },
                },
                {
                  name: 'descriptionImageTh',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Tagline Image TH (optional)',
                  admin: {
                    width: '50%',
                    description: 'If uploaded, replaces description text (TH) with this image',
                  },
                },
              ],
            },
            // ── Section 2: Registration Form ──
            {
              name: 'formBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Section 2: Registration Form Background',
              admin: { description: 'Background image for the registration form section (parallax)' },
            },
            // ── Section 3: Milestones ──
            {
              name: 'milestonesBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Section 3: Milestones Background',
              admin: { description: 'Background image for the milestones section (parallax)' },
            },
            // ── Section 4: Leaderboard ──
            {
              name: 'leaderboardBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Section 4: Leaderboard Background',
              admin: { description: 'Background image for the referral leaderboard section (parallax)' },
            },
          ],
        },
        // ═══════════════════════════════════════
        //  TAB 4: Store & Referral
        // ═══════════════════════════════════════
        {
          label: 'Store & Referral',
          description: 'App store links, button images, tracking, and referral points',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'iosStoreUrl',
                  type: 'text',
                  defaultValue: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
                  label: 'iOS App Store URL',
                  admin: { width: '33%' },
                },
                {
                  name: 'androidStoreUrl',
                  type: 'text',
                  defaultValue: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
                  label: 'Android Play Store URL',
                  admin: { width: '33%' },
                },
                {
                  name: 'pcStoreUrl',
                  type: 'text',
                  defaultValue: '#',
                  label: 'PC Store URL',
                  admin: {
                    width: '33%',
                    description: 'Set "#" if PC not yet available',
                  },
                },
              ],
            },
            // ── CTA Button Image ──
            {
              name: 'ctaButtonImage',
              type: 'upload',
              relationTo: 'media',
              label: 'CTA Button Image (optional)',
              admin: { description: 'Upload a custom button image to replace the default text CTA. Recommended: 400×80px PNG' },
            },
            // Store buttons are managed in the "Store Buttons" collection (Event group)
            // No duplication here — single source of truth
            // ── Referral Points ──
            {
              type: 'row',
              fields: [
                {
                  name: 'pointsLevel1',
                  type: 'number',
                  defaultValue: 1,
                  label: 'Points per Level 1 Referral',
                  admin: {
                    width: '50%',
                    description: 'Points for each direct invite (Level 1)',
                  },
                },
                {
                  name: 'pointsLevel2',
                  type: 'number',
                  defaultValue: 0.5,
                  label: 'Points per Level 2 Referral',
                  admin: {
                    width: '50%',
                    description: 'Points for each indirect invite (Level 2)',
                  },
                },
              ],
            },
          ],
        },
        // ═══════════════════════════════════════
        //  TAB 5: Content Sections
        // ═══════════════════════════════════════
        {
          label: 'Content Sections',
          description: 'Extra content blocks below the event',
          fields: [
            {
              name: 'contentSections',
              type: 'array',
              label: 'Content Blocks',
              admin: { description: 'Flexible content blocks — text or image' },
              fields: [
                {
                  name: 'contentType',
                  type: 'select',
                  options: [
                    { label: 'Text', value: 'text' },
                    { label: 'Image', value: 'image' },
                  ],
                  defaultValue: 'text',
                  label: 'Content Type',
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'textEn', type: 'textarea', label: 'Text (EN)', admin: { width: '50%', condition: (_, siblingData) => siblingData?.contentType === 'text' } },
                    { name: 'textTh', type: 'textarea', label: 'Text (TH)', admin: { width: '50%', condition: (_, siblingData) => siblingData?.contentType === 'text' } },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Image',
                  admin: { condition: (_, siblingData) => siblingData?.contentType === 'image' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
