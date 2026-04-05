import Link from 'next/link';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   404 PAGE â€” Dark Fantasy Theme
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function NotFound() {
  return (
    <div className="legal-page not-found-page">
      <div className="legal-container not-found-container">
        <p className="not-found-code">404</p>
        <h1 className="legal-title">404</h1>
        <p className="legal-subtitle not-found-subtitle">
          à¹„à¸¡à¹ˆà¸žà¸šà¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£
        </p>
        <p className="not-found-description">
          This page doesn&apos;t exist â€” or it wandered off into ArcatÃ©a.
        </p>
        <div className="legal-back not-found-back">
          <Link href="/">â† à¸à¸¥à¸±à¸šà¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸ / Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
