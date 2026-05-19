import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations();

  return (
    <main className="min-h-screen flex items-center justify-center bg-court-pattern">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-ink">
          SportHub — i18n working ({lang})
        </h1>
        <p className="mt-4 text-ink-muted">
          {t('home.heroDescription')}
        </p>
      </div>
    </main>
  );
}
