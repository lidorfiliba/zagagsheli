import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '~/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'התחברות מנהל',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-svh grid place-items-center px-6 py-16 bg-paper">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-ink text-center mb-2">הזגג שלי · מנהל</h1>
        <p className="text-center text-muted mb-10 text-sm">גישה פנימית בלבד.</p>
        <div className="bg-surface border border-line p-8 md:p-10 rounded-[2px]">
          <Suspense fallback={<div className="text-muted text-sm">טוען…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
