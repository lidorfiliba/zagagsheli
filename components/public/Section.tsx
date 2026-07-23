import { cn } from '~/lib/utils';

/**
 * Standard section wrapper — consistent vertical rhythm (80px mobile / 128px
 * desktop) and centered content container. `variant="surface"` swaps the
 * background to white for the one section that needs elevation (contact form).
 */
export function Section({
  id,
  as: Tag = 'section',
  children,
  variant = 'paper',
  className,
}: {
  id?: string;
  as?: 'section' | 'div';
  children: React.ReactNode;
  variant?: 'paper' | 'surface' | 'ink';
  className?: string;
}) {
  const bg =
    variant === 'surface' ? 'bg-surface' :
    variant === 'ink' ? 'bg-ink text-paper' :
    'bg-paper';
  return (
    <Tag id={id} className={cn('py-20 md:py-32', bg, className)}>
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">{children}</div>
    </Tag>
  );
}
