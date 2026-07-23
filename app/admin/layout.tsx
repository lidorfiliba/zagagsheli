import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Bare pass-through. Chrome (sidebar + bottom nav) lives in (shell)/layout.tsx
// so /admin/login can render without it.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
