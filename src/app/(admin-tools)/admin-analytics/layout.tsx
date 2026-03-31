import '../../globals.css';

export const metadata = {
  title: 'Analytics | EST CMS',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
