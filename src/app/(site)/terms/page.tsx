import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

const TERMS_SECTIONS = [
  {
    heading: '1. Acceptance of Terms / à¸à¸²à¸£à¸¢à¸­à¸¡à¸£à¸±à¸šà¹€à¸‡à¸·à¹ˆà¸­à¸™à¹„à¸‚',
    content: (
      <>
        <p>
          By accessing and using the Eternal Tower Saga website and game services
          (&quot;Services&quot;), you agree to be bound by these Terms of Service. If you
          do not agree to these terms, please do not use the Services.
        </p>
        <p>
          à¹€à¸¡à¸·à¹ˆà¸­à¹€à¸‚à¹‰à¸²à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹€à¸§à¹‡à¸šà¹„à¸‹à¸•à¹Œà¹à¸¥à¸°à¸šà¸£à¸´à¸à¸²à¸£à¹€à¸à¸¡ Eternal Tower Saga (&quot;à¸šà¸£à¸´à¸à¸²à¸£&quot;)
          à¸–à¸·à¸­à¸§à¹ˆà¸²à¸—à¹ˆà¸²à¸™à¸¢à¸­à¸¡à¸£à¸±à¸šà¹€à¸‡à¸·à¹ˆà¸­à¸™à¹„à¸‚à¸à¸²à¸£à¹ƒà¸«à¹‰à¸šà¸£à¸´à¸à¸²à¸£à¸™à¸µà¹‰ à¸«à¸²à¸à¹„à¸¡à¹ˆà¸¢à¸­à¸¡à¸£à¸±à¸š à¸à¸£à¸¸à¸“à¸²à¸­à¸¢à¹ˆà¸²à¹ƒà¸Šà¹‰à¸šà¸£à¸´à¸à¸²à¸£
        </p>
      </>
    ),
  },
  {
    heading: '2. Service Provider / à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸šà¸£à¸´à¸à¸²à¸£',
    content: (
      <p>
        The Services are provided by Ultimate Game Co., Ltd.
        (à¸šà¸£à¸´à¸©à¸±à¸— à¸­à¸±à¸¥à¸•à¸´à¹€à¸¡à¸•à¹€à¸à¸¡ à¸ˆà¸³à¸à¸±à¸”), a company registered in Thailand.
      </p>
    ),
  },
  {
    heading: '3. User Accounts / à¸šà¸±à¸à¸Šà¸µà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰',
    content: (
      <>
        <p>
          You may be required to register an account to use certain features. You are
          responsible for maintaining the confidentiality of your account information.
          You must be at least 13 years old to create an account.
        </p>
        <p>
          à¸—à¹ˆà¸²à¸™à¸­à¸²à¸ˆà¸•à¹‰à¸­à¸‡à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸šà¸±à¸à¸Šà¸µà¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸Šà¹‰à¸šà¸£à¸´à¸à¸²à¸£à¸šà¸²à¸‡à¸ªà¹ˆà¸§à¸™ à¸—à¹ˆà¸²à¸™à¸¡à¸µà¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸”à¸¹à¹à¸¥à¸£à¸±à¸à¸©à¸²à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸±à¸à¸Šà¸µ
          à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™à¹€à¸›à¹‡à¸™à¸„à¸§à¸²à¸¡à¸¥à¸±à¸š à¸—à¹ˆà¸²à¸™à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸²à¸¢à¸¸à¹„à¸¡à¹ˆà¸•à¹ˆà¸³à¸à¸§à¹ˆà¸² 13 à¸›à¸µ à¸ˆà¸¶à¸‡à¸ˆà¸°à¸ªà¸£à¹‰à¸²à¸‡à¸šà¸±à¸à¸Šà¸µà¹„à¸”à¹‰
        </p>
      </>
    ),
  },
  {
    heading: '4. Virtual Items / à¹„à¸­à¹€à¸—à¸¡à¹€à¸ªà¸¡à¸·à¸­à¸™',
    content: (
      <>
        <p>
          All in-game items, currency, and virtual goods are the property of the Service
          Provider. You are granted a limited, non-transferable license to use these
          items. Virtual items have no real-world monetary value.
        </p>
        <p>
          à¹„à¸­à¹€à¸—à¸¡ à¸ªà¸à¸¸à¸¥à¹€à¸‡à¸´à¸™ à¹à¸¥à¸°à¸ªà¸´à¸™à¸„à¹‰à¸²à¹€à¸ªà¸¡à¸·à¸­à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹ƒà¸™à¹€à¸à¸¡à¹€à¸›à¹‡à¸™à¸à¸£à¸£à¸¡à¸ªà¸´à¸—à¸˜à¸´à¹Œà¸‚à¸­à¸‡à¸œà¸¹à¹‰à¹ƒà¸«à¹‰à¸šà¸£à¸´à¸à¸²à¸£
          à¸—à¹ˆà¸²à¸™à¹„à¸”à¹‰à¸£à¸±à¸šà¸­à¸™à¸¸à¸à¸²à¸•à¹à¸šà¸šà¸ˆà¸³à¸à¸±à¸”à¹à¸¥à¸°à¸«à¹‰à¸²à¸¡à¹‚à¸­à¸™ à¹„à¸­à¹€à¸—à¸¡à¹€à¸ªà¸¡à¸·à¸­à¸™à¹„à¸¡à¹ˆà¸¡à¸µà¸¡à¸¹à¸¥à¸„à¹ˆà¸²à¹€à¸›à¹‡à¸™à¹€à¸‡à¸´à¸™à¸ˆà¸£à¸´à¸‡
        </p>
      </>
    ),
  },
  {
    heading: '5. Code of Conduct / à¸ˆà¸£à¸£à¸¢à¸²à¸šà¸£à¸£à¸“',
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use cheats, hacks, or unauthorized third-party software</li>
          <li>Harass, abuse, or threaten other users</li>
          <li>Sell, trade, or transfer accounts or virtual items for real money</li>
          <li>Reverse engineer or modify the game client</li>
        </ul>
      </>
    ),
  },
  {
    heading: '6. Limitation of Liability / à¸à¸²à¸£à¸ˆà¸³à¸à¸±à¸”à¸„à¸§à¸²à¸¡à¸£à¸±à¸šà¸œà¸´à¸”à¸Šà¸­à¸š',
    content: (
      <p>
        The Services are provided &quot;as is&quot; without warranties. We are not liable
        for any indirect, incidental, or consequential damages arising from the use of
        our Services.
      </p>
    ),
  },
  {
    heading: '7. Governing Law / à¸à¸Žà¸«à¸¡à¸²à¸¢à¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸šà¸±à¸‡à¸„à¸±à¸š',
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          the Kingdom of Thailand.
        </p>
        <p>à¹€à¸‡à¸·à¹ˆà¸­à¸™à¹„à¸‚à¹€à¸«à¸¥à¹ˆà¸²à¸™à¸µà¹‰à¸­à¸¢à¸¹à¹ˆà¸ à¸²à¸¢à¹ƒà¸•à¹‰à¸à¸Žà¸«à¸¡à¸²à¸¢à¸‚à¸­à¸‡à¸£à¸²à¸Šà¸­à¸²à¸“à¸²à¸ˆà¸±à¸à¸£à¹„à¸—à¸¢</p>
      </>
    ),
  },
  {
    heading: '8. Contact / à¸•à¸´à¸”à¸•à¹ˆà¸­',
    content: (
      <p>
        For questions regarding these Terms, please contact us at{' '}
        <a href="mailto:support@eternaltowersaga.com">support@eternaltowersaga.com</a>
      </p>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      subtitle="à¹€à¸‡à¸·à¹ˆà¸­à¸™à¹„à¸‚à¸à¸²à¸£à¹ƒà¸«à¹‰à¸šà¸£à¸´à¸à¸²à¸£"
      updatedAt="March 17, 2026"
      sections={[...TERMS_SECTIONS]}
    />
  );
}
