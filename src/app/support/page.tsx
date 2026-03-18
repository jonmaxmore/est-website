import React from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function SupportPage() {
  return (
    <div className="event-page">
      <LoadingScreen />
      <Navigation />
      
      <main className="container-custom" style={{ padding: '8rem 1rem 4rem', minHeight: '80vh', textAlign: 'center' }}>
        <h1 className="section-title-gold" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Support Center</h1>
        <p style={{ color: 'var(--white)', opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Need help? Our support team is here for you. Please contact us via our official channels below or join our Discord community.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px', margin: '0 auto' }}>
          <a href="mailto:support@eternaltowersaga.com" className="event-cta" style={{ textDecoration: 'none' }}>
            Email Support
          </a>
          <a href="#" className="event-cta" style={{ background: 'var(--navy)', border: '1px solid var(--gold)', textDecoration: 'none' }}>
            Join Discord Community
          </a>
        </div>
      </main>

      <Footer 
        socialLinks={{}} 
        footer={{
          copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
          termsUrl: '/terms',
          privacyUrl: '/privacy',
          supportUrl: '/support'
        }} 
      />
    </div>
  );
}
