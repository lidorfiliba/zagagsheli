import { AdminChrome } from '~/components/admin/AdminChrome';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
