import './globals.css';

export const metadata = {
  title: 'Rice Traceability System',
  description: 'Sistem Traceability Beras Berbasis Blockchain',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
