import { cn } from '~/lib/utils';

/**
 * The DESIGN.md signature block:
 *   eyebrow (optional)
 *   H2 or H1 heading
 *   40×3px brass rule
 */
export function SectionHeader({
  eyebrow,
  title,
  as: Tag = 'h2',
  align = 'start',
  className,
}: {
  eyebrow?: string;
  title: string;
  as?: 'h1' | 'h2';
  align?: 'start' | 'center';
  className?: string;
}) {
  return (
    <header
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' ? 'text-center' : 'text-start',
        className
      )}
    >
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <Tag
        className={cn(
          Tag === 'h1'
            ? 'text-[clamp(2rem,4.5vw,3rem)] leading-[1.1] font-bold'
            : 'text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-bold',
          'text-ink tracking-tight'
        )}
      >
        {title}
      </Tag>
      <span
        className={cn('rule-brass', align === 'center' && 'mx-auto')}
      />
    </header>
  );
}
