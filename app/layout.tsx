import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'កំណត់ហេតុប្រជុំគណៈគ្រប់គ្រងសាលារៀន — សាលាបឋមសិក្សា រោគ',
  description: 'ប្រព័ន្ធគ្រប់គ្រង និងរក្សាទុកកំណត់ហេតុប្រជុំគណៈគ្រប់គ្រងសាលារៀន ភ្ជាប់ជាមួយ Firebase Auth & Firestore Real-time Database',
  openGraph: {
    title: 'កំណត់ហេតុប្រជុំគណៈគ្រប់គ្រងសាលារៀន',
    description: 'ប្រព័ន្ធគ្រប់គ្រងកំណត់ហេតុប្រជុំសាលាបឋមសិក្សា រោគ',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-slate-100 min-h-screen font-khmer text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
