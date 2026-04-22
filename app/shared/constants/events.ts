import { TRACKING_EVENT_NAMES } from '../tracking/events'

/** GTM / Meta Pixel event name constants */
export const TRACKING_EVENTS = {
  pageView: 'page_view',
  preRegister: 'pre_register',
  preRegisterSuccess: 'pre_register_success',
  downloadClick: 'download_click',
  videoPlay: 'video_play',
  socialClick: 'social_click',
  newsClick: 'news_click',
  referralCopy: 'referral_copy',
} as const

export { TRACKING_EVENT_NAMES }
