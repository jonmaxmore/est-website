import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

const PRIVACY_SECTIONS = [
  {
    heading: '1. Introduction / à¸šà¸—à¸™à¸³',
    content: (
      <>
        <p>
          Ultimate Game Co., Ltd. (à¸šà¸£à¸´à¸©à¸±à¸— à¸­à¸±à¸¥à¸•à¸´à¹€à¸¡à¸•à¹€à¸à¸¡ à¸ˆà¸³à¸à¸±à¸”) is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use, and protect
          your personal data when you use the Eternal Tower Saga website and game
          services.
        </p>
        <p>
          à¸šà¸£à¸´à¸©à¸±à¸— à¸­à¸±à¸¥à¸•à¸´à¹€à¸¡à¸•à¹€à¸à¸¡ à¸ˆà¸³à¸à¸±à¸” à¸¡à¸¸à¹ˆà¸‡à¸¡à¸±à¹ˆà¸™à¸›à¸à¸›à¹‰à¸­à¸‡à¸„à¸§à¸²à¸¡à¹€à¸›à¹‡à¸™à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™ à¸™à¹‚à¸¢à¸šà¸²à¸¢à¸™à¸µà¹‰à¸­à¸˜à¸´à¸šà¸²à¸¢
          à¸§à¸´à¸˜à¸µà¸à¸²à¸£à¹€à¸à¹‡à¸šà¸£à¸§à¸šà¸£à¸§à¸¡ à¹ƒà¸Šà¹‰ à¹à¸¥à¸°à¸›à¸à¸›à¹‰à¸­à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹ˆà¸§à¸™à¸šà¸¸à¸„à¸„à¸¥à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™
        </p>
      </>
    ),
  },
  {
    heading: '2. Data We Collect / à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¹€à¸£à¸²à¹€à¸à¹‡à¸šà¸£à¸§à¸šà¸£à¸§à¸¡',
    content: (
      <ul>
        <li><strong>Registration Data:</strong> Email address, preferred platform (iOS/Android/PC), region</li>
        <li><strong>Usage Data:</strong> Pages visited, time spent, actions taken on the website</li>
        <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
        <li><strong>Cookie Data:</strong> Preferences and analytics cookies (with your consent)</li>
      </ul>
    ),
  },
  {
    heading: '3. How We Use Your Data / à¸§à¸´à¸˜à¸µà¹ƒà¸Šà¹‰à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™',
    content: (
      <ul>
        <li>To process your pre-registration and send game launch notifications</li>
        <li>To improve our website and game services</li>
        <li>To track registration milestones and award campaign rewards</li>
        <li>To comply with legal obligations under Thai law (PDPA)</li>
      </ul>
    ),
  },
  {
    heading: '4. PDPA Compliance / à¸à¸²à¸£à¸›à¸à¸´à¸šà¸±à¸•à¸´à¸•à¸²à¸¡ à¸ž.à¸£.à¸š. à¸„à¸¸à¹‰à¸¡à¸„à¸£à¸­à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹ˆà¸§à¸™à¸šà¸¸à¸„à¸„à¸¥',
    content: (
      <>
        <p>
          We comply with the Thailand Personal Data Protection Act (PDPA) B.E. 2562
          (2019). You have the right to:
        </p>
        <ul>
          <li>Access your personal data / à¹€à¸‚à¹‰à¸²à¸–à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹ˆà¸§à¸™à¸šà¸¸à¸„à¸„à¸¥à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™</li>
          <li>Request correction of inaccurate data / à¸‚à¸­à¹à¸à¹‰à¹„à¸‚à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡</li>
          <li>Request deletion of your data / à¸‚à¸­à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™</li>
          <li>Withdraw consent / à¹€à¸žà¸´à¸à¸–à¸­à¸™à¸„à¸§à¸²à¸¡à¸¢à¸´à¸™à¸¢à¸­à¸¡</li>
          <li>Data portability / à¸‚à¸­à¸£à¸±à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸™à¸£à¸¹à¸›à¹à¸šà¸šà¸žà¸à¸žà¸²à¹„à¸”à¹‰</li>
        </ul>
      </>
    ),
  },
  {
    heading: '5. Cookies / à¸„à¸¸à¸à¸à¸µà¹‰',
    content: (
      <>
        <p>
          We use cookies to enhance your browsing experience and collect analytics data.
          You can manage cookie preferences through your browser settings. Essential
          cookies are necessary for the website to function properly.
        </p>
        <p>
          à¹€à¸£à¸²à¹ƒà¸Šà¹‰à¸„à¸¸à¸à¸à¸µà¹‰à¹€à¸žà¸·à¹ˆà¸­à¸›à¸£à¸±à¸šà¸›à¸£à¸¸à¸‡à¸›à¸£à¸°à¸ªà¸šà¸à¸²à¸£à¸“à¹Œà¸à¸²à¸£à¹€à¸‚à¹‰à¸²à¸Šà¸¡à¹à¸¥à¸°à¹€à¸à¹‡à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œ
          à¸—à¹ˆà¸²à¸™à¸ªà¸²à¸¡à¸²à¸£à¸–à¸ˆà¸±à¸”à¸à¸²à¸£à¸„à¸¸à¸à¸à¸µà¹‰à¸œà¹ˆà¸²à¸™à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¹€à¸šà¸£à¸²à¸§à¹Œà¹€à¸‹à¸­à¸£à¹Œ
        </p>
      </>
    ),
  },
  {
    heading: '6. Data Security / à¸„à¸§à¸²à¸¡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢à¸‚à¸­à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥',
    content: (
      <p>
        We implement appropriate technical and organizational measures to protect your
        personal data against unauthorized access, alteration, disclosure, or
        destruction.
      </p>
    ),
  },
  {
    heading: '7. Third-Party Services / à¸šà¸£à¸´à¸à¸²à¸£à¸‚à¸­à¸‡à¸šà¸¸à¸„à¸„à¸¥à¸—à¸µà¹ˆà¸ªà¸²à¸¡',
    content: (
      <>
        <p>We may use the following third-party services:</p>
        <ul>
          <li><strong>Google Analytics (GA4):</strong> Website traffic analysis</li>
          <li><strong>Meta Pixel:</strong> Marketing campaign optimization</li>
          <li><strong>Cloudflare:</strong> Website security and CDN</li>
        </ul>
      </>
    ),
  },
  {
    heading: '8. Contact / à¸•à¸´à¸”à¸•à¹ˆà¸­',
    content: (
      <p>
        Data Protection Officer: Ultimate Game Co., Ltd.
        <br />
        Email: <a href="mailto:privacy@eternaltowersaga.com">privacy@eternaltowersaga.com</a>
      </p>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      subtitle="à¸™à¹‚à¸¢à¸šà¸²à¸¢à¸„à¸§à¸²à¸¡à¹€à¸›à¹‡à¸™à¸ªà¹ˆà¸§à¸™à¸•à¸±à¸§"
      updatedAt="March 17, 2026"
      sections={[...PRIVACY_SECTIONS]}
    />
  );
}
