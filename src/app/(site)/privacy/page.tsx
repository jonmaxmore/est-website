import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

const PRIVACY_SECTIONS = [
  {
    heading: '1. Introduction / บทนำ',
    content: (
      <>
        <p>
          Ultimate Game Co., Ltd. (บริษัท อัลติเมตเกม จำกัด) is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use, and protect
          your personal data when you use the Eternal Tower Saga website and game
          services.
        </p>
        <p>
          บริษัท อัลติเมตเกม จำกัด มุ่งมั่นปกป้องความเป็นส่วนตัวของท่าน นโยบายนี้อธิบาย
          วิธีการเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของท่าน
        </p>
      </>
    ),
  },
  {
    heading: '2. Data We Collect / ข้อมูลที่เราเก็บรวบรวม',
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
    heading: '3. How We Use Your Data / วิธีใช้ข้อมูลของท่าน',
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
    heading: '4. PDPA Compliance / การปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล',
    content: (
      <>
        <p>
          We comply with the Thailand Personal Data Protection Act (PDPA) B.E. 2562
          (2019). You have the right to:
        </p>
        <ul>
          <li>Access your personal data / เข้าถึงข้อมูลส่วนบุคคลของท่าน</li>
          <li>Request correction of inaccurate data / ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
          <li>Request deletion of your data / ขอลบข้อมูลของท่าน</li>
          <li>Withdraw consent / เพิกถอนความยินยอม</li>
          <li>Data portability / ขอรับข้อมูลในรูปแบบพกพาได้</li>
        </ul>
      </>
    ),
  },
  {
    heading: '5. Cookies / คุกกี้',
    content: (
      <>
        <p>
          We use cookies to enhance your browsing experience and collect analytics data.
          You can manage cookie preferences through your browser settings. Essential
          cookies are necessary for the website to function properly.
        </p>
        <p>
          เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การเข้าชมและเก็บข้อมูลวิเคราะห์
          ท่านสามารถจัดการคุกกี้ผ่านการตั้งค่าเบราว์เซอร์
        </p>
      </>
    ),
  },
  {
    heading: '6. Data Security / ความปลอดภัยของข้อมูล',
    content: (
      <p>
        We implement appropriate technical and organizational measures to protect your
        personal data against unauthorized access, alteration, disclosure, or
        destruction.
      </p>
    ),
  },
  {
    heading: '7. Third-Party Services / บริการของบุคคลที่สาม',
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
    heading: '8. Contact / ติดต่อ',
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
      subtitle="นโยบายความเป็นส่วนตัว"
      updatedAt="March 17, 2026"
      sections={[...PRIVACY_SECTIONS]}
    />
  );
}
