import Link from 'next/link';

/* ═══════════════════════════════════════════════════
   404 PAGE — Dark Fantasy Theme
   ═══════════════════════════════════════════════════ */
export default function NotFound() {
  return (
    <div className="legal-page" style={{ textAlign: 'center' }}>
      <div className="legal-container" style={{ paddingTop: '4rem' }}>
        <p style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚔️</p>
        <h1 className="legal-title">404</h1>
        <p className="legal-subtitle" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          ไม่พบหน้าที่ต้องการ
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '1rem' }}>
          The page you are looking for has vanished into the mists of Arcatéa.
        </p>
        <div className="legal-back" style={{ borderTop: 'none', marginTop: '1rem' }}>
          <Link href="/">← กลับหน้าหลัก / Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
