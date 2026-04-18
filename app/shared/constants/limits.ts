/** Rate limit & pagination constants */
export const LIMITS = {
  /** Max pre-registrations per IP per hour */
  registrationPerIpPerHour: 5,
  /** Max API requests per IP per minute */
  apiPerIpPerMinute: 60,
  /** News articles per page */
  newsPerPage: 12,
  /** Max file upload size in bytes (10MB) */
  maxUploadBytes: 10 * 1024 * 1024,
  /** Allowed upload MIME types */
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
  ],
} as const
