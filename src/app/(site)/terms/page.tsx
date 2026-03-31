import type { Metadata } from 'next';
import LegalDocumentPage from '@/components/legal/LegalDocumentPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

const TERMS_SECTIONS = [
  {
    heading: '1. Acceptance of Terms / การยอมรับเงื่อนไข',
    content: (
      <>
        <p>
          By accessing and using the Eternal Tower Saga website and game services
          (&quot;Services&quot;), you agree to be bound by these Terms of Service. If you
          do not agree to these terms, please do not use the Services.
        </p>
        <p>
          เมื่อเข้าใช้งานเว็บไซต์และบริการเกม Eternal Tower Saga (&quot;บริการ&quot;)
          ถือว่าท่านยอมรับเงื่อนไขการให้บริการนี้ หากไม่ยอมรับ กรุณาอย่าใช้บริการ
        </p>
      </>
    ),
  },
  {
    heading: '2. Service Provider / ผู้ให้บริการ',
    content: (
      <p>
        The Services are provided by Ultimate Game Co., Ltd.
        (บริษัท อัลติเมตเกม จำกัด), a company registered in Thailand.
      </p>
    ),
  },
  {
    heading: '3. User Accounts / บัญชีผู้ใช้',
    content: (
      <>
        <p>
          You may be required to register an account to use certain features. You are
          responsible for maintaining the confidentiality of your account information.
          You must be at least 13 years old to create an account.
        </p>
        <p>
          ท่านอาจต้องลงทะเบียนบัญชีเพื่อใช้บริการบางส่วน ท่านมีหน้าที่ดูแลรักษาข้อมูลบัญชี
          ของท่านเป็นความลับ ท่านต้องมีอายุไม่ต่ำกว่า 13 ปี จึงจะสร้างบัญชีได้
        </p>
      </>
    ),
  },
  {
    heading: '4. Virtual Items / ไอเทมเสมือน',
    content: (
      <>
        <p>
          All in-game items, currency, and virtual goods are the property of the Service
          Provider. You are granted a limited, non-transferable license to use these
          items. Virtual items have no real-world monetary value.
        </p>
        <p>
          ไอเทม สกุลเงิน และสินค้าเสมือนทั้งหมดในเกมเป็นกรรมสิทธิ์ของผู้ให้บริการ
          ท่านได้รับอนุญาตแบบจำกัดและห้ามโอน ไอเทมเสมือนไม่มีมูลค่าเป็นเงินจริง
        </p>
      </>
    ),
  },
  {
    heading: '5. Code of Conduct / จรรยาบรรณ',
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
    heading: '6. Limitation of Liability / การจำกัดความรับผิดชอบ',
    content: (
      <p>
        The Services are provided &quot;as is&quot; without warranties. We are not liable
        for any indirect, incidental, or consequential damages arising from the use of
        our Services.
      </p>
    ),
  },
  {
    heading: '7. Governing Law / กฎหมายที่ใช้บังคับ',
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of
          the Kingdom of Thailand.
        </p>
        <p>เงื่อนไขเหล่านี้อยู่ภายใต้กฎหมายของราชอาณาจักรไทย</p>
      </>
    ),
  },
  {
    heading: '8. Contact / ติดต่อ',
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
      subtitle="เงื่อนไขการให้บริการ"
      updatedAt="March 17, 2026"
      sections={[...TERMS_SECTIONS]}
    />
  );
}
