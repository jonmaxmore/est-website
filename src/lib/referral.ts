import { nanoid } from 'nanoid';

export function generateReferralCode(): string {
  return nanoid(8).toUpperCase();
}

export function getReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${baseUrl}/event?ref=${code}`;
}
