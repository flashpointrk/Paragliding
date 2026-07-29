import { PageProse } from '@/components/site/PageProse';
import type { LegalContent as LegalContentData } from '@/lib/admin/page-content';

const TITLE_CLASS =
  'font-display text-xl font-bold tracking-tight text-navy-900';

interface Props {
  items: { name: string; path: string }[];
  content: LegalContentData;
}

export function LegalContent({ items, content }: Props) {
  return (
    <PageProse
      items={items}
      title={content.title}
      lastUpdated={content.lastUpdated}
    >
      <p>{content.login}</p>
      {content.sections.map((section) => (
        <section key={section.title}>
          <h2 className={TITLE_CLASS}>{section.title}</h2>
          <p className="mt-2 whitespace-pre-line">{section.text}</p>
        </section>
      ))}
    </PageProse>
  );
}
