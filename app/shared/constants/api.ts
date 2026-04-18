/** API endpoint constants */
export const API = {
  public: {
    news: '/api/public/news',
    weapons: '/api/public/weapons',
    site: '/api/public/site',
    milestones: '/api/public/milestones',
  },
  admin: {
    news: '/api/admin/news',
    media: '/api/admin/media',
    weapons: '/api/admin/weapons',
    registrations: '/api/admin/registrations',
    config: '/api/admin/config',
  },
  auth: {
    login: '/api/auth/login',
  },
  register: '/api/register',
  track: '/api/track',
} as const
