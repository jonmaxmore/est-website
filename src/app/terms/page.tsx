import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-subtitle">เงื่อนไขการให้บริการ</p>
        <p className="legal-updated">Last updated: March 17, 2026</p>

        <section className="legal-section">
          <h2>1. Acceptance of Terms / การยอมรับเงื่อนไข</h2>
          <p>
            By accessing and using the Eternal Tower Saga website and game services (&quot;Services&quot;),
            you agree to be bound by these Terms of Service. If you do not agree to these terms,
            please do not use the Services.
          </p>
          <p>
            เมื่อเข้าใช้งานเว็บไซต์และบริการเกม Eternal Tower Saga (&quot;บริการ&quot;) ถือว่าท่านยอมรับเงื่อนไขการให้บริการนี้
            หากไม่ยอมรับ กรุณาอย่าใช้บริการ
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Service Provider / ผู้ให้บริการ</h2>
          <p>
            The Services are provided by Ultimate Game Co., Ltd. (บริษัท อัลติเมตเกม จำกัด),
            a company registered in Thailand.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. User Accounts / บัญชีผู้ใช้</h2>
          <p>
            You may be required to register an account to use certain features. You are responsible for
            maintaining the confidentiality of your account information. You must be at least 13 years old
            to create an account.
          </p>
          <p>
            ท่านอาจต้องลงทะเบียนบัญชีเพื่อใช้บริการบางส่วน ท่านมีหน้าที่ดูแลรักษาข้อมูลบัญชีของท่านเป็นความลับ
            ท่านต้องมีอายุไม่ต่ำกว่า 13 ปี จึงจะสร้างบัญชีได้
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Virtual Items / ไอเทมเสมือน</h2>
          <p>
            All in-game items, currency, and virtual goods are the property of the Service Provider.
            You are granted a limited, non-transferable license to use these items.
            Virtual items have no real-world monetary value.
          </p>
          <p>
            ไอเทม สกุลเงิน และสินค้าเสมือนทั้งหมดในเกมเป็นกรรมสิทธิ์ของผู้ให้บริการ
            ท่านได้รับอนุญาตแบบจำกัดและห้ามโอน ไอเทมเสมือนไม่มีมูลค่าเป็นเงินจริง
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Code of Conduct / จรรยาบรรณ</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use cheats, hacks, or unauthorized third-party software</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Sell, trade, or transfer accounts or virtual items for real money</li>
            <li>Reverse engineer or modify the game client</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Limitation of Liability / การจำกัดความรับผิดชอบ</h2>
          <p>
            The Services are provided &quot;as is&quot; without warranties. We are not liable for any
            indirect, incidental, or consequential damages arising from the use of our Services.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Governing Law / กฎหมายที่ใช้บังคับ</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Kingdom of Thailand.
          </p>
          <p>
            เงื่อนไขเหล่านี้อยู่ภายใต้กฎหมายของราชอาณาจักรไทย
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Contact / ติดต่อ</h2>
          <p>
            For questions regarding these Terms, please contact us at{' '}
            <a href="mailto:support@eternaltowersaga.com">support@eternaltowersaga.com</a>
          </p>
        </section>

        <div className="legal-back">
          <Link href="/">← Back to Home / กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  );
}
