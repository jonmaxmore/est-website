'use client';

import { useLang } from '@/lib/lang-context';
import Link from 'next/link';
import { motion } from 'framer-motion';

const faqItems = [
  {
    q: {
      th: 'Eternal Tower Saga เป็นเกมแนวอะไร?',
      en: 'What genre is Eternal Tower Saga?',
    },
    a: {
      th: 'เกมมือถือแนว Casual MMORPG ผสม Action RPG เน้นระบบ Mercenary Companion ที่ให้ผู้เล่นต่อสู้เคียงข้างสหายร่วมรบ สำรวจหอคอยนิรันดร์ และร่วมผจญภัยกับผู้เล่นอื่นๆ ในโลกแฟนตาซี',
      en: 'A mobile Casual MMORPG & Action RPG featuring the Mercenary Companion system. Fight alongside battle companions, explore the Eternal Tower, and adventure with other players in a fantasy world.',
    },
  },
  {
    q: {
      th: 'เกมนี้รองรับมือถือสเปคไหนบ้าง?',
      en: 'What devices are supported?',
    },
    a: {
      th: 'รองรับ iOS 14+, Android 8.0+ และ PC (Windows 10+) สามารถเล่นข้ามแพลตฟอร์มได้ โดยใช้บัญชีเดียวกัน',
      en: 'Supports iOS 14+, Android 8.0+, and PC (Windows 10+). Cross-platform play is available using the same account.',
    },
  },
  {
    q: {
      th: 'ระบบ Mercenary Companion คืออะไร?',
      en: 'What is the Mercenary Companion system?',
    },
    a: {
      th: 'จุดเด่นของ Eternal Tower Saga! ต่อสู้เคียงข้างสหายร่วมรบ 4 คลาส ได้แก่ Warrior, Mage, Archer และ Healer แต่ละคลาสมีสกิลเฉพาะตัว สามารถอัพเกรดและปรับแต่งกลยุทธ์ได้อย่างอิสระ',
      en: 'The highlight of Eternal Tower Saga! Fight alongside 4 companion classes: Warrior, Mage, Archer, and Healer. Each class has unique skills and can be upgraded and customized freely.',
    },
  },
  {
    q: {
      th: 'มีระบบกิลด์หรือเล่นกับเพื่อนได้ไหม?',
      en: 'Is there a guild system?',
    },
    a: {
      th: 'มีครับ! รองรับกิลด์เต็มรูปแบบ ทั้ง Guild War, Guild Raid, ระบบ Chat และ Party ร่วมผจญภัยกับเพื่อนได้สูงสุด 4 คน',
      en: 'Yes! Full guild system with Guild War, Guild Raid, Chat, and Party features. Adventure with up to 4 friends.',
    },
  },
  {
    q: {
      th: 'ลงทะเบียนล่วงหน้าจะได้อะไร?',
      en: 'What do I get for pre-registering?',
    },
    a: {
      th: 'ได้รับรางวัลสะสมตาม Milestone เช่น Gold, Summoning Stones, Premium Tickets และไอเทมพิเศษ Exclusive Mount ที่หาไม่ได้จากทางอื่น ยิ่งลงทะเบียนเร็ว ยิ่งได้รับรางวัลมากขึ้น!',
      en: 'Milestone rewards including Gold, Summoning Stones, Premium Tickets, and an Exclusive Mount unavailable elsewhere. The earlier you register, the more rewards you receive!',
    },
  },
  {
    q: {
      th: 'เกมนี้ผลิตโดยบริษัทอะไร?',
      en: 'Who developed this game?',
    },
    a: {
      th: 'พัฒนาโดย บริษัท อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.) สตูดิโอเกมจากประเทศไทยที่มุ่งมั่นสร้างเกมคุณภาพระดับสากล',
      en: 'Developed by Ultimate Game Co., Ltd., a Thai game studio committed to creating world-class quality games.',
    },
  },
];

export default function FAQPage() {
  const { t } = useLang();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--midnight) 0%, var(--deeper-navy) 50%, var(--midnight) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(ellipse 600px 400px at 20% 20%, rgba(30, 111, 191, 0.08), transparent), radial-gradient(ellipse 500px 300px at 80% 60%, rgba(212, 168, 67, 0.06), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '0 1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: '2rem' }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            {t('กลับหน้าหลัก', 'Back to Home')}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            textAlign: 'center',
            paddingTop: '3rem',
            paddingBottom: '3rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '0.35rem 1.2rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.15), rgba(245, 209, 120, 0.08))',
              border: '1px solid rgba(212, 168, 67, 0.3)',
              color: 'var(--gold-light)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            FAQ
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, var(--gold-light), var(--gold), var(--warm-orange))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}
          >
            {t('คำถามที่พบบ่อย', 'Frequently Asked Questions')}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            {t(
              'รวมคำตอบสำหรับทุกข้อสงสัยเกี่ยวกับ Eternal Tower Saga',
              'Everything you need to know about Eternal Tower Saga'
            )}
          </p>
        </motion.header>

        {/* FAQ Accordion */}
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingBottom: '6rem',
          }}
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
            >
              <details
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onToggle={(e) => {
                  const el = e.currentTarget;
                  if (el.open) {
                    el.style.borderColor = 'rgba(212, 168, 67, 0.25)';
                    el.style.boxShadow = '0 8px 32px rgba(212, 168, 67, 0.08)';
                  } else {
                    el.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                    el.style.boxShadow = 'none';
                  }
                }}
              >
                <summary
                  style={{
                    padding: '1.25rem 1.5rem',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: 'var(--white)',
                    fontFamily: 'var(--font-heading)',
                    userSelect: 'none',
                    transition: 'color 0.3s ease',
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {t(item.q.th, item.q.en)}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flexShrink: 0,
                      transition: 'transform 0.3s ease',
                    }}
                    className="faq-chevron"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem 1.5rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    marginTop: '0',
                    paddingTop: '1.25rem',
                  }}
                >
                  {t(item.a.th, item.a.en)}
                </div>
              </details>
            </motion.div>
          ))}
        </div>

        {/* Back to home CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            textAlign: 'center',
            paddingBottom: '4rem',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.12), rgba(212, 168, 67, 0.04))',
              border: '1px solid rgba(212, 168, 67, 0.25)',
              color: 'var(--gold-light)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 168, 67, 0.2), rgba(212, 168, 67, 0.08))';
              e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 168, 67, 0.12), rgba(212, 168, 67, 0.04))';
              e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.25)';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            {t('กลับหน้าหลัก', 'Back to Home')}
          </Link>
        </motion.div>
      </div>

      {/* Global styles for details/summary behavior */}
      <style jsx global>{`
        .faq-chevron {
          transition: transform 0.3s ease;
        }
        details[open] .faq-chevron {
          transform: rotate(180deg);
        }
        details summary::-webkit-details-marker {
          display: none;
        }
        details summary::marker {
          display: none;
          content: '';
        }
      `}</style>
    </div>
  );
}
