'use client';

import Script from 'next/script';

export default function PublicMarketingScripts() {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const adjustAppToken = process.env.NEXT_PUBLIC_ADJUST_APP_TOKEN;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}

      {adjustAppToken && (
        <>
          <Script
            src="https://cdn.adjust.com/adjust-latest.min.js"
            strategy="afterInteractive"
          />
          <Script id="adjust-init" strategy="afterInteractive">
            {`window.addEventListener('load',function(){if(window.Adjust){Adjust.initSdk({appToken:'${adjustAppToken}',environment:'production'});}});`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              style={{ display: 'none' }}
              width="1"
            />
          </noscript>
        </>
      )}
    </>
  );
}
