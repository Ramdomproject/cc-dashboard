import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom Contracting Inc — Financial Command Center',
  description: 'Break-even, scenario planning, budget vs actual, and service line profitability dashboard for Custom Contracting Inc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
