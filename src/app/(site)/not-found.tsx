import Link from 'next/link';

/* ═══════════════════════════════════════════════════
   404 PAGE — Dark Fantasy Theme
   ═══════════════════════════════════════════════════ */
export default function NotFound() {
  return (
    <div className="legal-page not-found-page">
      <div className="legal-container not-found-container">
        <p className="not-found-code">404</p>
        <h1 className="legal-title">404</h1>
        <p className="legal-subtitle not-found-subtitle">
          ไม่พบหน้าที่ต้องการ
        </p>
        <p className="not-found-description">
          This page doesn&apos;t exist — or it wandered off into Arcatéa.
        </p>
        <div className="legal-back not-found-back">
          <Link href="/">← กลับหน้าหลัก / Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
